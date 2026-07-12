import { legalAgent } from "../../agents/legal-agent";
import { featherlessAgent } from "../../agents/featherless-agent";

export async function generateAnswer(prompt: string) {
  try {
    console.log("🤖 Trying Gemini...");

    const response = await legalAgent.generate(prompt);

    return response.text;
  } catch (error: any) {
    console.log("⚠️ Gemini failed:", error?.message);

    const shouldFallback =
      error?.statusCode === 429 ||
      error?.statusCode === 503 ||
      error?.statusCode === 504 ||
      error?.message?.includes("UNAVAILABLE") ||
      error?.message?.includes("high demand");

    if (!shouldFallback) {
      throw error;
    }

    console.log("🚀 Switching to Featherless...");

    const response = await featherlessAgent.generate(prompt);

    return response.text;
  }
}