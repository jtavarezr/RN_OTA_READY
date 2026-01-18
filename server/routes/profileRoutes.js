const express = require('express');
const router = express.Router();
const ProfileController = require('../controllers/profileController');
const { requireAuth, validateSchema } = require('../middleware');
const { profileSchema } = require('../schemas');
const { client } = require('../config/appwrite');

/**
 * @swagger
 * tags:
 *   name: Profiles
 *   description: User profile management
 */

/**
 * @swagger
 * /api/profiles:
 *   get:
 *     summary: Retrieve a list of profiles
 *     tags: [Profiles]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The User ID for authentication (simulated)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 25
 *         description: Number of profiles to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of profiles to skip
 *     responses:
 *       200:
 *         description: A list of profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 profiles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserProfile'
 *       500:
 *         description: Server error
 */
router.get('/profiles', requireAuth(client), ProfileController.getAllProfiles);

/**
 * @swagger
 * /api/profile/{userId}:
 *   get:
 *     summary: Get a profile by User ID
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: The user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Server error
 */
router.get('/profile/:userId', requireAuth(client), ProfileController.getProfile);

/**
 * @swagger
 * /api/profile:
 *   post:
 *     summary: Create or update a profile
 *     tags: [Profiles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserProfile'
 *     responses:
 *       200:
 *         description: The updated profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       500:
 *         description: Server error
 */
router.post('/profile', requireAuth(client), validateSchema(profileSchema), ProfileController.createOrUpdateProfile);

/**
 * @swagger
 * /api/profile/{userId}:
 *   patch:
 *     summary: Partially update a profile
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserProfile'
 *     responses:
 *       200:
 *         description: The updated profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       500:
 *         description: Server error
 */
router.patch('/profile/:userId', requireAuth(client), validateSchema(profileSchema), ProfileController.patchProfile);

/**
 * @swagger
 * /api/profile/{userId}:
 *   delete:
 *     summary: Delete a profile
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Profile deleted successfully
 *       500:
 *         description: Server error
 */
router.delete('/profile/:userId', requireAuth(client), ProfileController.deleteProfile);

module.exports = router;
