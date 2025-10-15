const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Using db to fetch user for role check

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send({ message: "Access Denied: No token provided." });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey', (err, user) => {
        if (err) {
            console.error("JWT Verification Error:", err.message);
            return res.status(403).send({ message: "Access Denied: Invalid token." });
        }
        req.user = user; // Attach user payload (id, email, user_type) to the request
        next();
    });
};

const authorizeRoles = (roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.user_type) {
            return res.status(403).send({ message: "Access Denied: User role not found." });
        }
        if (!roles.includes(req.user.user_type)) {
            return res.status(403).send({ message: `Access Denied: You must be one of the following roles: ${roles.join(', ')}.` });
        }
        next();
    };
};

module.exports = { authenticateToken, authorizeRoles };