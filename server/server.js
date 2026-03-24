require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/dbconfig');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const quizRoutes = require('./routes/quiz');
const quizLiveRoutes = require('./routes/quizLive');
const superAdminRoutes = require('./routes/superAdmin');
const notificationRoutes = require('./routes/notifications'); // ✅ check this exists

const quizSocket = require('./socket/quizSocket');

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://brain-blitz-gules.vercel.app',
      'https://brain-blitz-git-main-venkatesh-0304s-projects.vercel.app',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3500;

connectDB();

app.use(cors({
  origin: '*',
  credentials: false,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/live', quizLiveRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/notifications', notificationRoutes); // ✅ check this exists

quizSocket(io);

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});