const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Client/Vendor/Admin: Get authenticated user's profile
router.get("/profile", authenticateToken, userController.getProfile);
// Client/Vendor/Admin: Update authenticated user's profile
router.put("/profile", authenticateToken, userController.updateProfile);

// Admin Only: Get all users
router.get("/", authenticateToken, authorizeRoles(['admin']), userController.getAllUsers);
// Admin Only: Get user by ID
router.get("/:id", authenticateToken, authorizeRoles(['admin']), userController.getUserById);
// Admin Only: Update user (status, user_type)
router.put("/:id", authenticateToken, authorizeRoles(['admin']), userController.updateUserStatus);
// Admin Only: Delete user
router.delete("/:id", authenticateToken, authorizeRoles(['admin']), userController.deleteUser);


module.exports = router;