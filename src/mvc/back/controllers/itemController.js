// src/mvc/back/controllers/itemController.js
const itemModel = require('../models/itemModel');

const itemController = {
  getAllItems: async (req, res) => {
    try {
      const items = await itemModel.findAll();
      res.json(items);
    } catch (error) {
      console.error('Error fetching items:', error);
      res.status(500).json({ message: 'Error fetching items', error: error.message });
    }
  },

  getItemById: async (req, res) => {
    try {
      const item = await itemModel.findById(req.params.id);
      if (item) {
        res.json(item);
      } else {
        res.status(404).json({ message: 'Item not found' });
      }
    } catch (error) {
      console.error('Error fetching item by ID:', error);
      res.status(500).json({ message: 'Error fetching item', error: error.message });
    }
  },

  createItem: async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'Item name is required' });
      }
      const newItem = await itemModel.create(name);
      res.status(201).json(newItem);
    } catch (error) {
      console.error('Error creating item:', error);
      res.status(500).json({ message: 'Error creating item', error: error.message });
    }
  },

  updateItem: async (req, res) => {
    try {
      const { name } = req.body;
      const { id } = req.params;
      if (!name) {
        return res.status(400).json({ message: 'Item name is required' });
      }
      const success = await itemModel.update(id, name);
      if (success) {
        res.json({ message: 'Item updated successfully' });
      } else {
        res.status(404).json({ message: 'Item not found or no changes made' });
      }
    } catch (error) {
      console.error('Error updating item:', error);
      res.status(500).json({ message: 'Error updating item', error: error.message });
    }
  },

  deleteItem: async (req, res) => {
    try {
      const { id } = req.params;
      const success = await itemModel.delete(id);
      if (success) {
        res.status(204).send(); // No content for successful deletion
      } else {
        res.status(404).json({ message: 'Item not found' });
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      res.status(500).json({ message: 'Error deleting item', error: error.message });
    }
  },
};

module.exports = itemController;