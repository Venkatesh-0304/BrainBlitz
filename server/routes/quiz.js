const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {
    getAllQuizzes,
    getQuizById,
    submitQuiz,
    getLeaderboard
} = require('../controllers/quizController');

//all routes require login
router.use(verifyToken);

router.get('/',getAllQuizzes);
router.get('/:id',getQuizById);
router.post('/:id/submit',submitQuiz);
router.get('/leaderboard/:quizId',getLeaderboard);

module.exports = router;