import { modelHeavy } from "./aiModels";
import { generateChartPrompt } from "../utils/chartPrompt";
import mcpClient from "../services/mcpClient";

export async function runChartAnalysis(message: string, dataset: any) {
  const prompt = generateChartPrompt(message, dataset);

  const chat = modelHeavy.startChat({ history: [] });
  let result = await chat.sendMessage(prompt);
  let response = result.response;

  // handle tool calls
  let iteration = 0;
  const MAX_ITER = 10;

  while (iteration < MAX_ITER) {
    const toolCall = response.functionCalls()?.[0];
    if (!toolCall) break;

    const toolResult = await mcpClient.call(toolCall.name, toolCall.args);

    const next = await chat.sendMessage([
      {
        functionResponse: {
          name: toolCall.name,
          response: toolResult,
        },
      },
    ]);

    response = next.response;
    iteration++;
  }

  //  SAFE JSON PARSING 
  const rawText = response.text().trim();

  // remove ` json and fences
  const withoutFences = rawText.replace(/```json\s*|```\s*/g, "").trim();

  // in case the model adds text around the JSON, grab only the outermost object
  const start = withoutFences.indexOf("{");
  const end = withoutFences.lastIndexOf("}");

  if (start === -1 || end === -1) {
    console.error("Model did not return a JSON object:", rawText);
    throw new Error("AI did not return valid JSON");
  }

  const jsonSlice = withoutFences.substring(start, end + 1);

  let parsed;
  try {
    parsed = JSON.parse(jsonSlice);
  } catch (e) {
    console.error("Failed to parse AI JSON in runChartAnalysis:", e, "\nTEXT:", rawText);
    throw e;
  }

  return parsed;
}