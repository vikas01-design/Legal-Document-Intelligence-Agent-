"""Embeddings and LLM Generation Service."""

import os
import logging
from typing import List, Optional
from dotenv import load_dotenv
import requests
from google import genai

load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

logger = logging.getLogger(__name__)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
FEATHERLESS_API_KEY = os.getenv("FEATHERLESS_API_KEY")
FEATHERLESS_MODEL = os.getenv("FEATHERLESS_MODEL", "deepseek-ai/DeepSeek-V3.2")
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# Initialize Google GenAI client
_ai_client: Optional[genai.Client] = None
if GOOGLE_API_KEY:
    try:
        _ai_client = genai.Client(api_key=GOOGLE_API_KEY)
    except Exception as e:
        logger.warning(f"⚠️ Failed to initialize Google GenAI Client: {e}")


def get_ai_client() -> Optional[genai.Client]:
    """Retrieve the initialized Google GenAI client, re-initializing if new key is set."""
    global _ai_client
    if _ai_client is None and os.getenv("GOOGLE_API_KEY"):
        try:
            _ai_client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
        except Exception as e:
            logger.warning(f"⚠️ Failed to re-initialize Google GenAI Client: {e}")
    return _ai_client


def generate_embedding(text: str) -> List[float]:
    """Generate 3072-dim text embedding using Gemini gemini-embedding-001."""
    client = get_ai_client()
    if not client:
        raise Exception("GOOGLE_API_KEY is missing or invalid in environment variables.")

    print("\n==============================")
    print("🧠 Generating Gemini Embedding")
    print("==============================")
    print("Text length:", len(text))

    try:
        response = client.models.embed_content(
            model="gemini-embedding-001",
            contents=text,
        )
        if response.embeddings and len(response.embeddings) > 0:
            values = response.embeddings[0].values
            if values:
                print("✅ Embedding generated")
                print("Vector length:", len(values))
                return values
        raise Exception("Empty embedding returned from Gemini")
    except Exception as e:
        print("❌ Gemini Embedding Error:", e)
        raise Exception(f"Failed to generate embedding: {str(e)}")


def generate_answer(prompt: str) -> str:
    """Generate LLM answer with Gemini and fallback to Featherless."""
    client = get_ai_client()

    # 1. Try Gemini primary provider
    if LLM_PROVIDER != "featherless" and client:
        try:
            print("🤖 Trying Gemini...")
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
            )
            if response.text:
                return response.text
        except Exception as error:
            print("⚠️ Gemini failed:", str(error))

    # 2. Featherless fallback
    featherless_key = os.getenv("FEATHERLESS_API_KEY", FEATHERLESS_API_KEY)
    if featherless_key:
        try:
            print("🚀 Switching to Featherless fallback...")
            headers = {
                "Authorization": f"Bearer {featherless_key}",
                "Content-Type": "application/json",
            }
            body = {
                "model": os.getenv("FEATHERLESS_MODEL", FEATHERLESS_MODEL),
                "messages": [{"role": "user", "content": prompt}],
            }
            resp = requests.post(
                "https://api.featherless.ai/v1/chat/completions",
                headers=headers,
                json=body,
                timeout=60,
            )
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"]
            else:
                print(f"❌ Featherless returned {resp.status_code}: {resp.text}")
        except Exception as fallback_err:
            print("❌ Featherless fallback also failed:", str(fallback_err))
            raise fallback_err

    raise Exception("All LLM generation providers failed.")
