// backend/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // For authentication tokens
const crypto = require('crypto');     // For generating tokens
const { sendPasswordResetEmail } = require('../utils/emailService'); // Import email service

const authController = {
    register: (req, res) => {
        const { name, company_name, email, password, user_type } = req.body;

        // Basic validation
        if (!name || !email || !password || !user_type) {
            return res.status(400).send({ message: "All required fields must be provided." });
        }
        if (!['client', 'bidder', 'admin'].includes(user_type)) {
            return res.status(400).send({ message: "Invalid user type." });
        }

        User.findByEmail(email, (err, users) => {
            if (err) {
                console.error('Error during registration (findByEmail):', err);
                return res.status(500).send({ message: "Server error during registration." });
            }
            if (users.length > 0) {
                return res.status(409).send({ message: "Email already registered." });
            }

            User.create({ name, company_name, email, password, user_type }, (err, result) => {
                if (err) {
                    console.error('Error during registration (create user):', err);
                    return res.status(500).send({ message: "Error registering user." });
                }
                res.status(201).send({ message: "User registered successfully!", userId: result.insertId });
            });
        });
    },

    login: (req, res) => {
        const { email, password } = req.body;

        User.findByEmail(email, (err, users) => {
            if (err) {
                console.error('Error during login (findByEmail):', err);
                return res.status(500).send({ message: "Server error during login." });
            }
            if (users.length === 0) {
                return res.status(401).send({ message: "Invalid credentials." });
            }

            const user = users[0];
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    console.error('Error during login (bcrypt.compare):', err);
                    return res.status(500).send({ message: "Server error during login." });
                }
                if (!isMatch) {
                    return res.status(401).send({ message: "Invalid credentials." });
                }

                const token = jwt.sign(
                    { id: user.id, email: user.email, user_type: user.user_type },
                    process.env.JWT_SECRET || 'supersecretjwtkey',
                    { expiresIn: '1h' }
                );

                res.status(200).send({ message: "Logged in successfully!", token, user: { id: user.id, name: user.name, email: user.email, user_type: user.user_type } });
            });
        });
    },

    // --- Forgot Password Implementation ---
    forgotPassword: (req, res) => {
        const { email } = req.body;
        if (!email) {
            return res.status(400).send({ message: "Email is required." });
        }

        User.findByEmail(email, async (err, users) => {
            if (err) {
                console.error('Error during forgotPassword (findByEmail):', err);
                // For security, always send a generic success message even if email not found
                return res.status(200).send({ message: "If an account with that email exists, a password reset link has been sent." });
            }
            if (users.length === 0) {
                // Email not found, but send generic success message for security reasons
                return res.status(200).send({ message: "If an account with that email exists, a password reset link has been sent." });
            }

            const user = users[0];

            // Generate a random token
            const resetToken = crypto.randomBytes(32).toString('hex');
            // Set token expiry to 1 hour from now
            const resetExpire = new Date(Date.now() + 3600000); // 1 hour

            User.saveResetToken(user.email, resetToken, resetExpire, async (err) => { // Removed 'result'
                if (err) {
                    console.error('Error saving reset token:', err);
                    return res.status(500).send({ message: "Error initiating password reset." });
                }

                // Send the email with the reset link
                const emailSent = await sendPasswordResetEmail(user.email, resetToken);

                if (emailSent) {
                    res.status(200).send({ message: "Password reset link sent to your email!" });
                } else {
                    res.status(500).send({ message: "Failed to send password reset email. Please try again later." });
                }
            });
        });
    },

    // --- Reset Password Implementation ---
    resetPassword: (req, res) => {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) { // Basic password strength validation
            return res.status(400).send({ message: "New password must be at least 6 characters long." });
        }

        User.findByResetToken(token, (err, user) => {
            if (err) {
                if (err.kind === "not_found") {
                    return res.status(400).send({ message: "Password reset token is invalid or has expired." });
                }
                console.error('Error finding user by reset token:', err);
                return res.status(500).send({ message: "Server error during password reset." });
            }

            // User found and token is valid and not expired
            User.updatePassword(user.id, newPassword, (err) => { // Removed 'result'
                if (err) {
                    console.error('Error updating password:', err);
                    return res.status(500).send({ message: "Error resetting password." });
                }
                res.status(200).send({ message: "Password has been successfully reset!" });
            });
        });
    },
    
    // --- Admin Dashboard Implementation ---
    getUserStatistics: (req, res) => {
        // NOTE: In a production environment, this route MUST be protected 
        // by middleware to ensure only users with user_type: 'admin' can access it.

        User.countUsersByType((err, results) => {
            if (err) {
                console.error('Error fetching user statistics:', err);
                return res.status(500).send({ message: "Error fetching statistics." });
            }

            // Transform results into a more usable object format (e.g., { client: 5, bidder: 10, admin: 1 })
            const stats = results.reduce((acc, current) => {
                acc[current.user_type] = current.count;
                return acc;
            }, {});

            res.status(200).send({
                message: "User statistics fetched successfully.",
                stats: stats
                // Future implementation: Add Tender and Proposal counts here.
            });
        });
    },
};

module.exports = authController;