const express = require('express');
const proposalController = require('../controllers/proposalController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// --- Vendor Endpoints (Requires 'vendor' role) ---
// Submit a new proposal for a tender
router.post("/", authenticateToken, authorizeRoles(['vendor']), proposalController.submitProposal);
// Get all proposals submitted by the authenticated vendor
router.get("/my-proposals", authenticateToken, authorizeRoles(['vendor']), proposalController.getVendorProposals);

// --- Client Endpoints (Requires 'client' role) ---
// Get all proposals for a specific tender (client must own the tender)
router.get("/tender/:tenderId", authenticateToken, authorizeRoles(['client', 'admin']), proposalController.getProposalsForTender);
// Client: Update proposal status (accept/reject)
router.patch("/:id/status", authenticateToken, authorizeRoles(['client', 'admin']), proposalController.updateProposalStatus);


// --- Admin Endpoints (Requires 'admin' role) ---
// Admin: Delete any proposal
router.delete("/admin/:id", authenticateToken, authorizeRoles(['admin']), proposalController.adminDeleteProposal);

module.exports = router;