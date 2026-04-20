const isOfficial = (req, res, next) => {
  if (!req.user || req.user.role !== "official") {
    return res.status(403).json({
      message: "Access denied. Officials only.",
    });
  }
  next();
};

module.exports = { isOfficial };
