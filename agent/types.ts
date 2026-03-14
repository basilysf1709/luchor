import type { z } from "zod";

export type FeatureFlag = string;
export type AuthScope = string;

export interface AgentContext {
  userId: string | null;
  workspaceId: string | null;
  sessionId: string | null;
  taskType: string | null;
  featureFlags: FeatureFlag[];
  authScopes: AuthScope[];
  attachedCapabilityIds: string[];
  metadata?: Record<string, unknown>;
}

export interface ToolExecutionContext {
  agentContext: AgentContext;
  activeAgent: AgentDefinition;
  resolvedCapabilities: ResolvedCapabilityConfig;
}

export interface ToolDefinition<T extends z.ZodType = z.ZodType> {
  name: string;
  description: string;
  parameters: T;
  execute: (
    args: z.infer<T>,
    context?: ToolExecutionContext,
  ) => Promise<unknown>;
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
  capabilitySnapshot?: CapabilitySnapshot;
  activeCapabilityIds?: string[];
}

export interface ConversationState {
  activeAgent: string;
}

export type CapabilityKind =
  | "native-tool"
  | "mcp-server"
  | "skill"
  | "plugin"
  | "agent";

export interface CapabilityPolicy {
  conflictsWith?: string[];
  requiredFeatureFlags?: FeatureFlag[];
  requiredAuthScopes?: AuthScope[];
  allowWhenAttached?: boolean;
}

type EnabledWhenResult = boolean | Promise<boolean>;

export interface CapabilityBase {
  kind: CapabilityKind;
  id: string;
  priority?: number;
  appliesToAgents?: string[];
  metadata?: Record<string, unknown>;
  policy?: CapabilityPolicy;
  enabledWhen?: (context: AgentContext) => EnabledWhenResult;
}

export interface NativeToolCapability extends CapabilityBase {
  kind: "native-tool";
  tool: ToolDefinition;
}

export interface McpServerCapability extends CapabilityBase {
  kind: "mcp-server";
  server: {
    transport: "stdio" | "http" | "sse";
    url?: string;
    command?: string;
    args?: string[];
  };
  resolveTools?: (context: AgentContext) => Promise<ToolDefinition[]>;
}

export interface SkillCapability extends CapabilityBase {
  kind: "skill";
  instructions?: string;
  tools?: ToolDefinition[];
  handoffs?: AgentDefinition[];
  uiRenderers?: CapabilityUiRenderer[];
}

export interface PluginCapability extends CapabilityBase {
  kind: "plugin";
  instructions?: string;
  tools?: ToolDefinition[];
  handoffs?: AgentDefinition[];
  uiRenderers?: CapabilityUiRenderer[];
}

export interface AgentCapability extends CapabilityBase {
  kind: "agent";
  agent: AgentDefinition;
  role?: "root" | "specialist";
  persistAcrossTurns?: boolean;
}

export type CapabilityDefinition =
  | NativeToolCapability
  | McpServerCapability
  | SkillCapability
  | PluginCapability
  | AgentCapability;

export interface CapabilityUiRenderer {
  id: string;
  kind: string;
  sourceCapabilityId: string;
  metadata?: Record<string, unknown>;
}

export interface CapabilitySnapshotItem {
  id: string;
  kind: CapabilityKind;
  priority: number;
  metadata?: Record<string, unknown>;
}

export interface CapabilitySnapshot {
  items: CapabilitySnapshotItem[];
  activeAgent: string;
  uiRendererIds: string[];
}

export interface ResolvedCapabilityConfig {
  context: AgentContext;
  activeAgent: AgentDefinition;
  registry: Map<string, AgentDefinition>;
  tools: ToolDefinition[];
  instructions: string[];
  handoffs: AgentDefinition[];
  uiRenderers: CapabilityUiRenderer[];
  snapshot: CapabilitySnapshot;
}
