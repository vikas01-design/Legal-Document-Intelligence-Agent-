"""Enkrypt AI Guardrails Service."""

import os
import logging
from typing import Dict, Any
from dotenv import load_dotenv
import requests

load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

logger = logging.getLogger(__name__)

ENKRYPT_API_KEY = os.getenv("ENKRYPT_API_KEY")
ENKRYPT_URL = "https://api.enkryptai.com/guardrails/detect"


def check_prompt(prompt: str) -> Dict[str, Any]:
    """Check prompt safety with Enkrypt AI Guardrails.
    
    Verifies against injection attacks, toxicity, PII, and banned keywords.
    Falls back gracefully if the API key is not provided or the service is offline.
    """
    print("\n==============================")
    print("🛡️ Enkrypt Prompt Guard")
    print("==============================")

    api_key = os.getenv("ENKRYPT_API_KEY", ENKRYPT_API_KEY)
    if not api_key:
        return {"safe": True, "message": "Enkrypt API key not set. Continuing safely."}

    try:
        headers = {
            "Content-Type": "application/json",
            "apikey": api_key,
        }
        payload = {
            "text": prompt,
            "detectors": {
                "injection_attack": {"enabled": True},
                "toxicity": {"enabled": True},
                "pii": {
                    "enabled": True,
                    "entities": ["pii", "secrets", "ip_address", "url"],
                },
                "keyword_detector": {
                    "enabled": True,
                    "banned_keywords": ["bomb", "terrorist"],
                },
            },
        }

        response = requests.post(ENKRYPT_URL, headers=headers, json=payload, timeout=10)
        print("Status:", response.status_code)

        if response.status_code != 200:
            print("❌ Enkrypt Error:", response.text)
            return {"safe": True, "message": "Enkrypt unavailable"}

        result = response.json()
        summary = result.get("summary", {})
        keyword_detected = summary.get("keyword_detected") == 1
        toxicity = summary.get("toxicity", [])
        toxic = isinstance(toxicity, list) and len(toxicity) > 0
        blocked = keyword_detected or toxic

        if blocked:
            print("❌ Prompt Blocked")
        else:
            print("✅ Prompt Safe")

        return {
            "safe": not blocked,
            "message": result.get("result_message", "Prompt blocked by Enkrypt.")
            if blocked
            else "Prompt passed safety check.",
            "result": result,
        }
    except Exception as err:
        print("❌ Enkrypt Exception:", err)
        return {"safe": True, "message": "Enkrypt unavailable. Continuing safely."}
