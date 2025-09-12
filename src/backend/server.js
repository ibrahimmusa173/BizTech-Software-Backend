const express = require('express');
require('dotenv').config();
const cors = require('cors');
require('./config/db'); // This will run the connection logic

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/tasks', require('./routes/taskRoutes'));

// Start Server
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));