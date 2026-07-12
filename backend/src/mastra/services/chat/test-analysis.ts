import { analyzeContract } from "./analyze-contract";

async function main() {

  const result = await analyzeContract();

  console.log(result);

}

main();