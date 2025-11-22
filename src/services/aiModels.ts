// services/aiModels.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import {mcpToolDeclarations} from "../config/mcpTools";

// Heavy model (expensive) – MCP enabled
const genAI_heavy = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const modelHeavy = genAI_heavy.getGenerativeModel({
  model: "gemini-2.5-flash",
  tools: [{ functionDeclarations: mcpToolDeclarations }],
});

// Cheap model — used for chat
const genAI_light = new GoogleGenerativeAI(process.env.GEMINI_API_LIGHT_KEY!);

console.log(genAI_light);
export const modelLight = genAI_light.getGenerativeModel({
  model: "gemini-1.5-flash",
});
