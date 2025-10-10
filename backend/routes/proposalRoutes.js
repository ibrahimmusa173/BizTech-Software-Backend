// backend/routes/proposalRoutes.js
const express = require('express');
const proposalController = require('../controllers/proposalController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// VENDOR specific routes
router.post('/proposals', protect, authorize('vendor'), proposalController.submitProposal);
router.get('/proposals/my', protect, authorize('vendor'), proposalController.getVendorProposals);

// CLIENT specific routes
router.get('/tenders/:tenderId/proposals', protect, authorize('client'), proposalController.getProposalsForTender);
router.put('/proposals/:proposalId/status', protect, authorize('client'), proposalController.updateProposalStatus); // Accept/Reject proposal

// ADMIN specific routes
router.get('/admin/proposals', protect, authorize('admin'), proposalController.getAllProposalsAdmin);
router.delete('/admin/proposals/:proposalId', protect, authorize('admin'), proposalController.deleteAnyProposalAdmin);


module.exports = router;