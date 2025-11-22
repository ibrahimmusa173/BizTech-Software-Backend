// backend/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // For authentication tokens
const crypto = require('crypto');     // For generating tokens
const { sendPasswordResetEmail } = require('../utils/emailService'); // Import email service

const authController = {
    register: (req, res) => {
        // ... (register function content)
    },

    login: (req, res) => {
        // ... (login function content)
    },

    // --- Forgot Password Implementation ---
    forgotPassword: (req, res) => {
        // ... (forgotPassword function content)
    },

    // --- Reset Password Implementation ---
    resetPassword: (req, res) => {
        // ... (resetPassword function content)
    },
    
    // --- Admin Dashboard Implementation ---
    getUserStatistics: (req, res) => { // <-- ENSURE THIS IS PRESENT
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

module.exports = authController; // <-- ENSURE authController is exported