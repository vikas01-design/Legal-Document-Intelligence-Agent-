import { askLegalQuestion } from "./ask-legal-question";

async function main() {
  const result = await askLegalQuestion(
    "What is Confidential Information?"
  );

  console.log(JSON.stringify(result, null, 2));
}

main();