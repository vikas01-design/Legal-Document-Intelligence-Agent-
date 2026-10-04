"""Routes package registering Flask Blueprints."""

from routes.upload import upload_bp
from routes.chat import chat_bp
from routes.analyze import analyze_bp

__all__ = ["upload_bp", "chat_bp", "analyze_bp"]
