import type {
  AgentContext,
  AgentDefinition,
  CapabilityDefinition,
  CapabilitySnapshot,
  CapabilitySnapshotItem,
  CapabilityUiRenderer,
  ResolvedCapabilityConfig,
  ToolDefinition,
} from "../types.ts";
import { buildAgentRegistry } from "../runtime/resolve-agent.ts";
import { getBuiltinCapabilities } from "./catalog.ts";

type ResolveCapabilitiesOptions = {
  context: AgentContext;
  activeAgentName?: string | null;
  additionalCapabilities?: CapabilityDefinition[];
};

function byPriorityDesc(
  left: CapabilityDefinition,
  right: CapabilityDefinition,
): number {
  return (right.priority ?? 0) - (left.priority ?? 0);
}

function uniqueAgents(agents: AgentDefinition[]): AgentDefinition[] {
  const deduped = new Map<string, AgentDefinition>();

  for (const agent of agents) {
    if (!deduped.has(agent.name)) {
      deduped.set(agent.name, agent);
    }
  }

  return [...deduped.values()];
}

function uniqueTools(tools: ToolDefinition[]): ToolDefinition[] {
  const deduped = new Map<string, ToolDefinition>();

  for (const tool of tools) {
    if (!deduped.has(tool.name)) {
      deduped.set(tool.name, tool);
    }
  }

  return [...deduped.values()];
}

function uniqueRenderers(renderers: CapabilityUiRenderer[]): CapabilityUiRenderer[] {
  const deduped = new Map<string, CapabilityUiRenderer>();

  for (const renderer of renderers) {
    if (!deduped.has(renderer.id)) {
      deduped.set(renderer.id, renderer);
    }
  }

  return [...deduped.values()];
}

function capabilityAppliesToAgent(
  capability: CapabilityDefinition,
  agentName: string,
): boolean {
  if (!capability.appliesToAgents || capability.appliesToAgents.length === 0) {
    return true;
  }

  return capability.appliesToAgents.includes(agentName);
}

function isExplicitlyAttached(
  capability: CapabilityDefinition,
  context: AgentContext,
): boolean {
  return context.attachedCapabilityIds.includes(capability.id);
}

async function isEnabled(
  capability: CapabilityDefinition,
  context: AgentContext,
): Promise<boolean> {
  const requiredFeatureFlags = capability.policy?.requiredFeatureFlags ?? [];
  if (
    requiredFeatureFlags.some((flag) => !context.featureFlags.includes(flag))
  ) {
    return false;
  }

  const requiredAuthScopes = capability.policy?.requiredAuthScopes ?? [];
  if (
    requiredAuthScopes.some((scope) => !context.authScopes.includes(scope))
  ) {
    return false;
  }

  if (capability.policy?.allowWhenAttached && !isExplicitlyAttached(capability, context)) {
    return false;
  }

  if (!capability.enabledWhen) {
    return true;
  }

  return Boolean(await capability.enabledWhen(context));
}

function resolveConflicts(
  capabilities: CapabilityDefinition[],
): CapabilityDefinition[] {
  const accepted: CapabilityDefinition[] = [];

  for (const capability of capabilities) {
    const rejectedByExisting = accepted.some((candidate) =>
      (candidate.policy?.conflictsWith ?? []).includes(capability.id),
    );
    if (rejectedByExisting) {
      continue;
    }

    const conflictsWithExisting = accepted.some((candidate) =>
      (capability.policy?.conflictsWith ?? []).includes(candidate.id),
    );
    if (conflictsWithExisting) {
      continue;
    }

    accepted.push(capability);
  }

  return accepted;
}

async function resolveMcpTools(
  capability: CapabilityDefinition,
  context: AgentContext,
): Promise<ToolDefinition[]> {
  if (capability.kind !== "mcp-server" || !capability.resolveTools) {
    return [];
  }

  return capability.resolveTools(context);
}

function toSnapshot(
  capabilities: CapabilityDefinition[],
  activeAgent: AgentDefinition,
  uiRenderers: CapabilityUiRenderer[],
): CapabilitySnapshot {
  const items: CapabilitySnapshotItem[] = capabilities.map((capability) => ({
    id: capability.id,
    kind: capability.kind,
    priority: capability.priority ?? 0,
    metadata: capability.metadata,
  }));

  return {
    items,
    activeAgent: activeAgent.name,
    uiRendererIds: uiRenderers.map((renderer) => renderer.id),
  };
}

function mergeAgentConfig(
  agent: AgentDefinition,
  instructions: string[],
  tools: ToolDefinition[],
  handoffs: AgentDefinition[],
): AgentDefinition {
  const mergedInstructions = instructions
    .map((instruction) => instruction.trim())
    .filter(Boolean)
    .join("\n\n");

  return {
    ...agent,
    instructions: mergedInstructions || agent.instructions,
    tools: uniqueTools([...(agent.tools ?? []), ...tools]),
    handoffs: uniqueAgents([...(agent.handoffs ?? []), ...handoffs]),
  };
}

function resolveRequestedAgent(
  activeAgentName: string | null | undefined,
  rootAgent: AgentDefinition,
  agentCapabilities: CapabilityDefinition[],
  registry: Map<string, AgentDefinition>,
): AgentDefinition {
  if (!activeAgentName) {
    return rootAgent;
  }

  const requestedAgent = registry.get(activeAgentName);
  if (!requestedAgent) {
    return rootAgent;
  }

  const matchingCapability = agentCapabilities.find((capability) => {
    return (
      capability.kind === "agent" &&
      capability.agent.name === activeAgentName
    );
  });

  if (
    matchingCapability &&
    matchingCapability.kind === "agent" &&
    matchingCapability.persistAcrossTurns === false
  ) {
    return rootAgent;
  }

  return requestedAgent;
}

export async function resolveCapabilities(
  options: ResolveCapabilitiesOptions,
): Promise<ResolvedCapabilityConfig> {
  const catalog = [
    ...getBuiltinCapabilities(),
    ...(options.additionalCapabilities ?? []),
  ].sort(byPriorityDesc);

  const enabledCapabilities = (
    await Promise.all(
      catalog.map(async (capability) => ({
        capability,
        enabled: await isEnabled(capability, options.context),
      })),
    )
  )
    .filter((entry) => entry.enabled)
    .map((entry) => entry.capability);

  const resolvedCapabilities = resolveConflicts(enabledCapabilities);
  const agentCapabilities = resolvedCapabilities
    .filter((capability) => capability.kind === "agent")
    .sort(byPriorityDesc);

  const rootAgentCapability =
    agentCapabilities.find((capability) => capability.role === "root") ?? null;

  if (!rootAgentCapability || rootAgentCapability.kind !== "agent") {
    throw new Error("Capability resolution failed: no root agent is registered.");
  }

  const registry = buildAgentRegistry(rootAgentCapability.agent);
  for (const capability of agentCapabilities) {
    if (capability.kind !== "agent") continue;
    if (!registry.has(capability.agent.name)) {
      registry.set(capability.agent.name, capability.agent);
    }
  }

  const baseAgent = resolveRequestedAgent(
    options.activeAgentName,
    rootAgentCapability.agent,
    agentCapabilities,
    registry,
  );

  const applicableCapabilities = resolvedCapabilities.filter((capability) =>
    capabilityAppliesToAgent(capability, baseAgent.name),
  );

  const tools = uniqueTools(
    (
      await Promise.all(
        applicableCapabilities.map(async (capability) => {
          switch (capability.kind) {
            case "native-tool":
              return [capability.tool];
            case "skill":
            case "plugin":
              return capability.tools ?? [];
            case "mcp-server":
              return resolveMcpTools(capability, options.context);
            default:
              return [];
          }
        }),
      )
    ).flat(),
  );

  const instructions = [
    baseAgent.instructions,
    ...applicableCapabilities.flatMap((capability) => {
      if (capability.kind === "skill" || capability.kind === "plugin") {
        return capability.instructions ? [capability.instructions] : [];
      }
      return [];
    }),
  ];

  const handoffs = uniqueAgents(
    applicableCapabilities.flatMap((capability) => {
      if (capability.kind === "skill" || capability.kind === "plugin") {
        return capability.handoffs ?? [];
      }
      return [];
    }),
  );

  const uiRenderers = uniqueRenderers(
    applicableCapabilities.flatMap((capability) => {
      if (capability.kind === "skill" || capability.kind === "plugin") {
        return capability.uiRenderers ?? [];
      }
      return [];
    }),
  );

  const activeAgent = mergeAgentConfig(baseAgent, instructions, tools, handoffs);
  registry.set(activeAgent.name, activeAgent);

  return {
    context: options.context,
    activeAgent,
    registry,
    tools: activeAgent.tools ?? [],
    instructions,
    handoffs: activeAgent.handoffs ?? [],
    uiRenderers,
    snapshot: toSnapshot(applicableCapabilities, activeAgent, uiRenderers),
  };
}
