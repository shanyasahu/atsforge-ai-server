const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const { apiLimiter, authLimiter } = require("./middlewares/rateLimit.middleware");
const sanitizeRequest = require("./middlewares/sanitize.middleware");

const app = express();

app.set("trust proxy", 1);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sanitizeRequest);
app.use(apiLimiter);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://atsforge-ai.vercel.app",
    ],
    credentials: true,
  }),
);

const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");
const resumeRouter = require("./routes/resume.routes");
const skillGapRouter = require("./routes/skillGap.routes");
const coverLetterRouter = require("./routes/coverLetter.routes");
const applicationRouter = require("./routes/application.routes");
const resumeBuilderRouter = require("./routes/resumeBuilder.routes");
const mockRouter = require("./routes/mockInterview.routes");
const dashboardRouter = require("./routes/dashboard.routes");

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ ok: true, service: "atsforge-ai-server" });
});

app.use("/api/v1/auth", authLimiter, authRouter);
app.use("/api/v1/interview", interviewRouter);
app.use("/api/v1/resume", resumeRouter);
app.use("/api/v1/skill-gap", skillGapRouter);
app.use("/api/v1/cover-letter", coverLetterRouter);
app.use("/api/v1/applications", applicationRouter);
app.use("/api/v1/resume-builder", resumeBuilderRouter);
app.use("/api/v1/mock-interview", mockRouter);
app.use("/api/v1/dashboard", dashboardRouter);

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File too large. Max 2MB for avatars, 3MB for PDFs." });
  }
  if (err?.message?.includes("images are allowed")) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: "Internal Server Error" });
});

module.exports = app;
