const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

/**
 * @swagger
 * /api/questions:
 *   get:
 *     summary: List questions
 *     tags: [Questions]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: difficulty
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of questions
 */
router.get('/', questionController.listQuestions);

/**
 * @swagger
 * /api/questions/categories:
 *   get:
 *     summary: List unique question categories
 *     tags: [Questions]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/categories', questionController.listCategories);

/**
 * @swagger
 * /api/questions:
 *   post:
 *     summary: Create a new question (Admin)
 *     tags: [Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Question' }
 */
router.post('/', questionController.createQuestion);

/**
 * @swagger
 * /api/questions/{id}:
 *   put:
 *     summary: Update a question (Admin)
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Question' }
 */
router.put('/:id', questionController.updateQuestion);

/**
 * @swagger
 * /api/questions/{id}:
 *   delete:
 *     summary: Delete a question (Admin)
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.delete('/:id', questionController.deleteQuestion);

module.exports = router;
