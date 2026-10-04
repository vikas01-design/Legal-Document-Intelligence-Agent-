"""Legal analysis pipeline: intent detection, guardrails, retrieval, and 10-step synthesis."""

import re
import logging
from typing import Dict, Any, Optional, List

from services.enkrypt_guardrails import check_prompt
from services.retrieval import retrieve_relevant_chunks
from services.embeddings import generate_answer

logger = logging.getLogger(__name__)

FULL_10_STEP_PROMPT = """You are a ThinkDoc AI Agent specializing in contract reviews and compliance under Indian law.
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
- Maintain consistency across all outputs using this 10-step sequence."""


def detect_intent(question: str) -> Dict[str, str]:
    """Detect request intent matching intent-agent."""
    normalized = question.lower().strip()
    if not normalized:
        return {"intent": "general-knowledge", "reason": "No useful input was provided."}

    greeting_terms = [
        "hi", "hii", "hiii", "hello", "hey", "good morning", "good afternoon", "good evening",
        "hello there", "hey there", "hola", "yo", "namaste", "howdy", "sup", "what's up", "whats up",
    ]
    goodbye_terms = [
        "bye", "goodbye", "thanks", "thank you", "see you", "talk later",
        "ok bye", "that's all", "thats all", "done", "no more questions",
    ]
    illegal_terms = [
        "money laundering", "tax evasion", "fraud", "forgery", "bribe",
        "illegal", "hack", "bypass security", "steal", "evade",
    ]
    legal_signals = [
        "contract", "agreement", "clause", "legal", "nda", "confidential",
        "liability", "termination", "payment", "indemnity", "force majeure",
        "arbitration", "intellectual property", "compliance", "risk",
        "governing law", "consumer protection", "companies act", "dpdp", "pmla", "it act",
        "document", "what's inside", "whats inside", "read", "analyze", "review",
        "summarize", "summary", "explain", "tell me about", "what does",
        "check", "obligations", "parties", "rights", "duties", "penalty",
        "dispute", "breach", "damages", "warranty", "renewal", "scope",
        "exclusion", "limitation", "overview", "entire", "full analysis",
    ]

    def matches_whole_word(text: str, term: str) -> bool:
        escaped = re.escape(term)
        return bool(re.search(rf"\b{escaped}\b", text, re.IGNORECASE))

    if any(matches_whole_word(normalized, term) for term in greeting_terms):
        return {"intent": "greeting", "reason": "The user greeted the assistant."}

    if any(matches_whole_word(normalized, term) for term in goodbye_terms):
        return {"intent": "goodbye", "reason": "The user ended the conversation."}

    if any(term in normalized for term in illegal_terms):
        return {"intent": "illegal-request", "reason": "The request appears to involve illegal activity."}

    if any(term in normalized for term in legal_signals):
        return {"intent": "legal-question", "reason": "The request is related to legal analysis or contractual review."}

    if "this" in normalized or "the document" in normalized or "uploaded" in normalized or normalized.endswith("?"):
        return {"intent": "legal-question", "reason": "The request likely refers to the uploaded document."}

    return {"intent": "general-knowledge", "reason": "The request is outside the legal domain."}


def detect_specific_request(question: str) -> Optional[str]:
    """Detect specific query focus to avoid full 10-step template when user asked a narrow question."""
    q = question.lower()
    requests = []

    if any(w in q for w in ["summarize", "summary", "explain", "tell me about", "what does", "what is"]):
        requests.append("- **Clause Summary**: Restate the clause in plain language, highlighting key obligations and risks.")

    if any(w in q for w in ["risk", "risky", "is there any", "identify", "list", "dangerous", "concern", "problem", "issue"]):
        requests.append("- **Risk Assessment**: Identify specific financial, legal, and reputational risks and explain why they matter.")

    if any(w in q for w in ["safer alternative", "alternative", "drafting advice", "drafting", "improve", "rewrite", "suggest"]):
        requests.append("- **Safer Alternatives**: Suggest revised wording or drafting strategies with sample clause language.")

    if any(w in q for w in ["legal reference", "indian contract act", "court", "applicable laws", "statutory", "law", "act", "section"]):
        requests.append("- **Legal References**: Cite relevant sections of the Indian Contract Act, 1872 or other applicable laws and explain court interpretations.")

    if any(w in q for w in ["benchmark", "industry standard", "industry norm", "standard practice", "compare"]):
        requests.append("- **Industry Benchmark**: Compare the clause against standard contract practices.")

    if any(w in q for w in ["ambiguity", "conflict", "unclear", "vague", "confusing"]):
        requests.append("- **Ambiguities & Conflicts**: Point out unclear terms or overlaps.")

    if any(w in q for w in ["compliance", "check", "verify", "enforceable", "valid"]):
        requests.append("- **Compliance Check**: Assess enforceability under Indian law. Flag potential issues.")

    if any(w in q for w in ["conclusion", "verdict", "recommendation"]):
        requests.append("- **Conclusion**: Provide a clear verdict and practical recommendations.")

    if requests:
        return (
            "The user is specifically asking for the following analyses:\n"
            + "\n".join(requests)
            + "\nPlease provide a detailed response addressing ONLY these requested aspects. Do NOT include the other sections of the standard 10-step sequence. Be concise and focused on what the user asked."
        )

    return None


def is_full_document_query(question: str) -> bool:
    """Detect if query asks for whole document review."""
    q = question.lower()
    patterns = [
        "what's inside", "whats inside", "what is inside",
        "analyze the document", "analyse the document",
        "full analysis", "complete analysis",
        "read the document", "review the document",
        "entire document", "whole document",
        "overview", "overall analysis",
        "analyze everything", "analyse everything",
        "what does this document contain",
        "what all", "tell me everything",
    ]
    return any(p in q for p in patterns)


def run_legal_pipeline(question: str) -> Dict[str, Any]:
    """Execute end-to-end legal intelligence pipeline for user question."""
    # 1. Intent Detection
    intent_info = detect_intent(question)
    intent = intent_info["intent"]

    if intent == "greeting":
        return {
            "success": True,
            "answer": "Hello! 👋 I'm ThinkDoc, your legal document intelligence assistant. I can help review legal documents, assess risk, and check compliance with Indian law. Please upload a contract or ask me a legal question!",
            "intent": intent,
            "citations": [],
            "sources": [],
        }

    if intent == "goodbye":
        return {
            "success": True,
            "answer": "Goodbye! I'm here whenever you need another legal review. Have a great day! 👋",
            "intent": intent,
            "citations": [],
            "sources": [],
        }

    if intent == "illegal-request":
        return {
            "success": False,
            "answer": "ThinkDoc is restricted to legal document analysis and statutory compliance review. I cannot assist with requests involving illegal activity or compliance evasion.",
            "intent": intent,
            "citations": [],
            "sources": [],
        }

    # 2. Guardrails check
    safety = check_prompt(question)
    if not safety.get("safe", True):
        return {
            "success": False,
            "answer": safety.get("message", "Prompt blocked by guardrails."),
            "intent": intent,
            "citations": [],
            "sources": [],
        }

    # 3. RAG Retrieval
    evidence = retrieve_relevant_chunks(question)
    evidence_text = "\n\n".join(item["text"] for item in evidence)

    if not evidence_text.strip() or len(evidence) == 0:
        return {
            "success": True,
            "answer": (
                "I couldn't find relevant content in the uploaded document for your query. This could mean:\n\n"
                "- The document hasn't finished indexing yet (please wait a few seconds after upload)\n"
                "- No document has been uploaded yet\n"
                "- Your question doesn't match the document content\n\n"
                "Please try uploading a document first, or ask a more specific legal question about the uploaded contract."
            ),
            "intent": intent,
            "citations": [],
            "sources": [],
        }

    # 4. Prompt formatting
    if is_full_document_query(question):
        formatting_prompt = FULL_10_STEP_PROMPT
    else:
        specific_instruction = detect_specific_request(question)
        formatting_prompt = specific_instruction or FULL_10_STEP_PROMPT

    prompt = f"""
User Question:

{question}

Retrieved Contract Evidence:

{evidence_text}

Instructions:

- Answer ONLY using the retrieved evidence whenever possible.
- If evidence is insufficient, explicitly state that.
- Explain in simple language.
- Cite the evidence.
- Format constraints:
{formatting_prompt}
"""
    print("🤖 Querying AI...")
    try:
        answer = generate_answer(prompt)
        print("✅ AI Response Generated")

        citations = [
            {
                "document": item.get("document", "Unknown"),
                "page": item.get("page", 0),
                "section": item.get("section", ""),
                "clause": item.get("clause", ""),
                "chunk": item.get("chunkNumber", idx + 1),
                "text": item.get("text", ""),
            }
            for idx, item in enumerate(evidence)
        ]

        sources = [f"{item.get('document', 'Unknown')} p.{item.get('page', 0)}" for item in evidence]

        return {
            "success": True,
            "answer": answer,
            "intent": intent,
            "citations": citations,
            "sources": sources,
        }
    except Exception as ai_err:
        print("❌ AI generation failed:", ai_err)
        return {
            "success": True,
            "answer": "I'm currently experiencing issues processing your request. The AI service may be temporarily unavailable. Please try again in a moment.",
            "intent": intent,
            "citations": [],
            "sources": [],
        }
