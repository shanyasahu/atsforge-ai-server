const getUserId = require("../utils/getUserId");
const parsePdfBuffer = require("../utils/parsePdf");
const {
  normalizeMockQuestions,
  withNormalizedQuestions,
} = require("../utils/normalizeMockQuestions");
const {
  generateMockInterview,
  generateMockFeedback,
} = require("../services/ai.service");
const MockInterview = require("../models/mockInterview.model");

async function startMockInterviewController(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized user." });

    const role = (req.body.role || "Software Engineer").trim();
    const jobDescription = (req.body.jobDescription || "").trim();
    let resumeText = "";

    if (req.file?.buffer) {
      try {
        resumeText = await parsePdfBuffer(req.file.buffer);
      } catch (parseError) {
        console.warn("Mock interview resume parse failed:", parseError.message);
        return res.status(400).json({
          message:
            "Could not read the uploaded PDF. Try a text-based PDF or start without a resume.",
        });
      }
    }

    const aiResult = await generateMockInterview({
      resume: resumeText,
      jobDescription,
      role,
      count: Number(req.body.count) || 6,
    });

    const questions = normalizeMockQuestions(aiResult.questions);
    if (questions.length === 0) {
      return res.status(500).json({
        message: "AI did not return interview questions. Please try again.",
      });
    }

    const session = await MockInterview.create({
      user: userId,
      role: aiResult.role || role,
      jobDescription,
      questions,
      status: "active",
    });

    res.status(201).json({
      message: "Mock interview started.",
      session: withNormalizedQuestions(session),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to start mock interview.",
      error: error.message,
    });
  }
}

async function submitMockAnswersController(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized user." });

    const session = await MockInterview.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!session) {
      return res.status(404).json({ message: "Mock session not found." });
    }

    const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
    const feedback = await generateMockFeedback({
      questions: session.questions,
      answers,
      role: session.role,
    });

    session.answers = answers;
    session.feedback = feedback;
    session.status = "completed";
    await session.save();

    res.status(200).json({
      message: "Mock interview evaluated.",
      session: withNormalizedQuestions(session),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to evaluate mock interview.",
      error: error.message,
    });
  }
}

async function getMockHistoryController(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized user." });

    const sessions = await MockInterview.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      count: sessions.length,
      sessions: sessions.map(withNormalizedQuestions),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function deleteMockInterviewController(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized user." });

    const deleted = await MockInterview.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Mock session not found." });
    }

    res.status(200).json({ message: "Mock session deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete mock session." });
  }
}

module.exports = {
  startMockInterviewController,
  submitMockAnswersController,
  getMockHistoryController,
  deleteMockInterviewController,
};
