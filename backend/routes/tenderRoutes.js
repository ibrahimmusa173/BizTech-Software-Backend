const express = require('express');
const tenderController = require('../controllers/tenderController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

// Publicly accessible tenders (e.g., for bidders to browse)
router.get("/", verifyToken, tenderController.getAllTenders);
router.get("/:id", verifyToken, tenderController.getTenderById);

// Client-specific routes
router.post("/", verifyToken, authorizeRoles('client', 'admin'), tenderController.createTender);
router.get("/my-tenders", verifyToken, authorizeRoles('client', 'admin'), tenderController.getClientTenders); // Get tenders created by the logged-in client
router.put("/:id", verifyToken, authorizeRoles('client', 'admin'), tenderController.updateTender);
router.delete("/:id", verifyToken, authorizeRoles('client', 'admin'), tenderController.deleteTender);

module.exports = router;