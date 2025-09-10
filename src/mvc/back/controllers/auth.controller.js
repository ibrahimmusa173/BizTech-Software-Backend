// src/backend/controllers/authController.js
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt =require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

// @desc    Register a new user (Client or Bidder)
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
    const { fullName, companyName, email, password, role } = req.body;

    if (!fullName || !email || !password || !role) {
        return res.status(400).json({ message: 'Please provide Full Name, Email, Password, and Role' });
    }

    if (role !== 'client' && role !== 'bidder') {
        return res.status(400).json({ message: 'Invalid role specified. Must be "client" or "bidder".' });
    }

    try {
        const existingUsers = await User.findByEmail(email);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            fullName,
            companyName: companyName || null,
            email,
            password: hashedPassword,
            role
        };

        const result = await User.create(newUser);
        
        const token = generateToken(result.insertId);
        
        res.status(201).json({
            token,
            message: 'User registered successfully'
        });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    try {
        const users = await User.findByEmail(email);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = generateToken(user.id);
            res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    fullName: user.full_name,
                    companyName: user.company_name
                }
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: 'Server error during login' });
    }
};


// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// This function can remain largely the same, but adapted for async/await and new model
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const users = await User.findByEmail(email);
        if (!users || users.length === 0) {
            return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been processed.' });
        }
        const user = users[0];

        const resetToken = crypto.randomBytes(20).toString('hex');
        const hashedPasswordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        await User.savePasswordResetToken(user.id, hashedPasswordResetToken, expires);
        
        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

        console.log('============================================');
        console.log('PASSWORD RESET LINK (for development):');
        console.log(resetUrl);
        console.log('============================================');

        // Here you would integrate your sendEmail utility
        // await sendEmail({ email: user.email, subject: 'Password Reset', message: `Reset URL: ${resetUrl}` });

        res.status(200).json({ message: 'Password reset link has been processed.' });

    } catch (err) {
        console.error("Error in forgotPassword:", err);
        return res.status(500).json({ message: 'Error on the server.' });
    }
};


// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token
// This function can also remain similar, adapted for async/await
exports.resetPassword = async (req, res) => {
    const unhashedToken = req.params.token;
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ message: 'Please provide a new password.' });
    }

    try {
        const hashedPasswordResetToken = crypto.createHash('sha256').update(unhashedToken).digest('hex');
        const users = await User.findByHashedPasswordResetToken(hashedPasswordResetToken);

        if (!users || users.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }
        const user = users[0];
        
        const salt = await bcrypt.genSalt(10);
        const newHashedPassword = await bcrypt.hash(password, salt);

        await User.resetPassword(user.id, newHashedPassword);
        
        res.status(200).json({ message: 'Password has been reset successfully. You can now log in.' });

    } catch(err) {
        console.error("Error resetting password:", err);
        return res.status(500).json({ message: 'Error resetting password.' });
    }
};