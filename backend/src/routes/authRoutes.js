const express = require("express");
const router = express.Router();

// CONTROLLERS
const {
  register,
  login,
  me,
  listPendingOfficials,
  approveOfficial,
  forgotPassword,
  resetPassword
} = require("../controllers/authController");

// MIDDLEWARE
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/role");

// ===============================
// AUTH ROUTES
// ===============================
router.post("/register", register);
router.post("/login", login);

// ===============================
// PASSWORD RESET (OTP)
// ===============================
router.post("/forgot-password", forgotPassword);   // ✅ FIX
router.post("/reset-password", resetPassword);     // ✅ FIX

// ===============================
// USER PROFILE
// ===============================
router.get("/me", protect, me);

// ===============================
// OFFICIAL MANAGEMENT
// ===============================
router.get(
  "/officials/pending",
  protect,
  allowRoles("official"),
  listPendingOfficials
);

router.patch(
  "/officials/:officialId/approve",
  protect,
  allowRoles("official"),
  approveOfficial
);

module.exports = router;