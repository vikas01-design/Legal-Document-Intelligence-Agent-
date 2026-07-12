import { detectIntent } from "../../agents/intent-agent";
import { checkPrompt } from "../enkrypt/guardrails";
import { retrieveRelevantChunks } from "../retrieval/hybrid-search";
import { generateAnswer } from "../chat/generate-answer";

/**
 * Detects if the user is asking a SPECIFIC focused query (risk, summary, etc.)
 * Returns targeted instructions so the LLM answers ONLY that aspect.
 */
function detectSpecificRequest(question: string): string | null {
  const q = question.toLowerCase();
  const requests: string[] = [];

  // Summarize / explain
  if (q.includes("summarize") || q.includes("summary") || q.includes("explain") || q.includes("tell me about") || q.includes("what does") || q.includes("what is")) {
    requests.push("- **Clause Summary**: Restate the clause in plain language, highlighting key obligations and risks.");
  }

  // Risk assessment
  if (q.includes("risk") || q.includes("risky") || q.includes("is there any") || q.includes("identify") || q.includes("list") || q.includes("dangerous") || q.includes("concern") || q.includes("problem") || q.includes("issue")) {
    requests.push("- **Risk Assessment**: Identify specific financial, legal, and reputational risks and explain why they matter.");
  }

  // Safer alternatives / drafting advice
  if (q.includes("safer alternative") || q.includes("alternative") || q.includes("drafting advice") || q.includes("drafting") || q.includes("improve") || q.includes("rewrite") || q.includes("suggest")) {
    requests.push("- **Safer Alternatives**: Suggest revised wording or drafting strategies with sample clause language.");
  }

  // Legal references
  if (q.includes("legal reference") || q.includes("indian contract act") || q.includes("court") || q.includes("applicable laws") || q.includes("statutory") || q.includes("law") || q.includes("act") || q.includes("section")) {
    requests.push("- **Legal References**: Cite relevant sections of the Indian Contract Act, 1872 or other applicable laws and explain court interpretations.");
  }

  // Industry benchmarks
  if (q.includes("benchmark") || q.includes("industry standard") || q.includes("industry norm") || q.includes("standard practice") || q.includes("compare")) {
    requests.push("- **Industry Benchmark**: Compare the clause against standard contract practices.");
  }

  // Ambiguities
  if (q.includes("ambiguity") || q.includes("conflict") || q.includes("unclear") || q.includes("vague") || q.includes("confusing")) {
    requests.push("- **Ambiguities & Conflicts**: Point out unclear terms or overlaps.");
  }

  // Compliance check
  if (q.includes("compliance") || q.includes("check") || q.includes("verify") || q.includes("enforceable") || q.includes("valid")) {
    requests.push("- **Compliance Check**: Assess enforceability under Indian law. Flag potential issues.");
  }

  // Conclusion / recommendation
  if (q.includes("conclusion") || q.includes("verdict") || q.includes("recommendation")) {
    requests.push("- **Conclusion**: Provide a clear verdict and practical recommendations.");
  }

  if (requests.length > 0) {
    return `The user is specifically asking for the following analyses:
${requests.join("\n")}
Please provide a detailed response addressing ONLY these requested aspects. Do NOT include the other sections of the standard 10-step sequence. Be concise and focused on what the user asked.`;
  }

  return null;
}

/**
 * Detects if the user wants a FULL document overview / complete analysis.
 */
function isFullDocumentQuery(question: string): boolean {
  const q = question.toLowerCase();
  const fullAnalysisPatterns = [
    "what's inside", "whats inside", "what is inside",
    "analyze the document", "analyse the document",
    "full analysis", "complete analysis",
    "read the document", "review the document",
    "entire document", "whole document",
    "overview", "overall analysis",
    "analyze everything", "analyse everything",
    "what does this document contain",
    "what all", "tell me everything",
  ];
  return fullAnalysisPatterns.some((p) => q.includes(p));
}

const FULL_10_STEP_PROMPT = `You are a Lexora AI Agent specializing in contract reviews and compliance under Indian law.
For every clause, contract, or legal query, always produce your output in the following 10-step format:

1. **Clause Summary**  
   Restate the clause in plain language, highlighting its key obligations and risks.

2. **Risk Assessment**  
   Identify specific risks (financial, legal, reputational) and explain why they matter.

3. **Legal References**  
   Cite relevant sections of the Indian Contract Act, 1872 (or other applicable laws) and explain how courts interpret such clauses.

4. **Industry Benchmark**  
   Compare the clause against standard practices in contracts and industry norms. Give concrete examples.

5. **Compliance Check**  
   Assess enforceability under Indian law. Flag potential issues like ambiguity, unfairness, or unconscionability.

6. **Safer Alternatives**  
   Suggest revised wording or drafting strategies that balance both parties' interests. Provide sample clause language when possible.

7. **Ambiguities & Conflicts**  
   Point out unclear terms or overlaps with other clauses that could cause disputes.

8. **Probable Risks & Conditions**  
   List likely outcomes if the clause is enforced (financial losses, litigation, reputational harm).

9. **Risk & Compliance Level**  
   Classify the clause as **High Risk**, **Moderate Risk**, or **Low Risk** with reasoning.

10. **Conclusion**  
    Provide a clear verdict and practical recommendation (e.g., "Revise clause to cap liability at fees paid" or "Clause is enforceable but should be clarified").

Guidelines:  
- Always use **plain language explanations** alongside legal references.  
- Be **clause-specific**, not generic.  
- Provide **actionable drafting advice**.  
- Maintain consistency across all outputs using this 10-step sequence.`;

export async function runLexoraPipeline(question: string) {
  const intent = await detectIntent(question);

  // Handle greetings without touching LLM or RAG
  if (intent.intent === "greeting") {
    return {
      success: true,
      answer: "Hello! 👋 I'm Lexora AI, your legal document intelligence assistant. I can help review legal documents, assess risk, and check compliance with Indian law. Please upload a contract or ask me a legal question!",
      intent: intent.intent,
      citations: [],
      sources: [],
    };
  }

  // Handle goodbyes without touching LLM or RAG
  if (intent.intent === "goodbye") {
    return {
      success: true,
      answer: "Goodbye! I'm here whenever you need another legal review. Have a great day! 👋",
      intent: intent.intent,
      citations: [],
      sources: [],
    };
  }

  if (intent.intent === "illegal-request") {
    return {
      success: false,
      answer: "Lexora AI is restricted to legal document analysis and statutory compliance review. I cannot assist with requests involving illegal activity or compliance evasion.",
      intent: intent.intent,
      citations: [],
      sources: [],
    };
  }

  // Enkrypt safety check (fails gracefully)
  const safety = await checkPrompt(question);
  if (!safety.safe) {
    return {
      success: false,
      answer: safety.message,
      intent: intent.intent,
      citations: [],
      sources: [],
    };
  }

  // RAG: retrieve relevant document chunks
  const evidence = await retrieveRelevantChunks(question);
  const evidenceText = evidence.map((item) => item.text).join("\n\n");

  // If no evidence found, tell the user
  if (!evidenceText.trim() || evidence.length === 0) {
    return {
      success: true,
      answer: "I couldn't find relevant content in the uploaded document for your query. This could mean:\n\n- The document hasn't finished indexing yet (please wait a few seconds after upload)\n- No document has been uploaded yet\n- Your question doesn't match the document content\n\nPlease try uploading a document first, or ask a more specific legal question about the uploaded contract.",
      intent: intent.intent,
      citations: [],
      sources: [],
    };
  }

  // Determine formatting: specific query vs full 10-step analysis
  let formattingPrompt = "";
  if (isFullDocumentQuery(question)) {
    formattingPrompt = FULL_10_STEP_PROMPT;
  } else {
    const specificInstruction = detectSpecificRequest(question);
    formattingPrompt = specificInstruction ?? FULL_10_STEP_PROMPT;
  }

  // Build the final prompt
  const prompt = `
User Question:

${question}

Retrieved Contract Evidence:

${evidenceText}

Instructions:

- Answer ONLY using the retrieved evidence whenever possible.
- If evidence is insufficient, explicitly state that.
- Explain in simple language.
- Cite the evidence.
- Format constraints:
${formattingPrompt}
`;

  console.log("🤖 Querying AI...");

  try {
    const answer = await generateAnswer(prompt);
    console.log("✅ AI Response Generated");

    const citations = evidence.map((item) => ({
      document: item.document,
      page: item.page,
      section: item.section,
      clause: item.clause,
      chunk: item.chunkNumber,
      text: item.text,
    }));

    const sources = evidence.map((item) => `${item.document} p.${item.page}`);

    return {
      success: true,
      answer,
      intent: intent.intent,
      citations,
      sources,
    };
  } catch (error) {
    console.error("❌ AI generation failed:", error);
    return {
      success: true,
      answer: "I'm currently experiencing issues processing your request. The AI service may be temporarily unavailable. Please try again in a moment.",
      intent: intent.intent,
      citations: [],
      sources: [],
    };
  }
}
