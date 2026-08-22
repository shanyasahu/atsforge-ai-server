const mongoose = require("mongoose");

const resumeAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    resumeText: String,
    jobDescription: String,
    atsScore: Number,
    keywordMatchScore: Number,
    matchedKeywords: [String],
    missingKeywords: [String],
    formattingIssues: [String],
    sectionFeedback: [
      {
        section: String,
        status: {
          type: String,
          enum: ["strong", "average", "weak", "missing"],
        },
        feedback: String,
      },
    ],
    improvementTips: [String],
    summary: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("ResumeAnalysis", resumeAnalysisSchema);
