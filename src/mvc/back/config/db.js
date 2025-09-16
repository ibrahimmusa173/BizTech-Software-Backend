// src/mvc/back/config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config(); // Load environment variables

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'your_password', // !!! IMPORTANT: Change this to your MySQL root password or a dedicated user's password
  database: process.env.DB_NAME || 'practice_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testDbConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to the database.');
    connection.release();
  } catch (error) {
    console.error('Failed to connect to the database:', error.message);
    process.exit(1); // Exit process if cannot connect to DB
  }
}

testDbConnection();

module.exports = pool;