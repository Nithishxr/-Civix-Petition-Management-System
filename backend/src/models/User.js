const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["citizen", "official"],
    default: "citizen"
  },

  location: {
    type: String,
    default: ""
  },

  idVerification: {
    type: String,
    default: ""
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  officialApprovalStatus: {
    type: String,
    enum: ["approved", "pending"],
    default: "approved"
  },

  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  approvedAt: {
    type: Date,
    default: null
  },

  // 🔥 VERY IMPORTANT (OTP fields)
  otp: {
    type: String,
    default: null
  },

  otpExpire: {
    type: Date,
    default: null
  }

}, {
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);