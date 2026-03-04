import type { z } from "zod";

export interface ToolDefinition<T extends z.ZodType = z.ZodType> {
  name: string;
  description: string;
  parameters: T;
  execute: (args: z.infer<T>) => Promise<unknown>;
}

export interface AgentDefinition {
  name: string;
  description: string;
  instructions: string;
  model?: string;
  tools?: ToolDefinition[];
  handoffs?: AgentDefinition[];
  maxSteps?: number;
}

export interface MessageMetadata {
  agentName?: string;
  handoffTarget?: string;
}

export interface ConversationState {
  activeAgent: string;
}
