const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");

// =========================
// Normalize role
// =========================
const normalizeRole = (role) => {
  if (!role) return "citizen";
  const raw = role.toString().trim().toLowerCase();
  if (raw === "official" || raw === "government official") return "official";
  return "citizen";
};

// =========================
// Serialize user
// =========================
const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  location: user.location,
  isVerified: user.isVerified,
  officialApprovalStatus: user.officialApprovalStatus
});

// =========================
// REGISTER
// =========================
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, location, idVerification } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    const cleanedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedRole = normalizeRole(role);

    let officialApprovalStatus = "approved";
    let approvedBy = null;
    let approvedAt = null;
    let isVerified = false;

    if (normalizedRole === "official") {
      const count = await User.countDocuments({
        role: "official",
        officialApprovalStatus: "approved"
      });

      if (count === 0) {
        isVerified = true;
        approvedAt = new Date();
      } else {
        officialApprovalStatus = "pending";
      }
    }

    const user = new User({
      name: name.trim(),
      email: cleanedEmail,
      password: hashedPassword,
      role: normalizedRole,
      location: location || "",
      idVerification: idVerification || "",
      isVerified,
      officialApprovalStatus,
      approvedBy,
      approvedAt
    });

    await user.save();

    if (normalizedRole === "official" && officialApprovalStatus === "pending") {
      return res.status(201).json({
        message: "Official registered and awaiting approval",
        user: serializeUser(user)
      });
    }

    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: serializeUser(user)
    });

  } catch (error) {
    res.status(500).json({
      message: "Error registering user",
      error: error.message
    });
  }
};

// =========================
// LOGIN
// =========================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const cleanedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanedEmail });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.role === "official" && user.officialApprovalStatus !== "approved") {
      return res.status(403).json({
        message: "Official account is pending approval"
      });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: serializeUser(user)
    });

  } catch (error) {
    res.status(500).json({
      message: "Error logging in",
      error: error.message
    });
  }
};

// =========================
// FORGOT PASSWORD (SEND OTP)
// =========================
exports.forgotPassword = async (req, res) => {
  try {
    const cleanedEmail = req.body.email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanedEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendEmail(
      cleanedEmail,
      "Password Reset OTP",
      `Your OTP is ${otp}. It expires in 10 minutes.`
    );

    res.json({ message: "OTP sent to email" });

  } catch (error) {
    res.status(500).json({
      message: "Error sending OTP",
      error: error.message
    });
  }
};

// =========================
// RESET PASSWORD
// =========================
exports.resetPassword = async (req, res) => {
  try {
    let { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Email, OTP and new password are required"
      });
    }

    const cleanedEmail = email.toLowerCase().trim();
    otp = otp.toString().trim();

    const user = await User.findOne({ email: cleanedEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.otp || !user.otpExpire) {
      return res.status(400).json({ message: "OTP not requested" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpire < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpire = null;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {
    res.status(500).json({
      message: "Error resetting password",
      error: error.message
    });
  }
};

// =========================
// CURRENT USER
// =========================
exports.me = async (req, res) => {
  res.json({ user: req.user });
};

// =========================
// LIST PENDING OFFICIALS
// =========================
exports.listPendingOfficials = async (req, res) => {
  try {
    const pendingOfficials = await User.find({
      role: "official",
      officialApprovalStatus: "pending"
    });

    res.json({
      count: pendingOfficials.length,
      pendingOfficials
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching pending officials"
    });
  }
};

// =========================
// APPROVE OFFICIAL
// =========================
exports.approveOfficial = async (req, res) => {
  try {
    const { officialId } = req.params;

    const user = await User.findById(officialId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.officialApprovalStatus = "approved";
    user.approvedBy = req.user._id;
    user.approvedAt = new Date();
    user.isVerified = true;

    await user.save();

    res.json({
      message: "Official approved successfully",
      user: serializeUser(user)
    });

  } catch (error) {
    res.status(500).json({
      message: "Error approving official",
      error: error.message
    });
  }
};