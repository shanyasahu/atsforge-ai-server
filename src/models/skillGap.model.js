const mongoose = require("mongoose");

const skillGapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    resumeText: String,
    jobDescription: String,
    selfDescription: String,
    overallFit: Number,
    presentSkills: [String],
    missingSkills: [
      {
        skill: String,
        severity: { type: String, enum: ["low", "medium", "high"] },
        whyItMatters: String,
        learnInDays: Number,
      },
    ],
    learningPlan: [
      {
        week: Number,
        focus: String,
        resources: [String],
        tasks: [String],
      },
    ],
    summary: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("SkillGapReport", skillGapSchema);
