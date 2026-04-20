const Petition = require("../models/Petition");
const Vote = require("../models/Vote");
const Response = require("../models/Response");

const { 
  getPetitionStatusReportService, 
  getLocalityReportService, 
  exportReportService,
  exportReportPDFService
} = require("../services/reportService");


// =========================
// 🔹 Petition Status Report
// =========================
const getPetitionStatusReport = async (req, res) => {
  try {
    const data = await getPetitionStatusReportService();

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.error("Error in petition status report:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate petition status report"
    });
  }
};


// =========================
// 🔹 Locality Report
// =========================
const getLocalityReport = async (req, res) => {
  try {
    const location = req.query.location || null;

    const data = await getLocalityReportService(location);

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.error("Error in locality report:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate locality report"
    });
  }
};


// =========================
// 🔹 CSV EXPORT (UPDATED)
// =========================
const exportReport = async (req, res) => {
  try {
    let { month, year, location } = req.query;

    // Safe parsing
    month = month ? parseInt(month) : null;
    year = year ? parseInt(year) : null;

    // Validation
    if (month && (month < 1 || month > 12)) {
      return res.status(400).json({
        success: false,
        message: "Invalid month value (1-12)"
      });
    }

    if (year && year < 2000) {
      return res.status(400).json({
        success: false,
        message: "Invalid year"
      });
    }

    const csv = await exportReportService({
      month,
      year,
      location: location || null
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=analytics-report.csv"
    );

    return res.status(200).send(csv);

  } catch (error) {
    console.error("Error exporting CSV report:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to export CSV report"
    });
  }
};


// =========================
// 🔹 PDF EXPORT (IMPORTANT FIX)
// =========================
const exportReportPDF = async (req, res) => {
  try {
    let { month, year, location } = req.query;

    // Safe parsing
    month = month ? parseInt(month) : null;
    year = year ? parseInt(year) : null;

    // Validation
    if (month && (month < 1 || month > 12)) {
      return res.status(400).json({
        success: false,
        message: "Invalid month value (1-12)"
      });
    }

    if (year && year < 2000) {
      return res.status(400).json({
        success: false,
        message: "Invalid year"
      });
    }

    const doc = await exportReportPDFService({
      month,
      year,
      location: location || null
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=analytics-report.pdf"
    );

    // 🔥 CRITICAL: STREAM PROPERLY
    doc.pipe(res);

    doc.on("end", () => {
      console.log("PDF sent successfully");
    });

    doc.on("error", (err) => {
      console.error("PDF stream error:", err);
      if (!res.headersSent) {
        res.status(500).json({ message: "PDF generation failed" });
      }
    });

  } catch (error) {
    console.error("Error exporting PDF report:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to export PDF report"
    });
  }
};


// =========================
// 🔹 Monthly Report (UNCHANGED)
// =========================
const getMonthlyReport = async (req, res) => {
  try {
    let { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month and year are required",
      });
    }

    month = parseInt(month);
    year = parseInt(year);

    if (month < 1 || month > 12) {
      return res.status(400).json({
        success: false,
        message: "Invalid month value",
      });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const totalPetitions = await Petition.countDocuments({
      createdAt: { $gte: startDate, $lt: endDate },
    });

    const respondedPetitions = await Petition.countDocuments({
      createdAt: { $gte: startDate, $lt: endDate },
      responses: { $exists: true, $not: { $size: 0 } },
    });

    const pendingPetitions = await Petition.countDocuments({
      createdAt: { $gte: startDate, $lt: endDate },
      $or: [
        { responses: { $exists: false } },
        { responses: { $size: 0 } },
      ],
    });

    const activeCitizensList = await Vote.distinct("user", {
      createdAt: { $gte: startDate, $lt: endDate },
    });

    const totalVotes = await Vote.countDocuments({
      createdAt: { $gte: startDate, $lt: endDate },
    });

    const totalComments = await Response.countDocuments({
      createdAt: { $gte: startDate, $lt: endDate },
    });

    return res.status(200).json({
      success: true,
      data: {
        totalPetitions,
        respondedPetitions,
        pendingPetitions,
        activeCitizens: activeCitizensList.length,
        totalVotes,
        totalComments,
      }
    });

  } catch (error) {
    console.error("Monthly Report Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate monthly report",
      error: error.message,
    });
  }
};


// =========================
// 🔹 EXPORTS
// =========================
module.exports = { 
  getPetitionStatusReport, 
  getLocalityReport,
  exportReport,
  exportReportPDF,
  getMonthlyReport
};