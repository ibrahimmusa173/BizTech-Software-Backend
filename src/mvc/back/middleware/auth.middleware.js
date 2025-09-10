// src/backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // <-- IMPORT USER MODEL
require('dotenv').config();

const protect = async (req, res, next) => { // <-- MAKE ASYNC
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get user from the token AND attach to request <-- THIS IS THE CHANGE
            const users = await User.findById(decoded.id);
            if (users && users.length > 0) {
                // Attach the user object without the password
                const { password, ...userWithoutPassword } = users[0];
                req.user = userWithoutPassword; 
                next();
            } else {
                 return res.status(401).json({ message: 'Not authorized, user not found' });
            }
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };