const express = require('express');
const tenderController = require('../controllers/tenderController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// --- Client Endpoints (Requires 'client' role) ---
// Create a new tender
router.post("/", authenticateToken, authorizeRoles(['client']), tenderController.createTender);
// Get all tenders created by the authenticated client
router.get("/my-tenders", authenticateToken, authorizeRoles(['client']), tenderController.getClientTenders);
// Update a specific tender (owned by client)
router.put("/:id", authenticateToken, authorizeRoles(['client']), tenderController.updateTender);
// Delete a specific tender (owned by client)
router.delete("/:id", authenticateToken, authorizeRoles(['client']), tenderController.deleteTender);


// --- Vendor Endpoints (Requires 'vendor' role) ---
// Search for active tenders (can also be accessed by admin for viewing)
router.get("/search", authenticateToken, authorizeRoles(['vendor', 'admin']), tenderController.searchTenders);
// Get full details of a specific tender (publicly viewable by vendor if active/approved, by client if draft, by admin always)
router.get("/:id", authenticateToken, authorizeRoles(['client', 'vendor', 'admin']), tenderController.getTenderDetails);


// --- Admin Endpoints (Requires 'admin' role) ---
// Admin: Moderate (approve/reject/change status) a tender
router.patch("/:id/moderate", authenticateToken, authorizeRoles(['admin']), tenderController.moderateTender);
// Admin: Edit any tender (full update)
router.put("/admin/:id", authenticateToken, authorizeRoles(['admin']), tenderController.adminEditTender);
// Admin: Delete any tender
router.delete("/admin/:id", authenticateToken, authorizeRoles(['admin']), tenderController.adminDeleteTender);


module.exports = router;