const jwt = require('jsonwebtoken');

const authMiddleware = {
    verifyToken: (req, res, next) => {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(403).send({ message: "No token provided." });
        }

        const token = authHeader.split(' ')[1]; // Expects "Bearer TOKEN"
        if (!token) {
            return res.status(403).send({ message: "No token provided." });
        }

        jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey', (err, decoded) => {
            if (err) {
                console.error('Failed to authenticate token:', err);
                return res.status(401).send({ message: "Unauthorized: Invalid token." });
            }
            req.user = decoded; // Attach user info (id, email, user_type) to the request
            next();
        });
    },

    // Middleware for specific roles
    authorizeRoles: (...allowedRoles) => {
        return (req, res, next) => {
            if (!req.user || !req.user.user_type) {
                return res.status(401).send({ message: "Unauthorized: User role not found." });
            }
            if (!allowedRoles.includes(req.user.user_type)) {
                return res.status(403).send({ message: "Forbidden: You do not have the required permissions." });
            }
            next();
        };
    }
};

module.exports = authMiddleware;