const express = require("express");
const router = express.Router();
const users = require("../controllers/user.controller.js");

router.get("/users", users.findAll);

module.exports = router;