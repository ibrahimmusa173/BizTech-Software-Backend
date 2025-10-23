const Proposal = require('../models/Proposal');
const Tender = require('../models/Tender'); // To check tender status
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Notification = require('../models/Notification'); // <-- ADDED

// Configure Multer for file uploads for proposals
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/proposals';
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

const proposalController = {
    // Vendor: Submit a new proposal for an active tender
    submitProposal: [
        upload.array('attachments', 3), // Allow up to 3 attachments
        (req, res) => {
            const vendor_id = req.user.id;
            const tender_id = req.body.tender_id; // Must be provided in body
            const { cover_letter, proposed_solution, pricing } = req.body;

            if (!tender_id || !cover_letter || !proposed_solution || !pricing) {
                return res.status(400).send({ message: "Tender ID, Cover Letter, Proposed Solution, and Pricing are required." });
            }

            // First, check if the tender exists and is active
            Tender.getById(tender_id, (err, tenders) => {
                if (err) {
                    console.error('Error checking tender status:', err);
                    return res.status(500).send({ message: "Error submitting proposal." });
                }
                if (tenders.length === 0) {
                    return res.status(404).send({ message: "Tender not found." });
                }
                const tender = tenders[0];
                if (tender.status !== 'active' && tender.status !== 'approved') { // Can submit to active or approved tenders
                    return res.status(400).send({ message: "Proposals can only be submitted for active tenders." });
                }

                const attachments = req.files ? req.files.map(file => `/uploads/proposals/${file.filename}`) : [];

                const proposalData = {
                    tender_id,
                    vendor_id,
                    cover_letter,
                    proposed_solution,
                    pricing,
                    attachments: JSON.stringify(attachments),
                    status: 'pending' // Default status
                };

                Proposal.create(proposalData, (err, result) => {
                    if (err) {
                        console.error('Error submitting proposal:', err);
                        return res.status(500).send({ message: "Error submitting proposal." });
                    }

                    const proposalId = result.insertId;
                    const client_id = tender.client_id; 

                    // --- NEW NOTIFICATION LOGIC (Client: New Proposal Submission) ---
                    if (client_id) {
                        const message = `A new proposal has been submitted for your tender (ID: ${tender_id}).`;
                        Notification.create(client_id, message, 'new_proposal', proposalId, (notifErr) => {
                            if (notifErr) console.error("Error creating new proposal notification:", notifErr);
                        });
                    }
                    // -----------------------------------------------------------------

                    res.status(201).send({ message: "Proposal submitted successfully!", proposalId: proposalId });
                });
            });
        }
    ],

    // Client/Admin: Get all proposals for a specific tender
    getProposalsForTender: (req, res) => {
        const tender_id = req.params.tenderId; // From URL parameter
        const currentUserId = req.user.id;
        const currentUserType = req.user.user_type;

        // First, check if the user is authorized to view proposals for this tender
        Tender.getById(tender_id, (err, tenders) => {
            if (err) {
                console.error('Error checking tender for proposals:', err);
                return res.status(500).send({ message: "Server error." });
            }
            if (tenders.length === 0) {
                return res.status(404).send({ message: "Tender not found." });
            }
            const tender = tenders[0];

            // Only client who created the tender or an admin can view proposals for it
            if (tender.client_id !== currentUserId && currentUserType !== 'admin') {
                return res.status(403).send({ message: "You are not authorized to view proposals for this tender." });
            }

            Proposal.findByTenderId(tender_id, (err, proposals) => {
                if (err) {
                    console.error('Error fetching proposals for tender:', err);
                    return res.status(500).send({ message: "Error fetching proposals." });
                }
                res.status(200).send(proposals.map(proposal => {
                    if (proposal.attachments) {
                        proposal.attachments = JSON.parse(proposal.attachments);
                    }
                    return proposal;
                }));
            });
        });
    },

    // Vendor: Get all proposals submitted by the authenticated vendor
    getVendorProposals: (req, res) => {
        const vendor_id = req.user.id;
        Proposal.findByVendorId(vendor_id, (err, proposals) => {
            if (err) {
                console.error('Error fetching vendor proposals:', err);
                return res.status(500).send({ message: "Error fetching your proposals." });
            }
            res.status(200).send(proposals.map(proposal => {
                if (proposal.attachments) {
                    proposal.attachments = JSON.parse(proposal.attachments);
                }
                return proposal;
            }));
        });
    },

    // Client/Admin: Update proposal status (accept/reject)
    updateProposalStatus: (req, res) => {
        const proposalId = req.params.id;
        const { status } = req.body; // Expected status: 'accepted', 'rejected'
        const currentUserId = req.user.id;
        const currentUserType = req.user.user_type;

        if (!status || !['accepted', 'rejected','shortlisted'].includes(status)) {
            return res.status(400).send({ message: "Invalid status provided. Must be 'accepted' or 'rejected' or." });
        }

        // Verify authorization: Only the client who owns the tender or an admin can change proposal status
        Proposal.getById(proposalId, (err, proposals) => {
            if (err) {
                console.error('Error fetching proposal for status update:', err);
                return res.status(500).send({ message: "Server error." });
            }
            if (proposals.length === 0) {
                return res.status(404).send({ message: "Proposal not found." });
            }
            const proposal = proposals[0];

            Tender.getById(proposal.tender_id, (err, tenders) => {
                if (err) {
                    console.error('Error fetching tender for proposal status update:', err);
                    return res.status(500).send({ message: "Server error." });
                }
                if (tenders.length === 0) {
                    return res.status(404).send({ message: "Associated tender not found." });
                }
                const tender = tenders[0];

                if (tender.client_id !== currentUserId && currentUserType !== 'admin') {
                    return res.status(403).send({ message: "You are not authorized to update this proposal's status." });
                }

                Proposal.update(proposalId, { status }, (err, result) => {
                    if (err) {
                        console.error('Error updating proposal status:', err);
                        return res.status(500).send({ message: "Error updating proposal status." });
                    }
                    if (result.affectedRows === 0) {
                        return res.status(404).send({ message: "Proposal not found for update." });
                    }

                    const vendor_id = proposal.vendor_id;
                    
                    // --- NEW NOTIFICATION LOGIC (Vendor: Status Update) ---
                    if (vendor_id) {
                        const message = `Your proposal (ID: ${proposalId}) has been updated to '${status}'.`;
                        Notification.create(vendor_id, message, 'proposal_status', proposalId, (notifErr) => {
                            if (notifErr) console.error("Error creating status update notification:", notifErr);
                        });
                    }
                    // ------------------------------------------------------

                    res.status(200).send({ message: `Proposal status updated to ${status} successfully!` });
                });
            });
        });
    },

    // Admin: Delete any proposal
    adminDeleteProposal: (req, res) => {
        const proposalId = req.params.id;

        Proposal.getById(proposalId, (err, proposals) => {
            if (err) {
                console.error('Error fetching proposal for admin deletion:', err);
                return res.status(500).send({ message: "Error fetching proposal." });
            }
            if (proposals.length === 0) {
                return res.status(404).send({ message: "Proposal not found." });
            }
            const proposal = proposals[0];

            // Optionally, delete associated files from the filesystem here
            if (proposal.attachments) {
                try {
                    const attachments = JSON.parse(proposal.attachments);
                    attachments.forEach(filePath => {
                        const fullPath = path.join(__dirname, '..', filePath);
                        fs.unlink(fullPath, (unlinkErr) => {
                            if (unlinkErr && unlinkErr.code !== 'ENOENT') {
                                console.warn(`Failed to delete old attachment: ${fullPath}`, unlinkErr);
                            }
                        });
                    });
                } catch (e) {
                    console.error('Error parsing attachments for deletion (admin):', e);
                }
            }

            Proposal.delete(proposalId, (err, result) => {
                if (err) {
                    console.error('Error admin deleting proposal:', err);
                    return res.status(500).send({ message: "Error deleting proposal." });
                }
                if (result.affectedRows === 0) {
                    return res.status(404).send({ message: "Proposal not found for deletion." });
                }
                res.status(200).send({ message: "Proposal deleted by Admin successfully!" });
            });
        });
    }
};

module.exports = proposalController;