const Proposal = require('../models/Proposal');
const Tender = require('../models/Tender'); 
const Notification = require('../models/Notification'); 
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure Multer for file uploads for proposals
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/proposals';
        // Ensure directory exists
        if (!fs.existsSync(path.join(__dirname, '..', uploadDir))) {
            fs.mkdirSync(path.join(__dirname, '..', uploadDir), { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

const proposalController = {
    // Vendor: Submit a new proposal for an active tender (R1)
    submitProposal: [
        upload.array('attachments', 5), // Increased limit for attachments
        (req, res) => {
            const vendor_id = req.user.id;
            const tender_id = req.body.tender_id; 
            const { cover_letter, proposed_solution, pricing } = req.body;

            // R1: Required fields validation
            if (!tender_id || !cover_letter || !proposed_solution || !pricing) {
                // Ensure files are cleaned up if validation fails
                if (req.files) {
                    req.files.forEach(file => fs.unlinkSync(file.path));
                }
                return res.status(400).send({ message: "Tender ID, Cover Letter, Proposed Solution, and Pricing are required." });
            }

            // Check if the tender is active and not passed the deadline
            Tender.getById(tender_id, (err, tenders) => {
                if (err) {
                    console.error('Error checking tender status:', err);
                    return res.status(500).send({ message: "Error submitting proposal." });
                }
                if (tenders.length === 0) {
                    return res.status(404).send({ message: "Tender not found." });
                }
                const tender = tenders[0];
                
                const now = new Date();
                if (tender.deadline && new Date(tender.deadline) < now) {
                     return res.status(400).send({ message: "Tender submission deadline has passed." });
                }
                
                if (tender.status !== 'active') { 
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
                    status: 'submitted' // Initial status set to 'submitted'
                };

                Proposal.create(proposalData, (err, result) => {
                    if (err) {
                        console.error('Error submitting proposal:', err);
                        // Clean up uploaded files on DB error
                        if (req.files) {
                            req.files.forEach(file => fs.unlinkSync(file.path));
                        }
                        return res.status(500).send({ message: "Error submitting proposal." });
                    }

                    // 1) The system shall notify Clients upon new proposal submission
                    const proposalId = result.insertId;
                    Notification.create({
                        user_id: tender.client_id,
                        type: 'proposal_submission',
                        message: `New proposal submitted for your tender: ${tender.title}`,
                        reference_id: proposalId
                    }, (notifErr) => {
                        if (notifErr) console.warn('Failed to create proposal submission notification:', notifErr);
                    });

                    res.status(201).send({ message: "Proposal submitted successfully!", proposalId: proposalId });
                });
            });
        }
    ],

    // Client/Admin: Get all proposals for a specific tender (R4)
    getProposalsForTender: (req, res) => {
        const tender_id = req.params.tenderId; 
        const currentUserId = req.user.id;
        const currentUserType = req.user.user_type;

        Tender.getById(tender_id, (err, tenders) => {
            if (err || tenders.length === 0) {
                return res.status(404).send({ message: "Tender not found." });
            }
            const tender = tenders[0];

            // Authorization: Client owner or Admin
            if (tender.client_id !== currentUserId && currentUserType !== 'admin') {
                return res.status(403).send({ message: "You are not authorized to view proposals for this tender." });
            }

            Proposal.findByTenderId(tender_id, (err, proposals) => {
                if (err) {
                    console.error('Error fetching proposals for tender:', err);
                    return res.status(500).send({ message: "Error fetching proposals." });
                }
                // R4: Proposal view includes vendor details, documents, pricing (handled by model join)
                res.status(200).send(proposals.map(proposal => {
                    if (proposal.attachments) {
                        proposal.attachments = JSON.parse(proposal.attachments);
                    }
                    return proposal;
                }));
            });
        });
    },
    
    // Get details for a single proposal (R2, R4) - UPDATED TO INCLUDE 'VIEWED' NOTIFICATION
    getProposalDetail: (req, res) => {
        const proposalId = req.params.id;
        const currentUserId = req.user.id;
        const currentUserType = req.user.user_type;
        
        // Helper function to send the response
        const sendResponse = (proposal) => {
            if (proposal.attachments) proposal.attachments = JSON.parse(proposal.attachments);
            res.status(200).send(proposal);
        };

        Proposal.getById(proposalId, (err, proposals) => {
            if (err || proposals.length === 0) {
                return res.status(404).send({ message: "Proposal not found." });
            }
            const proposal = proposals[0];

            Tender.getById(proposal.tender_id, (tenderErr, tenders) => {
                if (tenderErr || tenders.length === 0) {
                    console.error("Error fetching associated tender.");
                    return res.status(500).send({ message: "Error processing request." });
                }
                const tender = tenders[0];
                
                // --- Authorization Check ---
                let isAuthorized = false;
                let isClientOrAdminViewer = false;

                if (currentUserType === 'admin') {
                    isAuthorized = true;
                    isClientOrAdminViewer = true;
                } else if (currentUserType === 'vendor' && proposal.vendor_id === currentUserId) {
                    // Vendor viewing their own proposal (R2)
                    isAuthorized = true;
                } else if (currentUserType === 'client' && tender.client_id === currentUserId) {
                    // Client viewing proposal for their tender (R4)
                    isAuthorized = true;
                    isClientOrAdminViewer = true;
                }

                if (!isAuthorized) {
                    return res.status(403).send({ message: "Forbidden: You are not authorized to view this proposal." });
                }
                
                // --- Handle 'viewed' status update and notification (Requirement 3: viewed status) ---
                if (isClientOrAdminViewer && proposal.status === 'submitted') {
                    
                    Proposal.update(proposal.id, { status: 'viewed' }, (updateErr) => {
                        if (updateErr) {
                            console.error('Error setting proposal status to viewed:', updateErr);
                        } else {
                            // Notify Vendor
                            Notification.create({
                                user_id: proposal.vendor_id,
                                type: 'proposal_status_viewed',
                                message: `Your proposal for tender "${tender.title}" has been viewed by the client.`,
                                reference_id: proposal.id
                            }, (notifErr) => {
                                if (notifErr) console.warn('Failed to create viewed status notification:', notifErr);
                            });
                            proposal.status = 'viewed'; // Update status locally for immediate response
                        }

                        sendResponse(proposal);
                    });
                } else {
                    // Send response without status update (already viewed, shortlisted, or vendor viewing)
                    sendResponse(proposal);
                }
            });
        });
    },

    // Vendor: Get all proposals submitted by the authenticated vendor (R2, R7)
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

    // Client/Admin/Vendor: Update proposal status (R3, R5, R6) - Confirmed for status update notifications
    updateProposalStatus: (req, res) => {
        const proposalId = req.params.id;
        const { status } = req.body; 
        const currentUserId = req.user.id;
        const currentUserType = req.user.user_type;

        // Note: 'accepted' = Awarded
        const VALID_STATUSES = ['accepted', 'rejected', 'shortlisted', 'withdrawn', 'viewed']; 
        if (!status || !VALID_STATUSES.includes(status)) {
            return res.status(400).send({ 
                message: `Invalid status provided. Must be one of: ${VALID_STATUSES.join(', ')}.` 
            });
        }

        Proposal.getById(proposalId, (err, proposals) => {
            if (err || proposals.length === 0) {
                return res.status(404).send({ message: "Proposal not found." });
            }
            const proposal = proposals[0];

            Tender.getById(proposal.tender_id, (err, tenders) => {
                if (err || tenders.length === 0) {
                    return res.status(404).send({ message: "Associated tender not found." });
                }
                const tender = tenders[0];
                
                // --- Authorization Logic ---
                
                if (currentUserType === 'vendor') {
                    // R3: Vendor Withdrawal Check
                    if (proposal.vendor_id !== currentUserId) {
                        return res.status(403).send({ message: "Forbidden: Vendors can only update the status of their own proposals." });
                    }
                    if (status !== 'withdrawn') {
                        return res.status(403).send({ message: "Forbidden: Vendors are only permitted to change the status to 'withdrawn'." });
                    }
                    // Implement deadline check for withdrawal
                    if (tender.deadline && new Date(tender.deadline) < new Date()) {
                         return res.status(403).send({ message: "Cannot withdraw proposal: The tender deadline has passed." });
                    }
                
                } else if (currentUserType === 'client') {
                    // R5, R6: Client Evaluation Check
                    if (tender.client_id !== currentUserId) {
                        return res.status(403).send({ message: "Forbidden: You are not authorized to update proposals for this tender." });
                    }
                    // Clients cannot use 'withdrawn' status
                    if (status === 'withdrawn') {
                         return res.status(400).send({ message: "Bad Request: Clients cannot use the 'withdrawn' status." });
                    }
                
                } else if (currentUserType !== 'admin') {
                    return res.status(403).send({ message: "Unauthorized role for this operation." });
                }
                
                // --- Update the Proposal Status ---
                Proposal.update(proposalId, { status }, (err, result) => {
                    if (err) {
                        console.error('Error updating proposal status:', err);
                        return res.status(500).send({ message: "Error updating proposal status." });
                    }

                    // 3) Notify Vendors about status updates (Shortlisted, Accepted, Rejected, Withdrawn)
                    let statusMessage;
                    if (status === 'shortlisted') {
                        statusMessage = `Your proposal for tender "${tender.title}" has been shortlisted.`;
                    } else if (status === 'accepted') {
                        statusMessage = `Congratulations! Your proposal for tender "${tender.title}" has been accepted (Awarded)!`;
                    } else if (status === 'rejected') {
                         statusMessage = `Your proposal for tender "${tender.title}" has been rejected.`;
                    } else if (status === 'withdrawn') {
                        statusMessage = `You successfully withdrew your proposal for tender "${tender.title}".`;
                    } else { // viewed, etc.
                         statusMessage = `The status of your proposal for tender "${tender.title}" was updated to: ${status}.`;
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

    // Admin: View all proposals submitted on the platform (R8)
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
            if (err || proposals.length === 0) {
                return res.status(404).send({ message: "Proposal not found." });
            }
            const proposal = proposals[0];

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
                res.status(200).send({ message: "Proposal deleted by Admin successfully!" });
            });
        });
    }
};

module.exports = proposalController;