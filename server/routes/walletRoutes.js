const express = require('express');
const router = express.Router();
const WalletController = require('../controllers/walletController');
const { requireAuth } = require('../middleware'); // Assuming authentication middleware exists
const { client } = require('../config/appwrite');

/**
 * @swagger
 * tags:
 *   name: Wallet
 *   description: Virtual economy and credit management
 */

/**
 * @swagger
 * /api/wallet/balance:
 *   get:
 *     summary: Get user wallet balance
 *     tags: [Wallet]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *         description: User ID (optional if authenticated via token)
 *     responses:
 *       200:
 *         description: Current wallet state
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId: { type: string }
 *                 balance: { type: integer }
 *                 lastAdView: { type: string }
 */
router.get('/balance', requireAuth(client), WalletController.getWallet);

/**
 * @swagger
 * /api/wallet/add-credits:
 *   post:
 *     summary: Add credits for watching an ad
 *     tags: [Wallet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: string }
 *               adToken: { type: string, description: "Validation token from ad provider" }
 *     responses:
 *       200:
 *         description: Credits added successfully
 *       403:
 *         description: Invalid ad token
 */
router.post('/add-credits', requireAuth(client), WalletController.addCredits);

/**
 * @swagger
 * /api/wallet/deduct-credits:
 *   post:
 *     summary: Spend credits on reports or features
 *     tags: [Wallet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: string }
 *               amount: { type: integer }
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Transaction successful
 *       402:
 *         description: Insufficient funds
 */
router.post('/deduct-credits', requireAuth(client), WalletController.deductCredits);

/**
 * @swagger
 * /api/wallet/transactions:
 *   get:
 *     summary: Get transaction history
 *     tags: [Wallet]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of transactions
 */
router.get('/transactions', requireAuth(client), WalletController.getTransactions);

/**
 * @swagger
 * /api/reports/prices:
 *   get:
 *     summary: Get price list for reports
 *     tags: [Wallet]
 *     responses:
 *       200:
 *         description: Price table
 */
router.get('/prices', WalletController.getPrices);

module.exports = router;
