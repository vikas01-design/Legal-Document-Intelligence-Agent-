export function cleanAnswer(text: string) {
  return text
    .replace(/```markdown/g, "")
    .replace(/```/g, "")
    .trim();
}