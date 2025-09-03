const jwt = require("jsonwebtoken");
const JWT_SECRET = "your_super_secret_key_12345"; // IMPORTANT: Use an environment variable for this

const verifyToken = (req, res, next) => {
  let token = req.headers["authorization"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  if (token.startsWith('Bearer ')) {
    // Remove "Bearer " from string
    token = token.slice(7, token.length);
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized! Token is not valid." });
    }
    // Add user ID from token payload to the request object
    req.userId = decoded.id; 
    next();
  });
};

module.exports = verifyToken;