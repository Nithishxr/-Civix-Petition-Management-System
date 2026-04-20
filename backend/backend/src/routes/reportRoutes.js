const express = require("express");
const router = express.Router();

const { 
  getPetitionStatusReport , 
  getLocalityReport , 
  exportReport , 
  exportReportPDF,   
  getMonthlyReport 
} = require("../controllers/reportController");


// Middlewares
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/role"); 

// Petition status report
// GET /api/reports/petition-status
router.get(
  "/petition-status",
  protect,
  allowRoles("official", "admin"), // flexible role-based access
  getPetitionStatusReport
);

// Locality report
// GET /api/reports/locality
router.get(
  "/locality",
  protect,
  allowRoles("official", "admin"),
  getLocalityReport
);

// Export report (CSV download)
router.get(
  "/export/csv",
  protect,
  allowRoles("official", "admin"),
  exportReport
);
//Export report (pdf download)
router.get(
  "/export/pdf",
  protect,
  allowRoles("official", "admin"),
  exportReportPDF
);
//Monthly report
router.get(
  "/monthly",
  protect,
  allowRoles("official", "admin"),
  getMonthlyReport
);
module.exports = router;