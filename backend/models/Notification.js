const db = require('../config/db');

const Notification = {
    // Utility to get user ID by tender ID (Crucial for Client notifications)
    getClientIdByTenderId: (tenderId, callback) => {
        const sql = 'SELECT client_id FROM tenders WHERE id = ?';
        db.query(sql, [tenderId], (err, results) => {
            if (err) return callback(err);
            if (results.length === 0) return callback(null, null);
            callback(null, results[0].client_id);
        });
    },

    // Utility to get vendor ID by proposal ID (Crucial for Vendor notifications)
    getVendorIdByProposalId: (proposalId, callback) => {
        const sql = 'SELECT vendor_id FROM proposals WHERE id = ?';
        db.query(sql, [proposalId], (err, results) => {
            if (err) return callback(err);
            if (results.length === 0) return callback(null, null);
            callback(null, results[0].vendor_id);
        });
    },

    // Create a new notification entry
    create: (userId, message, type, contextId, callback) => {
        const sql = `INSERT INTO notifications (user_id, message, type, context_id) VALUES (?, ?, ?, ?)`;
        db.query(sql, [userId, message, type, contextId], callback);
    },

    // Get notifications for a specific user
    findByUserId: (userId, callback) => {
        const sql = `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`;
        db.query(sql, [userId], callback);
    },

    // Mark a notification as read
    markAsRead: (notificationId, userId, callback) => {
        const sql = `UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?`;
        db.query(sql, [notificationId, userId], callback);
    }
};

module.exports = Notification;