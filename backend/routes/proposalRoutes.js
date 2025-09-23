const express = require('express');
const proposalController = require('../controllers/proposalController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

// Bidder-specific routes
router.post("/", verifyToken, authorizeRoles('bidder'), proposalController.createProposal);
router.get("/my-proposals", verifyToken, authorizeRoles('bidder'), proposalController.getBidderProposals); // Get proposals submitted by the logged-in bidder

// Client/Admin-specific routes
router.get("/tender/:tender_id", verifyToken, authorizeRoles('client', 'admin'), proposalController.getProposalsByTender); // Get all proposals for a specific tender
router.put("/:id/status", verifyToken, authorizeRoles('client', 'admin'), proposalController.updateProposalStatus); // Update status of a proposal (e.g., accept/reject)

// Admin-specific routes
router.delete("/:id", verifyToken, authorizeRoles('admin'), proposalController.deleteProposal);

module.exports = router;