// src/mvc/back/routes/itemRoutes.js
const express = require('express');
const itemController = require('../controllers/itemController');
const router = express.Router();

// GET all items
router.get('/', itemController.getAllItems);

// GET a single item by ID
router.get('/:id', itemController.getItemById);

// POST a new item
router.post('/', itemController.createItem);

// PUT (update) an item by ID
router.put('/:id', itemController.updateItem);

// DELETE an item by ID
router.delete('/:id', itemController.deleteItem);

module.exports = router;