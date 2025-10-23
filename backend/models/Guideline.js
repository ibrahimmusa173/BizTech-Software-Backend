const db = require('../config/db');

const Guideline = {
    // Admin: Create new content section
    create: (data, callback) => {
        const sql = 'INSERT INTO guidelines (title, content, type) VALUES (?, ?, ?)';
        db.query(sql, [data.title, data.content, data.type || 'tender_request'], callback);
    },

    // Client/Vendor: Get all guidelines (public access)
    getAll: (callback) => {
        const sql = 'SELECT id, title, content, updated_at FROM guidelines WHERE type = ? ORDER BY id ASC';
        db.query(sql, ['tender_request'], callback);
    },

    // Admin: Get a single guideline by ID
    getById: (id, callback) => {
        db.query("SELECT * FROM guidelines WHERE id = ?", [id], callback);
    },

    // Admin: Update content
    update: (id, data, callback) => {
        const sql = 'UPDATE guidelines SET title = ?, content = ?, updated_at = NOW() WHERE id = ?';
        db.query(sql, [data.title, data.content, id], callback);
    },

    // Admin: Delete content
    delete: (id, callback) => {
        db.query("DELETE FROM guidelines WHERE id = ?", [id], callback);
    }
};

module.exports = Guideline;