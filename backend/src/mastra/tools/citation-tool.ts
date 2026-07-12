export interface EvidenceCitation {
  text: string;
  score: number;
  page: number;
  section: string;
  clause: string;
  document: string;
}

export function buildCitations(results: EvidenceCitation[]) {
  return results.slice(0, 5).map((result) => ({
    text: result.text,
    score: result.score,
    page: result.page,
    section: result.section,
    clause: result.clause,
    document: result.document,
    chunk: 1,
  }));
}
