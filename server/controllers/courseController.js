const CourseModel = require('../models/courseModel');
const ProgressModel = require('../models/progressModel');

const listCourses = async (req, res) => {
    try {
        const { category } = req.query;
        const courses = await CourseModel.listCourses(category);
        res.json(courses);
    } catch (error) {
        console.error('List Courses Error:', error);
        res.status(500).json({ error: 'Failed to list courses' });
    }
};

const createCourse = async (req, res) => {
    try {
        const course = await CourseModel.createCourse(req.body);
        res.status(201).json(course);
    } catch (error) {
        console.error('Create Course Error:', error);
        res.status(500).json({ error: 'Failed to create course' });
    }
};

const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await CourseModel.updateCourse(id, req.body);
        res.json(course);
    } catch (error) {
        console.error('Update Course Error:', error);
        res.status(500).json({ error: 'Failed to update course' });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        await CourseModel.deleteCourse(id);
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Delete Course Error:', error);
        res.status(500).json({ error: 'Failed to delete course' });
    }
};

const updateProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { userId, percentage, completedLessons, resumePoint } = req.body;
        
        const progress = await ProgressModel.updateProgress(userId, courseId, {
            percentage,
            completedLessons: JSON.stringify(completedLessons), // Storage as string
            resumePoint
        });
        
        res.json(progress);
    } catch (error) {
        console.error('Update Progress Error:', error);
        res.status(500).json({ error: 'Failed to update progress' });
    }
};

const getCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await CourseModel.getCourse(id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json(course);
    } catch (error) {
        console.error('Get Course Error:', error);
        res.status(500).json({ error: 'Failed to get course' });
    }
};

const getProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { userId } = req.query;
        
        const progress = await ProgressModel.getProgress(userId, courseId);
        res.json(progress || { percentage: 0 });
    } catch (error) {
        console.error('Get Progress Error:', error);
        res.status(500).json({ error: 'Failed to get progress' });
    }
};

module.exports = {
    listCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    updateProgress,
    getProgress,
    getCourse
};
