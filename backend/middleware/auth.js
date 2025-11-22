
const jwt = require('jsonwebtoken');

// Middleware to verify JWT and attach user data to the request
const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (Format: Bearer <token>)
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey');

            // Attach user information (id, email, user_type) to the request
            req.user = decoded;
            next();

        } catch (error) {
            console.error('JWT Verification Error:', error);
            // Changed status to 401 as per best practice for failed token auth
            return res.status(401).send({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).send({ message: 'Not authorized, no token' });
    }
};

// Middleware to restrict access only to Admins
const admin = (req, res, next) => {
    // This assumes the 'protect' middleware runs first and sets req.user
    if (req.user && req.user.user_type === 'admin') {
        next();
    } else {
        return res.status(403).send({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };
