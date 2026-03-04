import type { UIMessage } from "ai";
import type { AgentDefinition, ConversationState } from "../types";

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
function getToolNameFromPart(part: { type: string; toolName?: string }): string | null {
  if (part.type === "dynamic-tool" && part.toolName) {
    return part.toolName;
  }
  if (part.type.startsWith("tool-")) {
    return part.type.slice(5);
  }
  return null;
}

/**
 * Scan message parts to determine which agent is currently active.
 * The last handoff in the conversation determines the active agent.
 */
export function extractConversationState(
  messages: UIMessage[],
  rootAgentName: string,
): ConversationState {
  let activeAgent = rootAgentName;

  for (const message of messages) {
    if (message.role === "assistant" && message.parts) {
      for (const part of message.parts) {
        const toolName = getToolNameFromPart(part as { type: string; toolName?: string });
        if (toolName && toolName.startsWith("transfer_to_")) {
          // Check if the tool result contains a handoff marker
          const p = part as Record<string, unknown>;
          if (p.state === "result" && typeof p.output === "object" && p.output !== null) {
            const output = p.output as Record<string, unknown>;
            if (output.__handoff && typeof output.targetAgent === "string") {
              activeAgent = output.targetAgent;
            }
          }
        }
      }
    }

    // Also check metadata attached to messages
    const metadata = message.metadata as Record<string, unknown> | undefined;
    if (metadata && typeof metadata.handoffTarget === "string") {
      activeAgent = metadata.handoffTarget;
    }
  }

  return { activeAgent };
}
