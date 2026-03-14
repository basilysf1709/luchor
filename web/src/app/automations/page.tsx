"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Workflow, Plus, Play, Pause, Clock, CheckCircle2, XCircle } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const categories = ["All", "Active", "Paused", "Failed"];

const placeholderAutomations = [
  { name: "Daily Site Monitor", description: "Scrape target URLs every 24h and flag changes", schedule: "Every day at 9:00 AM", status: "active" as const, lastRun: "2h ago" },
  { name: "Lead Enrichment", description: "Enrich new CRM leads with company data", schedule: "On new lead added", status: "active" as const, lastRun: "15m ago" },
  { name: "Competitor Price Tracker", description: "Monitor competitor pricing pages for updates", schedule: "Every 6 hours", status: "active" as const, lastRun: "4h ago" },
  { name: "Weekly Report Builder", description: "Compile scraped data into a summary report", schedule: "Every Monday at 8:00 AM", status: "paused" as const, lastRun: "5d ago" },
  { name: "Social Mention Alerts", description: "Track brand mentions across social platforms", schedule: "Every 30 minutes", status: "active" as const, lastRun: "12m ago" },
  { name: "Broken Link Checker", description: "Scan site pages for broken outbound links", schedule: "Every Sunday at 2:00 AM", status: "failed" as const, lastRun: "1d ago" },
  { name: "Data Backup Pipeline", description: "Export collected data to cloud storage nightly", schedule: "Every day at 1:00 AM", status: "active" as const, lastRun: "8h ago" },
  { name: "Content Change Digest", description: "Summarize page content diffs and email team", schedule: "Every day at 6:00 PM", status: "paused" as const, lastRun: "2d ago" },
];

const statusConfig = {
  active: { icon: Play, color: "text-green-600", bg: "bg-green-50", dot: "bg-green-500", label: "Active" },
  paused: { icon: Pause, color: "text-yellow-600", bg: "bg-yellow-50", dot: "bg-yellow-500", label: "Paused" },
  failed: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", dot: "bg-red-500", label: "Failed" },
};

function AutomationCard({ automation }: { automation: (typeof placeholderAutomations)[number] }) {
  const config = statusConfig[automation.status];
  const StatusIcon = config.icon;

  return (
    <div className="group flex h-40 cursor-pointer flex-col rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-gray-900">{automation.name}</h3>
          <p className="mt-1 text-xs text-gray-500">{automation.description}</p>
        </div>
        <span className={`ml-2 shrink-0 rounded-full p-1 ${config.bg}`}>
          <StatusIcon className={`h-4 w-4 ${config.color}`} />
        </span>
      </div>
      <div className="mt-auto flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>{automation.schedule}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`inline-block h-2 w-2 rounded-full ${config.dot}`} />
          <span className="text-xs text-gray-500">{config.label}</span>
        </div>
      </div>
    </div>
  );
}

export default function AutomationsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
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

  const filtered = placeholderAutomations.filter((a) => {
    if (activeCategory === "All") return true;
    return a.status === activeCategory.toLowerCase();
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
              <Workflow className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Automations</h1>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-screamin-green-800 px-4 py-2 text-sm font-medium text-white hover:bg-screamin-green-700">
              <Plus className="h-4 w-4" />
              New Automation
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
            {filtered.map((automation) => (
              <AutomationCard key={automation.name} automation={automation} />
            ))}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
