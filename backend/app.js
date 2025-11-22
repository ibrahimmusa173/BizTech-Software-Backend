const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const itemRoutes = require('./routes/itemRoutes'); // Keep existing item routes
const authRoutes = require('./routes/authRoutes'); // Keep existing auth routes
const userRoutes = require('./routes/userRoutes');       // <-- NEW
const tenderRoutes = require('./routes/tenderRoutes');   // <-- NEW
const proposalRoutes = require('./routes/proposalRoutes');// <-- NEW
const adminRoutes = require('./routes/adminRoutes');     // <-- NEW
// NOTE: notificationRoutes should also be imported if needed

const dotenv = require('dotenv'); // To load environment variables

dotenv.config(); // Load .env file

const app = express();
const port = 7000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// API Routes
app.use('/api', itemRoutes); // Existing route
app.use('/api/auth', authRoutes); // Existing route

// Registering new routes based on the file structure:
app.use('/api/users', userRoutes);
app.use('/api/tenders', tenderRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/admin', adminRoutes); 

// Simple root route (optional, for testing if server is running)
app.get('/', (req, res) => {
    res.send('Server is running and ready for API requests!');
});

// Start the server
app.listen(port, () => console.log(`Server is running on port ${port}`));

module.exports = app;