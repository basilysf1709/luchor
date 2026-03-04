import type { z } from "zod";
import type { ToolDefinition } from "./types";

export function defineTool<T extends z.ZodType>(config: {
  name: string;
  description: string;
  parameters: T;
  execute: (args: z.infer<T>) => Promise<unknown>;
}): ToolDefinition<T> {
  return config;
}
