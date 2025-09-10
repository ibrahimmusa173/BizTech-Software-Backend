// src/backend/models/userModel.js
const db = require('../config/db');

const User = {
    // Creates a new user with a specific role and profile
    create: async (userData) => {
        const { email, password, role, fullName, companyName } = userData;
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Insert into the main users table
            const userQuery = "INSERT INTO users (email, password, role) VALUES (?, ?, ?)";
            const [userResult] = await connection.query(userQuery, [email, password, role]);
            const userId = userResult.insertId;

            // 2. Insert into the role-specific profile table
            let profileQuery;
            if (role === 'client') {
                profileQuery = "INSERT INTO clients (user_id, full_name, company_name) VALUES (?, ?, ?)";
            } else if (role === 'bidder') {
                profileQuery = "INSERT INTO bidders (user_id, full_name, company_name) VALUES (?, ?, ?)";
            } else {
                throw new Error("Invalid user role specified");
            }

            await connection.query(profileQuery, [userId, fullName, companyName]);

            await connection.commit();
            return { insertId: userId };
        } catch (error) {
            await connection.rollback();
            throw error; // Propagate the error to be caught by the controller
        } finally {
            connection.release();
        }
    },

    // Finds a user by email and joins with their profile table
    findByEmail: async (email) => {
        const query = `
            SELECT 
                u.id, u.email, u.password, u.role,
                COALESCE(c.full_name, b.full_name) AS full_name,
                COALESCE(c.company_name, b.company_name) AS company_name
            FROM users u
            LEFT JOIN clients c ON u.id = c.user_id AND u.role = 'client'
            LEFT JOIN bidders b ON u.id = b.user_id AND u.role = 'bidder'
            WHERE u.email = ?
        `;
        const [rows] = await db.query(query, [email]);
        return rows;
    },

    // Finds a user by ID and joins with their profile table (for fetching profile)
    findById: async (userId) => {
         const query = `
            SELECT 
                u.id, u.email, u.role,
                COALESCE(c.full_name, b.full_name) AS full_name,
                COALESCE(c.company_name, b.company_name) AS company_name
            FROM users u
            LEFT JOIN clients c ON u.id = c.user_id AND u.role = 'client'
            LEFT JOIN bidders b ON u.id = b.user_id AND u.role = 'bidder'
            WHERE u.id = ?
        `;
        const [rows] = await db.query(query, [userId]);
        return rows;
    },

    // --- Password Reset Methods (Updated for async/await) ---
    savePasswordResetToken: (userId, token, expires) => {
        const query = "UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE id = ?";
        return db.query(query, [token, expires, userId]);
    },

    findByHashedPasswordResetToken: async (hashedToken) => {
        const query = "SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > NOW()";
        const [rows] = await db.query(query, [hashedToken]);
        return rows;
    },
    
    resetPassword: (userId, newHashedPassword) => {
        const query = "UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE id = ?";
        return db.query(query, [newHashedPassword, userId]);
    }
};

module.exports = User;