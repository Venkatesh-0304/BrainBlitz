const Quiz = require('../models/Quiz');         // ✅
const Question = require('../models/Question'); // ✅

const createQuiz = async (req, res) => {
  const { title, description } = req.body;
  try {
    const quiz = await Quiz.create({
      title,
      description,
      createdBy: req.user.id, // ✅
    });
    res.status(201).json({ message: "Quiz successfully created", quiz });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate('createdBy', 'name email');
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateQuiz = async (req, res) => {
  try {
    const { title, description } = req.body;
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true } // ✅ boolean not string
    );
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.status(200).json({ message: "Quiz updated successfully", quiz });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" }); // ✅ status()
    await Question.deleteMany({ quizId: req.params.id });
    res.status(200).json({ message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addQuestion = async (req, res) => {
  try {
    const { questionText, options, correctAnswer } = req.body; // ✅ options
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" }); // ✅ status()

    const question = await Question.create({ // ✅ await
      quizId: req.params.id,
      questionText,
      options,       // ✅ options
      correctAnswer,
    });

    quiz.questions.push(question._id); // ✅ questions
    await quiz.save();

    res.status(201).json({ message: "Question created successfully", question });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { questionText, options, correctAnswer } = req.body;
    const question = await Question.findByIdAndUpdate(
      req.params.id, // ✅ id as first argument
      { questionText, options, correctAnswer },
      { new: true }
    );
    if (!question) return res.status(404).json({ message: "Question not found" });
    res.status(200).json({ message: "Question successfully updated", question });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    await Quiz.findByIdAndUpdate(question.quizId, {
      $pull: { questions: question._id },
    });
    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  createQuiz,
  getAllQuizzes,
  updateQuiz,
  deleteQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
};