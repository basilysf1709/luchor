import { z } from "zod";
import { defineTool } from "../define-tool.ts";

const artifactInput = z.object({
  title: z.string().min(1).describe("Short title for the generated artifact."),
  description: z
    .string()
    .min(1)
    .describe("What this artifact is and what it is intended to show."),
  language: z
    .enum(["html", "tsx", "jsx", "css", "javascript"])
    .default("html")
    .describe("Primary language of the code tab."),
  code: z
    .string()
    .min(1)
    .describe(
      "The code that should appear in the code tab. For UI requests, prefer complete implementations over partial snippets, and avoid stub layouts that only show a header or one row of content.",
    ),
  previewHtml: z
    .string()
    .min(1)
    .describe(
      "A complete HTML document for the preview tab. Use inline CSS and JavaScript so it renders standalone in an iframe, fills the viewport, shows a complete screen rather than only a header or partial section, and does not clip content with fixed heights or overflow-hidden body styles.",
    ),
  notes: z
    .array(z.string())
    .max(8)
    .default([])
    .describe("Optional short implementation or design notes for the artifact."),
});

export const createFrontendArtifact = defineTool({
  name: "create_frontend_artifact",
  description:
    "Create a structured frontend artifact containing code for a code tab and standalone preview HTML for a live preview tab.",
  parameters: artifactInput,
  execute: async (input) => {
    return {
      kind: "frontend-artifact",
      ...input,
    };
  },
});
