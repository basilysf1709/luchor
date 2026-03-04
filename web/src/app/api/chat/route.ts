import type { UIMessage } from "ai";
import { createAgentChatResponse } from "../../../../agent/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  return createAgentChatResponse(messages);
}
