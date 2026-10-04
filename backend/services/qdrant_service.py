"""Qdrant Vector Database Service."""

import os
import time
import logging
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels

from services.pdf_parser import extract_pdf_text
from services.chunk_text import chunk_text, infer_metadata
from services.embeddings import generate_embedding

load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

logger = logging.getLogger(__name__)

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
COLLECTION_NAME = "legal-documents"

# Initialize Qdrant client
qdrant_client: Optional[QdrantClient] = None
if QDRANT_URL and QDRANT_API_KEY:
    try:
        qdrant_client = QdrantClient(
            url=QDRANT_URL,
            api_key=QDRANT_API_KEY,
            prefer_grpc=False,
            timeout=10,
        )
        print("✅ Qdrant client initialized")
    except Exception as e:
        print(f"⚠️ Failed to initialize Qdrant Client: {e}")

# In-memory document storage fallback in case remote Qdrant cluster is unreachable
in_memory_docs: List[Dict[str, Any]] = []


def get_qdrant_client() -> Optional[QdrantClient]:
    """Get the active QdrantClient instance."""
    global qdrant_client
    if qdrant_client is None:
        url = os.getenv("QDRANT_URL")
        key = os.getenv("QDRANT_API_KEY")
        if url and key:
            try:
                qdrant_client = QdrantClient(url=url, api_key=key, prefer_grpc=False, timeout=10)
            except Exception as e:
                logger.warning(f"Failed to initialize Qdrant client: {e}")
    return qdrant_client


def ensure_qdrant_collection(collection_name: str = COLLECTION_NAME):
    """Ensure the Qdrant collection exists with cosine distance and 3072 vector dimension."""
    client = get_qdrant_client()
    if not client:
        return
    try:
        collections = client.get_collections().collections
        exists = any(c.name == collection_name for c in collections)
        if not exists:
            client.create_collection(
                collection_name=collection_name,
                vectors_config=qmodels.VectorParams(
                    size=3072,
                    distance=qmodels.Distance.COSINE,
                ),
            )
            print(f"✅ Qdrant collection '{collection_name}' created!")
    except Exception as e:
        print(f"⚠️ Note on Qdrant collection status: {e}")


def upload_document_to_qdrant(file_path: str, original_filename: str) -> Dict[str, Any]:
    """Extract, chunk, embed, and store document in Qdrant with in-memory fallback."""
    global in_memory_docs
    try:
        print("📄 Reading PDF...")
        text = extract_pdf_text(file_path)

        print("✂️ Chunking document...")
        chunks = chunk_text(text)
        print(f"✅ {len(chunks)} chunks created\n")

        points = []
        new_mem_docs = []
        batch_size = 5

        for i in range(0, len(chunks), batch_size):
            batch = chunks[i : i + batch_size]
            print(f"Embedding chunks {i + 1} to {min(i + batch_size, len(chunks))} of {len(chunks)}...")

            for index, chunk in enumerate(batch):
                chunk_idx = i + index
                try:
                    embedding = generate_embedding(chunk)
                except Exception as emb_err:
                    print(f"⚠️ Failed to embed chunk {chunk_idx + 1}: {emb_err}")
                    embedding = []

                payload = infer_metadata(chunk, original_filename, chunk_idx + 1)
                point_id = int(time.time() * 1000) + chunk_idx

                if embedding:
                    points.append(
                        qmodels.PointStruct(
                            id=point_id,
                            vector=embedding,
                            payload=payload,
                        )
                    )
                new_mem_docs.append({
                    "id": point_id,
                    "vector": embedding,
                    "payload": payload,
                })

            if i + batch_size < len(chunks):
                time.sleep(0.2)

        client = get_qdrant_client()
        if client and points:
            try:
                print("\n⬆️ Uploading vectors to Qdrant...")
                ensure_qdrant_collection(COLLECTION_NAME)
                client.upsert(
                    collection_name=COLLECTION_NAME,
                    points=points,
                    wait=True,
                )
                print("✅ Uploaded to Qdrant!")
            except Exception as q_err:
                print(f"⚠️ Qdrant upload failed (will use memory store): {q_err}")

        # Update in-memory fallback
        in_memory_docs = new_mem_docs
        print("🎉 Document Indexing Complete!\n")

        return {
            "success": True,
            "filename": original_filename,
            "chunks": len(chunks),
        }
    except Exception as e:
        print("❌ Indexing failed:", e)
        raise e
    finally:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass


def background_upload_document(file_path: str, original_filename: str):
    """Thread target for asynchronous background indexing."""
    try:
        upload_document_to_qdrant(file_path, original_filename)
    except Exception as e:
        print(f"❌ Background indexing encountered error: {e}")


def get_entire_contract(collection_name: str = COLLECTION_NAME) -> str:
    """Retrieve all chunks of the contract in order, checking Qdrant then in-memory fallback."""
    client = get_qdrant_client()
    if client:
        try:
            scroll_res = client.scroll(
                collection_name=collection_name,
                limit=100,
                with_payload=True,
                with_vectors=False,
            )
            points = scroll_res[0] if scroll_res else []
            if points:
                sorted_points = sorted(points, key=lambda p: int(p.payload.get("chunkNumber", 0)))
                return "\n\n".join(str(p.payload.get("text", "")) for p in sorted_points)
        except Exception as e:
            print("⚠️ Failed to scroll contract from Qdrant:", e)

    # In-memory fallback
    if in_memory_docs:
        sorted_mem = sorted(in_memory_docs, key=lambda d: int(d.get("payload", {}).get("chunkNumber", 0)))
        return "\n\n".join(str(d.get("payload", {}).get("text", "")) for d in sorted_mem)

    return ""
