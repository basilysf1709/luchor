"use client";

import { useEffect, useMemo, useState } from "react";
import { Expand, LoaderIcon, X } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
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

type WorkspacePanelProps = {
  isExpanded: boolean;
  onExpandedChange: (nextValue: boolean) => void;
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

export function WorkspacePanel({
  isExpanded,
  onExpandedChange,
}: WorkspacePanelProps) {
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [dismissedArtifactIdentity, setDismissedArtifactIdentity] = useState<string | null>(null);
  const messages = useAuiState(
    (s) => s.thread.messages,
  ) as unknown as readonly MessageLike[];

  const workspace = useMemo(() => getLatestArtifact(messages), [messages]);
  const smoothedWorkspace = useSmoothedWorkspace(workspace);

  const artifactIdentity = smoothedWorkspace
    ? [
        smoothedWorkspace.artifact.title,
        smoothedWorkspace.artifact.language,
        smoothedWorkspace.artifact.description,
      ].join("::")
    : null;

  useEffect(() => {
    if (artifactIdentity) {
      setActiveTab("code");
      setIsIframeLoaded(false);
      setDismissedArtifactIdentity((current) =>
        current === artifactIdentity ? current : null,
      );
    }
  }, [artifactIdentity]);

  if (!smoothedWorkspace || (artifactIdentity && dismissedArtifactIdentity === artifactIdentity)) {
    return null;
  }

  const { artifact, isStreaming } = smoothedWorkspace;
  const previewSource =
    artifact.previewHtml || (artifact.language === "html" ? artifact.code : "");
  const isolatedPreviewSource = buildPreviewDocument(previewSource);
  const hasPreviewSource = Boolean(isolatedPreviewSource);
  const showPreviewLoader =
    activeTab === "preview" && (!hasPreviewSource || isStreaming || !isIframeLoaded);
  const codeSnippets = [
    {
      language: artifact.language,
      label: artifact.language.toUpperCase(),
      filename: `artifact.${artifact.language === "javascript" ? "js" : artifact.language}`,
      code: artifact.code,
    },
  ];

  return (
    <aside
      className={cn(
        "group/workspace flex min-h-0 min-w-0 flex-1 flex-col border-t border-black/8 bg-white lg:border-t lg:border-l",
        isExpanded ? "w-full lg:max-w-none" : "lg:max-w-[48%]",
      )}
    >
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
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover/workspace:opacity-100">
            <button
              type="button"
              aria-label={isExpanded ? "Shrink workspace" : "Expand workspace"}
              className="flex h-8 w-8 items-center justify-center text-black/40 transition-colors hover:text-screamin-green-800"
              onClick={() => onExpandedChange(!isExpanded)}
            >
              <Expand className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Close workspace"
              className="flex h-8 w-8 items-center justify-center text-black/40 transition-colors hover:text-screamin-green-800"
              onClick={() => {
                onExpandedChange(false);
                setDismissedArtifactIdentity(artifactIdentity);
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "code" | "preview")}
          >
            <TabsList>
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="min-h-0 flex-1 bg-white">
        {activeTab === "code" ? (
          <div className="flex h-full min-h-[22rem] flex-col overflow-hidden bg-white">
            <CodeBlock
              data={codeSnippets}
              value={artifact.language}
              className="h-full min-h-0 w-full"
            >
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
              <ScrollArea className="min-h-0 flex-1 w-full">
                {isStreaming ? (
                  <pre className="min-h-full whitespace-pre-wrap break-words bg-white px-4 py-4 font-mono text-[13px] leading-6 text-black/82">
                    <code>{artifact.code}</code>
                  </pre>
                ) : (
                  <CodeBlockBody className="min-h-full">
                    {(item) => (
                      <CodeBlockItem
                        key={item.language}
                        value={item.language}
                        className="w-full"
                      >
                        <CodeBlockContent language={item.language as BundledLanguage}>
                          {item.code}
                        </CodeBlockContent>
                      </CodeBlockItem>
                    )}
                  </CodeBlockBody>
                )}
              </ScrollArea>
            </CodeBlock>
          </div>
        ) : (
          <div className="flex h-full min-h-[22rem] flex-col overflow-hidden bg-white">
            {hasPreviewSource ? (
              <div className="relative min-h-0 flex-1 bg-[#f7faf7] p-5">
                {showPreviewLoader ? (
                  <div className="absolute inset-0 z-10 flex min-h-0 flex-1 bg-[#f7faf7] p-5">
                    <div className="flex min-h-0 flex-1 items-center justify-center rounded-sm bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,0.08)] ring-1 ring-black/5">
                      <div className="flex flex-col items-center gap-4 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-screamin-green-50 text-screamin-green-800 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
                          <LoaderIcon className="h-6 w-6 animate-spin" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-black/70">
                            Building preview
                          </p>
                          <p className="text-xs text-black/40">
                            Rendering the generated interface in the canvas.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
                <iframe
                  title={artifact.title}
                  srcDoc={isolatedPreviewSource}
                  className="relative z-0 min-h-0 flex-1 w-full border-0 bg-white"
                  sandbox="allow-scripts"
                  onLoad={() => setIsIframeLoaded(true)}
                />
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 items-center justify-center bg-[#f7faf7] p-5">
                <div className="w-full max-w-xl rounded-sm bg-white p-8 text-center shadow-[0_24px_60px_rgba(0,0,0,0.08)] ring-1 ring-black/5">
                  <p className="text-sm text-black/40">
                    {isStreaming ? "Preview is loading." : "Preview is not available for this artifact."}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
