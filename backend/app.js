const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const itemRoutes = require('./routes/itemRoutes');
const authRoutes = require('./routes/authRoutes'); // Import auth routes
const dotenv = require('dotenv'); // To load environment variables

dotenv.config(); // Load .env file

const app = express();
const port = 7000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// API Routes
app.use('/api', itemRoutes);
app.use('/api/auth', authRoutes); // All authentication routes under /api/auth

// Simple root route (optional, for testing if server is running)
app.get('/', (req, res) => {
    res.send('Server is running and ready for API requests!');
});

// Start the server
app.listen(port, () => console.log(`Server is running on port ${port}`));

module.exports = app;