const { GoogleGenerativeAI } = require("@google/generative-ai");
const CVModel = require('../models/cvModel');
const ServiceModel = require('../models/serviceModel');
const WalletModel = require('../models/walletModel');
const TransactionModel = require('../models/transactionModel');
const logger = require('../utils/logger');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MOCK_KEY');
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

const BASIC_PROMPT = `
You are an expert HR Recruiter. Analyze the Job Description (JD) and Resume provided.
Provide a basic compatibility report in JSON format.
JSON Schema:
{
  "score": number (0-100),
  "verdict": string (Short phrase),
  "summary": string (2-3 sentences),
  "pros": string[],
  "cons": string[]
}
Apply the analysis strictly based on the content provided.
`;

const ADVANCED_PROMPT = `
You are a Senior Technical Recruiter and Career Consultant. Perform a deep analysis between the Job Description (JD) and the Resume.
Provide a professional compatibility report in JSON format.
JSON Schema:
{
  "score": number (0-100),
  "verdict": string (Expert assessment phrase),
  "verdictDesc": string (Detailed assessment),
  "summary": string (Comprehensive professional summary),
  "sections": [
    {
      "title": string (e.g., Technical Skills, Experience, Education),
      "score": number (0-100),
      "items": [
        { "label": string, "match": boolean, "desc": string }
      ]
    }
  ],
  "strengths": string[],
  "improvements": string[]
}
Analyze the fit deeply, considering seniority, specific technologies, and industry context.
`;

exports.analyzeCompatibility = async (req, res) => {
    try {
        const userId = req.user ? req.user.$id : req.body.userId;
        const { jobTitle, jobDescription, resumeText, reportType, language } = req.body;
        const jdFile = req.files && req.files['jdFile'] ? req.files['jdFile'][0] : null;
        const resumeFile = req.files && req.files['resumeFile'] ? req.files['resumeFile'][0] : null;

        logger.info(`🔍 [CV] New analysis request for user: ${userId} (Report: ${reportType})`);
        if (jdFile) logger.info(`📁 [CV] JD File received: ${jdFile.originalname}`);
        if (resumeFile) logger.info(`📁 [CV] Resume File received: ${resumeFile.originalname}`);

        if (!userId) return res.status(400).json({ error: 'User ID is required' });
        
        const lang = language || 'en';
        const isAdvanced = reportType === 'advanced';
        const serviceSlug = isAdvanced ? 'ADVANCED_REPORT' : 'BASIC_REPORT';

        // 1. Get Service Info
        const service = await ServiceModel.getService(serviceSlug);
        const price = service ? service.cost : (isAdvanced ? 2 : 1);

        // 2. Credit check
        const wallet = await WalletModel.getByUserId(userId);
        if (!wallet || wallet.balance < price) {
            return res.status(402).json({ error: 'Insufficient credits', required: price, balance: wallet ? wallet.balance : 0 });
        }

        // 3. Prepare Gemini Input
        const promptSystem = isAdvanced ? ADVANCED_PROMPT : BASIC_PROMPT;
        const promptUser = `
        Language: ${lang}
        Job Title: ${jobTitle || 'Not specified'}
        ${jobDescription ? `Job Description: ${jobDescription}` : 'Job Description provided as file.'}
        ${resumeText ? `Resume: ${resumeText}` : 'Resume provided as file.'}
        
        Analyze now and return ONLY the JSON object.
        `;

        const parts = [ { text: promptSystem + promptUser } ];

        if (jdFile) {
            parts.push({
                inlineData: {
                    mimeType: jdFile.mimetype,
                    data: jdFile.buffer.toString('base64')
                }
            });
        }
        if (resumeFile) {
            parts.push({
                inlineData: {
                    mimeType: resumeFile.mimetype,
                    data: resumeFile.buffer.toString('base64')
                }
            });
        }

        // 4. Call Gemini
        let aiResult;
        if (!process.env.GEMINI_API_KEY) {
            // Mock response
            aiResult = isAdvanced ? {
                score: 85,
                verdict: "Strong Candidate",
                verdictDesc: "The profile matches most of the requirements for a Senior role.",
                summary: "This is a mock response because GEMINI_API_KEY is not set.",
                sections: [
                    { title: "Skills", score: 90, items: [{ label: "React", match: true, desc: "Expert level" }] }
                ],
                strengths: ["Experience", "Tech Stack"],
                improvements: ["Certifications"]
            } : {
                score: 75,
                verdict: "Good Match",
                summary: "Mock summary for basic report.",
                pros: ["Relevant experience"],
                cons: ["Missing specific tool knowledge"]
            };
        } else {
            const result = await model.generateContent(parts);
            const response = await result.response;
            const text = response.text();
            try {
                const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
                aiResult = JSON.parse(cleanJson);
            } catch (e) {
                logger.error('Failed to parse Gemini JSON:', text);
                throw new Error('AI Response parsing failed');
            }
        }

        // 5. Deduct Credits
        const newBalance = wallet.balance - price;
        await WalletModel.updateBalance(wallet.$id, newBalance);
        await TransactionModel.create(userId, wallet.$id, price, 'SPEND', `CV Compatibility Analysis (${reportType})`);

        // 6. Save Report
        const reportData = {
            userId,
            jobTitle: jobTitle ? jobTitle.substring(0, 255) : 'Unknown',
            jobDescription: jobDescription ? jobDescription.substring(0, 2000) : (jdFile ? '[File]' : null),
            resumeText: resumeText ? resumeText.substring(0, 2000) : (resumeFile ? '[File]' : null),
            reportType,
            result: JSON.stringify(aiResult).substring(0, 8000)
        };

        try {
            await CVModel.saveReport(reportData);
        } catch (saveError) {
            logger.warn('⚠️ CV Report saved locally but failed to store in DB:', saveError.message);
            // We still return the result to the user since they paid
        }

        res.json({
            result: aiResult,
            balance: newBalance
        });

    } catch (error) {
        logger.error('CV Compatibility Error:', error);
        res.status(500).json({ error: 'Failed to analyze compatibility' });
    }
};

exports.getReports = async (req, res) => {
    try {
        const userId = req.user ? req.user.$id : req.query.userId;
        if (!userId) return res.status(400).json({ error: 'UserId required' });

        const reports = await CVModel.listReports(userId);
        res.json(reports.documents.map(d => ({
            ...d,
            result: JSON.parse(d.result)
        })));
    } catch (error) {
        logger.error('Get Reports Error:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
};
