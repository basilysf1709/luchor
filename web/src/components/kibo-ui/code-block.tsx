"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export type BundledLanguage =
  | "html"
  | "tsx"
  | "jsx"
  | "css"
  | "javascript"
  | "typescript"
  | "json"
  | "python"
  | "go"
  | "ruby"
  | "bash"
  | "text";

type CodeBlockItemData = {
  language: string;
  filename?: string;
  code: string;
};

type CodeBlockContextValue<T extends CodeBlockItemData> = {
  data: T[];
  value: string;
  setValue?: (value: string) => void;
};

const CodeBlockContext = React.createContext<CodeBlockContextValue<CodeBlockItemData> | null>(
  null,
);

function useCodeBlockContext<T extends CodeBlockItemData>() {
  const context = React.useContext(CodeBlockContext);
  if (!context) {
    throw new Error("CodeBlock components must be used within <CodeBlock />.");
  }
  return context as CodeBlockContextValue<T>;
}

function CodeBlock<T extends CodeBlockItemData>({
  data,
  value,
  className,
  children,
}: {
  data: T[];
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <CodeBlockContext.Provider value={{ data, value }}>
      <div className={cn("flex min-h-0 flex-1 flex-col bg-white", className)}>{children}</div>
    </CodeBlockContext.Provider>
  );
}

function CodeBlockHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-black/6 bg-[#fafafa] px-4 py-3",
        className,
      )}
      {...props}
    />
  );
}

function CodeBlockFiles({
  className,
  children,
}: {
  className?: string;
  children: (item: CodeBlockItemData) => React.ReactNode;
}) {
  const { data } = useCodeBlockContext<CodeBlockItemData>();

  return <div className={cn("flex items-center gap-2", className)}>{data.map(children)}</div>;
}

function CodeBlockFilename({
  value,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  value: string;
}) {
  const { value: activeValue } = useCodeBlockContext<CodeBlockItemData>();
  const active = activeValue === value;

  return (
    <button
      type="button"
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-medium",
        active ? "bg-white text-black shadow-[0_1px_2px_rgba(0,0,0,0.05)]" : "text-black/45",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function CodeBlockCopyButton({
  onCopy,
  onError,
  className,
}: {
  onCopy?: () => void;
  onError?: () => void;
  className?: string;
}) {
  const { data, value } = useCodeBlockContext<CodeBlockItemData>();
  const [copied, setCopied] = React.useState(false);
  const activeItem = data.find((item) => item.language === value);

  async function handleCopy() {
    if (!activeItem) return;

    try {
      await navigator.clipboard.writeText(activeItem.code);
      setCopied(true);
      onCopy?.();
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      onError?.();
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn("text-black/45 transition hover:text-black/75", className)}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
    </button>
  );
}

function CodeBlockBody({
  className,
  children,
}: {
  className?: string;
  children: (item: CodeBlockItemData) => React.ReactNode;
}) {
  const { data } = useCodeBlockContext<CodeBlockItemData>();

  return <div className={cn("min-h-0", className)}>{data.map(children)}</div>;
}

function CodeBlockItem({
  value,
  className,
  children,
}: React.ComponentProps<"div"> & {
  value: string;
}) {
  const { value: activeValue } = useCodeBlockContext<CodeBlockItemData>();

  if (value !== activeValue) return null;

  return <div className={className}>{children}</div>;
}

function CodeBlockContent({
  language,
  className,
  children,
}: React.ComponentProps<"pre"> & {
  language?: BundledLanguage;
}) {
  const code = typeof children === "string" ? children : String(children ?? "");

  if (language === "html") {
    const html = code.split(/(<[^>]+>)/g).filter(Boolean);

    return (
      <pre className={cn("bg-white px-4 py-4 text-[13px] leading-6", className)}>
        <code>
          {html.map((segment, index) => {
            if (!segment.startsWith("<")) {
              return (
                <span key={`${segment}-${index}`} className="text-black/82">
                  {segment}
                </span>
              );
            }

            const tagMatch = segment.match(/^<\/?\s*([A-Za-z0-9-:]+)/);
            const tagName = tagMatch?.[1] ?? "";
            const close = segment.startsWith("</") ? "</" : "<";
            const end = segment.endsWith("/>") ? "/>" : ">";
            const attributeSource = segment
              .slice(close.length + tagName.length, segment.length - end.length)
              .trim();
            const attributes = Array.from(
              attributeSource.matchAll(/([:@A-Za-z0-9_-]+)(=)("[^"]*"|'[^']*')?/g),
            );

            return (
              <span key={`${segment}-${index}`} className="text-black/82">
                <span className="text-sky-700">{close}</span>
                <span className="text-screamin-green-800">{tagName}</span>
                {attributes.map((attribute, attributeIndex) => (
                  <React.Fragment key={`${attribute[0]}-${attributeIndex}`}>
                    <span> </span>
                    <span className="text-emerald-700">{attribute[1]}</span>
                    {attribute[2] ? (
                      <>
                        <span className="text-black/45">{attribute[2]}</span>
                        {attribute[3] ? (
                          <span className="text-amber-700">{attribute[3]}</span>
                        ) : null}
                      </>
                    ) : null}
                  </React.Fragment>
                ))}
                <span className="text-sky-700">{end}</span>
              </span>
            );
          })}
        </code>
      </pre>
    );
  }

  return (
    <pre className={cn("bg-white px-4 py-4 text-[13px] leading-6 text-black/82", className)}>
      <code>{children}</code>
    </pre>
  );
}

export {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockFiles,
  CodeBlockHeader,
  CodeBlockItem,
};
