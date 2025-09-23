// backend/utils/emailService.js
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config(); // Load .env file for email credentials

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io', // e.g., 'smtp.gmail.com' or 'smtp.sendgrid.net'
    port: process.env.EMAIL_PORT || 2525,       // e.g., 465 for SSL, 587 for TLS
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER || 'your_mailtrap_username', // Your email address from .env
        pass: process.env.EMAIL_PASS || 'your_mailtrap_password'  // Your email password from .env
    },
    // Optional: for local development with self-signed certs or specific networks
    // tls: {
    //     rejectUnauthorized: false
    // }
});

const sendPasswordResetEmail = async (toEmail, token) => {
    // Make sure your frontend URL is correct here.
    // In a real app, you'd use an environment variable for `FRONTEND_URL`.
    const resetUrl = `http://localhost:5173/reset-password/${token}`; // Adjust port if your frontend uses a different one

    const mailOptions = {
        from: process.env.EMAIL_FROM || 'no-reply@yourdomain.com',
        to: toEmail,
        subject: 'Password Reset Request',
        html: `
            <p>You requested a password reset. Please click the link below to reset your password:</p>
            <a href="${resetUrl}">Reset Password</a>
            <p>This link is valid for 1 hour.</p>
            <p>If you did not request this, please ignore this email.</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to ${toEmail}`);
        return true;
    } catch (error) {
        console.error(`Error sending password reset email to ${toEmail}:`, error);
        return false;
    }
};

module.exports = { sendPasswordResetEmail };