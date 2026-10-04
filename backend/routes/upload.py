"""Upload blueprint for handling document uploads and triggering background indexing."""

import os
import uuid
import tempfile
import threading
import logging
from flask import Blueprint, request, jsonify
from services.qdrant_service import background_upload_document

logger = logging.getLogger(__name__)

upload_bp = Blueprint("upload", __name__)


@upload_bp.route("/upload", methods=["POST"])
def upload_file():
    """Handle PDF file upload and launch async indexing."""
    print("\n========== NEW REQUEST ==========")
    print("Method:", request.method)
    print("URL:", request.url)
    print("Content-Type:", request.headers.get("content-type"))
    print("Files:", request.files)
    print("=================================\n")

    try:
        if "file" not in request.files:
            return jsonify({"success": False, "message": "No PDF uploaded"}), 400

        file = request.files["file"]
        if not file or file.filename == "":
            return jsonify({"success": False, "message": "No PDF uploaded"}), 400

        # Save to temporary file
        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, f"thinkdoc_{uuid.uuid4().hex}_{file.filename}")
        file.save(temp_path)

        print("✅ File uploaded successfully")
        print("Original Name:", file.filename)
        print("Stored Path:", temp_path)

        # Respond immediately to prevent gateway timeouts
        response_data = {
            "success": True,
            "filename": file.filename,
            "chunks": 0,
            "status": "processing",
        }

        # Start background indexing in a daemon thread
        thread = threading.Thread(
            target=background_upload_document,
            args=(temp_path, file.filename),
            daemon=True,
        )
        thread.start()

        return jsonify(response_data), 200

    except Exception as e:
        print("❌ Upload Error:", e)
        return jsonify({"success": False, "message": "Upload failed", "error": str(e)}), 500
