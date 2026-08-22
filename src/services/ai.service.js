const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview";

async function generateJson(prompt, schema) {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(schema),
    },
  });
  return JSON.parse(response.text);
}

const interviewReportSchema = z.object({
  jobTitle: z.string().describe("Inferred job title from the job description"),
  company: z
    .string()
    .describe("Company name if present, otherwise Unknown"),
  matchScore: z.number().describe("Score 0-100 for profile-job match"),
  technicalQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    }),
  ),
  behavioralQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    }),
  ),
  skillGaps: z.array(
    z.object({
      skill: z.string(),
      severity: z.enum(["low", "medium", "high"]),
    }),
  ),
  preparationPlan: z.array(
    z.object({
      day: z.number(),
      focus: z.string(),
      tasks: z.array(z.string()),
    }),
  ),
});

const resumeAnalysisSchema = z.object({
  atsScore: z.number().describe("ATS compatibility score 0-100"),
  keywordMatchScore: z.number().describe("Keyword overlap score 0-100"),
  matchedKeywords: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  formattingIssues: z.array(z.string()),
  sectionFeedback: z.array(
    z.object({
      section: z.string(),
      status: z.enum(["strong", "average", "weak", "missing"]),
      feedback: z.string(),
    }),
  ),
  improvementTips: z.array(z.string()),
  summary: z.string(),
});

const skillGapSchema = z.object({
  overallFit: z.number().describe("Overall fit score 0-100"),
  presentSkills: z.array(z.string()),
  missingSkills: z.array(
    z.object({
      skill: z.string(),
      severity: z.enum(["low", "medium", "high"]),
      whyItMatters: z.string(),
      learnInDays: z.number(),
    }),
  ),
  learningPlan: z.array(
    z.object({
      week: z.number(),
      focus: z.string(),
      resources: z.array(z.string()),
      tasks: z.array(z.string()),
    }),
  ),
  summary: z.string(),
});

const coverLetterSchema = z.object({
  subject: z.string(),
  coverLetter: z.string().describe("Full professional cover letter body"),
  highlights: z.array(z.string()),
  tone: z.string(),
});

const mockInterviewSchema = z.object({
  role: z.string(),
  questions: z.array(
    z.object({
      id: z.coerce.number(),
      type: z.string(),
      question: z.string(),
      tips: z.string(),
    }),
  ),
});

const mockFeedbackSchema = z.object({
  overallScore: z.number(),
  answers: z.array(
    z.object({
      questionId: z.number(),
      score: z.number(),
      feedback: z.string(),
      improvedAnswer: z.string(),
    }),
  ),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  summary: z.string(),
});

const resumeBulletsSchema = z.object({
  professionalSummary: z.string(),
  experienceBullets: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      bullets: z.array(z.string()),
    }),
  ),
  skills: z.array(z.string()),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      bullets: z.array(z.string()),
    }),
  ),
});

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  return generateJson(
    `Generate an interview report for a candidate.
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}`,
    interviewReportSchema,
  );
}

async function generateResumeAnalysis({ resume, jobDescription }) {
  return generateJson(
    `Analyze this resume for ATS compatibility against the job description.
Resume: ${resume}
Job Description: ${jobDescription || "General software role"}`,
    resumeAnalysisSchema,
  );
}

async function generateSkillGapReport({ resume, jobDescription, selfDescription }) {
  return generateJson(
    `Detect skill gaps between candidate and job.
Resume: ${resume}
Self Description: ${selfDescription || "N/A"}
Job Description: ${jobDescription}`,
    skillGapSchema,
  );
}

async function generateCoverLetter({
  resume,
  jobDescription,
  company,
  role,
  tone,
}) {
  return generateJson(
    `Write a professional cover letter.
Resume: ${resume}
Job Description: ${jobDescription}
Company: ${company || "the company"}
Role: ${role || "the role"}
Tone: ${tone || "professional and confident"}`,
    coverLetterSchema,
  );
}

async function generateMockInterview({ resume, jobDescription, role, count }) {
  return generateJson(
    `Create a mock interview with ${count || 6} questions.
Resume: ${resume || "N/A"}
Job Description: ${jobDescription || "N/A"}
Target role: ${role || "Software Engineer"}`,
    mockInterviewSchema,
  );
}

async function generateMockFeedback({ questions, answers, role }) {
  return generateJson(
    `Score these mock interview answers for role: ${role || "Software Engineer"}.
Questions: ${JSON.stringify(questions)}
Candidate answers: ${JSON.stringify(answers)}`,
    mockFeedbackSchema,
  );
}

async function generateResumeContent({
  fullName,
  targetRole,
  experience,
  skills,
  projects,
  jobDescription,
}) {
  return generateJson(
    `Create ATS-friendly resume content using STAR method.
Name: ${fullName}
Target role: ${targetRole}
Experience notes: ${experience}
Skills: ${skills}
Projects: ${projects}
Job description to tailor for: ${jobDescription || "N/A"}`,
    resumeBulletsSchema,
  );
}

module.exports = {
  generateInterviewReport,
  generateResumeAnalysis,
  generateSkillGapReport,
  generateCoverLetter,
  generateMockInterview,
  generateMockFeedback,
  generateResumeContent,
};
