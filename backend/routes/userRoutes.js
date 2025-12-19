const express = require('express');
const router = express.Router();
const { getUserProfile } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protected Routes (Must be logged in)
router.get('/profile', protect, getUserProfile);

// RBAC Protected Route (Only Vendors can access)
router.get('/vendor-data', protect, authorize('Vendor'), (req, res) => {
    res.json({ message: "This is private Vendor data." });
});

module.exports = router;