// backend/models/User.js
const db = require('../config/db'); // Import the database connection
const bcrypt = require('bcryptjs'); // For password hashing

const User = {
    // Finds a user by email
    findByEmail: (email, callback) => {
        db.query("SELECT * FROM users WHERE email = ?", [email], callback);
    },

    // Creates a new user with hashed password
    create: (userData, callback) => {
        const { name, company_name, email, password, user_type } = userData;
        // Hash password before storing
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) return callback(err);

            const sql = "INSERT INTO users (name, company_name, email, password, user_type) VALUES (?, ?, ?, ?, ?)";
            db.query(sql, [name, company_name, email, hashedPassword, user_type], callback);
        });
    },

    // Dummy method for getting all users (can be expanded for admin view)
    getAll: (callback) => {
        db.query("SELECT id, name, company_name, email, user_type FROM users", callback);
    },

    // --- New methods for password reset ---

    // Save reset token and expiry to the database for a user
    saveResetToken: (email, token, expire, callback) => {
        db.query(
            "UPDATE users SET resetPasswordToken = ?, resetPasswordExpire = ? WHERE email = ?",
            [token, expire, email],
            (err, result) => {
                if (err) { callback(err); return; }
                if (result.affectedRows === 0) { callback({ kind: "not_found" }); return; }
                callback(null, result);
            }
        );
    },

    // Find a user by a valid (non-expired) reset token
    findByResetToken: (token, callback) => {
        // Ensure token is not null and expiry is in the future
        db.query(
            "SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpire > NOW()",
            [token],
            (err, rows) => {
                if (err) { callback(err); return; }
                if (rows.length) { callback(null, rows[0]); return; }
                callback({ kind: "not_found" });
            }
        );
    },

    // Update a user's password and clear the reset token
    updatePassword: (userId, newPassword, callback) => {
        bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
            if (err) return callback(err);

            db.query(
                "UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordExpire = NULL WHERE id = ?",
                [hashedPassword, userId],
                (err, result) => {
                    if (err) { callback(err); return; }
                    if (result.affectedRows === 0) { callback({ kind: "not_found" }); return; }
                    callback(null, result);
                }
            );
        });
    },

    // You can add more user-related methods here (e.g., update profile, delete user)
};

module.exports = User;