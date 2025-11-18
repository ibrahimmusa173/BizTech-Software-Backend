// backend/routes/proposalRoutes.js
const express = require('express');
const proposalController = require('../controllers/proposalController');
const { protect, admin, restrictTo } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// --- MULTER SETUP FOR FILE UPLOADS ---
// Define storage destination and filename
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ensure this directory exists relative to your app.js location
        cb(null, 'uploads/proposals/'); 
    },
    filename: (req, file, cb) => {
        // Use a unique name + original extension
        cb(null, `${Date.now()}-${path.basename(file.originalname)}`);
    }
});

// Configure Multer to handle up to 5 attachments under the field name 'attachments'
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit per file (Adjust as needed)
}).array('attachments', 5); // 'attachments' matches the name used in the frontend FormData


// ===================================
// --- Vendor/Client Protected Routes ---
// ===================================

// 1) Submit a proposal (including files).
// Middleware chain: protect -> upload files -> controller
router.post('/', protect, upload, proposalController.submitProposal);

// 2) View submitted proposals dashboard (Vendor).
router.get('/my-proposals', protect, restrictTo(['vendor']), proposalController.getMyProposals);

// 5) View all proposals for a tender (Client/Admin list view).
router.get('/tender/:tenderId', protect, restrictTo(['client', 'admin']), proposalController.getProposalsByTender);

// 3, 6, 10) Withdraw, Shortlist, Reject, or Award/Update proposal status.
router.patch('/:id/status', protect, proposalController.updateProposalStatus); // Logic handles client/vendor permissions

// 4, 7) View a single proposal detail (Client/Vendor/Admin).
router.get('/:id', protect, proposalController.getProposalDetails);


// ===================================
// --- Admin Protected Routes ---
// ===================================

// 8) View all proposals submitted on the platform (Admin).
router.get('/admin/all', protect, admin, proposalController.getAllProposalsAdmin);

// 9) Delete any proposal (Admin Dispute Resolution).
router.delete('/admin/:id', protect, admin, proposalController.deleteProposalAdmin);


module.exports = router;