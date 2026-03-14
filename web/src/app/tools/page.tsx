"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench, Plus, ToggleLeft, ToggleRight, Globe, FileSearch, Database, Code, Filter, GitBranch, FileOutput, Table, Regex, Link, Webhook, FileJson } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const categories = ["All", "Active", "Inactive", "Custom"];

type Tool = { name: string; description: string; icon: React.ComponentType<{ className?: string }>; active: boolean };

const placeholderTools: Tool[] = [
  { name: "Web Scraper", description: "Extract structured data from web pages", icon: Globe, active: true },
  { name: "CSS Selector", description: "Target specific page elements with CSS queries", icon: Code, active: true },
  { name: "Link Crawler", description: "Follow and index links across pages", icon: Link, active: false },
  { name: "Data Filter", description: "Filter and transform extracted datasets", icon: Filter, active: true },
  { name: "JSON Extractor", description: "Parse and extract fields from JSON responses", icon: FileJson, active: true },
  { name: "Regex Matcher", description: "Match patterns in scraped text content", icon: Regex, active: false },
  { name: "Table Parser", description: "Convert HTML tables to structured data", icon: Table, active: false },
  { name: "File Exporter", description: "Export collected data to CSV, JSON, or Excel", icon: FileOutput, active: true },
  { name: "API Connector", description: "Fetch data from REST and GraphQL endpoints", icon: Webhook, active: false },
  { name: "Page Inspector", description: "Analyze page structure and metadata", icon: FileSearch, active: false },
  { name: "Database Writer", description: "Write scraped data directly to databases", icon: Database, active: false },
  { name: "Version Tracker", description: "Track changes across page versions over time", icon: GitBranch, active: false },
];

function ToolCard({ tool, onToggle }: { tool: Tool; onToggle: () => void }) {
  return (
    <div className="group flex h-36 cursor-pointer flex-col rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center text-lg text-gray-700">
          <tool.icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">{tool.name}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className="shrink-0 text-gray-400 hover:text-gray-600"
            >
              {tool.active ? (
                <ToggleRight className="h-6 w-6 text-green-600" />
              ) : (
                <ToggleLeft className="h-6 w-6" />
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">{tool.description}</p>
        </div>
      </div>
      <div className="mt-auto flex items-center gap-2">
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            tool.active ? "bg-green-500" : "bg-gray-300"
          }`}
        />
        <span className="text-xs text-gray-500">
          {tool.active ? "Enabled" : "Disabled"}
        </span>
      </div>
    </div>
  );
}

export default function ToolsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [tools, setTools] = useState(placeholderTools);
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

  const handleToggle = (index: number) => {
    setTools((prev) =>
      prev.map((t, i) => (i === index ? { ...t, active: !t.active } : t)),
    );
  };

  const filteredTools = tools.filter((t) => {
    if (activeCategory === "All") return true;
    if (activeCategory === "Active") return t.active;
    if (activeCategory === "Inactive") return !t.active;
    return false;
  });

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
              <Wrench className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Tools</h1>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-screamin-green-800 px-4 py-2 text-sm font-medium text-white hover:bg-screamin-green-700">
              <Plus className="h-4 w-4" />
              Add Tool
            </button>
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.name}
                tool={tool}
                onToggle={() =>
                  handleToggle(tools.findIndex((t) => t.name === tool.name))
                }
              />
            ))}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
