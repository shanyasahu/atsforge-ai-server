const mongoose = require("mongoose");

const coverLetterSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    company: String,
    role: String,
    tone: String,
    jobDescription: String,
    resumeText: String,
    subject: String,
    coverLetter: String,
    highlights: [String],
  },
  { timestamps: true },
);

module.exports = mongoose.model("CoverLetter", coverLetterSchema);
