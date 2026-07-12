import { extractPdfText } from "../pdf/pdf-parser";
import { chunkText } from "../chunker/chunk-text";
import { basename } from "path";
import { generateEmbedding } from "../embeddings/gemini-embedding";
import { qdrant } from "./client";

function inferMetadata(text: string, pdfName: string, chunkNumber: number) {
  const sectionMatch = text.match(/(?:^|\n)(section|article|clause|part|chapter)\s*[:#-]?\s*([A-Za-z0-9.()/-]+)/i);
  const headingMatch = text.match(/(?:^|\n)([A-Z][A-Za-z0-9 &(),.-]{2,})/);
  const clauseMatch = text.match(/clause\s*([A-Za-z0-9.()/-]+)/i);

  return {
    text,
    document: pdfName,
    page: 0,
    section: sectionMatch?.[2] ?? "",
    clause: clauseMatch?.[1] ?? "",
    heading: headingMatch?.[1] ?? "",
    chunkNumber,
    tokenCount: text.split(/\s+/).filter(Boolean).length,
    uploadTime: new Date().toISOString(),
  };
}

export async function uploadDocument(pdfPath: string) {
  console.log("📄 Reading PDF...");

  const text = await extractPdfText(pdfPath);

  console.log("✂️ Chunking document...");

  const chunks = chunkText(text);
  const pdfName = basename(pdfPath);

  console.log(`✅ ${chunks.length} chunks created\n`);

  const points = [];
  const BATCH_SIZE = 5;

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    console.log(`Embedding chunks ${i + 1} to ${Math.min(i + BATCH_SIZE, chunks.length)} of ${chunks.length}...`);

    const batchPromises = batch.map(async (chunk, index) => {
      const chunkIdx = i + index;
      const embedding = await generateEmbedding(chunk);
      const payload = inferMetadata(chunk, pdfName, chunkIdx + 1);
      return {
        id: Date.now() + chunkIdx,
        vector: embedding,
        payload,
      };
    });

    const batchResults = await Promise.all(batchPromises);
    points.push(...batchResults);

    if (i + BATCH_SIZE < chunks.length) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  console.log("\n⬆️ Uploading vectors to Qdrant...");

  await qdrant.upsert("legal-documents", {
    wait: true,
    points,
  });

  console.log("\n🎉 Upload Complete!");

  return {
    success: true,
    chunks: chunks.length,
  };
}