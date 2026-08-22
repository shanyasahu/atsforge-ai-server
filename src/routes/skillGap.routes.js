const { Router } = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/file.middleware");
const { aiLimiter } = require("../middlewares/rateLimit.middleware");
const {
  detectSkillGapController,
  getSkillGapHistoryController,
  deleteSkillGapController,
} = require("../controller/skillGap.controller");

const skillGapRouter = Router();

skillGapRouter.post(
  "/",
  authMiddleware.authUser,
  aiLimiter,
  upload.single("resume"),
  detectSkillGapController,
);

skillGapRouter.get(
  "/history",
  authMiddleware.authUser,
  getSkillGapHistoryController,
);

skillGapRouter.delete(
  "/history/:id",
  authMiddleware.authUser,
  deleteSkillGapController,
);

module.exports = skillGapRouter;
