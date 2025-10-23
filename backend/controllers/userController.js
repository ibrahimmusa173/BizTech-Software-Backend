const User = require('../models/User');
const bcrypt = require('bcryptjs');

const userController = {
    // Get currently authenticated user's profile
    getProfile: (req, res) => {
        User.getById(req.user.id, (err, users) => {
            if (err) {
                console.error('Error getting user profile:', err);
                return res.status(500).send({ message: "Error fetching user profile." });
            }
            if (users.length === 0) {
                return res.status(404).send({ message: "User not found." });
            }
            const user = users[0];
            // Don't send password hash
            delete user.password;
            delete user.resetPasswordToken;
            delete user.resetPasswordExpire;
            res.status(200).send(user);
        });
    },

    // Update currently authenticated user's profile
    updateProfile: (req, res) => {
        const userId = req.user.id;
        const { name, company_name, email, currentPassword, newPassword } = req.body;

        // Fetch user to verify current password if new password is provided
        User.getById(userId, (err, users) => {
            if (err) {
                console.error('Error fetching user for profile update:', err);
                return res.status(500).send({ message: "Server error during profile update." });
            }
            if (users.length === 0) {
                return res.status(404).send({ message: "User not found." });
            }
            const user = users[0];

            let updateData = { name, company_name, email };
            let passwordPromise = Promise.resolve(); // No password change by default

            // If a new password is provided, verify current password
            if (newPassword) {
                if (!currentPassword) {
                    return res.status(400).send({ message: "Current password is required to change password." });
                }
                passwordPromise = new Promise((resolve, reject) => {
                    bcrypt.compare(currentPassword, user.password, (err, isMatch) => {
                        if (err) return reject(new Error("Server error verifying password."));
                        if (!isMatch) return reject(new Error("Incorrect current password."));

                        bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
                            if (err) return reject(new Error("Server error hashing new password."));
                            updateData.password = hashedPassword;
                            resolve();
                        });
                    });
                });
            }

            passwordPromise
                .then(() => {
                    User.update(userId, updateData, (err, result) => {
                        if (err) {
                            console.error('Error updating user profile:', err);
                            return res.status(500).send({ message: "Error updating profile." });
                        }
                        if (result.affectedRows === 0) {
                            return res.status(404).send({ message: "User not found for update." });
                        }
                        res.status(200).send({ message: "Profile updated successfully!" });
                    });
                })
                .catch(error => {
                    console.error('Error in profile update promise chain:', error.message);
                    res.status(400).send({ message: error.message });
                });
        });
    },

    // --- Admin functionalities ---

    // Admin: Get all users
    getAllUsers: (req, res) => {
        User.getAll((err, users) => {
            if (err) {
                console.error('Error getting all users (admin):', err);
                return res.status(500).send({ message: "Error fetching users." });
            }
            // Remove sensitive password info before sending
            const sanitizedUsers = users.map(user => {
                delete user.password;
                delete user.resetPasswordToken;
                delete user.resetPasswordExpire;
                return user;
            });
            res.status(200).send(sanitizedUsers);
        });
    },

    // Admin: Get a user by ID
    getUserById: (req, res) => {
        const { id } = req.params;
        User.getById(id, (err, users) => {
            if (err) {
                console.error('Error getting user by ID (admin):', err);
                return res.status(500).send({ message: "Error fetching user." });
            }
            if (users.length === 0) {
                return res.status(404).send({ message: "User not found." });
            }
            const user = users[0];
            delete user.password;
            delete user.resetPasswordToken;
            delete user.resetPasswordExpire;
            res.status(200).send(user);
        });
    },
    
    /**
     * updateUserStatus (Renamed from setUserStatus)
     * Requirement: Admin to view, activate, deactivate, and manage user accounts (including status and user_type).
     * This function now handles all Admin PUT requests to /api/users/:id.
     */
    updateUserStatus: (req, res) => {
        const userId = req.params.id;
        // Use req.body directly to allow updating any field (is_active, user_type, etc.)
        const updateData = req.body; 

        // Optional safety check: Admins shouldn't change their own user_type via this endpoint
        if (req.user.id === parseInt(userId) && updateData.user_type && updateData.user_type !== req.user.user_type) {
             return res.status(403).send({ message: "Administrators cannot change their own user_type." });
        }
        
        // If no data is provided, return 400
        if (Object.keys(updateData).length === 0) {
            return res.status(400).send({ message: "No fields provided for update." });
        }

        User.update(userId, updateData, (err, result) => {
            if (err) {
                console.error('Error updating user data (admin):', err);
                return res.status(500).send({ message: "Error updating user data." });
            }
            if (result.affectedRows === 0) {
                return res.status(404).send({ message: "User not found." });
            }
            
            res.status(200).send({ message: `User account ${userId} updated successfully!` });
        });
    },

    // Admin: Delete a user account
    deleteUser: (req, res) => {
        const { id } = req.params;
        User.delete(id, (err, result) => {
            if (err) {
                console.error('Error deleting user (admin):', err);
                return res.status(500).send({ message: "Error deleting user." });
            }
            if (result.affectedRows === 0) {
                return res.status(404).send({ message: "User not found for deletion." });
            }
            res.status(200).send({ message: "User deleted successfully!" });
        });
    }
};

module.exports = userController;