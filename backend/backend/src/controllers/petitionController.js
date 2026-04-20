const Petition = require("../models/Petition");

// ===============================
// CREATE PETITION
// ===============================
exports.createPetition = async (req, res) => {
  try {
    const { title, description, location, category } = req.body;

    if (!title || !description || !location || !category) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const petition = await Petition.create({
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      category: category.trim(),
      status: "pending", // ✅ FIXED
      createdBy: req.user.id
    });

    res.status(201).json({
      message: "Petition created successfully",
      petition
    });

  } catch (error) {
    res.status(500).json({
      message: "Error creating petition",
      error: error.message
    });
  }
};

// ===============================
// GET ALL PETITIONS
// ===============================
exports.getAllPetitions = async (req, res) => {
  try {
    const filters = {};

    if (req.query.location) filters.location = req.query.location;
    if (req.query.category) filters.category = req.query.category;
    if (req.query.status) filters.status = req.query.status;

    const petitions = await Petition.find(filters)
      .populate("createdBy", "name email")
      .populate("signatures", "name")
      .populate({
        path: "responses",
        populate: {
          path: "officialId",
          select: "name email"
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      count: petitions.length,
      petitions
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching petitions",
      error: error.message
    });
  }
};

// ===============================
// GET PETITION BY ID
// ===============================
exports.getPetitionById = async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("signatures", "name")
      .populate({
        path: "responses",
        populate: {
          path: "officialId",
          select: "name email"
        }
      });

    if (!petition) {
      return res.status(404).json({
        message: "Petition not found"
      });
    }

    res.json(petition);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching petition",
      error: error.message
    });
  }
};

// ===============================
// UPDATE PETITION
// ===============================
exports.updatePetition = async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);

    if (!petition) {
      return res.status(404).json({
        message: "Petition not found"
      });
    }

    if (petition.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized"
      });
    }

    if (req.body.title) petition.title = req.body.title.trim();
    if (req.body.description) petition.description = req.body.description.trim();
    if (req.body.location) petition.location = req.body.location.trim();
    if (req.body.category) petition.category = req.body.category.trim();

    await petition.save();

    res.json({
      message: "Petition updated successfully",
      petition
    });

  } catch (error) {
    res.status(500).json({
      message: "Error updating petition",
      error: error.message
    });
  }
};

// ===============================
// UPDATE STATUS
// ===============================
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatus = ["pending", "active", "closed"]; // ✅ FIXED

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value"
      });
    }

    const petition = await Petition.findById(req.params.id);

    if (!petition) {
      return res.status(404).json({
        message: "Petition not found"
      });
    }

    petition.status = status;
    await petition.save();

    res.json({
      message: "Status updated successfully",
      petition
    });

  } catch (error) {
    res.status(500).json({
      message: "Error updating status",
      error: error.message
    });
  }
};

// ===============================
// SIGN PETITION
// ===============================
exports.signPetition = async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);

    if (!petition) {
      return res.status(404).json({
        message: "Petition not found"
      });
    }

    if (petition.signatures.includes(req.user.id)) {
      return res.status(400).json({
        message: "You already signed this petition"
      });
    }

    petition.signatures.push(req.user.id);
    await petition.save();

    res.json({
      message: "Petition signed successfully",
      totalSignatures: petition.signatures.length
    });

  } catch (error) {
    res.status(500).json({
      message: "Error signing petition",
      error: error.message
    });
  }
};

// ===============================
// DELETE PETITION
// ===============================
exports.deletePetition = async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);

    if (!petition) {
      return res.status(404).json({
        message: "Petition not found"
      });
    }

    if (petition.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized"
      });
    }

    await petition.deleteOne();

    res.json({
      message: "Petition deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Error deleting petition",
      error: error.message
    });
  }
};