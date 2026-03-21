import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import {
  buildSystemPrompt,
  extractConversationState,
} from "./runtime/index.ts";
import { resolveTools } from "./runtime/resolve-tools.ts";
import { resolveCapabilities } from "./capabilities/index.ts";
import type { AgentContext, CapabilityDefinition } from "./types.ts";
import { getComposioTools } from "./composio.ts";

function getHandoffTarget(output: unknown): string | null {
  if (typeof output !== "object" || output === null) return null;
  const parsed = output as Record<string, unknown>;
  if (parsed.__handoff !== true) return null;
  return typeof parsed.targetAgent === "string" ? parsed.targetAgent : null;
}

type CreateAgentChatResponseOptions = {
  messages: UIMessage[];
  context: AgentContext;
  additionalCapabilities?: CapabilityDefinition[];
};

export async function createAgentChatResponse({
  messages,
  context,
  additionalCapabilities,
}: CreateAgentChatResponseOptions) {
  const conversationState = extractConversationState(messages, "orchestrator");
  const resolvedCapabilities = await resolveCapabilities({
    context,
    activeAgentName: conversationState.activeAgent,
    additionalCapabilities,
  });
  const activeAgent = resolvedCapabilities.activeAgent;
  const dslTools = resolveTools(activeAgent, resolvedCapabilities);
  const composioTools = await getComposioTools(
    context.userId ?? "default-user",
  );
  const tools = { ...dslTools, ...composioTools };
  const systemPrompt = buildSystemPrompt(activeAgent);

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.write({
        type: "message-metadata",
        messageMetadata: {
          agentName: activeAgent.name,
          capabilitySnapshot: resolvedCapabilities.snapshot,
          activeCapabilityIds: resolvedCapabilities.snapshot.items.map(
            (item) => item.id,
          ),
        },
      });

      const result = streamText({
        model: anthropic(activeAgent.model ?? "claude-sonnet-4-5"),
        system: systemPrompt,
        messages: await convertToModelMessages(messages),
        tools,
        stopWhen: stepCountIs(activeAgent.maxSteps ?? 5),
        onStepFinish: ({ toolResults }) => {
          for (const toolResult of toolResults) {
            const handoffTarget = getHandoffTarget(toolResult.output);
            if (!handoffTarget) continue;
            writer.write({
              type: "message-metadata",
              messageMetadata: {
                agentName: handoffTarget,
                handoffTarget,
                capabilitySnapshot: resolvedCapabilities.snapshot,
                activeCapabilityIds: resolvedCapabilities.snapshot.items.map(
                  (item) => item.id,
                ),
              },
            });
          }
        },
      });

      writer.merge(result.toUIMessageStream());
    },
    onError: (error) => {
      console.error("Chat stream error:", error);
      return "An error occurred while processing your request.";
    },
  });

  return createUIMessageStreamResponse({ stream });
}
