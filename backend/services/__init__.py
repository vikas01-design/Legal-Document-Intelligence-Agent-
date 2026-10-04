"""Services package for Legal Document Intelligence Agent."""

from services.pdf_parser import extract_pdf_text
from services.chunk_text import chunk_text, infer_metadata
from services.embeddings import generate_embedding, generate_answer
from services.enkrypt_guardrails import check_prompt
from services.qdrant_service import (
    ensure_qdrant_collection,
    upload_document_to_qdrant,
    background_upload_document,
    get_entire_contract,
    get_qdrant_client,
)
from services.retrieval import retrieve_relevant_chunks
from services.contract_analyzer import classify_document, analyze_contract_risks
from services.legal_pipeline import run_legal_pipeline

__all__ = [
    "extract_pdf_text",
    "chunk_text",
    "infer_metadata",
    "generate_embedding",
    "generate_answer",
    "check_prompt",
    "ensure_qdrant_collection",
    "upload_document_to_qdrant",
    "background_upload_document",
    "get_entire_contract",
    "get_qdrant_client",
    "retrieve_relevant_chunks",
    "classify_document",
    "analyze_contract_risks",
    "run_legal_pipeline",
]
