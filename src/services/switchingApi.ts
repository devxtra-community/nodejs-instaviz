import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

let apiKeyIndex = 0;
const apiKeys = process.env.GEMINI_API_KEY!.split(",").map(k => k.trim());

let currentApi = apiKeys[apiKeyIndex];

// current model
let genAI = new GoogleGenerativeAI(currentApi);
let model: GenerativeModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});

export const getModel = () => model;
export const getApiKeyCount = () => apiKeys.length;

export const switchApi = () => {
  apiKeyIndex = (apiKeyIndex + 1) % apiKeys.length;
  currentApi = apiKeys[apiKeyIndex];

  genAI = new GoogleGenerativeAI(currentApi);
  model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  console.log("Switched to API key:", currentApi);
};

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

      console.log("Non-limit AI failure. Stopping AI.");
      return null;
    }
  }

  console.log("All AI keys failed");
  return null;
}
