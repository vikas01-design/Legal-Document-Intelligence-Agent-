import "dotenv/config";

import express from "express";
import cors from "cors";

import analyzeRouter from "./api/analyze";
import routes from "./api/routes";
import chatRouter from "./api/chat";

const app = express();

app.use(cors());
app.use(express.json());

app.use(routes);
app.use("/chat", chatRouter);
app.use("/analyze", analyzeRouter);

app.get("/", (_, res) => {
  res.json({
    status: "Legal Document Intelligence API Running",
  });
});

console.log("================================");
console.log("Environment Check");
console.log("GOOGLE_API_KEY:", process.env.GOOGLE_API_KEY ? "Loaded ✅" : "Missing ❌");
console.log("QDRANT_URL:", process.env.QDRANT_URL ? "Loaded ✅" : "Missing ❌");
console.log("QDRANT_API_KEY:", process.env.QDRANT_API_KEY ? "Loaded ✅" : "Missing ❌");
console.log("ENKRYPT_API_KEY:", process.env.ENKRYPT_API_KEY ? "Loaded ✅" : "Missing ❌");
console.log("================================");
console.log(
  "LLM Provider:",
  process.env.LLM_PROVIDER ?? "gemini (default)"
);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});