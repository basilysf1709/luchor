"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuiState } from "@assistant-ui/react";
import { cn } from "@/lib/utils";
import type { BundledLanguage } from "@/components/kibo-ui/code-block";
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockFiles,
  CodeBlockHeader,
  CodeBlockItem,
} from "@/components/kibo-ui/code-block";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FrontendArtifact = {
  kind: "frontend-artifact";
  title: string;
  description: string;
  language: "html" | "tsx" | "jsx" | "css" | "javascript";
  code: string;
  previewHtml: string;
  notes?: string[];
};

type ToolPartLike = {
  type?: string;
  toolName?: string;
  argsText?: string;
  result?: unknown;
  status?: {
    type?: string;
  };
};

type MessageLike = {
  role?: string;
  content?: readonly unknown[];
};

function isFrontendArtifact(value: unknown): value is FrontendArtifact {
  if (typeof value !== "object" || value === null) return false;
  const artifact = value as Record<string, unknown>;

  return (
    artifact.kind === "frontend-artifact" &&
    typeof artifact.title === "string" &&
    typeof artifact.description === "string" &&
    typeof artifact.language === "string" &&
    typeof artifact.code === "string" &&
    typeof artifact.previewHtml === "string"
  );
}

function unescapeJsonString(value: string) {
  return value
    .replace(/\\\\/g, "\\")
    .replace(/\\"/g, '"')
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\//g, "/");
}

function extractJsonStringField(source: string, field: string) {
  const fieldIndex = source.indexOf(`"${field}"`);
  if (fieldIndex < 0) return "";

  const startQuote = source.indexOf('"', fieldIndex + field.length + 2);
  if (startQuote < 0) return "";

  let value = "";

  for (let index = startQuote + 1; index < source.length; index += 1) {
    const char = source[index];
    const previous = source[index - 1];

    if (char === '"' && previous !== "\\") {
      break;
    }

    value += char;
  }

  return unescapeJsonString(value);
}

function buildPreviewDocument(source: string) {
  if (!source) return "";

  const injection = `
<base target="_self">
<script>
  document.addEventListener("click", function(event) {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const anchor = target.closest("a[href]");
    if (anchor) {
      event.preventDefault();
      return;
    }

    const button = target.closest("button");
    if (button && !button.hasAttribute("type")) {
      button.setAttribute("type", "button");
    }
  });

  document.addEventListener("submit", function(event) {
    event.preventDefault();
  });
</script>`;

  if (source.includes("</head>")) {
    return source.replace("</head>", `${injection}</head>`);
  }

  if (source.includes("<body")) {
    return source.replace(/<body([^>]*)>/i, `<head>${injection}</head><body$1>`);
  }

  return `<!DOCTYPE html><html><head>${injection}</head><body>${source}</body></html>`;
}

type WorkspaceState = {
  artifact: FrontendArtifact;
  isStreaming: boolean;
};

function useSmoothedWorkspace(workspace: WorkspaceState | null) {
  const [smoothedWorkspace, setSmoothedWorkspace] = useState(workspace);

  useEffect(() => {
    if (!workspace) {
      setSmoothedWorkspace(null);
      return;
    }

    if (!workspace.isStreaming) {
      setSmoothedWorkspace(workspace);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSmoothedWorkspace(workspace);
    }, 48);

    return () => window.clearTimeout(timeoutId);
  }, [workspace]);

  return smoothedWorkspace;
}

function getLatestArtifact(messages: readonly MessageLike[]): WorkspaceState | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role !== "assistant" || !Array.isArray(message.content)) {
      continue;
    }

    for (let partIndex = message.content.length - 1; partIndex >= 0; partIndex -= 1) {
      const part = message.content[partIndex] as ToolPartLike | undefined;
      if (part?.type !== "tool-call" || part.toolName !== "create_frontend_artifact") {
        continue;
      }

      if (isFrontendArtifact(part.result)) {
        return {
          artifact: part.result,
          isStreaming: false,
        };
      }

      const argsText = part.argsText ?? "";
      if (!argsText) {
        continue;
      }

      return {
        artifact: {
          kind: "frontend-artifact",
          title: extractJsonStringField(argsText, "title") || "Building canvas",
          description:
            extractJsonStringField(argsText, "description") ||
            "The agent is generating the code and preview.",
          language:
            (extractJsonStringField(argsText, "language") as FrontendArtifact["language"]) ||
            "html",
          code: extractJsonStringField(argsText, "code"),
          previewHtml: extractJsonStringField(argsText, "previewHtml"),
          notes: [],
        },
        isStreaming: part.status?.type === "running" || part.status?.type === "requires-action",
      };
    }
  }

  return null;
}

export function WorkspacePanel() {
  const [activeTab, setActiveTab] = useState<"code" | "preview">("preview");
  const messages = useAuiState(
    (s) => s.thread.messages,
  ) as unknown as readonly MessageLike[];

  const workspace = useMemo(() => getLatestArtifact(messages), [messages]);
  const smoothedWorkspace = useSmoothedWorkspace(workspace);

  if (!smoothedWorkspace) {
    return null;
  }

  const { artifact, isStreaming } = smoothedWorkspace;
  const previewSource =
    artifact.previewHtml || (artifact.language === "html" ? artifact.code : "");
  const isolatedPreviewSource = buildPreviewDocument(previewSource);
  const codeSnippets = [
    {
      language: artifact.language,
      label: artifact.language.toUpperCase(),
      filename: `artifact.${artifact.language === "javascript" ? "js" : artifact.language}`,
      code: artifact.code,
    },
  ];

  return (
    <aside className="flex min-h-0 min-w-0 flex-1 flex-col border-t border-black/6 bg-white lg:max-w-[48%] lg:border-t-0 lg:border-l">
      <div className="flex items-center justify-between border-b border-black/6 bg-white px-4 py-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-black/35">
            Workspace
          </p>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-black/85">{artifact.title}</h2>
            {isStreaming ? (
              <span className="rounded-full border border-black/8 bg-black/[0.02] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-black/45">
                Streaming
              </span>
            ) : null}
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "code" | "preview")}>
          <TabsList>
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

        <div className="min-h-0 flex-1 bg-white">
          {activeTab === "code" ? (
            <div className="flex h-full min-h-[22rem] flex-col overflow-hidden bg-white">
              <CodeBlock data={codeSnippets} value={artifact.language} className="w-full">
                <CodeBlockHeader>
                  <CodeBlockFiles>
                    {(item) => (
                      <CodeBlockFilename key={item.language} value={item.language}>
                        {item.filename}
                      </CodeBlockFilename>
                    )}
                  </CodeBlockFiles>
                  <CodeBlockCopyButton />
                </CodeBlockHeader>
                <ScrollArea className="w-full">
                  {isStreaming ? (
                    <pre className="max-h-[36rem] overflow-auto whitespace-pre-wrap break-words bg-white px-4 py-4 font-mono text-[13px] leading-6 text-black/82">
                      <code>{artifact.code}</code>
                    </pre>
                  ) : (
                    <CodeBlockBody>
                      {(item) => (
                        <CodeBlockItem
                          key={item.language}
                          value={item.language}
                          className="max-h-[36rem] w-full"
                        >
                          <CodeBlockContent language={item.language as BundledLanguage}>
                            {item.code}
                          </CodeBlockContent>
                        </CodeBlockItem>
                      )}
                    </CodeBlockBody>
                  )}
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </CodeBlock>
            </div>
          ) : (
            <div className="h-full min-h-[22rem] overflow-hidden bg-white">
              <div className="border-b border-black/6 bg-[#fafafa] px-4 py-3">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-black/38">
                  Live Preview
                </span>
              </div>
              {isolatedPreviewSource ? (
                <iframe
                  title={artifact.title}
                  srcDoc={isolatedPreviewSource}
                  className="h-[calc(100%-49px)] w-full border-0 bg-white"
                  sandbox="allow-scripts"
                />
              ) : (
                <div className="flex h-[calc(100%-49px)] items-center justify-center bg-white px-6 text-center">
                  <p className="text-sm text-black/45">
                    {isStreaming
                      ? "Preview is being assembled."
                      : "Preview is not available for this artifact."}
                  </p>
                </div>
              )}
            </div>
          )}
      </div>
    </aside>
  );
}
