const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const tenderRoutes = require('./routes/tenderRoutes'); // New tender routes
const proposalRoutes = require('./routes/proposalRoutes'); // New proposal routes
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 7000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// API Routes
app.use('/api/auth', authRoutes); // Shared authentication routes
app.use('/api', tenderRoutes);    // Tender related routes
app.use('/api', proposalRoutes);  // Proposal related routes

// Simple root route (optional, for testing if server is running)
app.get('/', (req, res) => {
    res.send('BizTech Group Platform Backend is running!');
});

// Start the server
app.listen(port, () => console.log(`Server is running on port ${port}`));

module.exports = app;