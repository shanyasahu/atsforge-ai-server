const getUserId = require("../utils/getUserId");
const parsePdfBuffer = require("../utils/parsePdf");
const { generateResumeAnalysis } = require("../services/ai.service");
const ResumeAnalysis = require("../models/resumeAnalysis.model");

async function analyzeResumeController(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized user." });
    if (!req.file?.buffer) {
      return res.status(400).json({ message: "Resume PDF is required." });
    }

    const jobDescription = (req.body.jobDescription || "").trim();
    const resumeText = await parsePdfBuffer(req.file.buffer);
    const aiResult = await generateResumeAnalysis({
      resume: resumeText,
      jobDescription,
    });

    const analysis = await ResumeAnalysis.create({
      user: userId,
      resumeText,
      jobDescription,
      ...aiResult,
    });

    res.status(201).json({
      message: "Resume analyzed successfully.",
      analysis,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to analyze resume.",
      error: error.message,
    });
  }
}

async function getResumeAnalysisHistoryController(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized user." });

    const analyses = await ResumeAnalysis.find({ user: userId })
      .select("-resumeText")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ count: analyses.length, analyses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getResumeAnalysisByIdController(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized user." });

    const analysis = await ResumeAnalysis.findOne({
      _id: req.params.id,
      user: userId,
    })
      .select("-resumeText")
      .lean();

    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found." });
    }

    res.status(200).json({ analysis });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function deleteResumeAnalysisController(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized user." });

    const deleted = await ResumeAnalysis.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Analysis not found." });
    }

    res.status(200).json({ message: "Analysis deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete analysis." });
  }
}

module.exports = {
  analyzeResumeController,
  getResumeAnalysisHistoryController,
  getResumeAnalysisByIdController,
  deleteResumeAnalysisController,
};
