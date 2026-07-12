import { runLexoraPipeline } from "../legal/lexora-pipeline";

export async function askLegalQuestion(question: string) {
  try {
    console.log("\n==============================");
    console.log("💬 New Lexora Chat Request");
    console.log("==============================");
    console.log("Question:", question);

    const result = await runLexoraPipeline(question);

    return {
      success: result.success,
      answer: result.answer,
      intent: result.intent,
      citations: result.citations ?? [],
      sources: result.sources ?? [],
    };
  } catch (error) {
    console.error("❌ Error inside askLegalQuestion:", error);

    return {
      success: false,
      answer: "An internal error occurred. Please try again later.",
      error: (error as Error).message,
    };
  }
}
