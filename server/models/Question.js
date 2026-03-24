const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true, // ✅
    },
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      validate: {
        validator: (val) => val.length === 4,
        message: "There must be exactly 4 options",
      },
      required: true,
    },
    correctAnswer: {
      type: String,
      required: true,
    },
    timeLimit:{
      type: Number,
      default: 30,
      min: 5,
      max: 120,
    },
  },
  { timestamps: true } // ✅ plural
);

module.exports = mongoose.model("Question", questionSchema);