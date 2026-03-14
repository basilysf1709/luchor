import { z } from "zod";
import { generateText, stepCountIs } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { defineTool } from "../define-tool.ts";
import { planner } from "../agents/planner.ts";

export const createPlan = defineTool({
  name: "create_plan",
  description:
    "Break down a task into an ordered list of steps before executing. Call this first for any multi-step or complex request so you have a clear plan to follow.",
  parameters: z.object({
    task: z
      .string()
      .min(1)
      .describe("The full user request or task to plan for."),
    context: z
      .string()
      .optional()
      .describe("Optional context such as constraints, preferences, or prior conversation details."),
  }),
  execute: async ({ task, context }) => {
    const prompt = context
      ? `Task: ${task}\n\nContext: ${context}`
      : `Task: ${task}`;

    const result = await generateText({
      model: anthropic(planner.model ?? "claude-sonnet-4-5"),
      system: planner.instructions,
      prompt,
      stopWhen: stepCountIs(planner.maxSteps ?? 1),
    });

    return {
      plan: result.text,
    };
  },
});
