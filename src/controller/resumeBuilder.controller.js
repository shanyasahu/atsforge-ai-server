const getUserId = require("../utils/getUserId");
const SavedResume = require("../models/savedResume.model");
const { generateResumeContent } = require("../services/ai.service");

async function listResumesController(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized user." });

    const resumes = await SavedResume.find({ user: userId })
      .sort({ updatedAt: -1 })
      .lean();

    res.status(200).json({ count: resumes.length, resumes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function saveResumeController(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized user." });

    const payload = { ...req.body, user: userId };
    delete payload._id;

    let resume;
    if (req.body._id) {
      resume = await SavedResume.findOneAndUpdate(
        { _id: req.body._id, user: userId },
        payload,
        { new: true },
      );
      if (!resume) {
        return res.status(404).json({ message: "Resume not found." });
      }
    } else {
      resume = await SavedResume.create(payload);
    }

    res.status(201).json({ message: "Resume saved.", resume });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save resume." });
  }
}

async function generateResumeAiController(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized user." });

    const aiResult = await generateResumeContent({
      fullName: req.body.fullName,
      targetRole: req.body.targetRole,
      experience: req.body.experience,
      skills: req.body.skills,
      projects: req.body.projects,
      jobDescription: req.body.jobDescription,
    });

    res.status(200).json({ message: "Resume content generated.", content: aiResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to generate resume content.",
      error: error.message,
    });
  }
}

async function deleteResumeController(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized user." });

    const deleted = await SavedResume.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Resume not found." });
    }

    res.status(200).json({ message: "Resume deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete resume." });
  }
}

module.exports = {
  listResumesController,
  saveResumeController,
  generateResumeAiController,
  deleteResumeController,
};
