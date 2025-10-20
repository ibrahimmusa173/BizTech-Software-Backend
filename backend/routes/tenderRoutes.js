// routes/tenderRoutes.js
const express = require('express');
const tenderController = require('../controllers/tenderController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// --- Client Endpoints (Requires 'client' role) ---
// Create a new tender
router.post("/", authenticateToken, authorizeRoles(['client']), tenderController.createTender);
// Get all tenders created by the authenticated client
router.get("/my-tenders", authenticateToken, authorizeRoles(['client']), tenderController.getClientTenders);

// Client Management Actions
// Publish a draft tender
router.patch("/:id/publish", authenticateToken, authorizeRoles(['client']), tenderController.publishTender);
// Extend the deadline
router.patch("/:id/extend-deadline", authenticateToken, authorizeRoles(['client']), tenderController.extendDeadline);
// Close a tender
router.patch("/:id/close", authenticateToken, authorizeRoles(['client']), tenderController.closeTender);
// Archive a closed tender
router.patch("/:id/archive", authenticateToken, authorizeRoles(['client']), tenderController.archiveTender);

// Update a specific tender (owned by client)
router.put("/:id", authenticateToken, authorizeRoles(['client']), tenderController.updateTender);
// Delete a specific tender (owned by client)
router.delete("/:id", authenticateToken, authorizeRoles(['client']), tenderController.deleteTender);


// --- Vendor Endpoints (Requires 'vendor' role) ---
// Search for active tenders
router.get("/search", authenticateToken, authorizeRoles(['vendor', 'admin']), tenderController.searchTenders);
// Get full details of a specific tender
router.get("/:id", authenticateToken, authorizeRoles(['client', 'vendor', 'admin']), tenderController.getTenderDetails);


// --- Admin Endpoints (Remains the same) ---
// ... (Admin routes)

module.exports = router;