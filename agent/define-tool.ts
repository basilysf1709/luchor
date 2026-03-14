import type { z } from "zod";
import type { ToolDefinition, ToolExecutionContext } from "./types.ts";

export function defineTool<T extends z.ZodType>(config: {
  name: string;
  description: string;
  parameters: T;
  execute: (
    args: z.infer<T>,
    context?: ToolExecutionContext,
  ) => Promise<unknown>;
}): ToolDefinition<T> {
  return config;
}
