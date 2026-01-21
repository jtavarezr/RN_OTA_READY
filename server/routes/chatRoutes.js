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
 *     description: Deducts 1 credit and returns AI response.
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
 *               userId: { type: string }
 *               sessionId: { type: string, description: "Optional. If omitted, creates new session." }
 *               message: { type: string }
 *     responses:
 *       200:
 *         description: AI Response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId: { type: string }
 *                 response: { type: string }
 *                 balance: { type: integer }
 *       402:
 *         description: Insufficient Credits
 */
router.post('/message', requireAuth(client), ChatController.sendMessage);

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
