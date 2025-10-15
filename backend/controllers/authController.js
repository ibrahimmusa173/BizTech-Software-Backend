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
        if (!['client', 'vendor', 'admin'].includes(user_type)) { // Corrected 'bidder' to 'vendor'
            return res.status(400).send({ message: "Invalid user type. Must be 'client', 'vendor', or 'admin'." });
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

    forgotPassword: (req, res) => {
        const { email } = req.body;
        if (!email) {
            return res.status(400).send({ message: "Email is required." });
        }

        User.findByEmail(email, async (err, users) => {
            if (err) {
                console.error('Error during forgotPassword (findByEmail):', err);
                return res.status(200).send({ message: "If an account with that email exists, a password reset link has been sent." });
            }
            if (users.length === 0) {
                return res.status(200).send({ message: "If an account with that email exists, a password reset link has been sent." });
            }

            const user = users[0];

            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetExpire = new Date(Date.now() + 3600000); // 1 hour

            User.saveResetToken(user.email, resetToken, resetExpire, async (err) => {
                if (err) {
                    console.error('Error saving reset token:', err);
                    return res.status(500).send({ message: "Error initiating password reset." });
                }

                const emailSent = await sendPasswordResetEmail(user.email, resetToken);

                if (emailSent) {
                    res.status(200).send({ message: "Password reset link sent to your email!" });
                } else {
                    res.status(500).send({ message: "Failed to send password reset email. Please try again later." });
                }
            });
        });
    },

    resetPassword: (req, res) => {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
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

            User.updatePassword(user.id, newPassword, (err) => {
                if (err) {
                    console.error('Error updating password:', err);
                    return res.status(500).send({ message: "Error resetting password." });
                }
                res.status(200).send({ message: "Password has been successfully reset!" });
            });
        });
    },
};

module.exports = authController;