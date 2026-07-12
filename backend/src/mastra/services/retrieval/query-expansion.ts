export function expandQueries(question: string): string[] {
  const normalized = question.trim();
  if (!normalized) {
    return [];
  }

  const baseTerms = normalized
    .replace(/[?.,!]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  const seeds = new Set<string>();
  seeds.add(normalized);

  const nounPhrase = baseTerms.slice(0, 8).join(" ");
  if (nounPhrase) {
    seeds.add(nounPhrase);
  }

  const keywords = baseTerms.filter((term) => term.length > 3);
  if (keywords.length > 1) {
    seeds.add(keywords.join(" "));
  }

  const variants = new Set<string>();
  for (const seed of seeds) {
    variants.add(seed);
    variants.add(`${seed} clause`);
    variants.add(`${seed} definition`);
    variants.add(`${seed} legal meaning`);
    variants.add(`${seed} obligations`);
    variants.add(`${seed} risk`);
  }

  if (normalized.toLowerCase().includes("confidential")) {
    variants.add("confidentiality clause");
    variants.add("disclosure obligations");
    variants.add("exceptions to confidentiality");
  }

  if (normalized.toLowerCase().includes("liability")) {
    variants.add("unlimited liability");
    variants.add("indemnity obligations");
  }

  return Array.from(variants).filter(Boolean).slice(0, 8);
}
