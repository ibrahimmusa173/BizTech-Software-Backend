const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const itemRoutes = require('./routes/itemRoutes'); // Existing route
const authRoutes = require('./routes/authRoutes'); // Existing auth routes
const tenderRoutes = require('./routes/tenderRoutes'); // NEW
const proposalRoutes = require('./routes/proposalRoutes'); // NEW
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = 7000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// API Routes
// Existing item routes (consider if these are still needed or if 'tenders' will replace them)
app.use('/api', itemRoutes); 
app.use('/api/auth', authRoutes);

// New Tender & Proposal Routes
app.use('/api/tenders', tenderRoutes); // All tender routes
app.use('/api/proposals', proposalRoutes); // All proposal routes

// Simple root route
app.get('/', (req, res) => {
    res.send('Server is running and ready for API requests!');
});

// Start the server
app.listen(port, () => console.log(`Server is running on port ${port}`));

module.exports = app;