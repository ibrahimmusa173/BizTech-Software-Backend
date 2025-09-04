// src/mvc/back/models/product.model.js - FINAL CORRECTED VERSION

const sql = require("./db.js");

// The constructor for the Product object
const Product = function(product) {
  // ========================== THE FIX ==========================
  // The body of the constructor must assign properties from the
  // 'product' parameter to the 'this' context.
  // =============================================================
  this.name = product.name;
  this.category = product.category;
  this.price = product.price;
  this.imageUrl = product.imageUrl;
};

// Create a new Product in the database
Product.create = (newProduct, result) => {
  sql.query("INSERT INTO products SET ?", newProduct, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    result(null, { id: res.insertId, ...newProduct });
  });
};

// Retrieve all Products from the database
Product.getAll = (result) => {
  sql.query("SELECT * FROM products ORDER BY category, name", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    result(null, res);
  });
};


// --- YOUR NEW FUNCTIONS ---

// Find a single Product by its ID
Product.findById = (id, result) => {
  sql.query(`SELECT * FROM products WHERE id = ${id}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res[0]);
      return;
    }
    // If no product is found
    result({ kind: "not_found" }, null);
  });
};

// Update a product by its ID
Product.updateById = (id, product, result) => {
  let query = "UPDATE products SET name = ?, category = ?, price = ?";
  const params = [product.name, product.category, product.price];

  // Only add the imageUrl to the update query if a new one was provided
  if (product.imageUrl) {
    query += ", imageUrl = ?";
    params.push(product.imageUrl);
  }

  query += " WHERE id = ?";
  params.push(id);

  sql.query(query, params, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.affectedRows == 0) {
      // No product was found with that ID
      result({ kind: "not_found" }, null);
      return;
    }
    result(null, { id: id, ...product });
  });
};

// Delete a Product by its ID
Product.remove = (id, result) => {
  sql.query("DELETE FROM products WHERE id = ?", id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.affectedRows == 0) {
      result({ kind: "not_found" }, null);
      return;
    }
    result(null, res);
  });
};

module.exports = Product;