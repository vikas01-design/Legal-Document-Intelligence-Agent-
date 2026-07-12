import "dotenv/config";
import { QdrantClient } from "@qdrant/js-client-rest";

console.log("QDRANT_URL:", process.env.QDRANT_URL);
console.log("QDRANT_API_KEY Loaded:", !!process.env.QDRANT_API_KEY);

console.log("QDRANT_URL:", process.env.QDRANT_URL);

const key = process.env.QDRANT_API_KEY ?? "";

console.log("QDRANT KEY PREFIX:", key.substring(0, 20));
console.log("QDRANT KEY SUFFIX:", key.substring(key.length - 10));
console.log("QDRANT KEY LENGTH:", key.length);

export const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL!,
  apiKey: process.env.QDRANT_API_KEY!,
  checkCompatibility: false,
});