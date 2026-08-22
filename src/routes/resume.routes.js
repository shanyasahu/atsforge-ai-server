const { Router } = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/file.middleware");
const { aiLimiter } = require("../middlewares/rateLimit.middleware");
const {
  analyzeResumeController,
  getResumeAnalysisHistoryController,
  getResumeAnalysisByIdController,
  deleteResumeAnalysisController,
} = require("../controller/resume.controller");

const resumeRouter = Router();

resumeRouter.post(
  "/analyze",
  authMiddleware.authUser,
  aiLimiter,
  upload.single("resume"),
  analyzeResumeController,
);

resumeRouter.get(
  "/history",
  authMiddleware.authUser,
  getResumeAnalysisHistoryController,
);

resumeRouter.get(
  "/history/:id",
  authMiddleware.authUser,
  getResumeAnalysisByIdController,
);

resumeRouter.delete(
  "/history/:id",
  authMiddleware.authUser,
  deleteResumeAnalysisController,
);

module.exports = resumeRouter;
