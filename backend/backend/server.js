require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/db");

const authRoutes = require("./src/routes/authRoutes");
const petitionRoutes = require("./src/routes/petitionRoutes");
const pollRoutes = require("./src/routes/pollRoutes");
const responseRoutes = require("./src/routes/responseRoutes");
const reportRoutes = require("./src/routes/reportRoutes");

const { protect } = require("./src/middleware/authMiddleware");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 Civix backend running successfully");
});

// ✅ ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/petitions", petitionRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/responses", responseRoutes); // ✅ FIXED
app.use("/api/reports", reportRoutes);

// ✅ PROTECTED TEST
app.get("/api/profile", protect, (req, res) => {
  res.json({
    message: "Protected route accessed successfully",
    user: req.user
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("❌ GLOBAL ERROR:", err);
  res.status(500).json({ message: err.message || "Server Error" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});