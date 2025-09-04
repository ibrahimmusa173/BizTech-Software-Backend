const express = require("express");
const cors = require("cors");
const path = require('path'); // You MUST import the 'path' module to use path.join

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===================================================================
//  THE FIX: MAKE THE 'UPLOADS' FOLDER PUBLICLY ACCESSIBLE
//
//  This line tells Express: "If you receive a request that starts
//  with '/uploads' in the URL, treat it as a request for a static file
//  and look for it inside the physical folder located at path.join(__dirname, 'uploads')."
//  __dirname is a Node.js variable that gives the path of the current file's directory.
// ===================================================================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// --- API ROUTES ---
// Make sure these paths correctly point to your route files.
const authRoutes = require("./routes/auth.routes.js");
const productRoutes = require("./routes/product.routes.js");
// If you have more routes, require them here.

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
// app.use('/api/users', userRoutes); // Add other routes if you have them


// Set port and start the server
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});