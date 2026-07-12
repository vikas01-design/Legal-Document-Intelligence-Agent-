import { detectIntent } from "../../agents/intent-agent";
import { checkPrompt } from "../enkrypt/guardrails";
import { retrieveRelevantChunks } from "../retrieval/hybrid-search";
import { generateAnswer } from "../chat/generate-answer";

function detectSpecificRequest(question: string): string | null {
  const q = question.toLowerCase();
  const requests: string[] = [];

  if (q.includes("summarize") || q.includes("summary")) {
    requests.push("- **Clause Summary**: Restate the clause in plain language, highlighting key obligations and risks.");
  }
  if (q.includes("risk assessment") || q.includes("analyze risk") || q.includes("risky") || q.includes("risk clause") || q.includes("risks")) {
    requests.push("- **Risk Assessment**: Identify specific financial, legal, and reputational risks and explain why they matter.");
  }
  if (q.includes("safer alternative") || q.includes("alternative") || q.includes("drafting advice") || q.includes("drafting")) {
    requests.push("- **Safer Alternatives**: Suggest revised wording or drafting strategies with sample clause language.");
  }
  if (q.includes("legal reference") || q.includes("indian contract act") || q.includes("court") || q.includes("applicable laws") || q.includes("statutory")) {
    requests.push("- **Legal References**: Cite relevant sections of the Indian Contract Act, 1872 or other applicable laws and explain court interpretations.");
  }
  if (q.includes("benchmark") || q.includes("industry standard") || q.includes("industry norm") || q.includes("standard practice")) {
    requests.push("- **Industry Benchmark**: Compare the clause against standard contract practices.");
  }
  if (q.includes("ambiguity") || q.includes("conflict") || q.includes("unclear")) {
    requests.push("- **Ambiguities & Conflicts**: Point out unclear terms or overlaps.");
  }
  if (q.includes("conclusion") || q.includes("verdict") || q.includes("recommendation") || q.includes("verdict")) {
    requests.push("- **Conclusion**: Provide a clear verdict and practical recommendations.");
  }

  if (requests.length > 0) {
    return `The user is specifically asking for the following analyses:
${requests.join("\n")}
Please provide a detailed response addressing ONLY these requested aspects, and do not include the other sections of the standard 10-step sequence.`;
  }
  
  return null;
}

export async function runLexoraPipeline(question: string) {
  const intent = await detectIntent(question);

  if (intent.intent === "greeting") {
    return {
      success: true,
      answer: "Hi, I’m Lexora AI. I can help review legal documents, assess risk, and check compliance with Indian law. Please upload a contract or ask me a legal question!",
      intent: intent.intent,
      citations: [],
      sources: [],
    };
  }

  if (intent.intent === "goodbye") {
    return {
      success: true,
      answer: "Goodbye. I’m here whenever you need another legal review.",
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

  const evidence = await retrieveRelevantChunks(question);
  const evidenceText = evidence.map((item) => item.text).join("\n\n");

  const specificInstruction = detectSpecificRequest(question);
  let formattingPrompt = "";
  if (specificInstruction) {
    formattingPrompt = specificInstruction;
  } else {
    formattingPrompt = `You are a Lexora AI Agent specializing in contract reviews and compliance under Indian law.
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
   Suggest revised wording or drafting strategies that balance both parties’ interests. Provide sample clause language when possible.

7. **Ambiguities & Conflicts**  
   Point out unclear terms or overlaps with other clauses that could cause disputes.

8. **Probable Risks & Conditions**  
   List likely outcomes if the clause is enforced (financial losses, litigation, reputational harm).

9. **Risk & Compliance Level**  
   Classify the clause as **High Risk**, **Moderate Risk**, or **Low Risk** with reasoning.

10. **Conclusion**  
    Provide a clear verdict and practical recommendation (e.g., “Revise clause to cap liability at fees paid” or “Clause is enforceable but should be clarified”).

Guidelines:  
- Always use **plain language explanations** alongside legal references.  
- Be **clause-specific**, not generic.  
- Provide **actionable drafting advice**.  
- Maintain consistency across all outputs using this 10-step sequence.`;
  }

  // Query Gemini / DeepSeek V3 conversationally based on the contract context
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
}
