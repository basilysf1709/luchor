"use client";

import { useState } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { AuthCard } from "@/components/auth-card";
import { authClient } from "@/lib/auth-client";
import { ChatPage } from "@/components/chat/chat-page";
import { FaDiscord, FaGithub } from "react-icons/fa";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Home() {
  const isDevEnvironment =
    process.env.NEXT_PUBLIC_ENV === "dev" ||
    process.env.NODE_ENV === "development";
  const authRequired = !isDevEnvironment;
  const { data: session, isPending, refetch } = authClient.useSession();
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setSignOutError(null);
    setIsSigningOut(true);

    try {
      const result = await authClient.signOut();

      if (result.error) {
        setSignOutError(result.error.message ?? "Failed to sign out.");
        return;
      }

      await refetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to sign out.";
      setSignOutError(message);
    } finally {
      setIsSigningOut(false);
    }
  }

  if (authRequired && isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-screamin-green-800">Checking your session...</p>
      </main>
    );
  }

  if (authRequired && !session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-screamin-green-50 px-4 py-12">
        <div className="flex w-full max-w-md flex-col items-center gap-6">
          <h1 className="text-center text-3xl font-bold text-screamin-green-900">
            Welcome to Luchor
          </h1>
          <AuthCard onAuthenticated={refetch} />
        </div>
      </main>
    );
  }

  return (
    <SidebarProvider defaultOpen={false} className="h-[100dvh] overflow-hidden">
      <AppSidebar />
      <SidebarInset className="min-h-0 overflow-hidden">
        <header className="flex h-12 shrink-0 items-center justify-between px-4">
          <SidebarTrigger />
          <div className="flex items-center gap-1.5 mt-4 mr-4">
            <a href="https://discord.gg" target="_blank" rel="noopener noreferrer" className="flex h-7 w-7 items-center justify-center text-black/50 hover:text-black">
              <FaDiscord size={18} />
            </a>
            <a href="https://github.com/basilysf1709/luchor" target="_blank" rel="noopener noreferrer" className="flex h-7 w-7 items-center justify-center text-black/50 hover:text-black">
              <FaGithub size={18} />
            </a>
            {session ? (
              <>
                <span className="hidden text-xs text-screamin-green-900 md:inline">
                  {session.user.email}
                </span>
                <button
                  className="flex h-9 items-center px-6 text-sm font-medium bg-screamin-green-800 text-white hover:bg-screamin-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                >
                  {isSigningOut ? "Signing out..." : "Sign out"}
                </button>
              </>
            ) : (
              <span className="rounded border border-screamin-green-200 bg-screamin-green-50 px-2 py-1 text-xs text-screamin-green-900">
                Dev Mode: Auth Optional
              </span>
            )}
          </div>
        </header>
        {session && signOutError ? (
          <p className="px-4 text-sm text-red-600">{signOutError}</p>
        ) : null}
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ChatPage />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
