import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
} from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import type { UIMessage } from "ai";
import { orchestrator } from "@/lib/agents/agents";
import {
  buildAgentRegistry,
  buildSystemPrompt,
  extractConversationState,
  resolveTools,
} from "@/lib/agents/runtime";

const registry = buildAgentRegistry(orchestrator);

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const { activeAgent: activeAgentName } = extractConversationState(
    messages,
    orchestrator.name,
  );
  const activeAgent = registry.get(activeAgentName) ?? orchestrator;
  const tools = resolveTools(activeAgent);
  const systemPrompt = buildSystemPrompt(activeAgent);

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      // Write agent name as message metadata
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
          // Check for handoff markers in tool results
          for (const toolResult of toolResults) {
            const output = toolResult.output;
            if (
              typeof output === "object" &&
              output !== null &&
              "__handoff" in output
            ) {
              const handoff = output as unknown as {
                targetAgent: string;
                reason: string;
              };
              writer.write({
                type: "message-metadata",
                messageMetadata: {
                  agentName: handoff.targetAgent,
                  handoffTarget: handoff.targetAgent,
                },
              });
            }
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
