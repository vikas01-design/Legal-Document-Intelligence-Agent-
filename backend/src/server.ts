import "dotenv/config";

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import analyzeRouter from "./api/analyze";
import routes from "./api/routes";
import chatRouter from "./api/chat";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configure CORS to allow requests from the frontend
const allowedOrigins = [
  'https://lexora-ai-app.onrender.com',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API routes (must come before static files)
app.use(routes);
app.use("/chat", chatRouter);
app.use("/analyze", analyzeRouter);

app.get("/api/health", (_, res) => {
  res.json({
    status: "Legal Document Intelligence API Running",
  });
});

// Serve frontend static files in production
const frontendDist = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(frontendDist));

// SPA fallback: serve index.html for all non-API routes
app.use((req, res) => {
  // Don't serve index.html for API-like paths
  if (req.path.startsWith("/upload") || req.path.startsWith("/chat") || req.path.startsWith("/analyze")) {
    return res.status(404).json({ error: "Not found" });
  }
  res.sendFile(path.join(frontendDist, "index.html"));
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
console.log("Frontend dist:", frontendDist);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});