const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all notifications for the authenticated user
router.get("/", authenticateToken, notificationController.getUserNotifications);

// Get the count of unread notifications for the authenticated user
router.get("/unread-count", authenticateToken, notificationController.getUnreadCount);

// Mark a specific notification as read, or mark all as read if no ID provided
router.patch("/mark-read/:id?", authenticateToken, notificationController.markNotificationAsRead);

module.exports = router;