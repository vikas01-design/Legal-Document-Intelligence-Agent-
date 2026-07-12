function looksLikeHeading(line: string) {
  const normalized = line.trim();
  return /^(section|article|clause|part|chapter|heading|sub-heading)\b/i.test(normalized) || /^([IVXLC]+|\d+(?:\.\d+)*)\s*([.):-]|$)/.test(normalized);
}

function splitLongBlock(block: string, maxLength = 2000): string[] {
  if (block.length <= maxLength) return [block];
  
  const subBlocks: string[] = [];
  let remaining = block;
  
  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      subBlocks.push(remaining);
      break;
    }
    
    // Find a good split point (sentence boundary or word boundary)
    let splitIdx = remaining.lastIndexOf(". ", maxLength);
    if (splitIdx === -1) {
      splitIdx = remaining.lastIndexOf(" ", maxLength);
    }
    if (splitIdx === -1) {
      splitIdx = maxLength;
    }
    
    subBlocks.push(remaining.substring(0, splitIdx + 1).trim());
    remaining = remaining.substring(splitIdx + 1).trim();
  }
  
  return subBlocks;
}

export function chunkText(text: string) {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return [];
  }

  const lines = normalized.split("\n").map((line) => line.trim()).filter(Boolean);
  const blocks: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (looksLikeHeading(line) && current.length > 0) {
      const block = current.join(" ").trim();
      if (block) {
        blocks.push(block);
      }
      current = [line];
      continue;
    }

    current.push(line);
  }

  const tail = current.join(" ").trim();
  if (tail) {
    blocks.push(tail);
  }

  // Split any blocks that are too long to ensure precise embeddings
  const finalChunks: string[] = [];
  for (const block of blocks) {
    const subChunks = splitLongBlock(block, 2000);
    finalChunks.push(...subChunks);
  }

  return finalChunks.filter((block) => block.length > 40);
}