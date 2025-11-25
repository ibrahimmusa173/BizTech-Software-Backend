
// controllers/adminController.js
const db = require('../config/db'); 
const Guideline = require('../models/Guideline'); // NEW: Import Guideline model

const adminController = {

    // --- Content Management Functions (Guideline Implementation) ---

    // 1) Admins to create guidelines
    createGuideline: (req, res) => {
        const { title, content, type, status } = req.body; 
        
        if (!title || !content || !type) {
            return res.status(400).send({ message: "Title, content, and type are required." });
        }

        Guideline.create({ title, content, type, status }, (err, result) => {
            if (err) {
                console.error('Error creating guideline:', err);
                return res.status(500).send({ message: "Error creating guideline." });
            }
            res.status(201).send({ message: "Guideline created successfully!", id: result.insertId });
        });
    },
    
    // 1) Admins to edit guidelines
    updateGuideline: (req, res) => {
        const id = req.params.id;
        const updateData = req.body;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).send({ message: "No update data provided." });
        }

        Guideline.update(id, updateData, (err, result) => {
            if (err) {
                console.error('Error updating guideline:', err);
                return res.status(500).send({ message: "Error updating guideline." });
            }
            if (result.affectedRows === 0) {
                return res.status(404).send({ message: "Guideline not found." });
            }
            res.status(200).send({ message: `Guideline ${id} updated successfully.` });
        });
    },
    
    // 1) Admins to delete guidelines
    deleteGuideline: (req, res) => {
        const id = req.params.id;
        Guideline.delete(id, (err, result) => {
            if (err) {
                console.error('Error deleting guideline:', err);
                return res.status(500).send({ message: "Error deleting guideline." });
            }
            if (result.affectedRows === 0) {
                return res.status(404).send({ message: "Guideline not found." });
            }
            res.status(200).send({ message: `Guideline ${id} deleted successfully.` });
        });
    },

    // Admin endpoint to list all guidelines (including drafts)
    listGuidelinesAdmin: (req, res) => {
        Guideline.getAllForAdmin((err, guidelines) => {
            if (err) {
                console.error('Error listing guidelines:', err);
                return res.status(500).send({ message: "Error fetching guidelines." });
            }
            res.status(200).send(guidelines);
        });
    },

    // 2) Client access function
    getPublishedTenderGuidelines: (req, res) => {
        Guideline.getAllPublishedTenderGuidelines((err, guidelines) => {
            if (err) {
                console.error('Error fetching published guidelines:', err);
                return res.status(500).send({ message: "Error fetching guidelines." });
            }
            res.status(200).send(guidelines);
        });
    },

    // Manage Categories/Taxonomies
    createTaxonomyItem: (req, res) => {
        // Implementation: Insert new category/industry into a taxonomy table
        res.status(201).send({ message: "Taxonomy item created (Requires Taxonomy Model)." });
    },
    updateTaxonomyItem: (req, res) => {
        // Implementation: Update taxonomy item
        res.status(200).send({ message: `Taxonomy item ${req.params.id} updated (Requires Taxonomy Model).` });
    },
    deleteTaxonomyItem: (req, res) => {
        // Implementation: Delete taxonomy item
        res.status(200).send({ message: `Taxonomy item ${req.params.id} deleted (Requires Taxonomy Model).` });
    },
    listTaxonomy: (req, res) => {
        // Implementation: Fetch all active categories/industries
        res.status(200).send({ message: "List of taxonomies retrieved (Requires Taxonomy Model)." });
    },


    // --- Analytics and Reporting Functions ---

    getDashboardStats: (req, res) => {
        // Provides platform usage dashboards (e.g., active users, tenders posted, proposals submitted)
        const statsQuery = `
                   SELECT 
                (SELECT COUNT(id) FROM users) AS total_registered_users,
                (SELECT COUNT(id) FROM users WHERE user_type='client') AS total_clients,
                (SELECT COUNT(id) FROM users WHERE user_type='vendor') AS total_vendors,
                (SELECT COUNT(id) FROM tenders) AS total_tenders_posted,
                (SELECT COUNT(id) FROM tenders WHERE status='active') AS tenders_currently_active,
                (SELECT COUNT(id) FROM proposals) AS total_proposals_submitted;
        `;

        db.query(statsQuery, (err, results) => {
            if (err) {
                console.error('Error fetching dashboard stats:', err);
                return res.status(500).send({ message: "Error fetching analytics data." });
            }

            res.status(200).send({
                message: "Dashboard statistics retrieved successfully.",
                data: results[0]
            });
        });
    },

    getUserReport: (req, res) => {
        // Placeholder for complex user reports (e.g., breakdown by activity, registration dates)
        res.status(200).send({ message: "Detailed User Report generated (Stub for complex queries)." });
    },
    
    getTenderReport: (req, res) => {
        // Placeholder for complex tender reports (e.g., category distribution, proposal volume per tender)
        res.status(200).send({ message: "Detailed Tender Report generated (Stub for complex queries)." });
    }
};

module.exports = adminController;
