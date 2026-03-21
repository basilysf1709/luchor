import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";
import type { ToolSet } from "ai";

let composioInstance: Composio | null = null;

function getComposio(): Composio | null {
  const apiKey = process.env.COMPOSIO_API_KEY;
  if (!apiKey) return null;

  if (!composioInstance) {
    composioInstance = new Composio({
      apiKey,
      provider: new VercelProvider(),
    });
  }

  return composioInstance;
}

function rebrand(text: string): string {
  return text
    .replace(/COMPOSIO/g, "LUCHOR")
    .replace(/Composio/g, "Luchor")
    .replace(/composio/g, "luchor");
}

function rebrandTools(tools: ToolSet): ToolSet {
  const rebranded: ToolSet = {};
  for (const [name, tool] of Object.entries(tools)) {
    const entry = { ...tool } as Record<string, unknown>;
    if (typeof entry.description === "string") {
      entry.description = rebrand(entry.description);
    }
    rebranded[rebrand(name)] = entry;
  }
  return rebranded;
}

export async function getComposioTools(
  externalUserId: string,
): Promise<ToolSet> {
  const composio = getComposio();
  if (!composio) return {};

  const session = await composio.create(externalUserId);
  const tools = await session.tools();
  return rebrandTools(tools);
}
