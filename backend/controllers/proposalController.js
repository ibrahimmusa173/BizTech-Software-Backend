// backend/controllers/proposalController.js
const Proposal = require('../models/Proposal');
const Tender = require('../models/Tender'); // To update tender status

const proposalController = {
    // Vendor specific: Submit a proposal
    submitProposal: (req, res) => {
        const { tender_id, proposal_text, proposed_budget } = req.body;
        const vendor_id = req.user.id;

        if (!tender_id || !proposal_text || !proposed_budget) {
            return res.status(400).send({ message: "All proposal fields are required." });
        }

        // Check if tender is open before submitting a proposal
        Tender.getById(tender_id, (err, tender) => {
            if (err) {
                if (err.kind === "not_found") {
                    return res.status(404).send({ message: "Tender not found." });
                }
                console.error('Error fetching tender for proposal submission:', err);
                return res.status(500).send({ message: "Error submitting proposal: Tender check failed." });
            }

            if (tender.status !== 'open') {
                return res.status(400).send({ message: "Cannot submit proposal for a tender that is not open." });
            }

            const proposalData = { tender_id, vendor_id, proposal_text, proposed_budget };
            Proposal.create(proposalData, (err, result) => {
                if (err) {
                    console.error('Error submitting proposal:', err);
                    return res.status(500).send({ message: "Error submitting proposal.", error: err.message });
                }
                res.status(201).send({ message: "Proposal submitted successfully!", proposalId: result.insertId });
            });
        });
    },

    // Vendor specific: View their own proposals
    getVendorProposals: (req, res) => {
        const vendor_id = req.user.id;
        Proposal.getByVendorId(vendor_id, (err, proposals) => {
            if (err) {
                console.error('Error fetching vendor proposals:', err);
                return res.status(500).send({ message: "Error fetching your proposals.", error: err.message });
            }
            res.status(200).send(proposals);
        });
    },

    // Client specific: View proposals for their tender
    getProposalsForTender: (req, res) => {
        const { tenderId } = req.params;
        const client_id = req.user.id;

        // Verify the logged-in client owns this tender
        Tender.getById(tenderId, (err, tender) => {
            if (err) {
                if (err.kind === "not_found") {
                    return res.status(404).send({ message: "Tender not found." });
                }
                console.error('Error fetching tender for proposals:', err);
                return res.status(500).send({ message: "Error fetching proposals: Tender check failed." });
            }

            if (tender.client_id !== client_id) {
                return res.status(403).send({ message: "Forbidden: You can only view proposals for your own tenders." });
            }

            Proposal.getByTenderId(tenderId, (err, proposals) => {
                if (err) {
                    console.error('Error fetching proposals for tender:', err);
                    return res.status(500).send({ message: "Error fetching proposals.", error: err.message });
                }
                res.status(200).send(proposals);
            });
        });
    },

    // Client specific: Accept/Reject a proposal
    updateProposalStatus: (req, res) => {
        const { proposalId } = req.params;
        const { status } = req.body; // 'accepted' or 'rejected'
        const client_id = req.user.id;

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).send({ message: "Invalid proposal status." });
        }

        Proposal.getById(proposalId, (err, proposal) => {
            if (err) {
                if (err.kind === "not_found") {
                    return res.status(404).send({ message: "Proposal not found." });
                }
                console.error('Error fetching proposal for status update:', err);
                return res.status(500).send({ message: "Error updating proposal status: Proposal check failed." });
            }

            // Verify the client owns the tender associated with this proposal
            Tender.getById(proposal.tender_id, (err, tender) => {
                if (err) {
                    console.error('Error fetching tender for proposal status update:', err);
                    return res.status(500).send({ message: "Error updating proposal status: Tender check failed." });
                }
                if (tender.client_id !== client_id) {
                    return res.status(403).send({ message: "Forbidden: You can only modify proposals for your own tenders." });
                }
                if (tender.status === 'awarded' || tender.status === 'closed') {
                    return res.status(400).send({ message: "Tender is already awarded or closed. Cannot change proposal status." });
                }


                Proposal.updateStatus(proposalId, status, (err, result) => {
                    if (err) {
                        console.error('Error updating proposal status:', err);
                        return res.status(500).send({ message: "Error updating proposal status.", error: err.message });
                    }

                    // If a proposal is accepted, update the tender status to 'awarded'
                    if (status === 'accepted') {
                        Tender.awardTender(proposal.tender_id, (err) => {
                            if (err) {
                                console.error('Error awarding tender after proposal acceptance:', err);
                                // This is a critical error, you might want to rollback proposal status or flag for admin
                                return res.status(500).send({ message: "Proposal accepted, but failed to update tender status. Please contact support." });
                            }
                            // Also close other proposals for this tender as 'rejected' (optional, but good practice)
                            db.query("UPDATE proposals SET status = 'rejected' WHERE tender_id = ? AND id != ?", [proposal.tender_id, proposalId], (err) => {
                                if (err) console.warn('Could not automatically reject other proposals:', err);
                            });
                            res.status(200).send({ message: "Proposal accepted and tender awarded successfully!" });
                        });
                    } else {
                        res.status(200).send({ message: "Proposal status updated successfully!" });
                    }
                });
            });
        });
    },

    // Admin specific: Get all proposals
    getAllProposalsAdmin: (req, res) => {
        Proposal.getAll((err, proposals) => {
            if (err) {
                console.error('Error fetching all proposals for admin:', err);
                return res.status(500).send({ message: "Error fetching all proposals.", error: err.message });
            }
            res.status(200).send(proposals);
        });
    },

    // Admin specific: Delete any proposal
    deleteAnyProposalAdmin: (req, res) => {
        const { proposalId } = req.params;
        Proposal.delete(proposalId, (err, result) => {
            if (err) {
                console.error('Error deleting proposal by admin:', err);
                return res.status(500).send({ message: "Error deleting proposal by admin.", error: err.message });
            }
            if (result.affectedRows === 0) {
                return res.status(404).send({ message: "Proposal not found for deletion by admin." });
            }
            res.status(200).send({ message: "Proposal deleted successfully by admin!" });
        });
    }
};

module.exports = proposalController;