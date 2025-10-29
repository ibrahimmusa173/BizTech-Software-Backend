// routes/adminRoutes.js
const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply Auth and Admin role check to all routes in this file
router.use(authenticateToken, authorizeRoles(['admin']));

// --- Content Management ---

// Guidelines Management (e.g., for writing tender requests)
router.post('/content/guidelines', adminController.createGuideline);
router.put('/content/guidelines/:id', adminController.updateGuideline);
router.delete('/content/guidelines/:id', adminController.deleteGuideline);

// Category, Industry, and Taxonomy Management
router.post('/taxonomy', adminController.createTaxonomyItem);
router.put('/taxonomy/:id', adminController.updateTaxonomyItem);
router.delete('/taxonomy/:id', adminController.deleteTaxonomyItem);
router.get('/taxonomy', adminController.listTaxonomy); // List all current taxonomies


// --- Analytics and Reporting ---
router.get('/analytics/dashboard', adminController.getDashboardStats);
router.get('/analytics/user-report', adminController.getUserReport);
router.get('/analytics/tender-report', adminController.getTenderReport);


module.exports = router;