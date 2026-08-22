const QUESTION_TYPES = new Set([
  "technical",
  "behavioral",
  "system-design",
  "hr",
]);

function normalizeQuestionType(value) {
  const normalized = String(value || "technical")
    .toLowerCase()
    .trim()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-");

  if (QUESTION_TYPES.has(normalized)) return normalized;
  if (normalized.includes("system")) return "system-design";
  if (normalized.includes("behavior")) return "behavioral";
  if (normalized.includes("hr") || normalized.includes("human")) return "hr";
  return "technical";
}

function normalizeMockQuestions(questions = []) {
  let list = questions;

  // Legacy Mongoose bug: whole array stored as one string element
  if (
    Array.isArray(list) &&
    list.length === 1 &&
    typeof list[0] === "string" &&
    list[0].trim().startsWith("[")
  ) {
    try {
      const parsed = JSON.parse(list[0]);
      if (Array.isArray(parsed)) list = parsed;
    } catch {
      /* keep original */
    }
  }

  if (!Array.isArray(list)) return [];

  return list
    .map((q, index) => {
      if (typeof q === "string") {
        const raw = q.trim();
        if (!raw) return null;

        try {
          q = JSON.parse(raw);
        } catch {
          return {
            id: index + 1,
            questionType: "technical",
            question: raw,
            tips: "",
          };
        }

        if (typeof q === "string") {
          return {
            id: index + 1,
            questionType: "technical",
            question: q.trim(),
            tips: "",
          };
        }
      }
      if (!q || typeof q !== "object") return null;

      const question = String(q.question || "").trim();
      if (!question) return null;

      return {
        id: Number(q.id) || index + 1,
        questionType: normalizeQuestionType(q.type || q.questionType),
        question,
        tips: String(q.tips || "").trim(),
      };
    })
    .filter(Boolean);
}

function isEmptyFeedback(feedback) {
  if (!feedback || typeof feedback !== "object") return true;
  return (
    feedback.overallScore == null &&
    !feedback.summary &&
    !(feedback.answers || []).length &&
    !(feedback.strengths || []).length &&
    !(feedback.improvements || []).length
  );
}

function withNormalizedQuestions(session) {
  if (!session) return session;
  const doc = typeof session.toObject === "function" ? session.toObject() : { ...session };
  doc.questions = normalizeMockQuestions(doc.questions);
  if (isEmptyFeedback(doc.feedback)) delete doc.feedback;
  return doc;
}

module.exports = {
  normalizeQuestionType,
  normalizeMockQuestions,
  withNormalizedQuestions,
};
