// backend/models/User.js
const db = require('../config/db'); // Import the database connection
const bcrypt = require('bcryptjs'); // For password hashing

const User = {
    // Finds a user by email
    findByEmail: (email, callback) => {
        db.query("SELECT * FROM users WHERE email = ?", [email], callback);
    },

    // Finds a user by ID
    getById: (id, callback) => {
        db.query("SELECT * FROM users WHERE id = ?", [id], callback);
    },

    // Creates a new user with hashed password
    create: (userData, callback) => {
        const { name, company_name, email, password, user_type } = userData;
        // Hash password before storing
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) return callback(err);

            const sql = "INSERT INTO users (name, company_name, email, password, user_type, is_active) VALUES (?, ?, ?, ?, ?, TRUE)";
            // ASSUMPTION: New users are active by default (is_active: TRUE)
            db.query(sql, [name, company_name, email, hashedPassword, user_type], callback);
        });
    },

    /**
     * getAll (Enhanced for Admin View)
     * Retrieves all users, explicitly excluding sensitive fields from the SQL selection.
     */
    getAll: (callback) => {
        const sql = `
            SELECT 
                id, name, company_name, email, user_type, is_active, created_at, updated_at 
            FROM users 
            ORDER BY created_at DESC`; // Added is_active to the selection list for admin management
        db.query(sql, callback);
    },

    // General update method for user profile and admin management
    update: (userId, userData, callback) => {
        let fields = [];
        let values = [];

        // Handle password separately to hash it
        if (userData.password) {
            // Note: Update logic requires User._buildUpdateQuery to handle asynchronous bcrypt hashing
            bcrypt.hash(userData.password, 10, (err, hashedPassword) => {
                if (err) return callback(err);
                fields.push("password = ?");
                values.push(hashedPassword);
                delete userData.password; // Remove plain password from userData
                User._buildUpdateQuery(userId, userData, fields, values, callback);
            });
        } else {
            // Standard update path (synchronous)
            User._buildUpdateQuery(userId, userData, fields, values, callback);
        }
    },

    /**
     * Utility function to dynamically construct the SQL UPDATE query.
     * Note: This function handles fields that were already built (e.g., password hash) 
     * and new fields from userData.
     */
    _buildUpdateQuery: (userId, userData, fields, values, callback) => {
        for (const key in userData) {
            // Ensure we don't accidentally try to update primary key or undefined values
            if (userData.hasOwnProperty(key) && userData[key] !== undefined && key !== 'id') {
                fields.push(`${key} = ?`);
                values.push(userData[key]);
            }
        }

        if (fields.length === 0) {
            return callback(null, { affectedRows: 0 }); // No fields to update
        }

        const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
        values.push(userId);

        db.query(sql, values, callback);
    },

    delete: (id, callback) => {
        const sql = "DELETE FROM users WHERE id = ?";
        db.query(sql, [id], callback);
    },
    
    // Admin Analytics Function
    countUsersByTypeAndStatus: (callback) => {
        // ASSUMPTION: 'is_active' column exists in the 'users' table
        const sql = `SELECT user_type, is_active, COUNT(id) as count FROM users GROUP BY user_type, is_active`;
        db.query(sql, callback);
    },

    // --- Methods for password reset (kept as is) ---

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
};

module.exports = User;