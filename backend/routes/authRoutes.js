// backend/routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword); 

// New Admin Route 
router.get("/stats", authController.getUserStatistics); // <-- ENSURE authController.getUserStatistics is spelled correctly

module.exports = router;