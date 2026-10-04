"""Contract analysis and document classification service."""

import re
import json
import logging
from typing import List, Dict, Any

from services.qdrant_service import get_entire_contract
from services.embeddings import generate_answer

logger = logging.getLogger(__name__)


def _extract_json(text: str) -> Any:
    """Helper to extract and parse JSON from LLM response safely."""
    clean = text.strip()
    # Strip markdown block quotes if present
    if "```" in clean:
        clean = re.sub(r"^```(?:json)?\s*", "", clean)
        clean = re.sub(r"\s*```$", "", clean)

    # First attempt: direct json.loads
    try:
        return json.loads(clean.strip())
    except Exception:
        pass

    # Second attempt: find outer bracket / brace with regex
    match = re.search(r"(\[[\s\S]*\]|\{[\s\S]*\})", clean)
    if match:
        try:
            return json.loads(match.group(1))
        except Exception:
            pass

    raise ValueError(f"Could not parse valid JSON from text: {text[:200]}...")


def classify_document(text: str) -> Dict[str, Any]:
    """Classify if the document text belongs to a legal document."""
    print("📄 Classifying document type...")
    if not text or not text.strip():
        return {"isLegalDocument": True, "documentType": "Contract"}

    prompt = f"""
Analyze the text below. Determine if this text belongs to a legal document such as a contract, agreement, non-disclosure agreement (NDA), terms of service, privacy policy, or a similar legal document.

Return ONLY valid JSON in this exact format:
{{
  "isLegalDocument": true,
  "documentType": "Non-Disclosure Agreement"
}}

If it is NOT a legal document (for example, it is a cooking recipe, a travel guide, generic text notes, a story, programming code, etc.), return:
{{
  "isLegalDocument": false,
  "documentType": "Unknown"
}}

DO NOT write markdown. DO NOT wrap JSON in ```. DO NOT explain anything.

Text:
{text[:3000]}
"""
    try:
        answer = generate_answer(prompt)
        parsed = _extract_json(answer)
        if isinstance(parsed, dict) and "isLegalDocument" in parsed:
            return parsed
        return {"isLegalDocument": True, "documentType": "Contract"}
    except Exception as error:
        print("Error classifying document:", error)
        return {"isLegalDocument": True, "documentType": "Contract"}


def analyze_contract_risks() -> List[Dict[str, Any]]:
    """Analyze contract and return structured legal risks under Indian law."""
    print("📄 Reading entire contract for risk analysis...")
    contract = get_entire_contract()
    if not contract.strip():
        raise Exception("No indexed contract found.")

    prompt = f"""
You are an expert AI Legal Risk Analyzer.

Analyze ONLY the contract below.

Return ONLY valid JSON.

DO NOT write markdown.

DO NOT explain anything.

DO NOT wrap the JSON in ```.

Return EXACTLY this format:

[
  {{
    "title": "Unlimited Liability",
    "level": "High",
    "description": "The supplier has unlimited liability without any financial cap.",
    "law": "Section 73, Indian Contract Act, 1872",
    "recommendation": "Limit liability to the total contract value."
  }}
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

{contract}
"""
    answer = generate_answer(prompt)
    parsed = _extract_json(answer)
    if isinstance(parsed, list):
        return parsed
    elif isinstance(parsed, dict) and "risks" in parsed:
        return parsed["risks"]
    return []
