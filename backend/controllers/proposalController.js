const Proposal = require('../models/Proposal');
const Tender = require('../models/Tender'); // To check tender status
const Notification = require('../models/Notification'); 
const path = require('path');
const fs = require('fs');
const multer = require('multer');

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


                     // --- NEW: Notify Client of New Proposal ---
                    const proposalId = result.insertId;
                    Notification.create({
                        user_id: tender.client_id,
                        type: 'proposal_submission',
                        message: `New proposal submitted for your tender: ${tender.title}`,
                        reference_id: proposalId
                    }, (notifErr) => {
                        if (notifErr) console.warn('Failed to create proposal submission notification:', notifErr);
                    });


                    res.status(201).send({ message: "Proposal submitted successfully!", proposalId: result.insertId });
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
    
    // --- NEW: Get details for a single proposal (Accessible by Client, Vendor, Admin) ---
    getProposalDetail: (req, res) => {
        const proposalId = req.params.id;
        const currentUserId = req.user.id;
        const currentUserType = req.user.user_type;

        Proposal.getById(proposalId, (err, proposals) => {
            if (err) {
                console.error('Error fetching proposal details:', err);
                return res.status(500).send({ message: "Server error." });
            }
            if (proposals.length === 0) {
                return res.status(404).send({ message: "Proposal not found." });
            }

            const proposal = proposals[0];

            // 1. Admin is always authorized
            if (currentUserType === 'admin') {
                if (proposal.attachments) {
                    proposal.attachments = JSON.parse(proposal.attachments);
                }
                return res.status(200).send(proposal);
            }
            
            // 2. Vendor check
            if (currentUserType === 'vendor') {
                if (proposal.vendor_id === currentUserId) {
                    if (proposal.attachments) {
                        proposal.attachments = JSON.parse(proposal.attachments);
                    }
                    return res.status(200).send(proposal);
                }
                return res.status(403).send({ message: "Forbidden: Vendors can only view their own proposals." });
            }
            
            // 3. Client check (requires async tender lookup)
            if (currentUserType === 'client') {
                Tender.getById(proposal.tender_id, (tenderErr, tenders) => {
                    if (tenderErr) {
                        console.error('Error verifying tender ownership:', tenderErr);
                        return res.status(500).send({ message: "Server error during authorization check." });
                    }
                    if (tenders.length === 0 || tenders[0].client_id !== currentUserId) {
                        return res.status(403).send({ message: "Forbidden: You do not own the tender associated with this proposal." });
                    }
                    
                    // Client is authorized
                    if (proposal.attachments) {
                        proposal.attachments = JSON.parse(proposal.attachments);
                    }
                    res.status(200).send(proposal);
                });
                return; // Prevent further execution until the tender lookup completes
            }

            // Fallback for unauthorized roles
            return res.status(403).send({ message: "Unauthorized role to view proposal details." });
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

    // Client/Admin/Vendor: Update proposal status (Accept/Reject/Shortlist/Withdraw)
    updateProposalStatus: (req, res) => {
        const proposalId = req.params.id;
        const { status } = req.body; 
        const currentUserId = req.user.id;
        const currentUserType = req.user.user_type;

        // 1. Initial Status Validation (Includes 'withdrawn')
        const VALID_STATUSES = ['accepted', 'rejected', 'shortlisted', 'withdrawn'];
        if (!status || !VALID_STATUSES.includes(status)) {
            return res.status(400).send({ 
                message: `Invalid status provided. Must be one of: ${VALID_STATUSES.join(', ')}.` 
            });
        }

        // 2. Fetch Proposal and Tender Details
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
                
                // 3. Role-Based Authorization Logic
                
                if (currentUserType === 'vendor') {
                    // R8: Vendor Withdrawal Check
                    if (proposal.vendor_id !== currentUserId) {
                        return res.status(403).send({ message: "Forbidden: Vendors can only update the status of their own submitted proposals." });
                    }
                    if (status !== 'withdrawn') {
                        return res.status(403).send({ message: "Forbidden: Vendors are only permitted to change the status to 'withdrawn'." });
                    }
                    // Optional: Check deadline here if tender model provides deadline info
                
                } else if (currentUserType === 'client') {
                    // R3/R4: Client Evaluation Check
                    if (tender.client_id !== currentUserId) {
                        return res.status(403).send({ message: "Forbidden: You are not authorized to update proposals for this tender." });
                    }
                    // Clients cannot use 'withdrawn' status
                    if (status === 'withdrawn') {
                         return res.status(400).send({ message: "Bad Request: Clients cannot use the 'withdrawn' status." });
                    }
                
                } else if (currentUserType !== 'admin') {
                    // This handles any roles other than client, vendor, or admin 
                    // attempting to use this endpoint inappropriately.
                    return res.status(403).send({ message: "Unauthorized role for this operation." });
                }
                // If Admin, checks were bypassed/implied successful.


                // 4. Update the Proposal Status
                Proposal.update(proposalId, { status }, (err, result) => {
                    if (err) {
                        console.error('Error updating proposal status:', err);
                        return res.status(500).send({ message: "Error updating proposal status." });
                    }
                    if (result.affectedRows === 0) {
                        return res.status(404).send({ message: "Proposal not found for update." });
                    }

                       
                    // 5. Notify Vendor of Proposal Status Update
                    let statusMessage;
                    if (status === 'shortlisted') {
                        statusMessage = `Your proposal for tender "${tender.title}" has been shortlisted!`;
                    } else if (status === 'accepted') {
                        statusMessage = `Your proposal for tender "${tender.title}" has been accepted (Awarded)!`;
                    } else if (status === 'withdrawn') {
                        statusMessage = `You successfully withdrew your proposal for tender "${tender.title}".`;
                    } else {
                        statusMessage = `Your proposal for tender "${tender.title}" has been rejected.`;
                    }
                    
                    Notification.create({
                        user_id: proposal.vendor_id,
                        type: `proposal_status_${status}`,
                        message: statusMessage,
                        reference_id: proposalId
                    }, (notifErr) => {
                        if (notifErr) console.warn('Failed to create vendor status notification:', notifErr);
                    });


                    res.status(200).send({ message: `Proposal status updated to ${status} successfully!` });
                });
            });
        });
    },

    // --- ADMIN FUNCTION ---
    
    // Admin: View all proposals submitted on the platform
    getAllProposalsAdmin: (req, res) => {
        Proposal.getAll((err, proposals) => { 
            if (err) {
                console.error('Error fetching all proposals (Admin):', err);
                return res.status(500).send({ message: "Error fetching all proposals." });
            }
            res.status(200).send(proposals.map(proposal => {
                if (proposal.attachments) {
                    proposal.attachments = JSON.parse(proposal.attachments);
                }
                return proposal;
            }));
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