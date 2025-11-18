// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (Format: Bearer <token>)
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey');

            // Attach user data to request object
            // Ensure we use the same field names as generated in authController.js (id, email, user_type)
            req.user = decoded; 
            
            next();
        } catch (error) {
            console.error('JWT verification failed:', error);
            res.status(401).send({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).send({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.user_type === 'admin') {
        next();
    } else {
        res.status(403).send({ message: 'Not authorized as an admin' });
    }
};

// Middleware to restrict access based on user types
const restrictTo = (userTypes) => (req, res, next) => {
    if (!req.user || !userTypes.includes(req.user.user_type)) {
        return res.status(403).send({ message: 'Access denied for this user type.' });
    }
    next();
};


module.exports = { protect, admin, restrictTo };