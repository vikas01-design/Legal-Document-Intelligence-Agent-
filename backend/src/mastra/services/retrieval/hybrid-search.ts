import { expandQueries } from "./query-expansion";
import { generateEmbedding } from "../embeddings/gemini-embedding";
import { qdrant } from "../qdrant/client";

export interface RetrievalResult {
  text: string;
  score: number;
  page: number;
  section: string;
  clause: string;
  document: string;
  chunkNumber: number;
}

function dedupeResults(results: RetrievalResult[]) {
  const unique = new Map<string, RetrievalResult>();
  for (const result of results) {
    const key = `${result.document}:${result.page}:${result.section}:${result.clause}:${result.text}`.toLowerCase();
    if (!unique.has(key)) {
      unique.set(key, result);
    }
  }
  return Array.from(unique.values());
}

export async function retrieveRelevantChunks(question: string): Promise<RetrievalResult[]> {
  const expanded = expandQueries(question);
  const queries = Array.from(new Set([question, ...expanded]));

  const allMatches: RetrievalResult[] = [];

  for (const query of queries) {
    const embedding = await generateEmbedding(query);
    const response = await qdrant.query("legal-documents", {
      query: embedding,
      limit: 10,
      with_payload: true,
      with_vector: false,
    });

    for (const point of response.points ?? []) {
      const payload = point.payload ?? {};
      allMatches.push({
        text: String(payload.text ?? ""),
        score: Number(point.score ?? 0),
        page: Number(payload.page ?? 0),
        section: String(payload.section ?? ""),
        clause: String(payload.clause ?? ""),
        document: String(payload.document ?? payload.source ?? "Unknown"),
        chunkNumber: Number(payload.chunkNumber ?? 0),
      });
    }
  }

  const deduped = dedupeResults(allMatches);
  deduped.sort((a, b) => b.score - a.score);
  return deduped.slice(0, 5);
}
