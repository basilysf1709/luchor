import { z } from "zod";
import { generateText, stepCountIs } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { defineTool } from "../define-tool.ts";
import { deepResearcher } from "../agents/deep-researcher.ts";
import { createTask, completeTask, failTask } from "../task-store.ts";

export const startDeepResearch = defineTool({
  name: "start_deep_research",
  description:
    "Launch a deep research sub-agent in the background. Returns a task ID immediately. Use check_research_status to poll for the result.",
  parameters: z.object({
    query: z
      .string()
      .min(1)
      .describe("The research question or topic to investigate in depth."),
    context: z
      .string()
      .optional()
      .describe("Optional additional context to guide the research."),
  }),
  execute: async ({ query, context }) => {
    const task = createTask(query);

    const prompt = context
      ? `Research topic: ${query}\n\nAdditional context: ${context}`
      : `Research topic: ${query}`;

    // Fire and forget — runs in the background
    generateText({
      model: anthropic(deepResearcher.model ?? "claude-sonnet-4-5"),
      system: deepResearcher.instructions,
      prompt,
      stopWhen: stepCountIs(deepResearcher.maxSteps ?? 10),
    })
      .then((result) => {
        completeTask(task.id, result.text);
      })
      .catch((err) => {
        failTask(task.id, err instanceof Error ? err.message : String(err));
      });

    return {
      taskId: task.id,
      status: "running",
      message: `Deep research started. Use check_research_status with task ID "${task.id}" to get results.`,
    };
  },
});
