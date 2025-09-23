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

    // You can add more user-related methods here (e.g., update profile, delete user)
};

module.exports = User;