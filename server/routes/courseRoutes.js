const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: List all courses
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of courses
 */
router.get('/', courseController.listCourses);

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course (Admin)
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Course' }
 */
router.post('/', courseController.createCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get a course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Course data
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Course' }
 *       404:
 *         description: Course not found
 */
router.get('/:id', courseController.getCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Update a course (Admin)
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Course' }
 */
router.put('/:id', courseController.updateCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete a course (Admin)
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.delete('/:id', courseController.deleteCourse);

/**
 * @swagger
 * /api/courses/{courseId}/progress:
 *   post:
 *     summary: Update user progress for a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: string }
 *               percentage: { type: integer }
 *               completedLessons: { type: array, items: { type: string } }
 *               resumePoint: { type: string }
 */
router.post('/:courseId/progress', courseController.updateProgress);

/**
 * @swagger
 * /api/courses/{courseId}/progress:
 *   get:
 *     summary: Get user progress for a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: userId
 *         required: true
 *         schema: { type: string }
 */
router.get('/:courseId/progress', courseController.getProgress);

module.exports = router;
