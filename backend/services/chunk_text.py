"""Chunking and metadata inference service for legal documents."""

import re
from datetime import datetime, timezone
from typing import List, Dict, Any


def looks_like_heading(line: str) -> bool:
    """Check if a line looks like a legal clause or section heading."""
    normalized = line.strip()
    return bool(
        re.search(
            r"^(section|article|clause|part|chapter|heading|sub-heading)\b",
            normalized,
            re.IGNORECASE,
        )
        or re.search(r"^([IVXLC]+|\d+(?:\.\d+)*)\s*([.):-]|$)", normalized)
    )


def split_long_block(block: str, max_length: int = 2000) -> List[str]:
    """Split blocks longer than max_length on sentence or word boundaries."""
    if len(block) <= max_length:
        return [block]

    sub_blocks: List[str] = []
    remaining = block

    while len(remaining) > 0:
        if len(remaining) <= max_length:
            sub_blocks.append(remaining)
            break

        split_idx = remaining.rfind(". ", 0, max_length)
        if split_idx == -1:
            split_idx = remaining.rfind(" ", 0, max_length)
        if split_idx == -1:
            split_idx = max_length

        sub_blocks.append(remaining[: split_idx + 1].strip())
        remaining = remaining[split_idx + 1 :].strip()

    return sub_blocks


def chunk_text(text: str) -> List[str]:
    """Chunk document text with heading-awareness and size limits."""
    normalized = text.replace("\r\n", "\n").strip()
    if not normalized:
        return []

    lines = [line.strip() for line in normalized.split("\n") if line.strip()]
    blocks: List[str] = []
    current: List[str] = []

    for line in lines:
        if looks_like_heading(line) and len(current) > 0:
            block = " ".join(current).strip()
            if block:
                blocks.append(block)
            current = [line]
            continue
        current.append(line)

    tail = " ".join(current).strip()
    if tail:
        blocks.append(tail)

    final_chunks: List[str] = []
    for block in blocks:
        sub_chunks = split_long_block(block, 2000)
        final_chunks.extend(sub_chunks)

    # Filter out extremely small fragments
    return [b for b in final_chunks if len(b) > 40]


def infer_metadata(text: str, pdf_name: str, chunk_number: int) -> Dict[str, Any]:
    """Extract metadata (section, clause, heading, tokens) from chunk text."""
    section_match = re.search(
        r"(?:^|\n)(section|article|clause|part|chapter)\s*[:#-]?\s*([A-Za-z0-9.()/-]+)",
        text,
        re.IGNORECASE,
    )
    heading_match = re.search(r"(?:^|\n)([A-Z][A-Za-z0-9 &(),.-]{2,})", text)
    clause_match = re.search(r"clause\s*([A-Za-z0-9.()/-]+)", text, re.IGNORECASE)

    return {
        "text": text,
        "document": pdf_name,
        "page": 0,
        "section": section_match.group(2) if section_match else "",
        "clause": clause_match.group(1) if clause_match else "",
        "heading": heading_match.group(1) if heading_match else "",
        "chunkNumber": chunk_number,
        "tokenCount": len(re.findall(r"\S+", text)),
        "uploadTime": datetime.now(timezone.utc).isoformat(),
    }
