// app.js
const express = require('express');
const cors = require('cors');
// These paths assume itemRoutes.js and authRoutes.js are inside a 'routes' folder 
// which is a sibling directory to app.js (i.e., both inside 'backend').
const itemRoutes = require('./routes/itemRoutes'); 
const authRoutes = require('./routes/authRoutes'); 
const proposalRoutes = require('./routes/proposalRoutes'); // NEW: Import proposal routes
const dotenv = require('dotenv'); 
const path = require('path'); 
const fs = require('fs'); 

dotenv.config(); // Load .env file

const app = express();
const port = 7000;

// --- Setup Upload Directory (Crucial for proposal file uploads) ---
// This path ensures 'uploads/proposals' directory exists inside the 'backend' folder
const uploadDir = path.join(__dirname, 'uploads/proposals');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
// Use Express built-in parsers (replaces body-parser)
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cors());

// --- Static File Serving ---
// Allow access to uploaded files 
app.use('/uploads/proposals', express.static(uploadDir)); 


// API Routes
app.use('/api/auth', authRoutes); 
app.use('/api', itemRoutes); 
app.use('/api/proposals', proposalRoutes); // NEW Proposal Routes integration


// Simple root route 
app.get('/', (req, res) => {
    res.send('Server is running and ready for API requests!');
});

// Start the server
app.listen(port, () => console.log(`Server is running on port ${port}`));

module.exports = app;