const Quiz = require('../models/Quiz');
const Score = require('../models/Score');

const quizSocket = (io) => {

  io.on('connection', (socket) => {
    console.log('New socket connection:', socket.id);

    // Player or creator joins a quiz room
    socket.on('join-quiz-room', async ({ quizId, userId, userName, role }) => {
      socket.join(quizId);
      socket.data.userId = userId;
      socket.data.userName = userName;
      socket.data.quizId = quizId;
      socket.data.role = role;

      console.log(`${userName} joined quiz room ${quizId}`);

      // notify creator a player joined
      if (role === 'player') {
        io.to(quizId).emit('player-joined', {
          userId,
          userName,
          message: `${userName} joined the quiz!`,
        });
      }
    });

    // Creator starts the quiz
    socket.on('start-quiz', async ({ quizId }) => {
      try {
        const quiz = await Quiz.findById(quizId).populate('questions');
        if (!quiz) return;

        const firstQuestion = quiz.questions[0];

        // broadcast to all players in room
        io.to(quizId).emit('quiz-started', {
          message: 'Quiz is starting!',
          currentQuestion: 0,
          question: {
            _id: firstQuestion._id,
            questionText: firstQuestion.questionText,
            options: firstQuestion.options,
            timeLimit: firstQuestion.timeLimit,
          },
          totalQuestions: quiz.questions.length,
        });

        // start countdown timer
        startTimer(io, quizId, firstQuestion.timeLimit, 0, quiz);

      } catch (err) {
        console.error('start-quiz error:', err);
      }
    });

    // Creator moves to next question
    socket.on('next-question', async ({ quizId, currentIndex }) => {
      try {
        const quiz = await Quiz.findById(quizId).populate('questions');
        if (!quiz) return;

        const nextIndex = currentIndex + 1;

        if (nextIndex >= quiz.questions.length) {
          // end quiz
          const scores = await Score.find({ quizId })
            .populate('userId', 'name')
            .sort({ score: -1 });

          io.to(quizId).emit('quiz-ended', {
            message: 'Quiz has ended!',
            scores,
          });
          return;
        }

        const nextQuestion = quiz.questions[nextIndex];

        io.to(quizId).emit('new-question', {
          currentQuestion: nextIndex,
          question: {
            _id: nextQuestion._id,
            questionText: nextQuestion.questionText,
            options: nextQuestion.options,
            timeLimit: nextQuestion.timeLimit,
          },
          totalQuestions: quiz.questions.length,
        });

        // start timer for next question
        startTimer(io, quizId, nextQuestion.timeLimit, nextIndex, quiz);

      } catch (err) {
        console.error('next-question error:', err);
      }
    });

    // Player submits an answer
    socket.on('submit-answer', async ({ quizId, questionId, answer, userId }) => {
      try {
        const quiz = await Quiz.findById(quizId).populate('questions');
        if (!quiz) return;

        const question = quiz.questions.find(
          q => q._id.toString() === questionId
        );
        if (!question) return;

        const isCorrect = answer === question.correctAnswer;

        // update score in db
        let score = await Score.findOne({ userId, quizId });
        if (!score) {
          score = new Score({
            userId,
            quizId,
            score: 0,
            total: quiz.questions.length,
            answers: [],
          });
        }

        const alreadyAnswered = score.answers.find(
          a => a.questionId.toString() === questionId
        );

        if (!alreadyAnswered) {
          score.answers.push({ questionId, answer, isCorrect, answeredInTime: true });
          if (isCorrect) score.score += 1;
          await score.save();
        }

        // send result back to the player who answered
        socket.emit('answer-result', {
          isCorrect,
          correctAnswer: question.correctAnswer,
          yourAnswer: answer,
        });

        // broadcast updated scoreboard to everyone in room
        const scores = await Score.find({ quizId })
          .populate('userId', 'name')
          .sort({ score: -1 });

        io.to(quizId).emit('score-update', { scores });

      } catch (err) {
        console.error('submit-answer error:', err);
      }
    });

    // Creator removes a player
    socket.on('remove-player', ({ quizId, userId, userName }) => {
      // find that player's socket and emit removed event
      io.to(quizId).emit('player-removed', {
        userId,
        message: `${userName} was removed from the quiz`,
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
      if (socket.data.quizId && socket.data.userName) {
        io.to(socket.data.quizId).emit('player-left', {
          userId: socket.data.userId,
          userName: socket.data.userName,
          message: `${socket.data.userName} left the quiz`,
        });
      }
    });
  });
};

// Timer helper function
const startTimer = (io, quizId, timeLimit, questionIndex, quiz) => {
  let timeLeft = timeLimit;

  const interval = setInterval(async () => {
    timeLeft -= 1;

    // broadcast time remaining to all players
    io.to(quizId).emit('timer-tick', {
      timeLeft,
      questionIndex,
    });

    if (timeLeft <= 0) {
      clearInterval(interval);

      // auto advance to next question
      io.to(quizId).emit('timer-ended', {
        questionIndex,
        message: 'Time is up!',
      });
    }
  }, 1000);
};

module.exports = quizSocket;