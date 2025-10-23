const db = require('../config/db');

const Notification = {
    /**
     * Creates a new notification in the database.
     * @param {Object} data - { user_id, type, message, reference_id (optional, e.g., proposal_id or tender_id) }
     * @param {Function} callback
     */
    create: (data, callback) => {
        const { user_id, type, message, reference_id } = data;
        const sql = `INSERT INTO notifications (user_id, type, message, reference_id)
                     VALUES (?, ?, ?, ?)`;
        db.query(sql, [user_id, type, message, reference_id], callback);
    },

    /**
     * Fetches all notifications for a given user, ordered by creation date.
     * @param {number} userId
     * @param {Function} callback
     */
    findByUserId: (userId, callback) => {
        const sql = `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`;
        db.query(sql, [userId], callback);
    },

    /**
     * Marks a specific notification or all unread notifications as read.
     * @param {number} userId - The owner of the notification
     * @param {number|null} notificationId - Specific ID to mark, or null to mark all
     * @param {Function} callback
     */
    markAsRead: (userId, notificationId, callback) => {
        let sql = `UPDATE notifications SET is_read = TRUE WHERE user_id = ?`;
        const values = [userId];

        if (notificationId) {
            sql += ` AND id = ?`;
            values.push(notificationId);
        } else {
            sql += ` AND is_read = FALSE`;
        }

        db.query(sql, values, callback);
    },

    getUnreadCount: (userId, callback) => {
        const sql = `SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = FALSE`;
        db.query(sql, [userId], callback);
    }
};

module.exports = Notification;