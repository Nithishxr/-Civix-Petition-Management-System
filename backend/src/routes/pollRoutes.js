const express = require("express");
const router = express.Router();
const { createPoll, getPolls, getPollResults, getPollById } = require("../controllers/pollController");
const { voteOnPoll, removeVote } = require("../controllers/voteController");

const { protect } = require("../middleware/authMiddleware");
const { isOfficial } = require("../middleware/roleMiddleware");
const { allowRoles } = require("../middleware/role");

// Only officials can create polls
router.post("/", protect, isOfficial, createPoll);


// Get all polls OR filter by location
router.get("/", protect, getPolls);


// Poll results (must come before /:id)
router.get("/:id/results", getPollResults);


// Get single poll
router.get("/:id", protect, getPollById);


// Citizen votes or changes vote
router.post("/:id/vote", protect, allowRoles("citizen"), voteOnPoll);


// Citizen removes vote
router.delete("/:id/vote", protect, allowRoles("citizen"), removeVote);
module.exports = router;