const express = require('express');
const proposalController = require('../controllers/proposalController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// --- Vendor Endpoints (Requires 'vendor' role) ---

// Vendor: View all submitted proposals (Dashboard) (R2, R7)
// **CRITICAL FIX: Placed before the dynamic /:id route.**
router.get("/my-proposals", authenticateToken, authorizeRoles(['vendor']), proposalController.getVendorProposals); 

// Vendor: Submit a proposal (R1)
router.post(
    "/", 
    authenticateToken, 
    authorizeRoles(['vendor']), 
    ...proposalController.submitProposal 
);

// Get proposal detail (Used by Client/Vendor/Admin) (R2, R4)
router.get(
    "/:id", 
    authenticateToken, 
    authorizeRoles(['client', 'admin', 'vendor']), 
    proposalController.getProposalDetail
);


// --- Shared Endpoints (Status Update) ---

// Client/Admin: Shortlist/Award/Reject (R5, R6)
// Vendor: Withdraw (R3)
router.patch(
    "/:id/status", 
    authenticateToken, 
    authorizeRoles(['client', 'admin', 'vendor']), 
    proposalController.updateProposalStatus
);


// --- Client Endpoints (Requires 'client' role) ---

// Client: View all proposals for a specific tender (List view) (R4)
router.get("/tender/:tenderId", authenticateToken, authorizeRoles(['client', 'admin']), proposalController.getProposalsForTender);


// --- Admin Endpoints (Requires 'admin' role) ---

// Admin: View all proposals submitted on the platform (Oversight) (R8)
router.get("/admin/all", authenticateToken, authorizeRoles(['admin']), proposalController.getAllProposalsAdmin);

// Admin: Delete any proposal
router.delete("/admin/:id", authenticateToken, authorizeRoles(['admin']), proposalController.adminDeleteProposal);

module.exports = router;