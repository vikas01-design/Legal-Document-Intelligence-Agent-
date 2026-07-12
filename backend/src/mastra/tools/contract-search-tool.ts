import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { searchContract } from "../services/qdrant/search";

export const contractSearchTool = createTool({
  id: "contract-search",
  description: "Search the uploaded legal contract and return the most relevant clauses with citations.",
  inputSchema: z.object({
    query: z.string().describe("The legal question or search query."),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        text: z.string(),
        score: z.number(),
        page: z.number(),
        section: z.string(),
        clause: z.string(),
        document: z.string(),
      })
    ),
  }),
  execute: async ({ query }) => {
    try {
      const results = await searchContract(query);
      return {
        results: results.map((result) => ({
          text: result.text,
          score: result.score,
          page: result.page,
          section: result.section,
          clause: result.clause,
          document: result.document,
        })),
      };
    } catch (error) {
      console.error("❌ contractSearchTool Error", error);
      return {
        results: [],
      };
    }
  },
});