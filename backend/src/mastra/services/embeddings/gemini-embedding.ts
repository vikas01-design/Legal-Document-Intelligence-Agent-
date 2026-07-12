import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GOOGLE_API_KEY;

console.log("GOOGLE_API_KEY:", apiKey ? "Loaded ✅" : "Missing ❌");

if (!apiKey) {
  console.error("❌ GOOGLE_API_KEY is missing in environment variables");
  throw new Error("GOOGLE_API_KEY is missing in environment variables");
}

const ai = new GoogleGenAI({
  apiKey,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    console.log("\n==============================");
    console.log("🧠 Generating Gemini Embedding");
    console.log("==============================");
    console.log("Text length:", text.length);

    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
    });

    const embedding = response.embeddings?.[0]?.values ?? [];

    if (!embedding || embedding.length === 0) {
      throw new Error("Empty embedding returned from Gemini");
    }

    console.log("✅ Embedding generated");
    console.log("Vector length:", embedding.length);

    return embedding;
  } catch (error) {
    console.error("❌ Gemini Embedding Error");
    console.error(error);
    throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : String(error)}`);
  }
}