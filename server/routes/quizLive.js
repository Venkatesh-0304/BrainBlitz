const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const isCreator = require('../middleware/isCreator');
const isAdmin = require('../middleware/isAdmin');
const isQuizQwner = require('../middleware/isQuizOwner');
const {
  createQuiz,
  getMyQuizzes,
  joinByCode,
  joinByLink,
  allowPlayer,
  removePlayer,
  startQuiz,
  nextQuestion,
  submitAnswer,
  getScoreboard,
  adminEditQuiz,
  addQuestion,
  deleteQuestion,
  deleteQuiz,
} = require('../controllers/quizLiveController');
const isQuizOwner = require('../middleware/isQuizOwner');

router.use(verifyToken);

// Creator routes 
router.post('/create',isCreator,createQuiz);
router.get('/my',isCreator,getMyQuizzes);
router.post('/:id/question',isQuizQwner,addQuestion);
router.delete('/:id', isQuizOwner,deleteQuestion);
router.delete('/:id',isQuizOwner,deleteQuiz);

//player management 
router.post('/:id/allow/:userId',isQuizQwner, allowPlayer);
router.delete('/:id/remove/:userId',isQuizQwner, removePlayer);

//Quiz lifecycle
router.post('/:id/start',isQuizOwner, startQuiz);
router.post('/:id/next',isQuizOwner,nextQuestion);

//join routes

router.get('/join/code/:code',joinByCode);
router.get('/join/link/:id',joinByLink);

//player routes
router.post('/:id/answer',submitAnswer);
router.get('/:id/scoreboard',getScoreboard);

//admin routes
router.put('/:id/admin-edit',isAdmin,adminEditQuiz);

module.exports = router;