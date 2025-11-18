// backend/models/Proposal.js
const db = require('../config/db'); 

const Proposal = {
    // Req 1: Submit Proposal
    create: (proposalData, callback) => {
        const { tender_id, vendor_id, cover_letter, proposed_solution, pricing, attachments } = proposalData;
        const status = 'submitted'; // Default status upon submission

        const sql = "INSERT INTO proposals (tender_id, vendor_id, cover_letter, proposed_solution, pricing, attachments, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        // Ensure attachments is stored as a JSON string
        const attachmentsJson = JSON.stringify(attachments || []);

        db.query(sql, [tender_id, vendor_id, cover_letter, proposed_solution, pricing, attachmentsJson, status], callback);
    },

    // Req 2: Get My Proposals (Vendor Dashboard)
    getByVendor: (vendorId, callback) => {
        // SELECT relevant details for the dashboard view
        const sql = `
            SELECT 
                p.id AS proposal_id, 
                p.status, 
                p.pricing, 
                p.cover_letter,
                p.tender_id,
                t.title AS tender_title 
            FROM proposals p
            LEFT JOIN tenders t ON p.tender_id = t.id
            WHERE p.vendor_id = ?
        `;
        db.query(sql, [vendorId], callback);
    },

    // Req 5: Get Proposals by Tender (Client/Admin View)
    getByTender: (tenderId, callback) => {
         const sql = `
            SELECT 
                p.id, 
                p.status, 
                p.pricing, 
                p.cover_letter,
                p.proposed_solution,
                p.attachments,
                p.vendor_id,
                u.company_name AS vendor_company_name,
                p.createdAt
            FROM proposals p
            LEFT JOIN users u ON p.vendor_id = u.id
            WHERE p.tender_id = ?
        `;
        db.query(sql, [tenderId], callback);
    },

    // Req 4/7: Get Single Proposal Detail
    getById: (proposalId, callback) => {
        const sql = "SELECT * FROM proposals WHERE id = ?";
        db.query(sql, [proposalId], callback);
    },

    // Req 3/6/10: Update Proposal Status
    updateStatus: (proposalId, newStatus, callback) => {
        const sql = "UPDATE proposals SET status = ?, updatedAt = NOW() WHERE id = ?";
        db.query(sql, [newStatus, proposalId], callback);
    },

    // Req 8: Get All Proposals (Admin View)
    getAllAdmin: (callback) => {
        const sql = `
            SELECT 
                p.id AS proposal_id, 
                p.status, 
                p.pricing, 
                p.vendor_id,
                t.title AS tenderTitle,
                p.createdAt
            FROM proposals p
            LEFT JOIN tenders t ON p.tender_id = t.id
            ORDER BY p.createdAt DESC
        `;
        db.query(sql, callback);
    },

    // Req 9: Delete Proposal (Admin)
    delete: (proposalId, callback) => {
        const sql = "DELETE FROM proposals WHERE id = ?";
        db.query(sql, [proposalId], callback);
    }
};

module.exports = Proposal;