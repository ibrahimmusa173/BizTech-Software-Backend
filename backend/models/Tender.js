const db = require('../config/db');

const Tender = {
    // Client: Create a new tender
    create: (tenderData, callback) => {
        const { title, description, client_id } = tenderData;
        const sql = "INSERT INTO tenders (title, description, client_id) VALUES (?, ?, ?)";
        db.query(sql, [title, description, client_id], callback);
    },

    // Client/Bidder/Admin: Get all tenders (can be filtered later)
    getAll: (callback) => {
        const sql = `
            SELECT t.*, u.name as client_name, u.company_name as client_company
            FROM tenders t
            JOIN users u ON t.client_id = u.id
            ORDER BY t.created_at DESC
        `;
        db.query(sql, callback);
    },

    // Client/Bidder/Admin: Get a single tender by ID
    getById: (id, callback) => {
        const sql = `
            SELECT t.*, u.name as client_name, u.company_name as client_company
            FROM tenders t
            JOIN users u ON t.client_id = u.id
            WHERE t.id = ?
        `;
        db.query(sql, [id], callback);
    },

    // Client: Get tenders created by a specific client
    getByClientId: (client_id, callback) => {
        const sql = `
            SELECT t.*, u.name as client_name, u.company_name as client_company
            FROM tenders t
            JOIN users u ON t.client_id = u.id
            WHERE t.client_id = ?
            ORDER BY t.created_at DESC
        `;
        db.query(sql, [client_id], callback);
    },

    // Client/Admin: Update tender details
    update: (id, tenderData, callback) => {
        const { title, description, status } = tenderData;
        const sql = "UPDATE tenders SET title = ?, description = ?, status = ? WHERE id = ?";
        db.query(sql, [title, description, status, id], callback);
    },

    // Client/Admin: Delete a tender
    delete: (id, callback) => {
        const sql = "DELETE FROM tenders WHERE id = ?";
        db.query(sql, [id], callback);
    }
};

module.exports = Tender;