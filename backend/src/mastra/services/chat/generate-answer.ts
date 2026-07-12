import { legalAgent } from "../../agents/legal-agent";
import { featherlessAgent } from "../../agents/featherless-agent";

export async function generateAnswer(prompt: string) {
  try {
    console.log("🤖 Trying Gemini...");
    const response = await legalAgent.generate(prompt);
    return response.text;
  } catch (error: any) {
    console.log("⚠️ Gemini failed:", error?.message);

    // Always try fallback on any Gemini failure
    try {
      console.log("🚀 Switching to Featherless fallback...");
      const response = await featherlessAgent.generate(prompt);
      return response.text;
    } catch (fallbackError: any) {
      console.error("❌ Featherless fallback also failed:", fallbackError?.message);
      throw error; // Throw the original Gemini error
    }
  }
}