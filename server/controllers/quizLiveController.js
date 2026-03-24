const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const User = require('../models/User');
const Score = require('../models/Score');           // ✅ fixed
const Notification = require('../models/Notification'); // ✅ fixed

// create quiz (creator only)
const createQuiz = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    let quizCode;
    let isUnique = false;
    while (!isUnique) {
      quizCode = Math.random().toString(36).substring(2, 8).toUpperCase(); // ✅ fixed
      const existing = await Quiz.findOne({ quizCode });
      if (!existing) isUnique = true;
    }

    const quiz = await Quiz.create({
      title, description,
      createdBy: req.user.id,
      quizCode, status: 'draft',
    });
    res.status(201).json({ message: 'Quiz created successfully', quiz });
  } catch (err) {
    console.error('createQuiz error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getMyQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user.id })
      .populate('questions')              // ✅ fixed
      .populate('allowedPlayers', 'name email')
      .populate('pendingPlayers', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const joinByCode = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ quizCode: req.params.code }).populate('createdBy', 'name');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.status === 'ended') return res.status(400).json({ message: 'Quiz has ended' });

    const alreadyAllowed = quiz.allowedPlayers.map(p => p.toString()).includes(req.user.id);
    if (alreadyAllowed) return res.status(200).json({ message: 'Already in quiz', quiz, status: 'allowed' });

    const alreadyPending = quiz.pendingPlayers.map(p => p.toString()).includes(req.user.id);
    if (alreadyPending) return res.status(200).json({ message: 'Request pending approval', quiz, status: 'pending' });

    quiz.pendingPlayers.push(req.user.id); // ✅ fixed
    await quiz.save();
    res.status(200).json({ message: 'Join request sent! Waiting for creator approval.', quiz, status: 'pending' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const joinByLink = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('createdBy', 'name');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.status === 'ended') return res.status(400).json({ message: 'Quiz has ended' });

    const alreadyAllowed = quiz.allowedPlayers.map(p => p.toString()).includes(req.user.id);
    if (alreadyAllowed) return res.status(200).json({ message: 'Already in quiz', quiz, status: 'allowed' }); // ✅ fixed

    const alreadyPending = quiz.pendingPlayers.map(p => p.toString()).includes(req.user.id);
    if (alreadyPending) return res.status(200).json({ message: 'Request pending', quiz, status: 'pending' });

    quiz.pendingPlayers.push(req.user.id);
    await quiz.save();
    res.status(200).json({ message: 'Join request sent!', quiz, status: 'pending' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const allowPlayer = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    quiz.pendingPlayers = quiz.pendingPlayers.filter(p => p.toString() !== req.params.userId);

    const alreadyAllowed = quiz.allowedPlayers.map(p => p.toString()).includes(req.params.userId); // ✅ fixed
    if (!alreadyAllowed) quiz.allowedPlayers.push(req.params.userId);

    await quiz.save();
    res.status(200).json({ message: 'Player allowed successfully' }); // ✅ fixed
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const removePlayer = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id); // ✅ fixed findById + params
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    quiz.allowedPlayers = quiz.allowedPlayers.filter(p => p.toString() !== req.params.userId); // ✅ fixed
    quiz.pendingPlayers = quiz.pendingPlayers.filter(p => p.toString() !== req.params.userId);

    await quiz.save();
    res.status(200).json({ message: 'Player removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const startQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('questions');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.questions.length === 0) return res.status(400).json({ message: 'Cannot start quiz with no questions' });

    quiz.status = 'live';
    quiz.startedAt = new Date();
    quiz.currentQuestion = 0;
    quiz.questionStartedAt = new Date();
    await quiz.save();
    res.status(200).json({ message: 'Quiz Started!', quiz });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const nextQuestion = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('questions');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    if (quiz.currentQuestion >= quiz.questions.length - 1) { // ✅ fixed
      quiz.status = 'ended';
      await quiz.save();
      return res.status(200).json({ message: 'Quiz ended!', ended: true });
    }

    quiz.currentQuestion += 1;
    quiz.questionStartedAt = new Date();
    await quiz.save();
    res.status(200).json({
      message: 'Next question',
      currentQuestion: quiz.currentQuestion,
      question: quiz.questions[quiz.currentQuestion],
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const submitAnswer = async (req, res) => {
  try {
    const { questionId, answer } = req.body;
    const quiz = await Quiz.findById(req.params.id).populate('questions');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.status !== 'live') return res.status(400).json({ message: 'Quiz is not live' });

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    const timeElapsed = (new Date() - quiz.questionStartedAt) / 1000;
    const answeredInTime = timeElapsed <= question.timeLimit;
    const isCorrect = answer === question.correctAnswer;

    let score = await Score.findOne({ userId: req.user.id, quizId: req.params.id });
    if (!score) {
      score = new Score({
        userId: req.user.id, quizId: req.params.id,
        score: 0, total: quiz.questions.length, answers: [],
      });
    }

    const alreadyAnswered = score.answers.find(a => a.questionId.toString() === questionId);
    if (alreadyAnswered) return res.status(400).json({ message: 'Already answered this question' });

    score.answers.push({ questionId, answer, isCorrect, answeredInTime });
    if (isCorrect && answeredInTime) score.score += 1;
    await score.save();

    res.status(200).json({
      message: 'Answer submitted',
      isCorrect, answeredInTime,
      correctAnswer: question.correctAnswer,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getScoreboard = async (req, res) => {
  try {
    const scores = await Score.find({ quizId: req.params.id })
      .populate('userId', 'name')
      .sort({ score: -1 });
    res.status(200).json(scores);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const adminEditQuiz = async (req, res) => {
  try {
    const { title, description } = req.body;
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id, { title, description }, { new: true }
    );
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    await Notification.create({
      to: quiz.createdBy, from: req.user.id,
      quizId: quiz._id,
      message: `Admin updated your quiz "${quiz.title}"`,
    });
    res.status(200).json({ message: 'Quiz updated and creator notified', quiz });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const addQuestion = async (req, res) => {
  try {
    const { questionText, options, correctAnswer, timeLimit } = req.body;
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const question = await Question.create({
      quizId: req.params.id,
      questionText, options, correctAnswer,
      timeLimit: timeLimit || 30,
    });

    quiz.questions.push(question._id);
    await quiz.save();
    res.status(201).json({ message: 'Question added', question });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    await Quiz.findByIdAndUpdate(req.params.id, { // ✅ fixed params
      $pull: { questions: question._id },          // ✅ fixed field name
    });
    res.status(200).json({ message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    await Question.deleteMany({ quizId: req.params.id });
    res.status(200).json({ message: 'Quiz deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  createQuiz, getMyQuizzes, joinByCode, joinByLink,
  allowPlayer, removePlayer, startQuiz, nextQuestion,
  submitAnswer, getScoreboard, adminEditQuiz,
  addQuestion, deleteQuestion, deleteQuiz,
};