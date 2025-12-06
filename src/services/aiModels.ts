// services/aiModels
import { GoogleGenerativeAI } from "@google/generative-ai";
import { mcpToolDeclarations } from "../config/mcpTools";

// === HELPER: get first non-empty key from comma-separated env ===
function getFirstKey(envVar?: string): string {
  if (!envVar) {
    throw new Error("Missing Gemini API key environment variable");
  }

  const keys = envVar
    .split(",")
    .map(k => k.trim())
    .filter(Boolean);

  if (keys.length === 0) {
    throw new Error("Gemini API key env is defined but no valid keys found");
  }

  return keys[0]; // use first key by default
}

// ========== HEAVY MODEL (for charts with MCP tools) ==========
const heavyApiKey = getFirstKey(process.env.GEMINI_API_KEY);
const genAI_heavy = new GoogleGenerativeAI(heavyApiKey);

export const modelHeavy = genAI_heavy.getGenerativeModel({
  model: "gemini-2.5-flash",
  tools: [{ functionDeclarations: mcpToolDeclarations }],
});

// ========== LIGHT MODEL (for normal chat) ==========
const lightApiKey = getFirstKey(process.env.GEMINI_API_LIGHT_KEY);
const genAI_light = new GoogleGenerativeAI(lightApiKey);

export const modelLight = genAI_light.getGenerativeModel({
  model: "gemini-2.0-flash-lite-preview",
});
