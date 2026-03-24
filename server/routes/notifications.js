const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

const { 
    getNotifications,
    markAsRead,
    markAllRead,
} = require('../controllers/notificationController');

router.use(verifyToken);

router.get('/',getNotifications);
router.get('/:id/read',markAsRead);
router.get('/read/all',markAllRead);

module.exports = router;