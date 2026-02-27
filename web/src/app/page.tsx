"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Paperclip,
  Mic,
  ArrowUp,
  Settings,
  Globe,
  Mail,
  Phone,
  Magnet,
  Video,
  Linkedin,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const suggestions: { label: string; icon: LucideIcon }[] = [
  { label: "Personal website", icon: Globe },
  { label: "Customer support email", icon: Mail },
  { label: "Outbound sales calls", icon: Phone },
  { label: "Lead gen", icon: Magnet },
  { label: "Meeting recorder", icon: Video },
  { label: "LinkedIn outreach", icon: Linkedin },
  { label: "Support chatbot", icon: MessageSquare },
];

export default function Home() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 items-center justify-between px-4">
          <SidebarTrigger />
          <button className="flex h-7 w-7 items-center justify-center text-black/50 hover:text-black">
            <Settings size={18} strokeWidth={1.5} />
          </button>
        </header>
        <main className="flex flex-1 flex-col items-center justify-center px-4">
          <h1 className="mb-8 text-4xl font-bold">How can I help?</h1>

          {/* Input area */}
          <div className="w-full max-w-2xl border border-screamin-green-200 bg-screamin-green-50 p-4 shadow-md">
            <textarea
              placeholder="Build an agent or perform a task"
              rows={2}
              className="w-full resize-none bg-transparent placeholder-screamin-green-700/40 outline-none"
            />
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-2">
                <button className="flex h-8 w-8 items-center justify-center border border-screamin-green-200 text-screamin-green-700/40 hover:text-screamin-green-800">
                  <Paperclip size={16} strokeWidth={1.5} />
                </button>
                <button className="flex h-8 w-8 items-center justify-center border border-screamin-green-200 text-screamin-green-700/40 hover:text-screamin-green-800">
                  <Mic size={16} strokeWidth={1.5} />
                </button>
                <button className="flex h-8 w-8 items-center justify-center bg-screamin-green-800 text-white hover:bg-screamin-green-700">
                  <ArrowUp size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>

          {/* Suggestion chips */}
          <div className="mt-6 flex max-w-2xl flex-wrap justify-center gap-2">
            {suggestions.map((s) => (
              <button
                key={s.label}
                className="flex items-center gap-1.5 border border-screamin-green-200 bg-screamin-green-50 px-3 py-1.5 text-sm text-black/60 hover:bg-screamin-green-100 hover:text-black"
              >
                <s.icon size={14} strokeWidth={1.5} className="text-black" />
                {s.label}
              </button>
            ))}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
