const Notification = require('../models/Notification');

const notificationController = {
    /**
     * getMyNotifications
     * Description: Retrieves all notifications for the authenticated user.
     * Access: Client, Vendor, Admin
     */
    getMyNotifications: (req, res) => {
        const userId = req.user.id;
        Notification.findByUserId(userId, (err, notifications) => {
            if (err) {
                console.error('Error fetching notifications:', err);
                return res.status(500).send({ message: "Error fetching notifications." });
            }
            res.status(200).send(notifications);
        });
    },

    /**
     * markAsRead
     * Description: Marks a specific notification as read.
     * Access: Client, Vendor, Admin (User-specific)
     */
    markAsRead: (req, res) => {
        const notificationId = req.params.id;
        const userId = req.user.id;

        Notification.markAsRead(notificationId, userId, (err, result) => {
            if (err) {
                console.error('Error marking notification as read:', err);
                return res.status(500).send({ message: "Error updating notification status." });
            }
            if (result.affectedRows === 0) {
                return res.status(404).send({ message: "Notification not found or access denied." });
            }
            res.status(200).send({ message: "Notification marked as read." });
        });
    }
};

module.exports = notificationController;