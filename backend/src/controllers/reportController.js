const Petition = require("../models/Petition");
const Vote = require("../models/Vote");
const Response = require("../models/Response");

const { 
  getPetitionStatusReportService, 
  getLocalityReportService, 
  exportReportService
} = require("../services/reportService");


// 🔹 Petition Status Report
const getPetitionStatusReport = async (req, res) => {
  try {
    const data = await getPetitionStatusReportService();

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.error("Error in petition status report:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate petition status report"
    });
  }
};


// 🔹 Locality Report (WITH FILTER SUPPORT)
const getLocalityReport = async (req, res) => {
  try {
    // ✅ get query param
    const location = req.query.location;

    // ✅ pass to service
    const data = await getLocalityReportService(location);

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.error("Error in locality report:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate locality report"
    });
  }
};
// 🔹 Export Report (CSV)
const exportReport = async (req, res) => {
  try {
    const { type, location } = req.query;

    // Validate type
    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Report type is required"
      });
    }

    const csv = await exportReportService(type, location);

    // Set headers for download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${type}-report.csv`
    );

    res.status(200).send(csv);

  } catch (error) {
    console.error("Error exporting report:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to export report"
    });
  }
};
// 🔹 Monthly Report
const getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        message: "Month and year are required",
      });
    }

    const parsedMonth = parseInt(month);
    const parsedYear = parseInt(year);

    if (parsedMonth < 1 || parsedMonth > 12) {
      return res.status(400).json({
        message: "Invalid month value",
      });
    }

    const startDate = new Date(parsedYear, parsedMonth - 1, 1);
    const endDate = new Date(parsedYear, parsedMonth, 1);

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

    res.status(200).json({
      totalPetitions,
      respondedPetitions,
      pendingPetitions,
      activeCitizens: activeCitizensList.length,
      totalVotes,
      totalComments,
    });

  } catch (error) {
    console.error("Monthly Report Error:", error);

    res.status(500).json({
      message: "Failed to generate monthly report",
      error: error.message,
    });
  }
};

module.exports = { 
  getPetitionStatusReport, 
  getLocalityReport,
  exportReport,
  getMonthlyReport
};