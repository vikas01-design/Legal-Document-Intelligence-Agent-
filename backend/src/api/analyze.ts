import { Router } from "express";
import { analyzeContract, classifyDocument } from "../mastra/services/chat/analyze-contract";
import { getEntireContract } from "../mastra/qdrant/get-document";

const router = Router();

router.post("/", async (_req, res) => {
  try {
    console.log("================================");
    console.log("📊 Starting Lexora AI Contract Analysis...");
    console.log("================================");

    const contractText = await getEntireContract();
    const classification = await classifyDocument(contractText);
    const risks = await analyzeContract();

    console.log(`✅ Analysis Completed (${risks.length} risks found, isLegalDocument: ${classification.isLegalDocument})`);

    return res.status(200).json({
      success: true,
      risks,
      isLegalDocument: classification.isLegalDocument,
      documentType: classification.documentType,
    });

  } catch (error: any) {
    console.error("========== ANALYZE ERROR ==========");
    console.error(error);

    if (error?.stack) {
      console.error(error.stack);
    }

    console.error("===================================");

    return res.status(500).json({
      success: false,
      message: error?.message ?? "Contract analysis failed.",
    });
  }
});

export default router;