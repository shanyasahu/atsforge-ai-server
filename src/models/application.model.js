const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    company: { type: String, required: true },
    role: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "wishlist",
        "applied",
        "screening",
        "interview",
        "offer",
        "rejected",
        "accepted",
      ],
      default: "wishlist",
    },
    jobUrl: String,
    location: String,
    salaryRange: String,
    jobDescription: String,
    appliedAt: Date,
    notes: String,
    nextFollowUp: Date,
  },
  { timestamps: true },
);

applicationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Application", applicationSchema);
