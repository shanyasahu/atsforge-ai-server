const getUserId = require("../utils/getUserId");
const parsePdfBuffer = require("../utils/parsePdf");
const { generateCoverLetter } = require("../services/ai.service");
const CoverLetter = require("../models/coverLetter.model");

async function createCoverLetterController(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized user." });
    if (!req.file?.buffer) {
      return res.status(400).json({ message: "Resume PDF is required." });
    }

    const {
      jobDescription = "",
      company = "",
      role = "",
      tone = "professional",
    } = req.body;

    if (!jobDescription.trim()) {
      return res.status(400).json({ message: "Job description is required." });
    }

    const resumeText = await parsePdfBuffer(req.file.buffer);
    const aiResult = await generateCoverLetter({
      resume: resumeText,
      jobDescription,
      company,
      role,
      tone,
    });

    const letter = await CoverLetter.create({
      user: userId,
      company,
      role,
      tone,
      jobDescription,
      resumeText,
      ...aiResult,
    });

    res.status(201).json({
      message: "Cover letter generated.",
      letter,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to generate cover letter.",
      error: error.message,
    });
  }
}

async function getCoverLetterHistoryController(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized user." });

    const letters = await CoverLetter.find({ user: userId })
      .select("-resumeText")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ count: letters.length, letters });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function deleteCoverLetterController(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized user." });

    const deleted = await CoverLetter.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Cover letter not found." });
    }

    res.status(200).json({ message: "Cover letter deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete cover letter." });
  }
}

module.exports = {
  createCoverLetterController,
  getCoverLetterHistoryController,
  deleteCoverLetterController,
};
