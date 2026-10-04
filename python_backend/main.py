import os
import sys

# Ensure backend directory is in path and import app from backend/app.py
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import app, PORT

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=False)
