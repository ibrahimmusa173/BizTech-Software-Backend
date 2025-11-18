// routes/itemRoutes.js
const express = require('express');
const itemController = require('../controllers/itemController'); // Path is correct

const router = express.Router();

// Define routes and link them to controller methods
router.get("/items", itemController.getAllItems);         // GET all items (was /api/user)
router.get("/items/:id", itemController.getItemById);     // GET item by ID
router.post("/items", itemController.createItem);         // POST a new item
router.put("/items/:id", itemController.updateItem);      // PUT (update) an existing item
router.delete("/items/:id", itemController.deleteItem);   // DELETE an item

module.exports = router;