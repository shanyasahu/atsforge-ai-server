const getUserId = require("../utils/getUserId");
const interviewReportModel = require("../models/interviewReport");
const ResumeAnalysis = require("../models/resumeAnalysis.model");
const SkillGapReport = require("../models/skillGap.model");
const CoverLetter = require("../models/coverLetter.model");
const Application = require("../models/application.model");
const MockInterview = require("../models/mockInterview.model");
const SavedResume = require("../models/savedResume.model");

async function getDashboardStatsController(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized user." });

    const [
      interviewCount,
      analysisCount,
      skillGapCount,
      coverLetterCount,
      applicationCount,
      mockCount,
      resumeCount,
      recentInterviews,
      applicationsByStatus,
      latestAnalyses,
    ] = await Promise.all([
      interviewReportModel.countDocuments({ user: userId }),
      ResumeAnalysis.countDocuments({ user: userId }),
      SkillGapReport.countDocuments({ user: userId }),
      CoverLetter.countDocuments({ user: userId }),
      Application.countDocuments({ user: userId }),
      MockInterview.countDocuments({ user: userId }),
      SavedResume.countDocuments({ user: userId }),
      interviewReportModel
        .find({ user: userId })
        .select("matchScore jobTitle company createdAt")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Application.aggregate([
        { $match: { user: userId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      ResumeAnalysis.find({ user: userId })
        .select("atsScore keywordMatchScore createdAt summary")
        .sort({ createdAt: -1 })
        .limit(3)
        .lean(),
    ]);

    const avgMatch =
      recentInterviews.length > 0
        ? Math.round(
            recentInterviews.reduce((s, r) => s + (r.matchScore || 0), 0) /
              recentInterviews.length,
          )
        : 0;

    res.status(200).json({
      stats: {
        interviewCount,
        analysisCount,
        skillGapCount,
        coverLetterCount,
        applicationCount,
        mockCount,
        resumeCount,
        avgMatchScore: avgMatch,
      },
      recentInterviews,
      applicationsByStatus,
      latestAnalyses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load dashboard." });
  }
}

module.exports = { getDashboardStatsController };
