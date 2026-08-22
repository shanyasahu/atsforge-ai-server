const { Router } = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { aiLimiter } = require("../middlewares/rateLimit.middleware");
const {
  listResumesController,
  saveResumeController,
  generateResumeAiController,
  deleteResumeController,
} = require("../controller/resumeBuilder.controller");

const resumeBuilderRouter = Router();

resumeBuilderRouter.get("/", authMiddleware.authUser, listResumesController);
resumeBuilderRouter.post("/", authMiddleware.authUser, saveResumeController);
resumeBuilderRouter.post(
  "/generate",
  authMiddleware.authUser,
  aiLimiter,
  generateResumeAiController,
);
resumeBuilderRouter.delete(
  "/:id",
  authMiddleware.authUser,
  deleteResumeController,
);

module.exports = resumeBuilderRouter;
