import { jwtVerify } from "jose";
import type { AgentContext } from "./types.ts";

type RequestContextPayload = Partial<{
  workspaceId: string | null;
  sessionId: string | null;
  taskType: string | null;
  featureFlags: string[];
  authScopes: string[];
  attachedCapabilityIds: string[];
  metadata: Record<string, unknown>;
}>;

function getSecret() {
  const secret = process.env.AGENT_AUTH_SECRET;
  if (!secret) {
    throw new Error("AGENT_AUTH_SECRET is not set.");
  }

  return new TextEncoder().encode(secret);
}

function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === "string");
}

function toRecord(value: unknown): Record<string, unknown> | undefined {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  return value as Record<string, unknown>;
}

export async function verifyAgentToken(
  token: string,
): Promise<string | null> {
  const { payload } = await jwtVerify(token, getSecret(), {
    issuer: "luchor-web",
  });

  return typeof payload.sub === "string" ? payload.sub : null;
}

export function createAgentContext(
  payload?: RequestContextPayload,
  userId?: string | null,
): AgentContext {
  return {
    userId: userId ?? null,
    workspaceId: payload?.workspaceId ?? null,
    sessionId: payload?.sessionId ?? null,
    taskType: payload?.taskType ?? null,
    featureFlags: toStringList(payload?.featureFlags),
    authScopes: toStringList(payload?.authScopes),
    attachedCapabilityIds: toStringList(payload?.attachedCapabilityIds),
    metadata: toRecord(payload?.metadata),
  };
}
