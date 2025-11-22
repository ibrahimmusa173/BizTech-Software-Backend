
// backend/models/Item.js
const db = require('../config/db'); // Import the database connection

const Item = {
    getAll: (callback) => {
        db.query("SELECT * FROM items", callback);
    },

    getById: (id, callback) => {
        db.query("SELECT * FROM items WHERE id = ?", [id], (err, rows) => {
            if (err) return callback(err);
            callback(null, rows);
        });
    },
    
    // ADDED: Counts all items (tenders)
    countAll: (callback) => {
        db.query("SELECT COUNT(id) AS totalTenders FROM items", callback);
    },

    create: (itemData, callback) => {
        const { name, description, price } = itemData;
        const sql = "INSERT INTO items (name, description, price) VALUES (?, ?, ?)";
        db.query(sql, [name, description, price], callback);
    },

    update: (id, itemData, callback) => {
        const { name, description, price } = itemData;
        const sql = "UPDATE items SET name = ?, description = ?, price = ? WHERE id = ?";
        db.query(sql, [name, description, price, id], callback);
    },

    delete: (id, callback) => {
        const sql = "DELETE FROM items WHERE id = ?";
        db.query(sql, [id], callback);
    }
};

module.exports = Item;
