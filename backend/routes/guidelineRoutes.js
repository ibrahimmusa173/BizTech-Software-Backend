// backend/routes/guidelineRoutes.js
const express = require('express');
const adminController = require('../controllers/adminController'); 
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Get published guidelines for clients/vendors (Requires standard authentication)
router.get("/", authenticateToken, adminController.getPublishedTenderGuidelines);

module.exports = router;