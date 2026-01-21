const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get paginated users and services
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 */
router.get('/dashboard', adminController.getDashboardData);

/**
 * @swagger
 * /api/admin/user:
 *   post:
 *     summary: Update user details (name, email)
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: string }
 *               name: { type: string }
 *               email: { type: string }
 */
router.post('/user', adminController.updateUserDetails);

/**
 * @swagger
 * /api/admin/status:
 *   post:
 *     summary: Enable or disable user account
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: string }
 *               status: { type: boolean }
 */
router.post('/status', adminController.updateUserStatus);

/**
 * @swagger
 * /api/admin/wallet:
 *   post:
 *     summary: Update/Assign credits to a user
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               balance:
 *                 type: integer
 *           example:
 *             userId: "u123"
 *             balance: 100
 *     responses:
 *       200:
 *         description: Wallet updated successfully
 *         content:
 *           application/json:
 *             example: { "success": true, "message": "Wallet updated for u123" }
 */
router.post('/wallet', adminController.updateWallet);

/**
 * @swagger
 * /api/admin/service:
 *   post:
 *     summary: Update service cost and interactions
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slug:
 *                 type: string
 *               cost:
 *                 type: integer
 *               interactions:
 *                 type: integer
 *           example:
 *             slug: "AI_COACH_INTERACTION"
 *             cost: 2
 *             interactions: 10
 *     responses:
 *       200:
 *         description: Service updated successfully
 *         content:
 *           application/json:
 *             example: { "success": true, "message": "Service AI_COACH_INTERACTION updated" }
 */
router.post('/service', adminController.updateService);

module.exports = router;
