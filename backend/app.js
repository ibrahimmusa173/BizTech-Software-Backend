const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const tenderRoutes = require('./routes/tenderRoutes');
const proposalRoutes = require('./routes/proposalRoutes');
const notificationRoutes = require('./routes/notificationRoutes'); 
const adminRoutes = require('./routes/adminRoutes');
const guidelineRoutes = require('./routes/guidelineRoutes'); // NEW: Import guidelines route

const app = express();
const port = process.env.PORT || 7000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Serve static files (e.g., for attachments)
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tenders', tenderRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/guidelines', guidelineRoutes); // NEW: Guideline access route

// Simple root route (optional, for testing if server is running)
app.get('/', (req, res) => {
    res.send('Tender Management System API is running!');
});

// Start the server
app.listen(port, () => console.log(`Server is running on port ${port}`));

module.exports = app;