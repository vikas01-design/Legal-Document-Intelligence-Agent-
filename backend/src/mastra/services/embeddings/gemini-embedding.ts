import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error("❌ GOOGLE_API_KEY is missing in .env");
}

const ai = new GoogleGenAI({
  apiKey,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    console.log("\n==============================");
    console.log("🧠 Generating Gemini Embedding");
    console.log("==============================");

    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
    });

    const embedding = response.embeddings?.[0]?.values ?? [];

    console.log("✅ Embedding generated");
    console.log("Vector length:", embedding.length);

    return embedding;
  } catch (error) {
    console.error("❌ Gemini Embedding Error");
    console.error(error);
    throw error;
  }
}