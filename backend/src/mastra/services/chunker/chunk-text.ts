function looksLikeHeading(line: string) {
  const normalized = line.trim();
  return /^(section|article|clause|part|chapter|heading|sub-heading)\b/i.test(normalized) || /^([IVXLC]+|\d+(?:\.\d+)*)\s*([.):-]|$)/.test(normalized);
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

  return blocks.filter((block) => block.length > 40);
}