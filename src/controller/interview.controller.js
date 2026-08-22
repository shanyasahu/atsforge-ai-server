const getUserId = require("../utils/getUserId");
const parsePdfBuffer = require("../utils/parsePdf");
const { generateInterviewReport } = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport");

async function generateInterviewReportController(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized user." });
    }

    if (!req.file?.buffer) {
      return res.status(400).json({ message: "Resume PDF is required." });
    }

    const { selfDescription, jobDescription } = req.body;

    if (!selfDescription?.trim() || !jobDescription?.trim()) {
      return res.status(400).json({
        message: "Self description and job description are required.",
      });
    }

    const resumeText = await parsePdfBuffer(req.file.buffer);
    const aiReport = await generateInterviewReport({
      resume: resumeText,
      selfDescription,
      jobDescription,
    });

    const interviewReport = await interviewReportModel.create({
      resume: resumeText,
      selfDescription: selfDescription.trim(),
      jobDescription: jobDescription.trim(),
      ...aiReport,
      user: userId,
    });

    res.status(201).json({
      message: "Interview report generated and saved to history.",
      savedToHistory: true,
      interviewReport,
    });
  } catch (error) {
    console.error("generateInterviewReportController:", error);
    res.status(500).json({
      message: "Failed to generate or save interview report.",
      error: error.message,
    });
  }
}

async function getInterviewHistoryController(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized user." });
    }

    const reports = await interviewReportModel
      .find({ user: userId })
      .select("-resume")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      message: "Interview history fetched successfully.",
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error("getInterviewHistoryController:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getInterviewReportByIdController(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized user." });
    }

    const report = await interviewReportModel
      .findOne({ _id: req.params.id, user: userId })
      .select("-resume")
      .lean();

    if (!report) {
      return res.status(404).json({ message: "Interview report not found." });
    }

    res.status(200).json({
      message: "Interview report fetched successfully.",
      interviewReport: report,
    });
  } catch (error) {
    console.error("getInterviewReportByIdController:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function deleteInterviewReportController(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized user." });
    }

    const deleted = await interviewReportModel.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Interview report not found." });
    }

    res.status(200).json({ message: "Interview report deleted." });
  } catch (error) {
    console.error("deleteInterviewReportController:", error);
    res.status(500).json({ message: "Failed to delete interview report." });
  }
}

module.exports = {
  generateInterviewReportController,
  getInterviewHistoryController,
  getInterviewReportByIdController,
  deleteInterviewReportController,
};
