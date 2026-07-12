import dotenv from "dotenv";
import path from "path";

// Explicitly load .env from the backend root
dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

console.log("Current Directory:", process.cwd());
console.log("QDRANT_URL:", process.env.QDRANT_URL);
console.log(
  "QDRANT_API_KEY:",
  process.env.QDRANT_API_KEY ? "Loaded ✅" : "Missing ❌"
);