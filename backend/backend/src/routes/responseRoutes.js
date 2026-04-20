const express = require("express");
const router = express.Router();

const {
  addResponse,
  getResponsesByPetition
} = require("../controllers/responseController");

const { protect } = require("../middleware/authMiddleware");

// Add response (only logged-in user, usually official)
router.post("/:petitionId", protect, addResponse);

// Get all responses for a petition
router.get("/:petitionId", getResponsesByPetition);

module.exports = router;