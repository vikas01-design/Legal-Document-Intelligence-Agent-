import "dotenv/config";
import { QdrantClient } from "@qdrant/js-client-rest";

const qdrantUrl = process.env.QDRANT_URL;
const qdrantApiKey = process.env.QDRANT_API_KEY;

console.log("QDRANT_URL:", qdrantUrl ? "Loaded ✅" : "Missing ❌");
console.log("QDRANT_API_KEY:", qdrantApiKey ? "Loaded ✅" : "Missing ❌");

if (!qdrantUrl || !qdrantApiKey) {
  console.error("❌ QDRANT_URL and QDRANT_API_KEY must be set in environment variables");
  throw new Error("QDRANT_URL and QDRANT_API_KEY must be set in environment variables");
}

export const qdrant = new QdrantClient({
  url: qdrantUrl,
  apiKey: qdrantApiKey,
  checkCompatibility: false,
});