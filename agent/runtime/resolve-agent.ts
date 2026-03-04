import type { AgentDefinition, ConversationState } from "../types.ts";

type UIMessageLike = {
  role: string;
  parts?: unknown;
  metadata?: unknown;
};

/**
 * Recursively walk the agent graph and build a flat name -> agent map.
 */
export function buildAgentRegistry(
  root: AgentDefinition,
): Map<string, AgentDefinition> {
  const registry = new Map<string, AgentDefinition>();

  function walk(agent: AgentDefinition) {
    if (registry.has(agent.name)) return;
    registry.set(agent.name, agent);
    if (agent.handoffs) {
      for (const child of agent.handoffs) {
        walk(child);
      }
    }
  }

  walk(root);
  return registry;
}

/**
 * Build a system prompt that includes the agent's instructions
 * plus context about available handoffs.
 */
export function buildSystemPrompt(agent: AgentDefinition): string {
  let prompt = agent.instructions;

  if (agent.handoffs && agent.handoffs.length > 0) {
    prompt += "\n\n## Available Handoffs\n";
    prompt += "You can delegate to these specialized agents by calling the corresponding transfer tool:\n";
    for (const target of agent.handoffs) {
      prompt += `\n- **${target.name}**: ${target.description} (use \`transfer_to_${target.name}\`)`;
    }
  }

  return prompt;
}

/**
 * Extract the tool name from a UI message part.
 * In AI SDK v6, tool parts have type `tool-${toolName}` or `dynamic-tool` with a `toolName` field.
 */
function toRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) return null;
  return value as Record<string, unknown>;
}

function getToolNameFromPart(part: unknown): string | null {
  const parsed = toRecord(part);
  if (!parsed || typeof parsed.type !== "string") return null;

  if (parsed.type === "dynamic-tool" && typeof parsed.toolName === "string") {
    return parsed.toolName;
  }
  if (parsed.type.startsWith("tool-")) {
    return parsed.type.slice(5);
  }
  return null;
}

/**
 * Scan message parts to determine which agent is currently active.
 * The last handoff in the conversation determines the active agent.
 */
export function extractConversationState(
  messages: UIMessageLike[],
  rootAgentName: string,
): ConversationState {
  let activeAgent = rootAgentName;

  for (const message of messages) {
    if (message.role === "assistant" && Array.isArray(message.parts)) {
      for (const part of message.parts) {
        const toolName = getToolNameFromPart(part);
        if (toolName && toolName.startsWith("transfer_to_")) {
          // Check if the tool result contains a handoff marker
          const p = toRecord(part);
          if (!p) continue;
          if (
            (p.state === "result" || p.state === "output-available") &&
            toRecord(p.output)
          ) {
            const output = toRecord(p.output)!;
            if (output.__handoff && typeof output.targetAgent === "string") {
              activeAgent = output.targetAgent;
            }
          }
        }
      }
    }

    // Also check metadata attached to messages
    const metadata = toRecord(message.metadata);
    if (metadata) {
      if (typeof metadata.handoffTarget === "string") {
        activeAgent = metadata.handoffTarget;
      } else if (
        toRecord(metadata.custom) &&
        typeof toRecord(metadata.custom)?.handoffTarget === "string"
      ) {
        activeAgent = String(toRecord(metadata.custom)?.handoffTarget);
      }
    }
  }

  return { activeAgent };
}
