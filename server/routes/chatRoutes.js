const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chatController');
const { requireAuth } = require('../middleware');
const { client } = require('../config/appwrite');

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: AI Career Coach Interactions
 */

/**
 * @swagger
 * /api/chat/message:
 *   post:
 *     summary: Send message to AI Coach
 *     description: Deducts 1 credit ONCE per session (5 interactions). Returns remaining interactions.
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - userId
 *             properties:
 *               userId: { type: string, example: "u123" }
 *               sessionId: { type: string, example: "s456", description: "Optional. Continue session." }
 *               message: { type: string, example: "How can I improve my CV?" }
 *               language: { type: string, example: "es" }
 *     responses:
 *       200:
 *         description: AI Response and Session Info
 *         content:
 *           application/json:
 *             example:
 *               sessionId: "s456"
 *               response: "Deberías destacar tus habilidades en React..."
 *               balance: 49
 *               interactionsLeft: 4
 *       402:
 *         description: Insufficient Credits
 */
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/message', requireAuth(client), ChatController.sendMessage);

/**
 * @swagger
 * /api/chat/audio:
 *   post:
 *     summary: Send audio message to AI Coach
 *     description: Processes audio, transcribes it, and gets AI response. Deducts credit if needed.
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - audio
 *               - userId
 *             properties:
 *               audio: { type: string, format: binary }
 *               userId: { type: string }
 *               sessionId: { type: string }
 *               language: { type: string, default: "en" }
 *     responses:
 *       200:
 *         description: AI Response and Transcription
 *         content:
 *           application/json:
 *             example:
 *               sessionId: "s456"
 *               response: "Deberías destacar tus habilidades en React..."
 *               transcription: "How can I improve my CV?"
 *               balance: 49
 */
router.post('/audio', upload.single('audio'), requireAuth(client), ChatController.sendAudioMessage);

/**
 * @swagger
 * /api/chat/stt:
 *   post:
 *     summary: Transcribe audio to text (In-Memory)
 *     description: Only transcribes audio. Does not deduct credits or generate AI response.
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - audio
 *               - userId
 *             properties:
 *               audio: { type: string, format: binary }
 *               userId: { type: string }
 *               language: { type: string, default: "en" }
 *     responses:
 *       200:
 *         description: Transcribed text
 *         content:
 *           application/json:
 *             example: { "transcription": "This is what I said." }
 */
router.post('/stt', upload.single('audio'), requireAuth(client), ChatController.processSTT);

/**
 * @swagger
 * /api/chat/history:
 *   get:
 *     summary: Get user chat sessions
 *     tags: [Chat]
 *     parameters:
 *      - in: query
 *        name: userId
 *        required: false
 *        schema: { type: string }
 *     responses:
 *       200:
 *         description: List of sessions
 */
router.get('/history', requireAuth(client), ChatController.getHistory);

/**
 * @swagger
 * /api/chat/session/{sessionId}:
 *   get:
 *     summary: Get messages for a specific session
 *     tags: [Chat]
 *     parameters:
 *      - in: path
 *        name: sessionId
 *        required: true
 *        schema: { type: string }
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get('/session/:sessionId', requireAuth(client), ChatController.getSessionMessages);

module.exports = router;
