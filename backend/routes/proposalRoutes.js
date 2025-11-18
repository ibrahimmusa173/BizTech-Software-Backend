const express = require('express');
const proposalController = require('../controllers/proposalController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();


router.get(
    "/:id", 
    authenticateToken, 
    authorizeRoles(['client', 'admin', 'vendor']), 
    proposalController.getProposalDetail // <<< NEW CONTROLLER FUNCTION
);
// --- Vendor Endpoints (Requires 'vendor' role) ---
router.post(
    "/", 
    authenticateToken, 
    authorizeRoles(['vendor']), 
    ...proposalController.submitProposal
);
router.get("/my-proposals", authenticateToken, authorizeRoles(['vendor']), proposalController.getVendorProposals);

// --- Client Endpoints (Requires 'client' role) ---
router.get("/tender/:tenderId", authenticateToken, authorizeRoles(['client', 'admin']), proposalController.getProposalsForTender);
router.patch(
    "/:id/status", 
    authenticateToken, 
    authorizeRoles(['client', 'admin', 'vendor']), // <<< ADDED 'vendor' HERE
    proposalController.updateProposalStatus
);


// --- Admin Endpoints (Requires 'admin' role) ---

// Admin: View all proposals submitted on the platform
router.get("/admin/all", authenticateToken, authorizeRoles(['admin']), proposalController.getAllProposalsAdmin);

// Admin: Delete any proposal (already existed)
router.delete("/admin/:id", authenticateToken, authorizeRoles(['admin']), proposalController.adminDeleteProposal);

module.exports = router;