const { Router } = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/file.middleware");
const { aiLimiter } = require("../middlewares/rateLimit.middleware");
const {
  startMockInterviewController,
  submitMockAnswersController,
  getMockHistoryController,
  deleteMockInterviewController,
} = require("../controller/mockInterview.controller");

const mockRouter = Router();

mockRouter.post(
  "/start",
  authMiddleware.authUser,
  aiLimiter,
  upload.single("resume"),
  startMockInterviewController,
);

mockRouter.get("/history", authMiddleware.authUser, getMockHistoryController);

mockRouter.delete(
  "/history/:id",
  authMiddleware.authUser,
  deleteMockInterviewController,
);

mockRouter.post(
  "/:id/submit",
  authMiddleware.authUser,
  aiLimiter,
  submitMockAnswersController,
);

module.exports = mockRouter;
