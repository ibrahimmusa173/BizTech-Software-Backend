const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cors = require('cors');

// 1. Load Env Vars (Path points to .env inside backend folder)
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');

// 2. Import Route Files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// 3. Connect to Database
connectDB();

const app = express();

// --- SECURITY MIDDLEWARE (OWASP Top 10) ---
app.use(helmet());           // Set security headers
app.use(express.json());     // JSON Body parser
app.use(mongoSanitize());    // Prevent NoSQL Injection
app.use(cors());             // Enable Cross-Origin requests

// --- MOUNT ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Root route for testing
app.get('/', (req, res) => res.send('API is running...'));

// Start Server
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Secure Server running on port ${PORT}`));