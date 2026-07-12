import { Agent } from "@mastra/core/agent";
import { createOpenAI } from "@ai-sdk/openai";
import { contractSearchTool } from "../tools/contract-search-tool";

const featherless = createOpenAI({
  apiKey: process.env.FEATHERLESS_API_KEY!,
  baseURL: "https://api.featherless.ai/v1",
});

export const featherlessAgent = new Agent({
  id: "featherless-agent",
  name: "Lexora AI Backup Agent",

  instructions: `
You are Lexora AI.
Answer only using the retrieved evidence.
Never hallucinate.
Always cite the evidence.
`,

  model: featherless(
    process.env.FEATHERLESS_MODEL ??
      "deepseek-ai/DeepSeek-V3.2"
  ),

  tools: {
    contractSearchTool,
  },
});