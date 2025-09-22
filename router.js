const express= require('express');
const sqlDbconnect = require('./dbconnect');

const Router = express.Router();



// GET all items
Router.get("/api/user", (req, res)=>{
    sqlDbconnect.query("select * from  items",(err, rows)=>{
        if(!err)
            {
            res.send(rows);
        }else{
            console.log(err);
            res.status(500).send("Error fetching data from database.");
        }
    });
});

// GET item by ID (for update pre-filling form, optional but good practice)
Router.get("/api/items/:id", (req, res) => {
    const { id } = req.params;
    sqlDbconnect.query("SELECT * FROM items WHERE id = ?", [id], (err, rows) => {
        if (!err) {
            if (rows.length > 0) {
                res.send(rows[0]);
            } else {
                res.status(404).send("Item not found.");
            }
        } else {
            console.log(err);
            res.status(500).send("Error fetching item.");
        }
    });
});

// POST a new item
Router.post("/api/items", (req, res) => {
    const { name, description, price } = req.body;
    // Assuming 'items' table has 'name', 'description', 'price' columns
    const sql = "INSERT INTO items (name, description, price) VALUES (?, ?, ?)";
    sqlDbconnect.query(sql, [name, description, price], (err, result) => {
        if (!err) {
            res.status(201).send({ message: "Item added successfully!", id: result.insertId });
        } else {
            console.log(err);
            res.status(500).send({ message: "Error adding item to database.", error: err.message });
        }
    });
});

// PUT (update) an existing item
Router.put("/api/items/:id", (req, res) => {
    const { id } = req.params;
    const { name, description, price } = req.body;
    const sql = "UPDATE items SET name = ?, description = ?, price = ? WHERE id = ?";
    sqlDbconnect.query(sql, [name, description, price, id], (err, result) => {
        if (!err) {
            if (result.affectedRows === 0) {
                res.status(404).send({ message: "Item not found for update." });
            } else {
                res.send({ message: "Item updated successfully!" });
            }
        } else {
            console.log(err);
            res.status(500).send({ message: "Error updating item.", error: err.message });
        }
    });
});

// DELETE an item
Router.delete("/api/items/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM items WHERE id = ?";
    sqlDbconnect.query(sql, [id], (err, result) => {
        if (!err) {
            if (result.affectedRows === 0) {
                res.status(404).send({ message: "Item not found for deletion." });
            } else {
                res.send({ message: "Item deleted successfully!" });
            }
        } else {
            console.log(err);
            res.status(500).send({ message: "Error deleting item.", error: err.message });
        }
    });
});

module.exports = Router;
