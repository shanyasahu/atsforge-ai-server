const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/file.middleware");

const interviewController = require("../controller/interview.controller.js");

/**
 * @route POST /api/v1/interview/
 * @description generate new interview repost on the basic of self desc, resume pdf and JD
 * @access private
 */

const interviewRouter = express.Router();

interviewRouter.post(
  "/",
  authMiddleware.authUser,
  upload.single("resume"),
  interviewController.generateInterviewReportController,
);

module.exports = interviewRouter;
