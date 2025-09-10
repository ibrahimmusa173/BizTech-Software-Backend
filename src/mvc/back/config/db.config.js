// src/backend/config/db.js
const mysql = require("mysql2");
require('dotenv').config(); // Load environment variables

const dbConnection = mysql.createPool({ // Using createPool for better connection management
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
}).promise(); // Using promise-based API for async/await

dbConnection.getConnection()
    .then(conn => {
        console.log("Database Connected Successfully.");
        conn.release();
    })
    .catch(err => {
        console.error("Database Connection Failed: " + JSON.stringify(err, undefined, 2));
    });

module.exports = dbConnection;