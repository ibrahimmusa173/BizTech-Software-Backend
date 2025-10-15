const db = require('../config/db');

const Tender = {
    create: (tenderData, callback) => {
        const { client_id, title, description, category, budget_range, deadline, location, contact_info, attachments, status } = tenderData;
        const sql = `INSERT INTO tenders (client_id, title, description, category, budget_range, deadline, location, contact_info, attachments, status)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.query(sql, [client_id, title, description, category, budget_range, deadline, location, contact_info, attachments, status], callback);
    },

    // Get all tenders (for admin or general search)
    getAll: (callback) => {
        db.query("SELECT * FROM tenders", callback);
    },

    // Get a single tender by ID
    getById: (id, callback) => {
        db.query("SELECT * FROM tenders WHERE id = ?", [id], callback);
    },

    // Get tenders by a specific client
    findByClientId: (clientId, callback) => {
        db.query("SELECT * FROM tenders WHERE client_id = ?", [clientId], callback);
    },

    update: (id, tenderData, callback) => {
        const fields = [];
        const values = [];

        for (const key in tenderData) {
            if (tenderData.hasOwnProperty(key) && tenderData[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(tenderData[key]);
            }
        }

        if (fields.length === 0) {
            return callback(null, { affectedRows: 0 }); // No fields to update
        }

        const sql = `UPDATE tenders SET ${fields.join(', ')} WHERE id = ?`;
        values.push(id);
        db.query(sql, values, callback);
    },

    delete: (id, callback) => {
        const sql = "DELETE FROM tenders WHERE id = ?";
        db.query(sql, [id], callback);
    },

    // Search tenders with filters
    search: (filters, callback) => {
        let sql = `SELECT t.*, u.name as client_name, u.company_name as client_company
                   FROM tenders t
                   JOIN users u ON t.client_id = u.id
                   WHERE 1=1`;
        const values = [];

        if (filters.keywords) {
            const searchKw = `%${filters.keywords}%`;
            sql += ` AND (t.title LIKE ? OR t.description LIKE ? OR t.category LIKE ?)`;
            values.push(searchKw, searchKw, searchKw);
        }
        if (filters.category) {
            sql += ` AND t.category = ?`;
            values.push(filters.category);
        }
        if (filters.location) {
            sql += ` AND t.location LIKE ?`;
            values.push(`%${filters.location}%`);
        }
        if (filters.min_budget) {
            // Assuming budget_range is flexible string, might need parsing or better schema
            // For now, a simple LIKE search or client-side filtering might be necessary
            // Or a more complex SQL query if budget_range had specific numeric format
            sql += ` AND (t.budget_range LIKE ? OR t.budget_range = 'Negotiable')`; // Very basic, improve as needed
            values.push(`%${filters.min_budget}%`);
        }
        if (filters.max_budget) {
            sql += ` AND (t.budget_range LIKE ? OR t.budget_range = 'Negotiable')`; // Very basic, improve as needed
            values.push(`%${filters.max_budget}%`);
        }
        if (filters.status) {
            sql += ` AND t.status = ?`;
            values.push(filters.status);
        } else if (filters.status === null && !filters.keywords && !filters.category && !filters.location && !filters.min_budget && !filters.max_budget) {
            // If admin searches without status, show all except drafts by default, or explicitly all
            // For general users, default to 'active' is handled in controller
            // If admin explicitly wants all, the status should be 'all' or similar
            // For now, if null for admin, it means no status filter applied
        }


        // Ordering
        sql += ` ORDER BY t.${filters.sort_by || 'created_at'} ${filters.order_by === 'ASC' ? 'ASC' : 'DESC'}`;

        db.query(sql, values, callback);
    }
};

module.exports = Tender;