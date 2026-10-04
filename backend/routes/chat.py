"""Chat blueprint for answering legal and contractual queries."""

import re
import logging
from flask import Blueprint, request, jsonify
from services.legal_pipeline import run_legal_pipeline

logger = logging.getLogger(__name__)

chat_bp = Blueprint("chat", __name__)


@chat_bp.route("/chat", methods=["POST"])
def chat():
    """Handle chat queries using the Legal Intelligence Pipeline."""
    try:
        data = request.get_json(force=True, silent=True) or {}
        question = data.get("question", "")

        if not question or not str(question).strip():
            return jsonify({"success": False, "message": "Question is required."}), 400

        # Quick greeting check for instant response
        greetings = {
            "hi", "hello", "hey", "good morning", "good evening", "good afternoon",
            "hello there", "hey there", "hola", "yo"
        }
        clean_question = re.sub(r"[.,\/#!$%\^&\*;:{}=\-_`~()?]", "", question.strip().lower())
        if clean_question in greetings:
            return jsonify({
                "success": True,
                "answer": "Hi, how are you? How can I assist you with your legal or contract query today?",
                "intent": "greeting",
                "citations": [],
                "sources": [],
            }), 200

        # Run end-to-end legal intelligence pipeline
        result = run_legal_pipeline(str(question))
        return jsonify(result), 200

    except Exception as error:
        print("========== CHAT ERROR ==========")
        print(error)
        print("================================")
        return jsonify({"success": False, "message": str(error)}), 500
