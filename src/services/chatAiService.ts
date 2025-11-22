// services/chartAiService.ts
import { modelHeavy } from "./aiModels";
import { generateChartPrompt } from "../utils/chartPrompt";
import mcpClient from "../services/mcpClient";

export async function runChartAnalysis(
  message: string,        // <-- FIXED
  dataset: any            // <-- you can type this later
): Promise<any> {         // <-- return type for JSON output
  const prompt = generateChartPrompt(message, dataset);

  const chat = modelHeavy.startChat({ history: [] });
  let response = await chat.sendMessage(prompt);

  // handle tool calls
  while (true) {
    const toolCall = response.response.functionCalls()?.[0];
    if (!toolCall) break;

    const result = await mcpClient.call(
      toolCall.name,
      toolCall.args
    );

    const next = await chat.sendMessage([
      {
        functionResponse: {
          name: toolCall.name,
          response: result,
        },
      },
    ]);

    response = next;
  }

  return JSON.parse(response.response.text());
}
