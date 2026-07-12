import { retrieveRelevantChunks } from "../retrieval/hybrid-search";

export async function searchContract(query: string) {
  try {
    console.log("\n==============================");
    console.log("🔍 Lexora RAG Search");
    console.log("==============================");
    console.log("Query:", query);

    return await retrieveRelevantChunks(query);
  } catch (error) {
    console.error("\n❌ Qdrant Search Failed", error);
    return [];
  }
}