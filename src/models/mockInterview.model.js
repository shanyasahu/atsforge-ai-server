const mongoose = require("mongoose");

const mockSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    role: String,
    jobDescription: String,
    questions: [
      {
        id: { type: Number },
        questionType: { type: String },
        question: { type: String },
        tips: { type: String },
      },
    ],
    answers: [
      {
        questionId: Number,
        answer: String,
      },
    ],
    feedback: {
      overallScore: Number,
      answers: [
        {
          questionId: Number,
          score: Number,
          feedback: String,
          improvedAnswer: String,
        },
      ],
      strengths: [String],
      improvements: [String],
      summary: String,
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("MockInterview", mockSessionSchema);
