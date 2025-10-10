// backend/routes/tenderRoutes.js
const express = require('express');
const tenderController = require('../controllers/tenderController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// CLIENT specific routes
router.post('/tenders', protect, authorize('client'), tenderController.createTender);
router.get('/tenders/my', protect, authorize('client'), tenderController.getClientTenders);
router.put('/tenders/:id', protect, authorize('client'), tenderController.updateTender);
router.delete('/tenders/:id', protect, authorize('client'), tenderController.deleteTender);


// VENDOR specific routes
router.get('/tenders/open', protect, authorize('vendor'), tenderController.getAllOpenTenders); // Vendors view open tenders
router.get('/tenders/:id', protect, authorize('client', 'vendor', 'admin'), tenderController.getTenderById); // Get specific tender details

// ADMIN specific routes
router.get('/admin/tenders', protect, authorize('admin'), tenderController.getAllTendersAdmin); // Admin view all tenders
router.put('/admin/tenders/:id', protect, authorize('admin'), tenderController.updateAnyTenderAdmin); // Admin can update any tender

module.exports = router;