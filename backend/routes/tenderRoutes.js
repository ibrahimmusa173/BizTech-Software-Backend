// routes/tenderRoutes.js
const express = require('express');
const tenderController = require('../controllers/tenderController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// --- Client Endpoints (Requires 'client' role) ---
router.post("/", authenticateToken, authorizeRoles(['client']), tenderController.createTender);
router.get("/my-tenders", authenticateToken, authorizeRoles(['client']), tenderController.getClientTenders);
router.patch("/:id/publish", authenticateToken, authorizeRoles(['client']), tenderController.publishTender);
router.patch("/:id/extend-deadline", authenticateToken, authorizeRoles(['client']), tenderController.extendDeadline);
router.patch("/:id/close", authenticateToken, authorizeRoles(['client']), tenderController.closeTender);
router.patch("/:id/archive", authenticateToken, authorizeRoles(['client']), tenderController.archiveTender);
router.put("/:id", authenticateToken, authorizeRoles(['client']), tenderController.updateTender);
router.delete("/:id", authenticateToken, authorizeRoles(['client']), tenderController.deleteTender);


// --- Vendor Endpoints (Requires 'vendor' role) ---
router.get("/search", authenticateToken, authorizeRoles(['vendor', 'admin']), tenderController.searchTenders);
router.get("/:id", authenticateToken, authorizeRoles(['client', 'vendor', 'admin']), tenderController.getTenderDetails);


// --- Admin Endpoints (Requires 'admin' role) ---

// Admin: View all tenders on the platform
router.get("/admin/all", authenticateToken, authorizeRoles(['admin']), tenderController.getAllTendersAdmin); 

// Admin: Moderate, approve, or reject tenders
router.patch("/admin/:id/moderate", authenticateToken, authorizeRoles(['admin']), tenderController.moderateTender);

// Admin: Edit inappropriate tenders (uses existing adminEditTender middleware array)
router.put("/admin/:id", authenticateToken, authorizeRoles(['admin']), ...tenderController.adminEditTender); 

// Admin: Delete inappropriate tenders
router.delete("/admin/:id", authenticateToken, authorizeRoles(['admin']), tenderController.adminDeleteTender);

module.exports = router;