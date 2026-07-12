import { Router } from "express";
import { upload } from "./upload";
import { uploadDocument } from "../mastra/services/qdrant/upload-document";

const router = Router();

router.post(
  "/upload",
  upload.single("file"),
  async (req, res) => {

    console.log("\n========== NEW REQUEST ==========");
    console.log("Method:", req.method);
    console.log("URL:", req.originalUrl);
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Body:", req.body);
    console.log("File:", req.file);
    console.log("=================================\n");

    try {

      if (!req.file) {
        console.log("❌ No file received by Multer");

        return res.status(400).json({
          success: false,
          message: "No PDF uploaded",
        });
      }

      console.log("✅ File uploaded successfully");
      console.log("Original Name:", req.file.originalname);
      console.log("Stored Path:", req.file.path);
      console.log("Mime Type:", req.file.mimetype);
      console.log("Size:", req.file.size);

      // Respond immediately so Render's 30s gateway timeout is never hit.
      // The frontend already has the PDF via local blob URL.
      res.json({
        success: true,
        filename: req.file.originalname,
        chunks: 0, // Will be filled after background processing
        status: "processing",
      });

      // Fire-and-forget: process embedding + Qdrant indexing in the background
      uploadDocument(req.file.path)
        .then((result) => {
          console.log("✅ Background indexing finished");
          console.log(`   Chunks indexed: ${result.chunks}`);
        })
        .catch((err) => {
          console.error("❌ Background indexing failed");
          console.error(err);
        });

      return;

    } catch (error) {

      console.error("❌ Upload Error");
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Upload failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

export default router;