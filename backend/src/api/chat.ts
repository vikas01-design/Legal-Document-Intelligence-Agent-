import { Router } from "express";
import { askLegalQuestion } from "../mastra/services/chat/ask-legal-question";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required.",
      });
    }

    // Check if the user input is a greeting
    const greetings = new Set([
      "hi",
      "hello",
      "hey",
      "good morning",
      "good evening",
      "good afternoon",
      "hello there",
      "hey there",
      "hola",
      "yo"
    ]);
    const cleanQuestion = question.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
    
    if (greetings.has(cleanQuestion)) {
      return res.json({
        success: true,
        answer: "Hi, how are you? How can I assist you with your legal or contract query today?",
        intent: "greeting",
        citations: [],
        sources: []
      });
    }

    const result = await askLegalQuestion(question);
    return res.json(result);
  } catch (error: any) {
    console.error("========== CHAT ERROR ==========");
    console.error(error);

    if (error?.stack) {
      console.error(error.stack);
    }

    console.error("===============================");

    return res.status(500).json({
      success: false,
      message: error?.message ?? "Internal Server Error",
    });
  }
});

export default router;