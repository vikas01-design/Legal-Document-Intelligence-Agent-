import { contractSearchTool } from "./contract-search-tool";

async function main() {
  const tool = contractSearchTool as typeof contractSearchTool & {
    execute: (args: { query: string }, runtimeContext?: unknown) => Promise<unknown>;
  };

  const result = await tool.execute({
    query: "What is Confidential Information?",
  });

  console.log(result);
}

main();