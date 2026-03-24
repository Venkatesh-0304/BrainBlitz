const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const quizSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    quizCode: {
      type: String,
      unique: true, // ✅ fixed typo
      sparse: true,
    },
    status: {
      type: String,
      enum: ["draft", "waiting", "live", "ended"],
      default: "draft",
    },
    allowedPlayers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    pendingPlayers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    currentQuestion: {
      type: Number,
      default: 0,
    },
    questionStartedAt: {
      type: Date,
    },
    startedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Quiz", quizSchema);
