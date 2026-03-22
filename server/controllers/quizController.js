const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Score = require('../models/Score');

// Get all quizzes
const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate('createdBy', 'name');
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get quiz by id
const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('questions');
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const sanitizedQuestion = quiz.questions.map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options,
    }));

    res.status(200).json({
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      questions: sanitizedQuestion, // ✅ plural
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Submit quiz answers and calculate score
const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body; // ✅ answers not answer

    const quiz = await Quiz.findById(req.params.id).populate('questions');
    if (!quiz) return res.status(404).json({ message: "Quiz not found" }); // ✅ status

    let score = 0;
    const total = quiz.questions.length; // ✅ questions not question

    const results = quiz.questions.map((question) => {
      const userAnswer = answers.find( // ✅ answers is now defined
        (a) => a.questionId === question._id.toString()
      );
      const isCorrect = userAnswer?.answer === question.correctAnswer;
      if (isCorrect) score++;
      return {
        questionText: question.questionText,
        correctAnswer: question.correctAnswer,
        userAnswer: userAnswer?.answer || "not answered",
        isCorrect,
      };
    });

    await Score.create({
      userId: req.user.id,
      quizId: req.params.id,
      score,
      total,
    });

    res.status(200).json({
      message: "Quiz submitted successfully",
      score,
      total,
      percentage: Math.round((score / total) * 100), // ✅ spelling
      results,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Score.find({ quizId: req.params.quizId }) // ✅ chained before await
      .populate('userId', 'name')
      .sort({ score: -1 })
      .limit(10);
    res.status(200).json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  getAllQuizzes,
  getQuizById,
  submitQuiz,
  getLeaderboard,
};