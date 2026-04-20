const Petition = require("../models/Petition");

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
const convertToCSV = (data) => {
  const rows = [];

  // Header
  rows.push(["Location", "Active", "Under Review", "Closed"]);

  for (const location in data) {
    rows.push([
      location,
      data[location].active || 0,
      data[location].under_review || 0,
      data[location].closed || 0
    ]);
  }

  return rows.map(row => row.join(",")).join("\n");
};


const exportReportService = async (type, location) => {
  let data = {};

  if (type === "locality") {
    data = await getLocalityReportService(location);
  } else if (type === "status") {
    data = await getPetitionStatusReportService();
    
    // Convert to locality-like format for CSV
    data = {
      "All": data
    };
  } else {
    throw new Error("Invalid report type");
  }

  const csv = convertToCSV(data);

  return csv;
};

module.exports = {
  getPetitionStatusReportService, 
  getLocalityReportService,
  exportReportService
};