const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');
const {
    createQuiz,
    getAllQuizzes,
    updateQuiz,
    deleteQuiz,
    addQuestion,
    updateQuestion,
    deleteQuestion
}= require('../controllers/adminController');

router.use(verifyToken,isAdmin);

router.post('/quiz',createQuiz);
router.get('/quizzes',getAllQuizzes);
router.put('/quiz/:id',updateQuiz);
router.delete('/quiz/:id',deleteQuiz);

// routes for questions
router.post('/quiz/:id/question',addQuestion);
router.put('/questions/:id',updateQuestion);
router.delete('/question/:id',deleteQuestion);

module.exports = router;
