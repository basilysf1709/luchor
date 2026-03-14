"use client";

import { useCallback, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Plug, Plus, ToggleLeft, ToggleRight } from "lucide-react";
import {
  SiPlanetscale,
  SiGithub,
  SiSlack,
  SiLinear,
  SiNotion,
  SiJira,
  SiFigma,
  SiVercel,
  SiSentry,
  SiStripe,
  SiAmazonwebservices,
  SiPostgresql,
} from "react-icons/si";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const categories = ["All", "Active", "Inactive", "Custom"];

const placeholderServers: { name: string; description: string; icon: ReactNode; active: boolean }[] = [
  { name: "PlanetScale", description: "Database queries and schema management", icon: <SiPlanetscale />, active: true },
  { name: "GitHub", description: "Repository and issue management", icon: <SiGithub />, active: true },
  { name: "Slack", description: "Channel messaging and notifications", icon: <SiSlack />, active: false },
  { name: "Linear", description: "Issue tracking and project management", icon: <SiLinear />, active: true },
  { name: "Notion", description: "Document and knowledge base access", icon: <SiNotion />, active: false },
  { name: "Jira", description: "Sprint planning and ticket management", icon: <SiJira />, active: false },
  { name: "Figma", description: "Design file inspection and export", icon: <SiFigma />, active: false },
  { name: "Vercel", description: "Deployment status and environment variables", icon: <SiVercel />, active: true },
  { name: "Sentry", description: "Error tracking and performance monitoring", icon: <SiSentry />, active: false },
  { name: "Stripe", description: "Payment and subscription management", icon: <SiStripe />, active: false },
  { name: "AWS S3", description: "File storage and bucket management", icon: <SiAmazonwebservices />, active: false },
  { name: "Postgres", description: "Direct database access and queries", icon: <SiPostgresql />, active: false },
];

function ServerCard({
  server,
  onToggle,
}: {
  server: (typeof placeholderServers)[number];
  onToggle: () => void;
}) {
  return (
    <div className="group flex h-36 cursor-pointer flex-col rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center text-lg text-gray-700">
          {server.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">{server.name}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className="shrink-0 text-gray-400 hover:text-gray-600"
            >
              {server.active ? (
                <ToggleRight className="h-6 w-6 text-green-600" />
              ) : (
                <ToggleLeft className="h-6 w-6" />
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">{server.description}</p>
        </div>
      </div>
      <div className="mt-auto flex items-center gap-2">
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            server.active ? "bg-green-500" : "bg-gray-300"
          }`}
        />
        <span className="text-xs text-gray-500">
          {server.active ? "Connected" : "Disconnected"}
        </span>
      </div>
    </div>
  );
}

export default function McpPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [servers, setServers] = useState(placeholderServers);
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
    setServers((prev) =>
      prev.map((s, i) => (i === index ? { ...s, active: !s.active } : s)),
    );
  };

  const filteredServers = servers.filter((s) => {
    if (activeCategory === "All") return true;
    if (activeCategory === "Active") return s.active;
    if (activeCategory === "Inactive") return !s.active;
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
              <Plug className="h-6 w-6" />
              <h1 className="text-2xl font-bold">MCP Servers</h1>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-screamin-green-800 px-4 py-2 text-sm font-medium text-white hover:bg-screamin-green-700">
              <Plus className="h-4 w-4" />
              Add Server
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
            {filteredServers.map((server, i) => (
              <ServerCard
                key={server.name}
                server={server}
                onToggle={() =>
                  handleToggle(servers.findIndex((s) => s.name === server.name))
                }
              />
            ))}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
