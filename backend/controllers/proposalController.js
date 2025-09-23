const Proposal = require('../models/Proposal');
const Tender = require('../models/Tender'); // To check tender status/existence

const proposalController = {
    // Bidder: Create a new proposal
    createProposal: (req, res) => {
        const { tender_id, proposal_text, bid_amount } = req.body;
        const bidder_id = req.user.id; // Get bidder ID from authenticated user

        if (!tender_id || !proposal_text || !bid_amount) {
            return res.status(400).send({ message: "Tender ID, proposal text, and bid amount are required." });
        }

        // Optional: Check if the tender is still 'open' before allowing a proposal
        Tender.getById(tender_id, (err, tender) => {
            if (err) {
                console.error('Error checking tender status:', err);
                return res.status(500).send({ message: "Server error checking tender." });
            }
            if (!tender) {
                return res.status(404).send({ message: "Tender not found." });
            }
            if (tender.status !== 'open') {
                return res.status(400).send({ message: "Cannot submit proposal to a tender that is not open." });
            }

            Proposal.create({ tender_id, bidder_id, proposal_text, bid_amount }, (err, result) => {
                if (err) {
                    console.error('Error creating proposal:', err);
                    return res.status(500).send({ message: "Error creating proposal." });
                }
                res.status(201).send({ message: "Proposal submitted successfully!", proposalId: result.insertId });
            });
        });
    },

    // Client/Admin: Get all proposals for a specific tender
    getProposalsByTender: (req, res) => {
        const { tender_id } = req.params;
        const user_id = req.user.id;
        const user_type = req.user.user_type;

        Tender.getById(tender_id, (err, tender) => {
            if (err) return res.status(500).send({ message: "Server error." });
            if (!tender) return res.status(404).send({ message: "Tender not found." });

            // Authorization check: Only client who created tender or admin can view proposals
            if (user_type !== 'admin' && tender.client_id !== user_id) {
                return res.status(403).send({ message: "Forbidden: You are not authorized to view proposals for this tender." });
            }

            Proposal.getByTenderId(tender_id, (err, proposals) => {
                if (err) {
                    console.error('Error getting proposals by tender ID:', err);
                    return res.status(500).send({ message: "Error fetching proposals." });
                }
                res.status(200).send(proposals);
            });
        });
    },

    // Bidder: Get all proposals submitted by the logged-in bidder
    getBidderProposals: (req, res) => {
        const bidder_id = req.user.id; // Get bidder ID from authenticated user
        Proposal.getByBidderId(bidder_id, (err, proposals) => {
            if (err) {
                console.error('Error getting bidder proposals:', err);
                return res.status(500).send({ message: "Error fetching your proposals." });
            }
            res.status(200).send(proposals);
        });
    },

    // Client/Admin: Update proposal status (e.g., accepted, rejected)
    updateProposalStatus: (req, res) => {
        const { id } = req.params; // Proposal ID
        const { status } = req.body;
        const user_id = req.user.id;
        const user_type = req.user.user_type;

        if (!['submitted', 'reviewed', 'accepted', 'rejected'].includes(status)) {
            return res.status(400).send({ message: "Invalid proposal status." });
        }

        Proposal.getById(id, (err, proposal) => {
            if (err) return res.status(500).send({ message: "Server error." });
            if (!proposal) return res.status(404).send({ message: "Proposal not found." });

            Tender.getById(proposal.tender_id, (err, tender) => {
                if (err) return res.status(500).send({ message: "Server error." });
                if (!tender) return res.status(404).send({ message: "Associated tender not found." });

                // Authorization check: Only client who owns the tender or admin can update proposal status
                if (user_type !== 'admin' && tender.client_id !== user_id) {
                    return res.status(403).send({ message: "Forbidden: You are not authorized to update this proposal's status." });
                }

                Proposal.updateStatus(id, status, (err, result) => {
                    if (err) {
                        console.error('Error updating proposal status:', err);
                        return res.status(500).send({ message: "Error updating proposal status." });
                    }
                    if (result.affectedRows === 0) {
                        return res.status(404).send({ message: "Proposal not found for update." });
                    }
                    res.status(200).send({ message: "Proposal status updated successfully!" });
                });
            });
        });
    },

    // Admin: Delete a proposal
    deleteProposal: (req, res) => {
        const { id } = req.params;
        const user_type = req.user.user_type;

        if (user_type !== 'admin') {
            return res.status(403).send({ message: "Forbidden: Only administrators can delete proposals." });
        }

        Proposal.delete(id, (err, result) => {
            if (err) {
                console.error('Error deleting proposal:', err);
                return res.status(500).send({ message: "Error deleting proposal." });
            }
            if (result.affectedRows === 0) {
                return res.status(404).send({ message: "Proposal not found for deletion." });
            }
            res.status(200).send({ message: "Proposal deleted successfully!" });
        });
    }
};

module.exports = proposalController;