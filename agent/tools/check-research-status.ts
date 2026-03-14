import { z } from "zod";
import { defineTool } from "../define-tool.ts";
import { getTask } from "../task-store.ts";

export const checkResearchStatus = defineTool({
  name: "check_research_status",
  description:
    "Check the status of a background deep research task. Returns the result when complete, or the current status if still running.",
  parameters: z.object({
    taskId: z
      .string()
      .min(1)
      .describe("The task ID returned by start_deep_research."),
  }),
  execute: async ({ taskId }) => {
    const task = getTask(taskId);

    if (!task) {
      return {
        status: "not_found",
        message: `No task found with ID "${taskId}".`,
      };
    }

    if (task.status === "running") {
      const elapsed = Math.round((Date.now() - task.createdAt) / 1000);
      return {
        taskId: task.id,
        status: "running",
        elapsedSeconds: elapsed,
        message: `Research is still in progress (${elapsed}s elapsed). Check again shortly.`,
      };
    }

    if (task.status === "failed") {
      return {
        taskId: task.id,
        status: "failed",
        error: task.error,
        message: "The research task failed.",
      };
    }

    return {
      taskId: task.id,
      status: "completed",
      result: task.result,
      durationSeconds: task.completedAt
        ? Math.round((task.completedAt - task.createdAt) / 1000)
        : null,
    };
  },
});
