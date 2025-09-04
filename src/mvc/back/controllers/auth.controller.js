// src/mvc/back/controllers/auth.controller.js - FINAL CORRECTED VERSION

const User = require("../models/user.model.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Make sure to use an environment variable for this in production
const JWT_SECRET = "your_super_secret_key_12345";

// --- REGISTER A NEW USER ---
exports.register = (req, res) => {
    // 1. Validate the request
    if (!req.body.email || !req.body.password || !req.body.name || !req.body.username) {
        return res.status(400).send({ message: "Please provide all required fields." });
    }

    // 2. Create a User object with the data
    const user = new User({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
    });

    // 3. Call the model to save the user to the database
    User.create(user, (err, data) => {
        if (err) {
            // Check for duplicate entry error from MySQL
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).send({ message: "Email or username already exists." });
            }
            // For any other error
            console.error("DATABASE ERROR on register:", err);
            return res.status(500).send({ message: "Error registering user." });
        }
        
        // 4. Send a success response
        res.status(201).send({ message: "User registered successfully!", user: data });
    });
};


// --- LOGIN AN EXISTING USER ---
exports.login = (req, res) => {
    // 1. Validate the request
    if (!req.body.email || !req.body.password) {
        return res.status(400).send({ message: "Email and password are required." });
    }

    // 2. Find the user by email in the database
    User.findByEmail(req.body.email, (err, user) => {
        if (err) {
            if (err.kind === "not_found") {
                return res.status(401).send({ message: "Invalid email or password." });
            }
            return res.status(500).send({ message: "Error retrieving user." });
        }

        // 3. Compare the provided password with the stored hashed password
        const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) {
            return res.status(401).send({ message: "Invalid email or password." });
        }

        // 4. If password is valid, create a JWT token
        const token = jwt.sign({ id: user.id }, JWT_SECRET, {
            expiresIn: 86400 // 24 hours
        });

        // 5. Send the successful response with the token
        res.status(200).send({
            message: "Login successful!",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
            }
        });
    });
};


// --- You can add your forgotPassword and resetPassword functions here later ---
// exports.forgotPassword = (req, res) => { ... };
// exports.resetPassword = (req, res) => { ... };