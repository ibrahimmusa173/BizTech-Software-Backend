// src/backend/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { getUserProfile } = require("../controllers/userController");
const { protect } = require('../middleware/authMiddleware');

// PROTECTED ROUTE to get the logged-in user's profile
router.get("/users/me", protect, getUserProfile);

module.exports = router;