const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

async function invokeGeminiAi() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello Gemini! How to prepare for interview?",
    });

    console.log(response.text);
  } catch (error) {
    console.error("Gemini Error:", error.message);
  }
}

module.exports = invokeGeminiAi;
