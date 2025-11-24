import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

// GLOBAL API KEY ROTATION
let apiKeyIndex = 0;
const apiKeys = process.env.GEMINI_API_KEY!.split(",").map(k => k.trim());

let currentApi = apiKeys[apiKeyIndex];

// current model
let genAI = new GoogleGenerativeAI(currentApi);
let model: GenerativeModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});

// ========== PUBLIC HELPERS ==========
export const getModel = () => model;
export const getApiKeyCount = () => apiKeys.length;

// ========== SWITCH API KEY ==========
export const switchApi = () => {
  apiKeyIndex = (apiKeyIndex + 1) % apiKeys.length;
  currentApi = apiKeys[apiKeyIndex];

  genAI = new GoogleGenerativeAI(currentApi);
  model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  console.log("Switched to API key:", currentApi);
};

// ========== SIMPLE JSON LLM CALL ==========
export async function runAi(prompt: string) {
  let attempts = 0;

  while (attempts < apiKeys.length) {
    try {
      console.log(`Using Gemini Key #${apiKeyIndex + 1}`);

      const res = await model.generateContent(prompt);

      let raw = res.response.text().replace(/```json|```/g, "").trim();
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start === -1 || end === -1) throw new Error("Invalid JSON");

      return JSON.parse(raw.substring(start, end + 1));
    } catch (err: any) {
      const msg = String(err?.message || "");

      console.log("Gemini Error:", msg);

      // AI LIMIT HIT → ROTATE KEY
      if (
        msg.includes("quota") ||
        msg.includes("429") ||
        msg.includes("exceeded") ||
        err.status === 503
      ) {
        console.log("AI limit hit → switching key...");
        switchApi();
        attempts++;
        continue;
      }

      // OTHER ERRORS → STOP
      console.log("Non-limit AI failure. Stopping AI.");
      return null;
    }
  }

  console.log("All AI keys failed");
  return null;
}
