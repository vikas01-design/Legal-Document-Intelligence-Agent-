export type Intent = "greeting" | "goodbye" | "legal-question" | "illegal-request" | "general-knowledge";

const greetingTerms = [
  "hi", "hii", "hiii", "hello", "hey", "good morning", "good afternoon", "good evening",
  "hello there", "hey there", "hola", "yo", "namaste", "howdy", "sup", "what's up", "whats up",
];
const goodbyeTerms = [
  "bye", "goodbye", "thanks", "thank you", "see you", "talk later",
  "ok bye", "that's all", "thats all", "done", "no more questions",
];
const illegalTerms = [
  "money laundering", "tax evasion", "fraud", "forgery", "bribe",
  "illegal", "hack", "bypass security", "steal", "evade",
];
const legalSignals = [
  "contract", "agreement", "clause", "legal", "nda", "confidential",
  "liability", "termination", "payment", "indemnity", "force majeure",
  "arbitration", "intellectual property", "compliance", "risk",
  "governing law", "consumer protection", "companies act", "dpdp", "pmla", "it act",
  "document", "what's inside", "whats inside", "read", "analyze", "review",
  "summarize", "summary", "explain", "tell me about", "what does",
  "check", "obligations", "parties", "rights", "duties", "penalty",
  "dispute", "breach", "damages", "warranty", "renewal", "scope",
  "exclusion", "limitation", "overview", "entire", "full analysis",
];

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function matchesWholeWord(text: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(text);
}

export async function detectIntent(question: string): Promise<{ intent: Intent; reason: string }> {
  const normalized = normalize(question);

  if (!normalized) {
    return { intent: "general-knowledge", reason: "No useful input was provided." };
  }

  if (greetingTerms.some((term) => matchesWholeWord(normalized, term))) {
    return { intent: "greeting", reason: "The user greeted the assistant." };
  }

  if (goodbyeTerms.some((term) => matchesWholeWord(normalized, term))) {
    return { intent: "goodbye", reason: "The user ended the conversation." };
  }

  if (illegalTerms.some((term) => normalized.includes(term))) {
    return { intent: "illegal-request", reason: "The request appears to involve illegal activity." };
  }

  if (legalSignals.some((term) => normalized.includes(term))) {
    return { intent: "legal-question", reason: "The request is related to legal analysis or contractual review." };
  }

  // Fallback: treat any question about the uploaded document as legal
  if (normalized.includes("this") || normalized.includes("the document") || normalized.includes("uploaded") || normalized.endsWith("?")) {
    return { intent: "legal-question", reason: "The request likely refers to the uploaded document." };
  }

  return { intent: "general-knowledge", reason: "The request is outside the legal domain." };
}
