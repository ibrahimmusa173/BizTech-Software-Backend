const Tender = require('../models/Tender');

const tenderController = {
    // Client: Create a new tender
    createTender: (req, res) => {
        const { title, description } = req.body;
        const client_id = req.user.id; // Get client ID from authenticated user

        if (!title || !description) {
            return res.status(400).send({ message: "Title and description are required." });
        }

        Tender.create({ title, description, client_id }, (err, result) => {
            if (err) {
                console.error('Error creating tender:', err);
                return res.status(500).send({ message: "Error creating tender." });
            }
            res.status(201).send({ message: "Tender created successfully!", tenderId: result.insertId });
        });
    },

    // Client/Bidder/Admin: Get all tenders
    getAllTenders: (req, res) => {
        Tender.getAll((err, tenders) => {
            if (err) {
                console.error('Error getting all tenders:', err);
                return res.status(500).send({ message: "Error fetching tenders." });
            }
            res.status(200).send(tenders);
        });
    },

    // Client/Bidder/Admin: Get tender by ID
    getTenderById: (req, res) => {
        const { id } = req.params;
        Tender.getById(id, (err, tender) => {
            if (err) {
                console.error('Error getting tender by ID:', err);
                return res.status(500).send({ message: "Error fetching tender." });
            }
            if (!tender) {
                return res.status(404).send({ message: "Tender not found." });
            }
            res.status(200).send(tender);
        });
    },

    // Client: Get tenders by the logged-in client
    getClientTenders: (req, res) => {
        const client_id = req.user.id; // Get client ID from authenticated user
        Tender.getByClientId(client_id, (err, tenders) => {
            if (err) {
                console.error('Error getting client tenders:', err);
                return res.status(500).send({ message: "Error fetching client tenders." });
            }
            res.status(200).send(tenders);
        });
    },

    // Client/Admin: Update tender
    updateTender: (req, res) => {
        const { id } = req.params;
        const { title, description, status } = req.body;
        const user_id = req.user.id;
        const user_type = req.user.user_type;

        Tender.getById(id, (err, existingTender) => {
            if (err) return res.status(500).send({ message: "Server error." });
            if (!existingTender) return res.status(404).send({ message: "Tender not found." });

            // Authorization check
            if (user_type !== 'admin' && existingTender.client_id !== user_id) {
                return res.status(403).send({ message: "Forbidden: You do not own this tender." });
            }

            Tender.update(id, { title, description, status }, (err, result) => {
                if (err) {
                    console.error('Error updating tender:', err);
                    return res.status(500).send({ message: "Error updating tender." });
                }
                if (result.affectedRows === 0) {
                    return res.status(404).send({ message: "Tender not found for update." });
                }
                res.status(200).send({ message: "Tender updated successfully!" });
            });
        });
    },

    // Client/Admin: Delete tender
    deleteTender: (req, res) => {
        const { id } = req.params;
        const user_id = req.user.id;
        const user_type = req.user.user_type;

        Tender.getById(id, (err, existingTender) => {
            if (err) return res.status(500).send({ message: "Server error." });
            if (!existingTender) return res.status(404).send({ message: "Tender not found." });

            // Authorization check
            if (user_type !== 'admin' && existingTender.client_id !== user_id) {
                return res.status(403).send({ message: "Forbidden: You do not own this tender." });
            }

            Tender.delete(id, (err, result) => {
                if (err) {
                    console.error('Error deleting tender:', err);
                    return res.status(500).send({ message: "Error deleting tender." });
                }
                if (result.affectedRows === 0) {
                    return res.status(404).send({ message: "Tender not found for deletion." });
                }
                res.status(200).send({ message: "Tender deleted successfully!" });
            });
        });
    }
};

module.exports = tenderController;