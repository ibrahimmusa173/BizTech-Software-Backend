// src/backend/controllers/userController.js
const User = require('../models/userModel');

// @desc    Get current user's profile
// @route   GET /api/users/me
exports.getUserProfile = async (req, res) => {
    try {
        // req.userId is attached by the 'protect' middleware
        const user = await User.findById(req.userId);

        if (user && user.length > 0) {
            res.json(user[0]);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// You can add updateUserProfile and other functions here later