"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AlignLeft } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const categories = ["Recommend", "Code", "Research", "PPT", "Multimodal", "Others"];

const placeholderCards = [
  { title: "Organic Skincare Landing Page Design", author: "@Max", remixes: 9 },
  { title: "WebGL Supercar Landing Page", author: "@Max", remixes: 18 },
  { title: "Artisanal Coffee Web Design", author: "@Max", remixes: 5 },
  { title: "Coastal Calm Web Design", author: "@Max", remixes: 1 },
  { title: "Swiss Architecture Web Design", author: "@Alex", remixes: 3 },
  { title: "Luxury Fashion E-commerce Design", author: "@Alex", remixes: 11 },
  { title: "Wellness Yoga App Web Design", author: "@Alex", remixes: 2 },
  { title: "Luxury Travel Agency", author: "@Alex", remixes: 4 },
  { title: "Retro Gaming Landing Page", author: "@Sam", remixes: 7 },
  { title: "Orbit SaaS Dashboard", author: "@Sam", remixes: 14 },
  { title: "Knowledge Library Platform", author: "@Sam", remixes: 6 },
  { title: "Fan Club Community Site", author: "@Sam", remixes: 3 },
];

function PlaceholderImage({ index }: { index: number }) {
  const colors = [
    "bg-stone-100",
    "bg-zinc-900",
    "bg-amber-50",
    "bg-slate-200",
    "bg-gray-300",
    "bg-stone-800",
    "bg-emerald-50",
    "bg-slate-700",
    "bg-yellow-900",
    "bg-zinc-800",
    "bg-indigo-50",
    "bg-stone-700",
  ];
  return (
    <div
      className={`aspect-[16/10] w-full rounded-lg ${colors[index % colors.length]}`}
    />
  );
}

export default function LibraryPage() {
  const [activeCategory, setActiveCategory] = useState("Recommend");
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
          <div className="flex items-center gap-3 mb-6">
            <AlignLeft className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Library</h1>
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

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {placeholderCards.map((card, i) => (
              <div
                key={i}
                className="group cursor-pointer"
              >
                <PlaceholderImage index={i} />
                <h3 className="mt-3 text-sm font-medium text-gray-900">
                  {card.title}
                </h3>
                <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                  <span>{card.author}</span>
                  <span>{card.remixes} remixes</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
