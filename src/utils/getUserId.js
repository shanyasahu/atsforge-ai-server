const mongoose = require("mongoose");

function getUserId(req) {
  const raw = req.user?.id || req.user?._id;
  if (!raw || !mongoose.Types.ObjectId.isValid(raw)) return null;
  return new mongoose.Types.ObjectId(raw);
}

module.exports = getUserId;
