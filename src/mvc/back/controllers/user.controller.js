// controllers/user.controller.js
const User = require("../models/user.model.js"); // Corrected line

// Create and Save a new User
exports.create = (req, res) => {
  if (!req.body || !req.body.name || !req.body.username || !req.body.email) {
    return res.status(400).send({ message: "All fields are required." });
  }

  const user = new User({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
  });

  User.create(user, (err, data) => {
    if (err)
      res.status(500).send({ message: err.message || "Some error occurred while creating the User." });
    else res.status(201).send({ message: "User registered successfully", data });
  });
};

// ... the rest of your file remains the same ...

// Retrieve all Users from the database.
exports.findAll = (req, res) => {
  User.getAll((err, data) => {
    if (err)
      res.status(500).send({ message: err.message || "Some error occurred while retrieving users." });
    else res.send(data);
  });
};

// Find a single User with an id
exports.findOne = (req, res) => {
  User.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({ message: `Not found User with id ${req.params.id}.` });
      } else {
        res.status(500).send({ message: "Error retrieving User with id " + req.params.id });
      }
    } else res.send(data);
  });
};

// Update a User identified by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({ message: "Data to update can not be empty!" });
  }

  User.updateById(req.params.id, new User(req.body), (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({ message: `Not found User with id ${req.params.id}.` });
      } else {
        res.status(500).send({ message: "Error updating User with id " + req.params.id });
      }
    } else res.send({ message: "User updated successfully", data });
  });
};

// Delete a User with the specified id in the request
exports.delete = (req, res) => {
  User.remove(req.params.id, (err) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({ message: `Not found User with id ${req.params.id}.` });
      } else {
        res.status(500).send({ message: "Could not delete User with id " + req.params.id });
      }
    } else res.send({ message: `User was deleted successfully!` });
  });
};