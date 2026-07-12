import { getEntireContract } from "../qdrant/get-document";
import { generateAnswer } from "./generate-answer";

export async function analyzeContract() {
  console.log("📄 Reading entire contract...");

  const contract = await getEntireContract();

  if (!contract.trim()) {
    throw new Error("No indexed contract found.");
  }

  const prompt = `
You are an expert AI Legal Risk Analyzer.

Analyze ONLY the contract below.

Return ONLY valid JSON.

DO NOT write markdown.

DO NOT explain anything.

DO NOT wrap the JSON in \`\`\`.

Return EXACTLY this format:

[
  {
    "title": "Unlimited Liability",
    "level": "High",
    "description": "The supplier has unlimited liability without any financial cap.",
    "law": "Section 73, Indian Contract Act, 1872",
    "recommendation": "Limit liability to the total contract value."
  }
]

Rules:

- level MUST be ONLY:
  High
  Medium
  Low

- Analyze:
  1. Unlimited Liability
  2. Confidentiality
  3. Termination
  4. Indemnity
  5. Payment Terms
  6. Intellectual Property
  7. Force Majeure
  8. Governing Law
  9. Non-compete
  10. Data Protection

- If a clause is not found,
  don't invent one.

- Return ONLY JSON.

Contract:

${contract}
`;

  const answer = await generateAnswer(prompt);

  const clean = answer
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(clean);
}

export async function classifyDocument(text: string) {
  console.log("📄 Classifying document type...");

  if (!text || !text.trim()) {
    return { isLegalDocument: true, documentType: "Contract" };
  }

  const prompt = `
Analyze the text below. Determine if this text belongs to a legal document such as a contract, agreement, non-disclosure agreement (NDA), terms of service, privacy policy, or a similar legal document.

Return ONLY valid JSON in this exact format:
{
  "isLegalDocument": true,
  "documentType": "Non-Disclosure Agreement"
}

If it is NOT a legal document (for example, it is a cooking recipe, a travel guide, generic text notes, a story, programming code, etc.), return:
{
  "isLegalDocument": false,
  "documentType": "Unknown"
}

DO NOT write markdown. DO NOT wrap JSON in \`\`\`. DO NOT explain anything.

Text:
${text.slice(0, 3000)}
`;

  try {
    const answer = await generateAnswer(prompt);
    const clean = answer
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(clean);
  } catch (error) {
    console.error("Error classifying document:", error);
    return { isLegalDocument: true, documentType: "Contract" };
  }
}