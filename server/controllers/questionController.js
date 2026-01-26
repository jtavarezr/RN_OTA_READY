const QuestionModel = require('../models/questionModel');

const listQuestions = async (req, res) => {
    try {
        const { category, difficulty } = req.query;
        const questions = await QuestionModel.listQuestions(category, difficulty);
        // Simplify response for client if needed, or send as is
        res.json(questions);
    } catch (error) {
        console.error('List Questions Error:', error);
        res.status(500).json({ error: 'Failed to list questions' });
    }
};

const createQuestion = async (req, res) => {
    try {
        const question = await QuestionModel.createQuestion(req.body);
        res.status(201).json(question);
    } catch (error) {
        console.error('Create Question Error:', error);
        res.status(500).json({ error: 'Failed to create question' });
    }
};

const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await QuestionModel.updateQuestion(id, req.body);
        res.json(result);
    } catch (error) {
         console.error('Update Question Error:', error);
        res.status(500).json({ error: 'Failed to update question' });
    }
};

const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        await QuestionModel.deleteQuestion(id);
        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Delete Question Error:', error);
        res.status(500).json({ error: 'Failed to delete question' });
    }
};

const listCategories = async (req, res) => {
    try {
        const categories = await QuestionModel.listCategories();
        res.json(categories);
    } catch (error) {
        console.error('List Categories Error:', error);
        res.status(500).json({ error: 'Failed to list categories' });
    }
};

module.exports = {
    listQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    listCategories
};
