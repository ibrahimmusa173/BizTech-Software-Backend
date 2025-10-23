const Guideline = require('../models/Guideline');

const contentController = {

    // -----------------------------------------------------------
    // Tender Guidelines Access (Client/Vendor)
    // -----------------------------------------------------------

    /**
     * getTenderGuidelines
     * Description: Provides Clients and Vendors with access to stored guidelines.
     * Access: Client, Vendor, Admin (Public content)
     */
    getTenderGuidelines: (req, res) => {
        Guideline.getAll((err, guidelines) => {
            if (err) {
                console.error('Error fetching guidelines:', err);
                return res.status(500).send({ message: "Error fetching tender guidelines." });
            }
            res.status(200).send(guidelines);
        });
    },

    // -----------------------------------------------------------
    // Platform Administrator Content Management
    // -----------------------------------------------------------

    /**
     * createGuideline
     * Description: Allows Admins to create new guidelines (for writing tender requests).
     * Access: Admin
     */
    createGuideline: (req, res) => {
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).send({ message: "Title and Content are required for a guideline." });
        }

        Guideline.create({ title, content, type: 'tender_request' }, (err, result) => {
            if (err) {
                console.error('Error creating guideline:', err);
                return res.status(500).send({ message: "Error creating guideline." });
            }
            res.status(201).send({ message: "Guideline created successfully!", id: result.insertId });
        });
    },

    /**
     * updateGuideline
     * Description: Allows Admins to edit existing guidelines.
     * Access: Admin
     */
    updateGuideline: (req, res) => {
        const guidelineId = req.params.id;
        const { title, content } = req.body;

        if (!title && !content) {
            return res.status(400).send({ message: "Title or Content must be provided for update." });
        }

        Guideline.update(guidelineId, { title, content }, (err, result) => {
            if (err) {
                console.error('Error updating guideline:', err);
                return res.status(500).send({ message: "Error updating guideline." });
            }
            if (result.affectedRows === 0) {
                return res.status(404).send({ message: "Guideline not found for update." });
            }
            res.status(200).send({ message: "Guideline updated successfully." });
        });
    },

    /**
     * deleteGuideline
     * Description: Allows Admins to delete guidelines.
     * Access: Admin
     */
    deleteGuideline: (req, res) => {
        const guidelineId = req.params.id;
        
        Guideline.delete(guidelineId, (err, result) => {
            if (err) {
                console.error('Error deleting guideline:', err);
                return res.status(500).send({ message: "Error deleting guideline." });
            }
            if (result.affectedRows === 0) {
                return res.status(404).send({ message: "Guideline not found." });
            }
            res.status(200).send({ message: "Guideline deleted successfully." });
        });
    }
};

module.exports = contentController;