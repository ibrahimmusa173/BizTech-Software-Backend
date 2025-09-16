// src/mvc/back/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan'); // For request logging
const helmet = require('helmet'); // For security
require('dotenv').config(); // Load environment variables from .env

const itemRoutes = require('./routes/itemRoutes'); // Import item routes

const app = express();
const PORT = process.env.PORT || 5000; // Use port from .env or default to 5000

// --- Middleware ---
// Helmet helps secure Express apps by setting various HTTP headers
app.use(helmet());
// CORS for cross-origin requests (allow frontend to connect)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Adjust this to your frontend's actual URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
// Morgan for logging HTTP requests
app.use(morgan('dev')); // 'dev' format is concise, color-coded for development
// Body-parser to parse JSON request bodies
app.use(bodyParser.json());
// Body-parser to parse URL-encoded request bodies (optional, good practice)
app.use(bodyParser.urlencoded({ extended: true }));


// --- Routes ---
app.get('/', (req, res) => {
  res.send('Welcome to the MVC Backend API!');
});

// Item API routes
app.use('/api/items', itemRoutes);


// --- Error Handling Middleware (Optional but recommended) ---
app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});