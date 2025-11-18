// backend/controllers/proposalController.js
const Proposal = require('../models/Proposal');
const fs = require('fs');
const path = require('path');

const proposalController = {
    // Req 1: POST /api/proposals (Handles file upload)
    submitProposal: (req, res) => {
        // req.body contains text fields; req.files contains file data (thanks to Multer)
        const { tender_id, cover_letter, proposed_solution, pricing } = req.body;
        const vendor_id = req.user.id; // Extracted from JWT by authMiddleware

        if (!tender_id || !cover_letter || !proposed_solution || !pricing) {
            // Clean up uploaded files if required fields are missing
            if (req.files) {
                req.files.forEach(file => fs.unlinkSync(file.path));
            }
            return res.status(400).send({ message: "Missing required proposal fields." });
        }
        
        // Map uploaded file information to store in the DB (only path/filename needed)
        const attachments = req.files ? req.files.map(file => ({ 
            filename: file.originalname, 
            path: file.path, 
            mimeType: file.mimetype 
        })) : [];

        const proposalData = {
            tender_id,
            vendor_id,
            cover_letter,
            proposed_solution,
            pricing,
            attachments
        };

        Proposal.create(proposalData, (err, result) => {
            if (err) {
                console.error('Error submitting proposal:', err);
                // Clean up files on DB failure
                attachments.forEach(att => fs.unlinkSync(att.path));
                return res.status(500).send({ message: "Database error during proposal submission." });
            }
            res.status(201).send({ message: "Proposal submitted successfully!", id: result.insertId });
        });
    },

    // Req 2: GET /api/proposals/my-proposals (Vendor)
    getMyProposals: (req, res) => {
        const vendorId = req.user.id;

        Proposal.getByVendor(vendorId, (err, proposals) => {
            if (err) {
                console.error('Error fetching my proposals:', err);
                return res.status(500).send({ message: "Error fetching proposals." });
            }
            res.status(200).send(proposals);
        });
    },

    // Req 5: GET /api/proposals/tender/:tenderId (Client/Admin)
    getProposalsByTender: (req, res) => {
        const { tenderId } = req.params;

        Proposal.getByTender(tenderId, (err, proposals) => {
            if (err) {
                console.error('Error fetching proposals by tender:', err);
                return res.status(500).send({ message: "Error fetching proposals for tender." });
            }
            res.status(200).send(proposals);
        });
    },

    // Req 4/7: GET /api/proposals/:id (Client/Vendor/Admin detail view)
    getProposalDetails: (req, res) => {
        const { id } = req.params;
        const userId = req.user.id;
        const userType = req.user.user_type;

        Proposal.getById(id, (err, rows) => {
            if (err) {
                console.error('Error fetching proposal detail:', err);
                return res.status(500).send({ message: "Error fetching proposal details." });
            }
            if (rows.length === 0) {
                return res.status(404).send({ message: "Proposal not found." });
            }
            
            const proposal = rows[0];
            
            // Basic Authorization Check: Must be the vendor, the tender client, or an admin.
            // (Note: This assumes we have Tender.getClientIdByTenderId, which we don't, 
            // so we rely heavily on the backend route protection if Client access is required here. 
            // For now, we allow access if vendor_id matches or if admin.)
            if (userType === 'admin' || proposal.vendor_id === userId) {
                 // Convert attachments string back to array if necessary
                 proposal.attachments = JSON.parse(proposal.attachments); 
                 return res.status(200).send(proposal);
            }

            // Simplified client check (requires tender client ID logic on backend)
            // For now, let's deny generic access if not admin/vendor:
            return res.status(403).send({ message: "Not authorized to view this proposal." });
        });
    },

    // Req 3/6/10: PATCH /api/proposals/:id/status
    updateProposalStatus: (req, res) => {
        const { id } = req.params;
        const { status } = req.body;
        const allowedStatuses = ['submitted', 'withdrawn', 'shortlisted', 'rejected', 'awarded', 'viewed'];
        
        if (!status || !allowedStatuses.includes(status.toLowerCase())) {
            return res.status(400).send({ message: "Invalid status provided." });
        }
        
        // Authorization logic should be here: 
        // 1. Vendor can only set status to 'withdrawn'.
        // 2. Client/Admin can set status to 'shortlisted', 'rejected', 'awarded', 'viewed'.

        const userType = req.user.user_type;

        if (status.toLowerCase() === 'withdrawn') {
            if (userType !== 'vendor') {
                return res.status(403).send({ message: "Only the vendor can withdraw a proposal." });
            }
            // Further check needed: must be the correct vendor (implicit if using ID from token)
        } else {
            if (userType !== 'admin' && userType !== 'client') {
                return res.status(403).send({ message: "Only client or admin can manage proposal status." });
            }
            // Further check needed: must be the client who owns the tender.
        }

        Proposal.updateStatus(id, status, (err, result) => {
             if (err) {
                console.error('Error updating proposal status:', err);
                return res.status(500).send({ message: "Error updating proposal status." });
            }
            if (result.affectedRows === 0) {
                 return res.status(404).send({ message: "Proposal not found or no change made." });
            }
            res.status(200).send({ message: `Status updated to ${status} successfully!` });
        });
    },

    // Req 8: GET /api/proposals/admin/all
    getAllProposalsAdmin: (req, res) => {
        // Admin middleware handles authorization
        Proposal.getAllAdmin((err, proposals) => {
            if (err) {
                console.error('Error fetching all proposals (Admin):', err);
                return res.status(500).send({ message: "Error fetching all proposals." });
            }
            res.status(200).send(proposals);
        });
    },

    // Req 9: DELETE /api/proposals/admin/:id
    deleteProposalAdmin: (req, res) => {
        const { id } = req.params;
        // Admin middleware handles authorization
        
        // In a real application, you would also delete the associated files from the filesystem here.
        
        Proposal.delete(id, (err, result) => {
            if (err) {
                console.error('Error deleting proposal (Admin):', err);
                return res.status(500).send({ message: "Error deleting proposal." });
            }
            if (result.affectedRows === 0) {
                 return res.status(404).send({ message: "Proposal not found." });
            }
            res.status(200).send({ message: "Proposal deleted successfully." });
        });
    },
};

module.exports = proposalController;