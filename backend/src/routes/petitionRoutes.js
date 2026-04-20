const express = require("express");
const router = express.Router();

const {
  createPetition,
  getAllPetitions,
  getPetitionById,
  updatePetition,
  signPetition,
  updateStatus,
  deletePetition
} = require("../controllers/petitionController");

// ✅ IMPORT RESPOND CONTROLLER
const { respondToPetition } = require("../controllers/responseController");

const { protect } = require("../middleware/authMiddleware");

// ===============================
// CREATE PETITION
// ===============================
router.post("/", protect, createPetition);

// ===============================
// GET ALL PETITIONS
// ===============================
router.get("/", getAllPetitions);

// ===============================
// GET PETITION BY ID
// ===============================
router.get("/:id", getPetitionById);

// ===============================
// UPDATE PETITION
// ===============================
router.put("/:id", protect, updatePetition);

// ===============================
// UPDATE STATUS
// ===============================
router.patch("/:id/status", protect, updateStatus);

// ===============================
// SIGN PETITION
// ===============================
router.post("/:id/sign", protect, signPetition);

// ===============================
// DELETE PETITION
// ===============================
router.delete("/:id", protect, deletePetition);

// ===============================
// ✅ RESPOND TO PETITION (IMPORTANT)
// ===============================
router.post("/:id/respond", protect, respondToPetition);

module.exports = router;