// controllers/itemController.js (MISSING FILE CONTENT)
const Item = require('../models/Item'); // Path correct: ../models/Item

const itemController = {
    getAllItems: (req, res) => {
        Item.getAll((err, rows) => {
            if (!err) {
                res.status(200).send(rows);
            } else {
                console.error('Error in getAllItems:', err);
                res.status(500).send({ message: "Error fetching data from database.", error: err.message });
            }
        });
    },

    getItemById: (req, res) => {
        const { id } = req.params;
        Item.getById(id, (err, rows) => {
            if (!err) {
                if (rows.length > 0) {
                    res.status(200).send(rows[0]);
                } else {
                    res.status(404).send({ message: "Item not found." });
                }
            } else {
                console.error('Error in getItemById:', err);
                res.status(500).send({ message: "Error fetching item.", error: err.message });
            }
        });
    },

    createItem: (req, res) => {
        const itemData = req.body;
        Item.create(itemData, (err, result) => {
            if (!err) {
                res.status(201).send({ message: "Item added successfully!", id: result.insertId });
            } else {
                console.error('Error in createItem:', err);
                res.status(500).send({ message: "Error adding item to database.", error: err.message });
            }
        });
    },

    updateItem: (req, res) => {
        const { id } = req.params;
        const itemData = req.body;
        Item.update(id, itemData, (err, result) => {
            if (!err) {
                if (result.affectedRows === 0) {
                    res.status(404).send({ message: "Item not found for update." });
                } else {
                    res.status(200).send({ message: "Item updated successfully!" });
                }
            } else {
                console.error('Error in updateItem:', err);
                res.status(500).send({ message: "Error updating item.", error: err.message });
            }
        });
    },

    deleteItem: (req, res) => {
        const { id } = req.params;
        Item.delete(id, (err, result) => {
            if (!err) {
                if (result.affectedRows === 0) {
                    res.status(404).send({ message: "Item not found for deletion." });
                } else {
                    res.status(200).send({ message: "Item deleted successfully!" });
                }
            } else {
                console.error('Error in deleteItem:', err);
                res.status(500).send({ message: "Error deleting item.", error: err.message });
            }
        });
    }
};

module.exports = itemController;