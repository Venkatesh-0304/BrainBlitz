const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
