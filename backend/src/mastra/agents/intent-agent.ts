export type Intent = "greeting" | "goodbye" | "legal-question" | "illegal-request" | "general-knowledge";

const greetingTerms = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"];
const goodbyeTerms = ["bye", "goodbye", "thanks", "thank you", "see you", "talk later"];
const illegalTerms = [
  "money laundering",
  "tax evasion",
  "fraud",
  "forgery",
  "bribe",
  "illegal",
  "hack",
  "bypass security",
  "steal",
  "evade",
];
const legalSignals = [
  "contract",
  "agreement",
  "clause",
  "legal",
  "nda",
  "confidential",
  "liability",
  "termination",
  "payment",
  "indemnity",
  "force majeure",
  "arbitration",
  "intellectual property",
  "compliance",
  "risk",
  "governing law",
  "consumer protection",
  "companies act",
  "dpdp",
  "pmla",
  "it act",
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

  return { intent: "general-knowledge", reason: "The request is outside the legal domain." };
}
