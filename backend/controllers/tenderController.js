// backend/controllers/tenderController.js
const Tender = require('../models/Tender');

const tenderController = {
    // Client specific: Create a new tender
    createTender: (req, res) => {
        const { title, description, budget, deadline } = req.body;
        // The client_id comes from the authenticated user token
        const client_id = req.user.id;

        if (!title || !description || !budget || !deadline) {
            return res.status(400).send({ message: "All tender fields are required." });
        }

        const tenderData = { client_id, title, description, budget, deadline };
        Tender.create(tenderData, (err, result) => {
            if (err) {
                console.error('Error creating tender:', err);
                return res.status(500).send({ message: "Error creating tender.", error: err.message });
            }
            res.status(201).send({ message: "Tender created successfully!", tenderId: result.insertId });
        });
    },

    // Client specific: View tenders created by the logged-in client
    getClientTenders: (req, res) => {
        const client_id = req.user.id;
        Tender.getByClientId(client_id, (err, tenders) => {
            if (err) {
                console.error('Error fetching client tenders:', err);
                return res.status(500).send({ message: "Error fetching your tenders.", error: err.message });
            }
            res.status(200).send(tenders);
        });
    },

    // Vendor/Admin specific: View all open tenders
    getAllOpenTenders: (req, res) => {
        Tender.getAll((err, tenders) => { // You might want to filter for 'open' status here
            if (err) {
                console.error('Error fetching all tenders:', err);
                return res.status(500).send({ message: "Error fetching tenders.", error: err.message });
            }
            // Filter for 'open' tenders for vendors if needed, or let the model handle it
            const openTenders = tenders.filter(tender => tender.status === 'open');
            res.status(200).send(openTenders);
        });
    },

    // Get tender by ID (accessible to client who created it, vendors for details, admins)
    getTenderById: (req, res) => {
        const { id } = req.params;
        Tender.getById(id, (err, tender) => {
            if (err) {
                if (err.kind === "not_found") {
                    return res.status(404).send({ message: "Tender not found." });
                }
                console.error('Error fetching tender by ID:', err);
                return res.status(500).send({ message: "Error fetching tender.", error: err.message });
            }

            // Authorization check (optional, depending on business logic)
            // A vendor should be able to view any open tender.
            // A client should only view their own tender details.
            // An admin can view any.
            if (req.user.user_type === 'client' && tender.client_id !== req.user.id) {
                return res.status(403).send({ message: "Forbidden: You can only view your own tenders." });
            }

            res.status(200).send(tender);
        });
    },

    // Client specific: Update a tender (only the client who created it)
    updateTender: (req, res) => {
        const { id } = req.params;
        const client_id = req.user.id;
        const tenderData = req.body; // title, description, budget, deadline, status

        Tender.getById(id, (err, tender) => {
            if (err) {
                if (err.kind === "not_found") {
                    return res.status(404).send({ message: "Tender not found." });
                }
                console.error('Error fetching tender for update:', err);
                return res.status(500).send({ message: "Error finding tender for update." });
            }

            if (tender.client_id !== client_id) {
                return res.status(403).send({ message: "Forbidden: You can only update your own tenders." });
            }

            Tender.update(id, tenderData, (err, result) => {
                if (err) {
                    console.error('Error updating tender:', err);
                    return res.status(500).send({ message: "Error updating tender.", error: err.message });
                }
                res.status(200).send({ message: "Tender updated successfully!" });
            });
        });
    },

    // Client specific: Delete a tender (only the client who created it, if no proposals/not awarded)
    deleteTender: (req, res) => {
        const { id } = req.params;
        const client_id = req.user.id;

        Tender.getById(id, (err, tender) => {
            if (err) {
                if (err.kind === "not_found") {
                    return res.status(404).send({ message: "Tender not found." });
                }
                console.error('Error fetching tender for deletion:', err);
                return res.status(500).send({ message: "Error finding tender for deletion." });
            }

            if (tender.client_id !== client_id) {
                return res.status(403).send({ message: "Forbidden: You can only delete your own tenders." });
            }
            // Add more checks here, e.g., only delete if status is 'open' and no proposals submitted.

            Tender.delete(id, (err, result) => {
                if (err) {
                    console.error('Error deleting tender:', err);
                    return res.status(500).send({ message: "Error deleting tender.", error: err.message });
                }
                res.status(200).send({ message: "Tender deleted successfully!" });
            });
        });
    },

    // Admin specific: Get all tenders (including closed/awarded)
    getAllTendersAdmin: (req, res) => {
        Tender.getAll((err, tenders) => {
            if (err) {
                console.error('Error fetching all tenders for admin:', err);
                return res.status(500).send({ message: "Error fetching all tenders.", error: err.message });
            }
            res.status(200).send(tenders);
        });
    },

    // Admin specific: Update any tender (e.g., status change)
    updateAnyTenderAdmin: (req, res) => {
        const { id } = req.params;
        const tenderData = req.body;
        Tender.update(id, tenderData, (err, result) => {
            if (err) {
                console.error('Error updating tender by admin:', err);
                return res.status(500).send({ message: "Error updating tender by admin.", error: err.message });
            }
            if (result.affectedRows === 0) {
                return res.status(404).send({ message: "Tender not found for update by admin." });
            }
            res.status(200).send({ message: "Tender updated successfully by admin!" });
        });
    }
};

module.exports = tenderController;