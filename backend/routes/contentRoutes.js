// routes/contentRoutes.js

const express = require('express');
const contentController = require('../controllers/contentController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// -----------------------------------------------------------
// PUBLIC/AUTHENTICATED ACCESS
// -----------------------------------------------------------

// GET /api/content/guidelines (Get all public guidelines)
router.get("/guidelines", authenticateToken, contentController.getTenderGuidelines);

// -----------------------------------------------------------
// ADMIN ACCESS ONLY
// -----------------------------------------------------------

// POST /api/content/guidelines (Create a new guideline)
router.post("/guidelines", authenticateToken, authorizeRoles(['admin']), contentController.createGuideline);

// PUT /api/content/guidelines/:id (Update a guideline)
router.put("/guidelines/:id", authenticateToken, authorizeRoles(['admin']), contentController.updateGuideline);

// DELETE /api/content/guidelines/:id (Delete a guideline)
router.delete("/guidelines/:id", authenticateToken, authorizeRoles(['admin']), contentController.deleteGuideline);

module.exports = router;