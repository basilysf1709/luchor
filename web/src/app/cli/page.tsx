"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Terminal, Copy, Check } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const categories = ["Getting Started", "Commands", "Configuration", "Examples"];

const commands = [
  { name: "luchor init", description: "Initialize a new Luchor project in the current directory", category: "Getting Started" },
  { name: "luchor login", description: "Authenticate with your Luchor account", category: "Getting Started" },
  { name: "luchor scrape <url>", description: "Scrape a single URL and output structured data", category: "Commands" },
  { name: "luchor crawl <url> --depth 3", description: "Crawl a site up to a specified depth", category: "Commands" },
  { name: "luchor run <automation>", description: "Run a saved automation by name", category: "Commands" },
  { name: "luchor export --format csv", description: "Export collected data in the specified format", category: "Commands" },
  { name: "luchor status", description: "Show status of running agents and tasks", category: "Commands" },
  { name: "luchor config set <key> <value>", description: "Set a configuration value", category: "Configuration" },
  { name: "luchor config list", description: "List all configuration settings", category: "Configuration" },
  { name: "luchor config reset", description: "Reset configuration to defaults", category: "Configuration" },
];

const examples = [
  { title: "Scrape product prices", code: "luchor scrape https://example.com/products --selector '.price' --output prices.json" },
  { title: "Monitor page changes", code: "luchor watch https://example.com --interval 1h --notify email" },
  { title: "Bulk scrape from file", code: "luchor scrape --urls urls.txt --parallel 5 --output results/" },
  { title: "Run with custom agent", code: "luchor run my-agent --config agent.yaml --verbose" },
];

function CommandRow({ command, onCopy }: { command: (typeof commands)[number]; onCopy: (text: string) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:border-gray-300">
      <div className="min-w-0 flex-1">
        <code className="text-sm font-medium text-gray-900">{command.name}</code>
        <p className="mt-0.5 text-xs text-gray-500">{command.description}</p>
      </div>
      <CopyButton text={command.name} onCopy={onCopy} />
    </div>
  );
}

function CopyButton({ text, onCopy }: { text: string; onCopy: (text: string) => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-3 shrink-0 rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
    >
      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

function ExampleCard({ example, onCopy }: { example: (typeof examples)[number]; onCopy: (text: string) => void }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300">
      <h3 className="text-sm font-medium text-gray-900">{example.title}</h3>
      <div className="mt-2 flex items-center justify-between rounded-md bg-gray-900 px-3 py-2">
        <code className="min-w-0 flex-1 truncate text-xs text-gray-100">{example.code}</code>
        <CopyButton text={example.code} onCopy={onCopy} />
      </div>
    </div>
  );
}

export default function CliPage() {
  const [activeCategory, setActiveCategory] = useState("Getting Started");
  const router = useRouter();

  const handleNewAgent = useCallback(() => {
    const sessionId = crypto.randomUUID();
    router.push(`/?session=${sessionId}`);
  }, [router]);

  const handleSelectSession = useCallback(
    (sessionId: string) => {
      router.push(`/?session=${sessionId}`);
    },
    [router],
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filteredCommands = commands.filter((c) => c.category === activeCategory);

  return (
    <SidebarProvider className="h-[100dvh] overflow-hidden">
      <AppSidebar
        onNewAgent={handleNewAgent}
        onSelectSession={handleSelectSession}
      />
      <SidebarInset className="min-h-0 overflow-hidden">
        <header className="flex h-12 shrink-0 items-center px-4">
          <SidebarTrigger />
        </header>
        <main className="flex-1 overflow-y-auto px-6 pb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Terminal className="h-6 w-6" />
              <h1 className="text-2xl font-bold">CLI</h1>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-gray-900 px-3 py-1.5">
              <code className="text-sm text-gray-100">npm install -g luchor</code>
              <CopyButton text="npm install -g luchor" onCopy={handleCopy} />
            </div>
          </div>

          <div className="border-b border-gray-200 mb-8">
            <nav className="flex gap-6">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`pb-3 text-sm font-medium transition-colors ${
                    activeCategory === cat
                      ? "border-b-2 border-black text-black"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </div>

          {activeCategory === "Examples" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {examples.map((example) => (
                <ExampleCard key={example.title} example={example} onCopy={handleCopy} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredCommands.map((command) => (
                <CommandRow key={command.name} command={command} onCopy={handleCopy} />
              ))}
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
