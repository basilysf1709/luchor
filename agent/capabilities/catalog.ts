import type { CapabilityDefinition } from "../types.ts";
import { orchestrator } from "../agents/orchestrator.ts";
import { planner } from "../agents/planner.ts";
import { deepResearcher } from "../agents/deep-researcher.ts";
import { createPlan } from "../tools/create-plan.ts";
import { getDesignColors } from "../tools/get-design-colors.ts";
import { createFrontendArtifact } from "../tools/create-frontend-artifact.ts";
import { startDeepResearch } from "../tools/start-deep-research.ts";
import { checkResearchStatus } from "../tools/check-research-status.ts";

const planningInstructions = `Planning workflow:
- For any multi-step, complex, or ambiguous request, call \`create_plan\` first to break the task into ordered steps before doing anything else.
- Follow the returned plan step by step using your other tools.
- For simple, single-tool requests, skip planning and act directly.`;

const designInstructions = `Design workflow:
- For any frontend design, visual system, landing page, dashboard, or UI styling request, call \`get_design_colors\` first.
- For any request that asks you to build, redesign, prototype, or show a UI, call \`create_frontend_artifact\` after choosing colors.
- Use the returned palette as the source of truth and generate a complete, previewable artifact.`;

const deepResearchInstructions = `Deep research workflow:
- When the user asks for in-depth research, use \`start_deep_research\` to launch background work.
- Share the task ID and return control to the user.
- Only use \`check_research_status\` when the user explicitly asks for status or results.`;

export function getBuiltinCapabilities(): CapabilityDefinition[] {
  return [
    {
      kind: "agent",
      id: "agent.orchestrator",
      role: "root",
      persistAcrossTurns: true,
      agent: orchestrator,
      priority: 1000,
      metadata: {
        label: "Orchestrator",
      },
    },
    {
      kind: "agent",
      id: "agent.planner",
      role: "specialist",
      persistAcrossTurns: false,
      agent: planner,
      priority: 900,
      metadata: {
        label: "Planner",
      },
    },
    {
      kind: "agent",
      id: "agent.deep-researcher",
      role: "specialist",
      persistAcrossTurns: false,
      agent: deepResearcher,
      priority: 900,
      metadata: {
        label: "Deep Researcher",
      },
    },
    {
      kind: "native-tool",
      id: "tool.create-plan",
      appliesToAgents: ["orchestrator"],
      tool: createPlan,
      priority: 700,
      metadata: {
        label: "Create Plan",
      },
    },
    {
      kind: "native-tool",
      id: "tool.get-design-colors",
      appliesToAgents: ["orchestrator"],
      tool: getDesignColors,
      priority: 700,
      metadata: {
        label: "Get Design Colors",
      },
    },
    {
      kind: "native-tool",
      id: "tool.create-frontend-artifact",
      appliesToAgents: ["orchestrator"],
      tool: createFrontendArtifact,
      priority: 700,
      metadata: {
        label: "Create Frontend Artifact",
      },
    },
    {
      kind: "native-tool",
      id: "tool.start-deep-research",
      appliesToAgents: ["orchestrator"],
      tool: startDeepResearch,
      priority: 700,
      metadata: {
        label: "Start Deep Research",
      },
    },
    {
      kind: "native-tool",
      id: "tool.check-research-status",
      appliesToAgents: ["orchestrator"],
      tool: checkResearchStatus,
      priority: 700,
      metadata: {
        label: "Check Research Status",
      },
    },
    {
      kind: "skill",
      id: "skill.planning-workflow",
      appliesToAgents: ["orchestrator"],
      instructions: planningInstructions,
      priority: 500,
      metadata: {
        label: "Planning Workflow",
      },
    },
    {
      kind: "skill",
      id: "skill.design-workflow",
      appliesToAgents: ["orchestrator"],
      instructions: designInstructions,
      priority: 500,
      metadata: {
        label: "Design Workflow",
      },
    },
    {
      kind: "skill",
      id: "skill.deep-research-workflow",
      appliesToAgents: ["orchestrator"],
      instructions: deepResearchInstructions,
      priority: 500,
      metadata: {
        label: "Deep Research Workflow",
      },
    },
    {
      kind: "plugin",
      id: "plugin.workspace-canvas",
      appliesToAgents: ["orchestrator"],
      priority: 300,
      uiRenderers: [
        {
          id: "renderer.workspace.frontend-artifact",
          kind: "frontend-artifact",
          sourceCapabilityId: "plugin.workspace-canvas",
          metadata: {
            toolName: "create_frontend_artifact",
          },
        },
      ],
      metadata: {
        label: "Workspace Canvas",
      },
    },
  ];
}
