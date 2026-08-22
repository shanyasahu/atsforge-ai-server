const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/file.middleware");
const { aiLimiter } = require("../middlewares/rateLimit.middleware");
const interviewController = require("../controller/interview.controller.js");

const interviewRouter = express.Router();

interviewRouter.post(
  "/",
  authMiddleware.authUser,
  aiLimiter,
  upload.single("resume"),
  interviewController.generateInterviewReportController,
);

interviewRouter.get(
  "/history",
  authMiddleware.authUser,
  interviewController.getInterviewHistoryController,
);

interviewRouter.get(
  "/history/:id",
  authMiddleware.authUser,
  interviewController.getInterviewReportByIdController,
);

interviewRouter.delete(
  "/history/:id",
  authMiddleware.authUser,
  interviewController.deleteInterviewReportController,
);

module.exports = interviewRouter;
