const db = require('../config/db');

const Proposal = {
    // Bidder: Create a new proposal
    create: (proposalData, callback) => {
        const { tender_id, bidder_id, proposal_text, bid_amount } = proposalData;
        const sql = "INSERT INTO proposals (tender_id, bidder_id, proposal_text, bid_amount) VALUES (?, ?, ?, ?)";
        db.query(sql, [tender_id, bidder_id, proposal_text, bid_amount], callback);
    },

    // Client/Admin: Get all proposals for a specific tender
    getByTenderId: (tender_id, callback) => {
        const sql = `
            SELECT p.*, u.name as bidder_name, u.company_name as bidder_company
            FROM proposals p
            JOIN users u ON p.bidder_id = u.id
            WHERE p.tender_id = ?
            ORDER BY p.created_at ASC
        `;
        db.query(sql, [tender_id], callback);
    },

    // Bidder: Get all proposals submitted by a specific bidder
    getByBidderId: (bidder_id, callback) => {
        const sql = `
            SELECT p.*, t.title as tender_title, t.status as tender_status
            FROM proposals p
            JOIN tenders t ON p.tender_id = t.id
            WHERE p.bidder_id = ?
            ORDER BY p.created_at DESC
        `;
        db.query(sql, [bidder_id], callback);
    },

    // Client/Admin: Update proposal status (e.g., accept/reject)
    updateStatus: (id, status, callback) => {
        const sql = "UPDATE proposals SET status = ? WHERE id = ?";
        db.query(sql, [status], callback);
    },

    // Admin: Get a single proposal by ID
    getById: (id, callback) => {
        const sql = `
            SELECT p.*, u.name as bidder_name, u.company_name as bidder_company,
                   t.title as tender_title, t.description as tender_description
            FROM proposals p
            JOIN users u ON p.bidder_id = u.id
            JOIN tenders t ON p.tender_id = t.id
            WHERE p.id = ?
        `;
        db.query(sql, [id], callback);
    },

    // Admin: Delete a proposal
    delete: (id, callback) => {
        const sql = "DELETE FROM proposals WHERE id = ?";
        db.query(sql, [id], callback);
    }
};

module.exports = Proposal;