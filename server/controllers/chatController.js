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
You are SofIA, a professional Career Coach and Job Search Specialist.
Your goal is to help the user with professional growth, CV improvements, interview prep, and networking strategies.
RULES:
1. STRICTLY only answer questions related to: Career, Jobs, CVs, Interviews, Professional Skills, LinkedIn/Networking.
2. If a user asks about anything else (Personal life, Politics, Cooking, etc.), politely decline: "I can only assist with professional and career-related topics."
3. Be encouraging, professional, and concise.
4. If the user asks for legal/medical/financial advice, decline.
`;

const COACH_SERVICE_SLUG = 'AI_COACH_INTERACTION';

const fs = require('fs');

exports.sendAudioMessage = async (req, res) => {
    try {
        const userId = req.user ? req.user.$id : req.body.userId;
        const { sessionId, language } = req.body;
        const file = req.file;

        if (!userId || !file) return res.status(400).json({ error: 'User ID and Audio file are required' });

        // 1. Get Service Info
        const service = await ServiceModel.getService(COACH_SERVICE_SLUG);
        const price = service ? service.cost : 1;
        const maxInteractions = service ? service.interactions : 5;

        // 2. Resolve Session & Credit Logic
        let currentSessionId = sessionId;
        let session = null;
        let shouldDeduct = false;

        if (currentSessionId) {
            session = await ChatModel.getSession(currentSessionId);
            if (!session || session.interactionCount >= session.maxInteractions) {
                shouldDeduct = true;
            }
        } else {
            shouldDeduct = true;
        }

        const wallet = await WalletModel.getByUserId(userId);
        if (shouldDeduct) {
            if (!wallet || wallet.balance < price) {
                return res.status(402).json({ error: 'Insufficient credits', required: price, balance: wallet ? wallet.balance : 0 });
            }
            if (!currentSessionId || !session) {
                const newSession = await ChatModel.createSession(userId, "Voice Conversation...", maxInteractions);
                currentSessionId = newSession.$id;
                session = newSession;
            } else {
                // Reset interactions for existing session
                await ChatModel.updateSessionInteractions(currentSessionId, 0, maxInteractions);
                session.interactionCount = 0;
                session.maxInteractions = maxInteractions;
            }
            // Deduct Credits
            const newBalance = wallet.balance - price;
            await WalletModel.updateBalance(wallet.$id, newBalance);
            await TransactionModel.create(userId, wallet.$id, price, 'SPEND', 'AI Career Coach Session Start (Voice)');
        }

        // 3. Process with Gemini
        const audioBase64 = file.buffer.toString('base64');
        let aiResponseText = "";

        if (!process.env.GEMINI_API_KEY) {
            aiResponseText = "[MOCK Voice] I received your audio! As an AI Coach, I suggest you focus on your presentation skills.";
        } else {
            const lang = language || 'en';
            const prompt = SYSTEM_PROMPT + `\n\nAbove is your identity. A user has sent a voice message. 
            Please:
            1. Transcribe EXACTLY what the user said (STT).
            2. Provide your natural response as SofIA.
            
            IMPORTANT: Your response MUST be a JSON object with this format:
            {
              "transcription": "...",
              "reply": "..."
            }
            Reply in the following language: ${lang}.`;
            
            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        mimeType: file.mimetype === 'audio/m4a' ? 'audio/mpeg' : file.mimetype,
                        data: audioBase64
                    }
                }
            ]);
            const response = await result.response;
            const text = response.text();
            
            try {
                // Clean markdown if present
                const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
                const parsed = JSON.parse(cleanJson);
                aiResponseText = parsed.reply;
                // We'll pass the transcription back to the user
                var transcription = parsed.transcription;
            } catch (e) {
                logger.warn('Failed to parse Gemini JSON for STT, falling back to raw text');
                aiResponseText = text;
            }
        }

        // 4. Update Interactions & Cleanup
        await ChatModel.updateSessionInteractions(currentSessionId, session.interactionCount + 1);
        await ChatModel.addMessage(currentSessionId, 'user', transcription ? `🎤 ${transcription}` : "🎤 Voice Note");
        await ChatModel.addMessage(currentSessionId, 'model', aiResponseText);
        
        res.json({
            sessionId: currentSessionId,
            response: aiResponseText,
            transcription: transcription || null,
            balance: shouldDeduct ? wallet.balance - price : wallet.balance,
            interactionsLeft: maxInteractions - (session.interactionCount + 1),
            maxInteractions
        });

    } catch (error) {
        logger.error('Audio Chat Error:', error);
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: 'Failed to process audio message' });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const userId = req.user ? req.user.$id : req.body.userId;
        const { sessionId, message, language } = req.body;
        logger.info(`💬 New Message from ${userId}: "${message.substring(0, 50)}..."`);

        if (!userId || !message) return res.status(400).json({ error: 'User ID and Message are required' });

        // 1. Get Service Info
        const service = await ServiceModel.getService(COACH_SERVICE_SLUG);
        const price = service ? service.cost : 1;
        const maxInteractions = service ? service.interactions : 5;

        // 2. Resolve Session & Credit Logic
        let currentSessionId = sessionId;
        let session = null;
        let shouldDeduct = false;

        if (currentSessionId) {
            session = await ChatModel.getSession(currentSessionId);
            if (!session || session.interactionCount >= session.maxInteractions) {
                shouldDeduct = true;
            }
        } else {
            shouldDeduct = true;
        }

        const wallet = await WalletModel.getByUserId(userId);
        if (shouldDeduct) {
            if (!wallet || wallet.balance < price) {
                return res.status(402).json({ error: 'Insufficient credits', required: price, balance: wallet ? wallet.balance : 0 });
            }
            if (!currentSessionId || !session) {
                const newSession = await ChatModel.createSession(userId, message.substring(0, 30) + '...', maxInteractions);
                currentSessionId = newSession.$id;
                session = newSession;
            } else {
                await ChatModel.updateSessionInteractions(currentSessionId, 0, maxInteractions);
                session.interactionCount = 0;
                session.maxInteractions = maxInteractions;
            }
            const newBalance = wallet.balance - price;
            await WalletModel.updateBalance(wallet.$id, newBalance);
            await TransactionModel.create(userId, wallet.$id, price, 'SPEND', 'AI Career Coach Session Start');
            logger.info(`💸 Credits deducted for ${userId}: ${price} unit(s). Remaining: ${newBalance}`);
        }

        // 3. Process with AI
        const recentHistory = await ChatModel.getMessages(currentSessionId);
        let aiResponseText = "";
        
        if (!process.env.GEMINI_API_KEY) {
             aiResponseText = "[MOCK] That sounds like a great career goal. As an AI Coach (Demo), I suggest focusing on your portfolio.";
        } else {
             const lang = language || 'en';
             const chat = model.startChat({
                 history: [
                     { role: "user", parts: [{ text: SYSTEM_PROMPT + `\n\nIMPORTANT: You must always respond in the following language: ${lang}.` }] },
                     { role: "model", parts: [{ text: "Understood. I am ready to act as a Career Coach and I will respond in the requested language." }] },
                 ]
             });
             const result = await chat.sendMessage(message);
             const response = await result.response;
             aiResponseText = response.text();
             logger.info(`🤖 AI Response generated for ${userId}`);
        }

        // 4. Update Interactions & Save Messages
        await ChatModel.updateSessionInteractions(currentSessionId, session.interactionCount + 1);
        await ChatModel.addMessage(currentSessionId, 'user', message);
        await ChatModel.addMessage(currentSessionId, 'model', aiResponseText);

        res.json({
            sessionId: currentSessionId,
            response: aiResponseText,
            balance: shouldDeduct ? wallet.balance - price : wallet.balance,
            interactionsLeft: maxInteractions - (session.interactionCount + 1),
            maxInteractions
        });

    } catch (error) {
        logger.error('❌ Chat Error:', error);
        res.status(500).json({ error: 'Failed to process message' });
    }
};

exports.processSTT = async (req, res) => {
    try {
        const { file } = req;
        const { language } = req.body;
        
        if (!file) return res.status(400).json({ error: 'No audio file provided' });

        const audioBase64 = file.buffer.toString('base64');

        if (!process.env.GEMINI_API_KEY) {
            return res.json({ transcription: "[MOCK STT] This is a mock transcription." });
        }

        const lang = language || 'en';
        const prompt = `Transcribe the following audio EXACTLY as it is. Output only the transcription, nothing else. Language: ${lang}`;
        
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: file.mimetype === 'audio/m4a' ? 'audio/mpeg' : file.mimetype,
                    data: audioBase64
                }
            }
        ]);
        const response = await result.response;
        const transcription = response.text().trim();
        
        res.json({ transcription });

    } catch (error) {
        logger.error('❌ STT Error:', error);
        res.status(500).json({ error: 'Failed to transcribe audio' });
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
