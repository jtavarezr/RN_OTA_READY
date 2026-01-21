const { GoogleGenerativeAI } = require("@google/generative-ai");
const ChatModel = require('../models/chatModel');
const ServiceModel = require('../models/serviceModel');
const WalletModel = require('../models/walletModel');
const TransactionModel = require('../models/transactionModel');
const logger = require('../utils/logger');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MOCK_KEY');
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const SYSTEM_PROMPT = `
You are a professional Career Coach and Job Search Specialist.
Your goal is to help the user with professional growth, CV improvements, interview prep, and networking strategies.
RULES:
1. STRICTLY only answer questions related to: Career, Jobs, CVs, Interviews, Professional Skills, LinkedIn/Networking.
2. If a user asks about anything else (Personal life, Politics, Cooking, etc.), politely decline: "I can only assist with professional and career-related topics."
3. Be encouraging, professional, and concise.
4. If the user asks for legal/medical/financial advice, decline.
`;

const COACH_SERVICE_SLUG = 'AI_COACH_INTERACTION';

exports.sendMessage = async (req, res) => {
    try {
        const userId = req.user ? req.user.$id : req.body.userId;
        const { sessionId, message } = req.body;

        if (!userId || !message) return res.status(400).json({ error: 'User ID and Message are required' });

        // 1. Get Price
        const price = await ServiceModel.getPrice(COACH_SERVICE_SLUG) || 1;

        // 2. Check Wallet
        const wallet = await WalletModel.getByUserId(userId);
        if (!wallet || wallet.balance < price) {
            return res.status(402).json({ error: 'Insufficient credits', required: price, balance: wallet ? wallet.balance : 0 });
        }

        // 3. Resolve Session
        let currentSessionId = sessionId;
        if (!currentSessionId) {
            const newSession = await ChatModel.createSession(userId, message.substring(0, 30) + '...');
            currentSessionId = newSession.$id;
        }

        // 4. Process with AI
        // Build history context (optional: fetch last few messages for context)
        const recentHistory = await ChatModel.getMessages(currentSessionId);
        
        let aiResponseText = "";
        
        if (!process.env.GEMINI_API_KEY) {
             // Mock Fallback if no key (for demo safety)
             aiResponseText = "[MOCK] That sounds like a great career goal. As an AI Coach (Demo), I suggest focusing on your portfolio.";
             if (message.toLowerCase().includes('cook') || message.toLowerCase().includes('weather')) {
                 aiResponseText = "I can only assist with professional and career-related topics.";
             }
        } else {
             const chat = model.startChat({
                 history: [
                     { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
                     { role: "model", parts: [{ text: "Understood. I am ready to act as a Career Coach." }] },
                     // Add recent history if needed, mapping 'model'/'user' roles
                 ]
             });
             const result = await chat.sendMessage(message);
             const response = await result.response;
             aiResponseText = response.text();
        }

        // 5. Deduct Credits
        const newBalance = wallet.balance - price;
        await WalletModel.updateBalance(wallet.$id, newBalance);
        await TransactionModel.create(userId, wallet.$id, price, 'SPEND', 'AI Career Coach Session');

        // 6. Save Messages
        await ChatModel.addMessage(currentSessionId, 'user', message);
        await ChatModel.addMessage(currentSessionId, 'model', aiResponseText);

        res.json({
            sessionId: currentSessionId,
            response: aiResponseText,
            balance: newBalance
        });

    } catch (error) {
        logger.error('Chat Error:', error);
        res.status(500).json({ error: 'Failed to process message' });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const userId = req.user ? req.user.$id : req.query.userId;
        if (!userId) return res.status(400).json({ error: 'UserId required' });

        const sessions = await ChatModel.listSessions(userId);
        res.json(sessions);
    } catch (error) {
        logger.error('Chat History Error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};

exports.getSessionMessages = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const messages = await ChatModel.getMessages(sessionId);
        res.json(messages);
    } catch (error) {
         logger.error('Chat Messages Error:', error);
         res.status(500).json({ error: 'Failed to fetch messages' });
    }
};
