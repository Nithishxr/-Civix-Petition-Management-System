const Petition = require("../models/Petition");
const Response = require("../models/Response");

// ===============================
// RESPOND TO PETITION (for /api/petitions/:id/respond)
// ===============================
exports.respondToPetition = async (req, res) => {
  try {
    if (req.user.role !== "official") {
      return res.status(403).json({
        message: "Only officials can respond",
      });
    }

    const { comment } = req.body;

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({
        message: "Comment is required",
      });
    }

    const petition = await Petition.findById(req.params.id);

    if (!petition) {
      return res.status(404).json({
        message: "Petition not found",
      });
    }

    const existing = await Response.findOne({
      petitionId: req.params.id,
      officialId: req.user._id,
    });

    if (existing) {
      return res.status(400).json({
        message: "You already responded",
      });
    }

    const response = await Response.create({
      petitionId: req.params.id,
      officialId: req.user._id,
      comment: comment.trim(),
    });

    petition.responses.push(response._id);

    // Optional status update
    if (petition.status === "pending") {
      petition.status = "active";
    }

    await petition.save();

    res.status(201).json({
      message: "Response submitted successfully",
      data: response,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error responding to petition",
      error: error.message,
    });
  }
};

// ===============================
// ADD RESPONSE (for /api/responses/:petitionId)
// ===============================
exports.addResponse = async (req, res) => {
  try {
    if (req.user.role !== "official") {
      return res.status(403).json({
        message: "Only officials can respond",
      });
    }

    const { comment } = req.body;

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({
        message: "Comment is required",
      });
    }

    const petition = await Petition.findById(req.params.petitionId);

    if (!petition) {
      return res.status(404).json({
        message: "Petition not found",
      });
    }

    const existing = await Response.findOne({
      petitionId: req.params.petitionId,
      officialId: req.user._id,
    });

    if (existing) {
      return res.status(400).json({
        message: "You already responded",
      });
    }

    const response = await Response.create({
      petitionId: req.params.petitionId,
      officialId: req.user._id,
      comment: comment.trim(),
    });

    petition.responses.push(response._id);

    if (petition.status === "pending") {
      petition.status = "active";
    }

    await petition.save();

    res.status(201).json({
      message: "Response added successfully",
      response,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error adding response",
      error: error.message,
    });
  }
};

// ===============================
// GET RESPONSES BY PETITION
// ===============================
exports.getResponsesByPetition = async (req, res) => {
  try {
    const responses = await Response.find({
      petitionId: req.params.petitionId,
    })
      .populate("officialId", "name email role")
      .sort({ createdAt: -1 });

    res.json({
      count: responses.length,
      responses,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching responses",
      error: error.message,
    });
  }
};