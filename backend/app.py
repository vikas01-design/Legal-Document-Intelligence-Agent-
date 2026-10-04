"""Legal Document Intelligence Agent - Flask Application Entrypoint."""

import sys
import os
import logging
from dotenv import load_dotenv

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

from flask import Flask, jsonify, send_from_directory, send_file
from flask_cors import CORS

from routes.upload import upload_bp
from routes.chat import chat_bp
from routes.analyze import analyze_bp
from services.qdrant_service import ensure_qdrant_collection

# Configuration
PORT = int(os.getenv("PORT", 3001))
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
ENKRYPT_API_KEY = os.getenv("ENKRYPT_API_KEY")
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini")

# Initialize Flask app
app = Flask(__name__)

# Configure CORS to allow requests from the frontend (same allowedOrigins as Node server)
allowed_origins = [
    "https://lexora-ai-app.onrender.com",
    # Vercel deployments — update with your actual Vercel URL after first deploy
    "https://legal-document-agent.vercel.app",
    "https://legal-document-intelligence-agent.vercel.app",
    # Allow all vercel.app preview deployments
    r"https://.*\.vercel\.app",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:4173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
)

# Register Blueprints
app.register_blueprint(upload_bp)
app.register_blueprint(chat_bp)
app.register_blueprint(analyze_bp)

# Ensure Qdrant collection is ready
ensure_qdrant_collection()

# Health check route
@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "Legal Document Intelligence API Running"}), 200

# Static file serving for production React frontend
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "frontend", "dist"))

@app.route("/assets/<path:filename>")
def serve_assets(filename):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        return send_from_directory(assets_dir, filename)
    return jsonify({"error": "Assets not found"}), 404

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_spa(path):
    # Don't serve index.html for API-like paths
    if path.startswith("upload") or path.startswith("chat") or path.startswith("analyze") or path.startswith("api"):
        return jsonify({"error": "Not found"}), 404

    file_path = os.path.join(frontend_dist, path)
    if path and os.path.exists(file_path) and os.path.isfile(file_path):
        return send_from_directory(frontend_dist, path)

    index_file = os.path.join(frontend_dist, "index.html")
    if os.path.exists(index_file):
        return send_file(index_file)

    return jsonify({"status": "ThinkDoc Python Flask Backend Running. Frontend dist not found."}), 200


if __name__ == "__main__":
    print("================================")
    print("Environment Check")
    print("GOOGLE_API_KEY:", "Loaded ✅" if GOOGLE_API_KEY else "Missing ❌")
    print("QDRANT_URL:", "Loaded ✅" if QDRANT_URL else "Missing ❌")
    print("QDRANT_API_KEY:", "Loaded ✅" if QDRANT_API_KEY else "Missing ❌")
    print("ENKRYPT_API_KEY:", "Loaded ✅" if ENKRYPT_API_KEY else "Missing ❌")
    print("================================")
    print("LLM Provider:", LLM_PROVIDER or "gemini (default)")
    print("Frontend dist:", frontend_dist)
    print(f"🚀 ThinkDoc Flask Server running on port {PORT}")

    app.run(host="0.0.0.0", port=PORT, debug=False)
