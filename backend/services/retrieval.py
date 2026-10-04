"""Hybrid semantic retrieval service with query expansion and vector search."""

import re
from typing import List, Dict, Any
from services.embeddings import generate_embedding
from services.qdrant_service import get_qdrant_client, in_memory_docs, COLLECTION_NAME


def expand_queries(question: str) -> List[str]:
    """Query expansion to enrich retrieval seeds with legal terminology."""
    normalized = question.strip()
    if not normalized:
        return []

    base_terms = [t for t in re.sub(r"[?.,!]", "", normalized).split() if t]
    seeds = {normalized}

    noun_phrase = " ".join(base_terms[:8])
    if noun_phrase:
        seeds.add(noun_phrase)

    keywords = [term for term in base_terms if len(term) > 3]
    if len(keywords) > 1:
        seeds.add(" ".join(keywords))

    variants = set()
    for seed in seeds:
        variants.add(seed)
        variants.add(f"{seed} clause")
        variants.add(f"{seed} definition")
        variants.add(f"{seed} legal meaning")
        variants.add(f"{seed} obligations")
        variants.add(f"{seed} risk")

    if "confidential" in normalized.lower():
        variants.add("confidentiality clause")
        variants.add("disclosure obligations")
        variants.add("exceptions to confidentiality")

    if "liability" in normalized.lower():
        variants.add("unlimited liability")
        variants.add("indemnity obligations")

    return [v for v in variants if v][:8]


def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Calculate cosine similarity between two vector lists."""
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    dot = sum(a * b for a, b in zip(v1, v2))
    mag1 = sum(a * a for a in v1) ** 0.5
    mag2 = sum(b * b for b in v2) ** 0.5
    if mag1 == 0 or mag2 == 0:
        return 0.0
    return dot / (mag1 * mag2)


def retrieve_relevant_chunks(question: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """Hybrid semantic search across Qdrant vectors with query expansion and in-memory fallback."""
    try:
        expanded = expand_queries(question)
        queries = list(dict.fromkeys([question] + expanded))[:3]
        all_matches = []
        client = get_qdrant_client()

        for q in queries:
            try:
                emb = generate_embedding(q)
            except Exception as e:
                print(f"⚠️ Embedding generation failed for '{q}': {e}")
                continue

            searched_qdrant = False
            if client:
                try:
                    response = client.query_points(
                        collection_name=COLLECTION_NAME,
                        query=emb,
                        limit=top_k,
                        with_payload=True,
                        with_vectors=False,
                    )
                    points = response.points or []
                    for point in points:
                        payload = point.payload or {}
                        all_matches.append({
                            "text": str(payload.get("text", "")),
                            "score": float(point.score or 0),
                            "page": int(payload.get("page", 0)),
                            "section": str(payload.get("section", "")),
                            "clause": str(payload.get("clause", "")),
                            "document": str(payload.get("document", payload.get("source", "Unknown"))),
                            "chunkNumber": int(payload.get("chunkNumber", 0)),
                        })
                    searched_qdrant = True
                except Exception as q_err:
                    print(f"⚠️ Qdrant search query failed: {q_err}")

            # Fallback to in-memory docs if Qdrant was offline or returned no points
            if not searched_qdrant or len(all_matches) == 0:
                for doc in in_memory_docs:
                    doc_vec = doc.get("vector")
                    payload = doc.get("payload", {})
                    if doc_vec:
                        score = cosine_similarity(emb, doc_vec)
                        all_matches.append({
                            "text": str(payload.get("text", "")),
                            "score": float(score),
                            "page": int(payload.get("page", 0)),
                            "section": str(payload.get("section", "")),
                            "clause": str(payload.get("clause", "")),
                            "document": str(payload.get("document", "Unknown")),
                            "chunkNumber": int(payload.get("chunkNumber", 0)),
                        })

        # Deduplicate
        unique = {}
        for item in all_matches:
            key = f"{item['document']}:{item['page']}:{item['section']}:{item['clause']}:{item['text']}".lower()
            if key not in unique:
                unique[key] = item

        deduped = list(unique.values())
        deduped.sort(key=lambda x: x["score"], reverse=True)
        return deduped[:top_k]
    except Exception as error:
        print("❌ Retrieval failed:", error)
        return []
