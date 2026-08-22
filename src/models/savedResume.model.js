const mongoose = require("mongoose");

const savedResumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    title: { type: String, default: "My Resume" },
    fullName: String,
    email: String,
    phone: String,
    location: String,
    linkedin: String,
    targetRole: String,
    professionalSummary: String,
    skills: [String],
    experience: [
      {
        company: String,
        role: String,
        startDate: String,
        endDate: String,
        bullets: [String],
      },
    ],
    projects: [
      {
        name: String,
        description: String,
        bullets: [String],
      },
    ],
    education: [
      {
        school: String,
        degree: String,
        year: String,
      },
    ],
    rawNotes: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("SavedResume", savedResumeSchema);
