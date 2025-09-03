const express = require("express");
const router = express.Router();
const users = require("../controllers/user.controller.js");
const verifyToken = require("../middleware/auth.middleware.js");

router.get("/", [verifyToken], users.findAll);
router.get("/:id", [verifyToken], users.findOne);
router.put("/:id", [verifyToken], users.update);
router.delete("/:id", [verifyToken], users.delete);

module.exports = router;