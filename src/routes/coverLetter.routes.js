const { Router } = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/file.middleware");
const { aiLimiter } = require("../middlewares/rateLimit.middleware");
const {
  createCoverLetterController,
  getCoverLetterHistoryController,
  deleteCoverLetterController,
} = require("../controller/coverLetter.controller");

const coverLetterRouter = Router();

coverLetterRouter.post(
  "/",
  authMiddleware.authUser,
  aiLimiter,
  upload.single("resume"),
  createCoverLetterController,
);

coverLetterRouter.get(
  "/history",
  authMiddleware.authUser,
  getCoverLetterHistoryController,
);

coverLetterRouter.delete(
  "/history/:id",
  authMiddleware.authUser,
  deleteCoverLetterController,
);

module.exports = coverLetterRouter;
