// src/mvc/back/controllers/product.controller.js - FINAL COMPLETE VERSION

const Product = require("../models/product.model.js");
// 'fs' and 'path' were removed as they were not used.

// --- 1. CREATE A NEW PRODUCT ---
exports.create = (req, res) => {
  if (!req.body.name || !req.body.price || !req.file) {
    res.status(400).send({ message: "All fields, including an image, are required!" });
    return;
  }

  // Use the filename provided by multer and prepend the 'uploads/' directory path.
  const imageUrl = 'uploads/' + req.file.filename;

  const product = new Product({
    name: req.body.name,
    category: req.body.category,
    price: req.body.price,
    imageUrl: imageUrl // Store the clean, relative path
  });

  Product.create(product, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "An error occurred while creating the Product."
      });
    } else {
      res.status(201).send(data);
    }
  });
};

// --- 2. FIND ALL PRODUCTS ---
exports.findAll = (req, res) => {
  Product.getAll((err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "An error occurred while retrieving products."
      });
    } else {
      res.send(data);
    }
  });
};

// --- 3. FIND A SINGLE PRODUCT BY ID ---
exports.findOne = (req, res) => {
  Product.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({ message: `Not found Product with id ${req.params.id}.` });
      } else {
        res.status(500).send({ message: "Error retrieving Product with id " + req.params.id });
      }
    } else {
      res.send(data);
    }
  });
};

// --- 4. UPDATE A PRODUCT BY ID ---
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({ message: "Data to update can not be empty!" });
  }

  // Use the Product model's constructor to create an object with the new data
  const productData = new Product({
    name: req.body.name,
    category: req.body.category,
    price: req.body.price,
  });
  
  // If a new image was uploaded, add its path to the update data
  if (req.file) {
    // Note: req.file.path might include backslashes on Windows. 
    // It's good practice to normalize it.
    productData.imageUrl = req.file.path.replace(/\\/g, "/");
  }
  
  Product.updateById(req.params.id, productData, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({ message: `Not found Product with id ${req.params.id}.` });
      } else {
        res.status(500).send({ message: "Error updating Product with id " + req.params.id });
      }
    } else {
      res.send(data);
    }
  });
};

// --- 5. DELETE A PRODUCT ---
exports.delete = (req, res) => {
  // We only need the 'err' parameter from the callback, so we omit the second one.
  Product.remove(req.params.id, (err) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Product with id ${req.params.id}.`
        });
      } else {
        res.status(500).send({
          message: "Could not delete Product with id " + req.params.id
        });
      }
    } else {
      res.send({ message: `Product was deleted successfully!` });
    }
  });
};