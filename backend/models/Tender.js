// models/Tender.js
const db = require('../config/db');

const Tender = {
    
    // REQUIRED: Used in createTender controller
    create: (tenderData, callback) => {
        // tenderData contains client_id, title, description, attachments (JSON string), etc.
        const sql = 'INSERT INTO tenders SET ?';
        db.query(sql, tenderData, callback);
    },

    // REQUIRED: Used in updateTender, deleteTender, publishTender, extendDeadline, closeTender, archiveTender, getTenderDetails
    getById: (id, callback) => {
        const sql = 'SELECT * FROM tenders WHERE id = ?';
        db.query(sql, [id], callback);
    },
    
    // REQUIRED: Used in getClientTenders controller
    findByClientId: (client_id, callback) => {
        const sql = 'SELECT * FROM tenders WHERE client_id = ? ORDER BY created_at DESC';
        db.query(sql, [client_id], callback);
    },
    
    // REQUIRED: Used in deleteTender controller
    delete: (id, callback) => {
        const sql = 'DELETE FROM tenders WHERE id = ?';
        db.query(sql, [id], callback);
    },

    // Existing update function
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
            return callback(null, { affectedRows: 0 });
        }

        const sql = `UPDATE tenders SET ${fields.join(', ')} WHERE id = ?`;
        values.push(id);
        db.query(sql, values, callback);
    },
    
    // Existing search function
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
        
        if (filters.posting_date_start) {
            sql += ` AND DATE(t.created_at) >= ?`;
            values.push(filters.posting_date_start);
        }
        if (filters.posting_date_end) {
            sql += ` AND DATE(t.created_at) <= ?`;
            values.push(filters.posting_date_end);
        }
        
        if (filters.min_budget) {
            sql += ` AND (t.budget_range LIKE ? OR t.budget_range = 'Negotiable')`; 
            values.push(`%${filters.min_budget}%`);
        }
        if (filters.max_budget) {
            sql += ` AND (t.budget_range LIKE ? OR t.budget_range = 'Negotiable')`; 
            values.push(`%${filters.max_budget}%`);
        }
        if (filters.status) {
            sql += ` AND t.status = ?`;
            values.push(filters.status);
        } 


        // Ordering
        sql += ` ORDER BY t.${filters.sort_by || 'created_at'} ${filters.order_by === 'ASC' ? 'ASC' : 'DESC'}`;

        db.query(sql, values, callback);
    }
};

module.exports = Tender;