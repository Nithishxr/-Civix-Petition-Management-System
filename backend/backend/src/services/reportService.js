const Petition = require("../models/Petition");
const Vote = require("../models/Vote");
const Poll = require("../models/Poll");
const PDFDocument = require("pdfkit");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");

// =========================
// 🔹 SAFE FUNCTION
// =========================
const safe = (val, fallback = 0) => {
  if (val === undefined || val === null || isNaN(val)) return fallback;
  return val;
};

// =========================
// 🔹 CHART SETUP
// =========================
const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width: 500,
  height: 300
});

// =========================
// 🔹 FILTER
// =========================
const buildFilter = (month, year, location) => {
  let filter = {};

  if (month && year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    filter.createdAt = { $gte: startDate, $lt: endDate };
  }

  if (location) filter.location = location;

  return filter;
};

// =========================
// 🔹 MAIN DATA GENERATOR
// =========================
const generateReportData = async ({ month, year, location }) => {
  const filter = buildFilter(month, year, location);

  const petitions = await Petition.find(filter).populate("createdBy", "name");
  const votes = await Vote.find(filter).populate("user", "name").populate("poll", "title targetLocation createdBy");

  // =========================
  // PETITION STATUS
  // =========================
  let statusCount = { active: 0, under_review: 0, closed: 0 };

  petitions.forEach(p => {
    const key = p.status.replace(/ /g, "_");
    if (statusCount[key] !== undefined) statusCount[key]++;
  });

  // =========================
  // PETITION TABLE
  // =========================
  const petitionTable = petitions.map(p => ({
    title: p.title || "Untitled",
    location: p.location || "-",
    createdBy: p.createdBy?.name || "Unknown",
    createdAt: new Date(p.createdAt).toLocaleDateString(),
    status: p.status,
    signatures: safe(p.signatures?.length, 0)
  }));

  // =========================
  // POLL DATA
  // =========================
  let voteDistribution = { yes: 0, no: 0, unknown: 0 };
  const pollMap = {};

  votes.forEach(v => {
    const pollId = v.poll?._id?.toString() || "general";
    const option = (v.selectedOption || "").toLowerCase();

    if (!pollMap[pollId]) {
      pollMap[pollId] = {
        yes: 0,
        no: 0,
        unknown: 0,
        total: 0,
        pollData: v.poll
      };
    }

    if (option === "yes") {
      pollMap[pollId].yes++;
      voteDistribution.yes++;
    } else if (option === "no") {
      pollMap[pollId].no++;
      voteDistribution.no++;
    } else {
      pollMap[pollId].unknown++;
      voteDistribution.unknown++;
    }

    pollMap[pollId].total++;
  });

  // =========================
  // ENRICH POLL DATA
  // =========================
  const pollIds = Object.keys(pollMap).filter(id => id !== "general");
  const pollsData = await Poll.find({ _id: { $in: pollIds } }).populate("createdBy", "name");

  const pollsDataMap = {};
  pollsData.forEach(poll => {
    pollsDataMap[poll._id.toString()] = poll;
  });

  const pollTable = Object.entries(pollMap).map(([id, val]) => {
    const pollData = pollsDataMap[id] || val.pollData;
    return {
      id,
      title: pollData?.title || "Untitled Poll",
      location: pollData?.targetLocation || "-",
      createdBy: pollData?.createdBy?.name || "Unknown",
      createdAt: pollData?.createdAt ? new Date(pollData.createdAt).toLocaleDateString() : "-",
      yes: safe(val.yes, 0),
      no: safe(val.no, 0),
      unknown: safe(val.unknown, 0),
      total: safe(val.total, 0)
    };
  });

  const totalVotes = votes.length;

  let votePercentages = {};
  Object.keys(voteDistribution).forEach(key => {
    votePercentages[key] = totalVotes
      ? ((voteDistribution[key] / totalVotes) * 100).toFixed(2)
      : "0.00";
  });

  return {
    petitions,
    petitionTable,
    pollTable,
    statusCount,
    voteDistribution,
    votePercentages,
    totalVotes,
    totalPetitions: petitions.length,
    filters: { month, year, location }
  };
};

// =========================
// 🔹 CHARTS
// =========================
const generateBarChart = async (data) => {
  return chartJSNodeCanvas.renderToBuffer({
    type: "bar",
    data: {
      labels: Object.keys(data),
      datasets: [{
        label: "",
        data: Object.values(data),
        backgroundColor: "#3B82F6"
      }]
    },
    options: {
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
};

const generatePieChart = async (data) => {
  return chartJSNodeCanvas.renderToBuffer({
    type: "pie",
    data: {
      labels: Object.keys(data),
      datasets: [{
        data: Object.values(data),
        backgroundColor: ["#22C55E", "#EF4444", "#F59E0B", "#3B82F6"]
      }]
    }
  });
};

// =========================
// 🔹 PDF HELPER FUNCTIONS
// =========================
// =========================
// 🔹 PDF HELPER FUNCTIONS (FIXED & CENTERED)
// =========================
const drawTableRow = (doc, y, cols, widths, options = {}) => {
  const { bold = false, background = null, startX } = options;

  const tableWidth = widths.reduce((a, b) => a + b, 0);

  let maxHeight = 25;

  if (!bold) {
    cols.forEach((text, i) => {
      const colText = String(text || "0");
      const textHeight = doc.heightOfString(colText, {
        width: widths[i] - 10,
        lineBreak: true
      });
      maxHeight = Math.max(maxHeight, textHeight + 16);
    });
  }

  // Background
  if (background) {
    doc.rect(startX, y, tableWidth, maxHeight).fill(background);
  }

  doc.fillColor("#000000");
  doc.font(bold ? "Helvetica-Bold" : "Helvetica");

  let x = startX;

  cols.forEach((text, i) => {
    const colText = String(text || "0");
    doc.text(colText, x + 5, y + 8, {
      width: widths[i] - 10,
      align: "left",
      lineBreak: true
    });
    x += widths[i];
  });

  return y + maxHeight;
};

const drawTable = (doc, headers, rows, widths, startY) => {
  let y = startY;

  const tableWidth = widths.reduce((a, b) => a + b, 0);

  // 🔥 CENTER TABLE
  const startX = (doc.page.width - tableWidth) / 2;

  const headerHeight = 30;

  // Header background
  doc.rect(startX, y, tableWidth, headerHeight).fill("#1E3A8A");

  doc.fillColor("#FFFFFF");
  doc.font("Helvetica-Bold");
  doc.fontSize(9);

  let x = startX;

  headers.forEach((header, i) => {
    doc.text(header, x + 5, y + 8, {
      width: widths[i] - 10,
      align: "left"
    });
    x += widths[i];
  });

  doc.fontSize(10);
  y += headerHeight;

  // Rows
  rows.forEach((row, index) => {
    const bgColor = index % 2 === 0 ? "#F9FAFB" : "#FFFFFF";

    y = drawTableRow(doc, y, row, widths, {
      background: bgColor,
      startX
    });

    // Page break
    if (y > 700 && index < rows.length - 1) {
      doc.addPage();
      y = 60;
    }
  });

  return y;
};
// =========================
// 🔹 PDF EXPORT (PREMIUM)
// =========================
const exportReportPDFService = async (params) => {
  const data = await generateReportData(params);

  const doc = new PDFDocument({ 
    margin: 40, 
    size: "A4",
    bufferPages: true
  });

  // =========================
  // HEADER
  // =========================
  doc.fillColor("#1E3A8A")
     .fontSize(24)
     .font("Helvetica-Bold")
     .text("CIVIX ANALYTICS REPORT", { align: "center" });
  
  doc.moveDown(0.5);
  
  // Filter info
  doc.fontSize(10)
     .fillColor("#6B7280")
     .font("Helvetica")
     .text(
       `Generated: ${new Date().toLocaleDateString()} | Filters: ${
         data.filters.month && data.filters.year
           ? `${data.filters.month}/${data.filters.year}`
           : "All Time"
       } ${data.filters.location ? `| Location: ${data.filters.location}` : ""}`,
       { align: "center" }
     );
  
  doc.moveDown(2);

  // =========================
  // PETITIONS SECTION
  // =========================
  doc.fillColor("#2563EB")
     .fontSize(18)
     .font("Helvetica-Bold")
     .text("Petitions Overview", 40);
  
  doc.moveDown(0.3);
  
  doc.fillColor("#6B7280")
     .fontSize(11)
     .font("Helvetica")
     .text(`Total Petitions: ${data.totalPetitions}`, 40);
  
  doc.moveDown(1);

  // Petition Table
  const petitionHeaders = ["Title", "Location", "Created By", "Date", "Status", "Signatures"];
  const petitionWidths = [155, 70, 90, 70, 75, 55];
  const petitionRows = data.petitionTable.map(p => [
    p.title,
    p.location,
    p.createdBy,
    p.createdAt,
    p.status,
    p.signatures
  ]);

  let currentY = doc.y;
  currentY = drawTable(doc, petitionHeaders, petitionRows, petitionWidths, currentY);

  doc.moveDown(2);

  // =========================
  // STATUS CHART
  // =========================
  if (currentY > 550) {
    doc.addPage();
    currentY = 60;
  }

  doc.fillColor("#2563EB")
     .fontSize(14)
     .font("Helvetica-Bold")
     .text("Petition Status Distribution", 40, currentY);

  currentY = doc.y + 20;

  const barChart = await generateBarChart(data.statusCount);
  doc.image(barChart, 75, currentY, { fit: [450, 250] });

  doc.addPage();

  // =========================
  // POLLS SECTION
  // =========================
  doc.fillColor("#2563EB")
     .fontSize(18)
     .font("Helvetica-Bold")
     .text("Polls Overview", 40, 60);
  
  doc.moveDown(0.3);
  
  doc.fillColor("#6B7280")
     .fontSize(11)
     .font("Helvetica")
     .text(`Total Votes: ${data.totalVotes}`, 40);
  
  doc.moveDown(1);

  // Poll Table
  const pollHeaders = ["Title", "Location", "Created By", "Date", "Yes", "No", "Unknown", "Total"];
  const pollWidths = [150, 70, 90, 70, 40, 40, 55, 40];
  const pollRows = data.pollTable.map(p => [
    p.title,
    p.location,
    p.createdBy,
    p.createdAt,
    p.yes,
    p.no,
    p.unknown,
    p.total
  ]);

  currentY = doc.y;
  currentY = drawTable(doc, pollHeaders, pollRows, pollWidths, currentY);

  doc.moveDown(2);

  // =========================
  // VOTE DISTRIBUTION CHART
  // =========================
  if (currentY > 550) {
    doc.addPage();
    currentY = 60;
  }

  doc.fillColor("#2563EB")
     .fontSize(14)
     .font("Helvetica-Bold")
     .text("Vote Distribution", 40, currentY);

  currentY = doc.y + 20;

  const pieChart = await generatePieChart(data.voteDistribution);
  doc.image(pieChart, 75, currentY, { fit: [450, 300] });

  // =========================
  // FOOTER
  // =========================
  const range = doc.bufferedPageRange();

  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);

    doc.fontSize(8)
       .fillColor("#9CA3AF")
       .text(
         `Page ${i - range.start + 1} of ${range.count}`,
         40,
         doc.page.height - 50,
         { align: "center" }
       );
  }

  doc.end();
  return doc;
};

// =========================
// 🔹 CSV EXPORT (SIMPLE)
// =========================
const exportReportService = async (params) => {
  const data = await generateReportData(params);

  const escapeCSV = (value) => {
    const str = String(value || "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = [];

  // Header
  rows.push("===== CIVIX ANALYTICS REPORT =====");
  rows.push(`Generated: ${new Date().toLocaleDateString()}`);
  rows.push(`Total Petitions: ${data.totalPetitions} | Total Votes: ${data.totalVotes}`);
  rows.push("");

  // Petitions Section
  rows.push("===== PETITIONS =====");
  rows.push("");
  rows.push(
    ["Title", "Location", "Created By", "Date", "Status", "Signatures"]
      .map(escapeCSV)
      .join(",")
  );

  data.petitionTable.forEach(p => {
    rows.push(
      [p.title, p.location, p.createdBy, p.createdAt, p.status, p.signatures]
        .map(escapeCSV)
        .join(",")
    );
  });

  rows.push("");
  rows.push("");

  // Polls Section
  rows.push("===== POLLS =====");
  rows.push("");
  rows.push(
    ["Title", "Location", "Created By", "Date", "Yes", "No", "Unknown", "Total"]
      .map(escapeCSV)
      .join(",")
  );

  data.pollTable.forEach(p => {
    rows.push(
      [
        p.title,
        p.location,
        p.createdBy,
        p.createdAt,
        p.yes,
        p.no,
        p.unknown,
        p.total
      ]
        .map(escapeCSV)
        .join(",")
    );
  });

  rows.push("");
  rows.push("");

  // Summary Section
  rows.push("===== VOTE DISTRIBUTION =====");
  rows.push("");
  rows.push(["Choice", "Count", "Percentage"].map(escapeCSV).join(","));
  
  Object.keys(data.voteDistribution).forEach(key => {
    rows.push(
      [key, data.voteDistribution[key], `${data.votePercentages[key]}%`]
        .map(escapeCSV)
        .join(",")
    );
  });

  return rows.join("\n");
};

// =========================
// 🔹 PETITION STATUS REPORT
// =========================
const getPetitionStatusReportService = async () => {
  const data = await Petition.aggregate([
    {
      $project: {
        normalizedStatus: {
          $replaceAll: {
            input: "$status",
            find: " ",
            replacement: "_"
          }
        }
      }
    },
    {
      $group: {
        _id: "$normalizedStatus",
        count: { $sum: 1 }
      }
    }
  ]);

  const formatted = {
    active: 0,
    under_review: 0,
    closed: 0
  };

  data.forEach(item => {
    formatted[item._id] = item.count;
  });

  return formatted;
};

// =========================
// 🔹 LOCALITY REPORT
// =========================
const getLocalityReportService = async (locationFilter) => {
  const matchStage = locationFilter
    ? { $match: { location: locationFilter } }
    : null;

  const pipeline = [
    ...(matchStage ? [matchStage] : []),
    {
      $project: {
        location: 1,
        normalizedStatus: {
          $replaceAll: {
            input: "$status",
            find: " ",
            replacement: "_"
          }
        }
      }
    },
    {
      $group: {
        _id: {
          location: "$location",
          status: "$normalizedStatus"
        },
        count: { $sum: 1 }
      }
    }
  ];

  const data = await Petition.aggregate(pipeline);

  const formatted = {};

  data.forEach(item => {
    const { location, status } = item._id;

    if (!formatted[location]) {
      formatted[location] = {
        active: 0,
        under_review: 0,
        closed: 0
      };
    }

    formatted[location][status] = item.count;
  });

  return formatted;
};

module.exports = {
  exportReportService,
  exportReportPDFService,
  getPetitionStatusReportService,
  getLocalityReportService
};