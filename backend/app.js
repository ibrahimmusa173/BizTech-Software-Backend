const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv'); // To load environment variables

dotenv.config(); // Load .env file

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes'); // New: For profile management & admin user management
const tenderRoutes = require('./routes/tenderRoutes'); // New: For client tenders & vendor search/proposals
const proposalRoutes = require('./routes/proposalRoutes'); // New: For vendor proposals

const app = express();
const port = process.env.PORT || 7000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Serve static files (e.g., for attachments)
// Create an 'uploads' directory in your backend root.
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/auth', authRoutes); // Authentication (register, login, forgot/reset password)
app.use('/api/users', userRoutes); // User profile management and Admin user management
app.use('/api/tenders', tenderRoutes); // Client tender creation/management, Vendor tender search
app.use('/api/proposals', proposalRoutes); // Vendor proposal submission

// Simple root route (optional, for testing if server is running)
app.get('/', (req, res) => {
    res.send('Tender Management System API is running!');
});

// Start the server
app.listen(port, () => console.log(`Server is running on port ${port}`));

module.exports = app;