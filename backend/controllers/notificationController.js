const Notification = require('../models/Notification');

const notificationController = {
    // Get all notifications for the authenticated user
    getUserNotifications: (req, res) => {
        const userId = req.user.id;
        Notification.findByUserId(userId, (err, notifications) => {
            if (err) {
                console.error('Error fetching notifications:', err);
                return res.status(500).send({ message: "Error fetching notifications." });
            }
            res.status(200).send(notifications);
        });
    },

    // Get the count of unread notifications
    getUnreadCount: (req, res) => {
        const userId = req.user.id;
        Notification.getUnreadCount(userId, (err, result) => {
            if (err) {
                console.error('Error fetching unread count:', err);
                return res.status(500).send({ message: "Error fetching unread count." });
            }
            // result is an array [{ unread_count: X }]
            res.status(200).send({ unread_count: result[0].unread_count });
        });
    },

    // Mark a notification (or all) as read
    markNotificationAsRead: (req, res) => {
        const userId = req.user.id;
        const notificationId = req.params.id || null; // Optional parameter

        Notification.markAsRead(userId, notificationId, (err, result) => {
            if (err) {
                console.error('Error marking notifications as read:', err);
                return res.status(500).send({ message: "Error updating notification status." });
            }
            const message = notificationId
                ? "Notification marked as read."
                : `${result.affectedRows} notifications marked as read.`;

            res.status(200).send({ message });
        });
    }
};

module.exports = notificationController;