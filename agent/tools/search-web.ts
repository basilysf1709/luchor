import { z } from "zod";
import { defineTool } from "../define-tool.ts";

export const searchWeb = defineTool({
  name: "search_web",
  description:
    "Search the web for information on a given query. Returns a list of relevant results.",
  parameters: z.object({
    query: z.string().describe("The search query"),
  }),
  execute: async ({ query }) => {
    // Placeholder — replace with real search API
    return {
      results: [
        {
          title: `Result for "${query}"`,
          url: `https://example.com/search?q=${encodeURIComponent(query)}`,
          snippet: `This is a placeholder search result for "${query}". Connect a real search API for production use.`,
        },
      ],
    };
  },
});
