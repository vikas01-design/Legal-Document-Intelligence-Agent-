"""Analyze blueprint for comprehensive contract risk review and document classification."""

import logging
from flask import Blueprint, jsonify
from services.qdrant_service import get_entire_contract
from services.contract_analyzer import classify_document, analyze_contract_risks

logger = logging.getLogger(__name__)

analyze_bp = Blueprint("analyze", __name__)


@analyze_bp.route("/analyze", methods=["POST"])
def analyze():
    """Analyze the indexed contract for legal risks and classification."""
    try:
        print("================================")
        print("📊 Starting ThinkDoc AI Contract Analysis...")
        print("================================")

        contract_text = get_entire_contract()
        classification = classify_document(contract_text)
        risks = analyze_contract_risks()

        print(
            f"✅ Analysis Completed ({len(risks)} risks found, "
            f"isLegalDocument: {classification.get('isLegalDocument')})"
        )

        return jsonify({
            "success": True,
            "risks": risks,
            "isLegalDocument": classification.get("isLegalDocument", True),
            "documentType": classification.get("documentType", "Contract"),
        }), 200

    except Exception as error:
        print("========== ANALYZE ERROR ==========")
        print(error)
        print("===================================")
        return jsonify({
            "success": False,
            "message": str(error) or "Contract analysis failed.",
        }), 500
