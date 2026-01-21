const express = require('express');
const router = express.Router();
const multer = require('multer');
const CVController = require('../controllers/cvController');
const { requireAuth } = require('../middleware');
const { client } = require('../config/appwrite');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * @swagger
 * tags:
 *   name: CV
 *   description: CV and Resume Compatibility analysis
 */

/**
 * @swagger
 * /api/cv/analyze:
 *   post:
 *     summary: Analyze compatibility between Job Description and Resume
 *     tags: [CV]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: string }
 *               jobTitle: { type: string }
 *               jobDescription: { type: string }
 *               resumeText: { type: string }
 *               reportType: { type: string, enum: [basic, advanced], default: basic }
 *               language: { type: string, default: en }
 *               jdFile: { type: string, format: binary }
 *               resumeFile: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Analysis result
 *       402:
 *         description: Insufficient credits
 */
router.post('/analyze', 
    upload.fields([{ name: 'jdFile', maxCount: 1 }, { name: 'resumeFile', maxCount: 1 }]), 
    requireAuth(client), 
    CVController.analyzeCompatibility
);

/**
 * @swagger
 * /api/cv/reports:
 *   get:
 *     summary: Get user's previous compatibility reports
 *     tags: [CV]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of reports
 */
router.get('/reports', requireAuth(client), CVController.getReports);

module.exports = router;
