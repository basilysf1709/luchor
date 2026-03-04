import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { orchestrator } from "./agents";
import {
  buildAgentRegistry,
  buildSystemPrompt,
  extractConversationState,
} from "./runtime";
import { resolveTools } from "./runtime/resolve-tools";

const registry = buildAgentRegistry(orchestrator);

function getHandoffTarget(output: unknown): string | null {
  if (typeof output !== "object" || output === null) return null;
  const parsed = output as Record<string, unknown>;
  if (parsed.__handoff !== true) return null;
  return typeof parsed.targetAgent === "string" ? parsed.targetAgent : null;
}

export async function createAgentChatResponse(messages: UIMessage[]) {
  const { activeAgent: activeAgentName } = extractConversationState(
    messages,
    orchestrator.name,
  );
  const activeAgent = registry.get(activeAgentName) ?? orchestrator;
  const tools = resolveTools(activeAgent);
  const systemPrompt = buildSystemPrompt(activeAgent);

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.write({
        type: "message-metadata",
        messageMetadata: { agentName: activeAgent.name },
      });

      const result = streamText({
        model: anthropic(activeAgent.model ?? "claude-3-haiku-20240307"),
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
