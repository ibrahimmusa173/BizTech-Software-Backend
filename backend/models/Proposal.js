const db = require('../config/db');

const Proposal = {
    create: (proposalData, callback) => {
        const { tender_id, vendor_id, cover_letter, proposed_solution, pricing, attachments, status } = proposalData;
        const sql = `INSERT INTO proposals (tender_id, vendor_id, cover_letter, proposed_solution, pricing, attachments, status)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
        db.query(sql, [tender_id, vendor_id, cover_letter, proposed_solution, pricing, attachments, status], callback);
    },

    getById: (id, callback) => {
        db.query("SELECT * FROM proposals WHERE id = ?", [id], callback);
    },

    // Get all proposals for a specific tender (for client/admin to view)
    findByTenderId: (tenderId, callback) => {
        const sql = `SELECT p.*, u.name as vendor_name, u.company_name as vendor_company, u.email as vendor_email
                     FROM proposals p
                     JOIN users u ON p.vendor_id = u.id
                     WHERE p.tender_id = ?`;
        db.query(sql, [tenderId], callback);
    },

    // Get all proposals submitted by a specific vendor
    findByVendorId: (vendorId, callback) => {
        const sql = `SELECT p.*, t.title as tender_title, t.description as tender_description, t.client_id
                     FROM proposals p
                     JOIN tenders t ON p.tender_id = t.id
                     WHERE p.vendor_id = ?`;
        db.query(sql, [vendorId], callback);
    },

    update: (id, proposalData, callback) => {
        const fields = [];
        const values = [];

        for (const key in proposalData) {
            if (proposalData.hasOwnProperty(key) && proposalData[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(proposalData[key]);
            }
        }

        if (fields.length === 0) {
            return callback(null, { affectedRows: 0 }); // No fields to update
        }

        const sql = `UPDATE proposals SET ${fields.join(', ')} WHERE id = ?`;
        values.push(id);
        db.query(sql, values, callback);
    },

    delete: (id, callback) => {
        const sql = "DELETE FROM proposals WHERE id = ?";
        db.query(sql, [id], callback);
    }
};

module.exports = Proposal;