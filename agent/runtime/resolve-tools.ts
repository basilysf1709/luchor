import type { ToolSet } from "ai";
import type { AgentDefinition } from "../types.ts";
import { z } from "zod";

export function resolveTools(agent: AgentDefinition): ToolSet {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tools: Record<string, any> = {};

  // Convert DSL tool definitions to AI SDK tools
  if (agent.tools) {
    for (const t of agent.tools) {
      tools[t.name] = {
        description: t.description,
        inputSchema: t.parameters,
        execute: t.execute,
      };
    }
  }

  // Convert handoffs to transfer tools
  if (agent.handoffs) {
    for (const target of agent.handoffs) {
      const schema = z.object({
        reason: z
          .string()
          .describe("Brief explanation of why you are handing off to this agent"),
      });
      tools[`transfer_to_${target.name}`] = {
        description: `Hand off the conversation to the ${target.name} agent. ${target.description}`,
        inputSchema: schema,
        execute: async (input: z.infer<typeof schema>) => {
          return {
            __handoff: true,
            targetAgent: target.name,
            reason: input.reason,
          };
        },
      };
    }
  }

  return tools;
}
