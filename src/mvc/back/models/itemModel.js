// src/mvc/back/models/itemModel.js
const pool = require('../config/db');

const itemModel = {
  findAll: async () => {
    const [rows] = await pool.execute('SELECT * FROM items ORDER BY id DESC');
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.execute('SELECT * FROM items WHERE id = ?', [id]);
    return rows[0]; // Return the first matching item
  },

  create: async (name) => {
    const [result] = await pool.execute('INSERT INTO items (name) VALUES (?)', [name]);
    return { id: result.insertId, name }; // Return the newly created item's ID and name
  },

  update: async (id, name) => {
    const [result] = await pool.execute('UPDATE items SET name = ? WHERE id = ?', [name, id]);
    return result.affectedRows > 0; // Return true if an item was updated
  },

  delete: async (id) => {
    const [result] = await pool.execute('DELETE FROM items WHERE id = ?', [id]);
    return result.affectedRows > 0; // Return true if an item was deleted
  },
};

module.exports = itemModel;