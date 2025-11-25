// backend/models/Guideline.js
const db = require('../config/db');

const Guideline = {
    /**
     * Admin: Creates a new guideline.
     * @param {Object} data - { title, content, type (e.g., 'tender_request'), status ('draft' or 'published') }
     * @param {Function} callback
     */
    create: (data, callback) => {
        const { title, content, type, status = 'draft' } = data; 
        const sql = `INSERT INTO guidelines (title, content, type, status, created_at) VALUES (?, ?, ?, ?, NOW())`;
        db.query(sql, [title, content, type, status], callback);
    },

    /**
     * Admin: Retrieves a guideline by ID.
     * @param {number} id
     * @param {Function} callback
     */
    getById: (id, callback) => {
        db.query("SELECT * FROM guidelines WHERE id = ?", [id], callback);
    },

    /**
     * Admin: Updates an existing guideline.
     * @param {number} id
     * @param {Object} data - fields to update
     * @param {Function} callback
     */
    update: (id, data, callback) => {
        const fields = [];
        const values = [];

        for (const key in data) {
            if (data.hasOwnProperty(key) && data[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(data[key]);
            }
        }
        
        if (fields.length === 0) {
            return callback(null, { affectedRows: 0 });
        }

        const sql = `UPDATE guidelines SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
        values.push(id);
        db.query(sql, values, callback);
    },

    /**
     * Admin: Deletes a guideline.
     * @param {number} id
     * @param {Function} callback
     */
    delete: (id, callback) => {
        db.query("DELETE FROM guidelines WHERE id = ?", [id], callback);
    },

    /**
     * Admin: Gets all guidelines for management purposes.
     * @param {Function} callback
     */
    getAllForAdmin: (callback) => {
        const sql = `SELECT * FROM guidelines ORDER BY created_at DESC`;
        db.query(sql, callback);
    },

    /**
     * Client/Public: Gets all published guidelines (Requirement 2).
     * NOTE: This query strictly enforces status = 'published'.
     * @param {Function} callback
     */
    getAllPublishedTenderGuidelines: (callback) => {
        const sql = `SELECT id, title, content, created_at FROM guidelines 
                     WHERE type = 'tender_request' AND status = 'published'
                     ORDER BY created_at ASC`;
        db.query(sql, callback);
    }
};

module.exports = Guideline;