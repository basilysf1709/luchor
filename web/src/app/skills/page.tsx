"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Blocks, Plus, Zap, Globe, FileText, Database, Code, BarChart3, Mail, Search } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const categories = ["All", "Scraping", "Analysis", "Communication", "Custom"];

const placeholderSkills = [
  { name: "Web Scraper", description: "Extract structured data from any webpage", icon: Globe, category: "Scraping", usageCount: 342 },
  { name: "PDF Parser", description: "Extract text and tables from PDF documents", icon: FileText, category: "Scraping", usageCount: 189 },
  { name: "Data Cleaner", description: "Normalize and deduplicate collected datasets", icon: Database, category: "Analysis", usageCount: 276 },
  { name: "Sentiment Analyzer", description: "Classify text sentiment from scraped content", icon: BarChart3, category: "Analysis", usageCount: 154 },
  { name: "Code Extractor", description: "Pull code snippets from documentation pages", icon: Code, category: "Scraping", usageCount: 98 },
  { name: "Email Notifier", description: "Send formatted email alerts with collected data", icon: Mail, category: "Communication", usageCount: 421 },
  { name: "Deep Search", description: "Multi-engine search with result aggregation", icon: Search, category: "Scraping", usageCount: 267 },
  { name: "Report Generator", description: "Build structured reports from raw data", icon: FileText, category: "Analysis", usageCount: 203 },
  { name: "API Caller", description: "Make authenticated requests to external APIs", icon: Zap, category: "Custom", usageCount: 312 },
  { name: "Pattern Matcher", description: "Find recurring patterns across scraped pages", icon: Search, category: "Analysis", usageCount: 145 },
  { name: "Webhook Sender", description: "Push collected data to webhook endpoints", icon: Zap, category: "Communication", usageCount: 178 },
  { name: "Schema Validator", description: "Validate scraped data against defined schemas", icon: Database, category: "Custom", usageCount: 89 },
];

function SkillCard({ skill }: { skill: (typeof placeholderSkills)[number] }) {
  const Icon = skill.icon;

  return (
    <div className="group flex h-36 cursor-pointer flex-col rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-700">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-gray-900">{skill.name}</h3>
          <p className="mt-1 text-xs text-gray-500">{skill.description}</p>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between">
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
          {skill.category}
        </span>
        <span className="text-xs text-gray-400">{skill.usageCount} uses</span>
      </div>
    </div>
  );
}

export default function SkillsPage() {
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

  const filtered = placeholderSkills.filter((s) => {
    if (activeCategory === "All") return true;
    return s.category === activeCategory;
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
              <Blocks className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Skills</h1>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-screamin-green-800 px-4 py-2 text-sm font-medium text-white hover:bg-screamin-green-700">
              <Plus className="h-4 w-4" />
              New Skill
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
            {filtered.map((skill) => (
              <SkillCard key={skill.name} skill={skill} />
            ))}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
