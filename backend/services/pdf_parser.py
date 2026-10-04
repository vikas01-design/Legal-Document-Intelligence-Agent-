"""PDF text extraction service using pypdf."""

import logging
from pypdf import PdfReader

logger = logging.getLogger(__name__)


def extract_pdf_text(file_path: str) -> str:
    """Extract text from a PDF file using pypdf.
    
    Args:
        file_path: Absolute or relative path to the PDF file.
        
    Returns:
        Extracted text as a string.
    """
    try:
        reader = PdfReader(file_path)
        text_parts = []
        for idx, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            text_parts.append(page_text)
        return "\n".join(text_parts)
    except Exception as e:
        logger.error(f"Error extracting text from PDF {file_path}: {e}")
        raise e
