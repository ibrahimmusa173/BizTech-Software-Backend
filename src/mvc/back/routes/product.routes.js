// src/mvc/back/routes/product.routes.js - EDITED

const express = require('express');
const router = express.Router();
const multer = require('multer');
const products = require("../controllers/product.controller.js");
const verifyToken = require('../middleware/auth.middleware.js');

// ... (multer configuration remains the same)
const storage = multer.diskStorage({ /* ... */ });
const upload = multer({ storage: storage });

// --- PUBLIC ROUTES ---
router.get("/", products.findAll);
router.get("/:id", products.findOne); // <-- ADD THIS: To get a single product for the edit form

// --- PROTECTED ROUTES ---
router.post("/", [verifyToken, upload.single('image')], products.create); 
router.put("/:id", [verifyToken, upload.single('image')], products.update); // <-- ADD THIS: To update a product
router.delete("/:id", [verifyToken], products.delete);

module.exports = router;