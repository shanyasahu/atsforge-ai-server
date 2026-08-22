const getUserId = require("../utils/getUserId");
const parsePdfBuffer = require("../utils/parsePdf");
const { generateSkillGapReport } = require("../services/ai.service");
const SkillGapReport = require("../models/skillGap.model");

async function detectSkillGapController(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized user." });
    if (!req.file?.buffer) {
      return res.status(400).json({ message: "Resume PDF is required." });
    }

    const jobDescription = (req.body.jobDescription || "").trim();
    const selfDescription = (req.body.selfDescription || "").trim();
    if (!jobDescription) {
      return res.status(400).json({ message: "Job description is required." });
    }

    const resumeText = await parsePdfBuffer(req.file.buffer);
    const aiResult = await generateSkillGapReport({
      resume: resumeText,
      jobDescription,
      selfDescription,
    });

    const report = await SkillGapReport.create({
      user: userId,
      resumeText,
      jobDescription,
      selfDescription,
      ...aiResult,
    });

    res.status(201).json({
      message: "Skill gap report generated.",
      report,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to detect skill gaps.",
      error: error.message,
    });
  }
}

async function getSkillGapHistoryController(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized user." });

    const reports = await SkillGapReport.find({ user: userId })
      .select("-resumeText")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ count: reports.length, reports });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function deleteSkillGapController(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized user." });

    const deleted = await SkillGapReport.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Skill gap report not found." });
    }

    res.status(200).json({ message: "Skill gap report deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete skill gap report." });
  }
}

module.exports = {
  detectSkillGapController,
  getSkillGapHistoryController,
  deleteSkillGapController,
};
