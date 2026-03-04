import type { AgentDefinition, ToolDefinition } from "./types";

export function defineAgent(config: {
  name: string;
  description: string;
  instructions: string;
  model?: string;
  tools?: ToolDefinition[];
  handoffs?: AgentDefinition[];
  maxSteps?: number;
}): AgentDefinition {
  return {
    maxSteps: 5,
    ...config,
  };
}
