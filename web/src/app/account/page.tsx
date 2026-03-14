"use client";

import { useState } from "react";
import { Activity, Check, CreditCard, UserRound } from "lucide-react";
import { FaDiscord, FaGithub } from "react-icons/fa";

import { AppSidebar } from "@/components/app-sidebar";
import { AuthCard } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useUsage } from "@/hooks/use-usage";

type Section = "account" | "billing";

const COST_PER_PROMPT_TOKEN = 0.003 / 1000;   // $3 per 1M tokens
const COST_PER_COMPLETION_TOKEN = 0.015 / 1000; // $15 per 1M tokens

export default function AccountPage() {
  const [section, setSection] = useState<Section>("account");
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const isDevEnvironment =
    process.env.NEXT_PUBLIC_ENV === "dev" ||
    process.env.NODE_ENV === "development";
  const authRequired = !isDevEnvironment;
  const { data: session, isPending, refetch } = authClient.useSession();
  const { data: usage, isLoading: usageLoading } = useUsage(section === "billing");

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

  const userName = session?.user?.name ?? "";
  const userEmail = session?.user?.email ?? "";

  return (
    <SidebarProvider defaultOpen={false} className="h-[100dvh] overflow-hidden">
      <AppSidebar />
      <SidebarInset className="min-h-0 overflow-hidden">
        <header className="flex h-12 shrink-0 items-center justify-between px-4">
          <SidebarTrigger />
          <div className="mt-4 mr-4 flex items-center gap-1.5">
            <a
              href="https://discord.gg"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-7 w-7 items-center justify-center text-black/50 hover:text-black"
            >
              <FaDiscord size={18} />
            </a>
            <a
              href="https://github.com/basilysf1709/luchor"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-7 w-7 items-center justify-center text-black/50 hover:text-black"
            >
              <FaGithub size={18} />
            </a>
            {session ? (
              <>
                <span className="hidden text-xs text-screamin-green-900 md:inline">
                  {session.user.email}
                </span>
                <button
                  className="flex h-9 items-center bg-screamin-green-800 px-6 text-sm font-medium text-white hover:bg-screamin-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                >
                  {isSigningOut ? "Signing out..." : "Sign out"}
                </button>
              </>
            ) : null}
          </div>
        </header>

        {session && signOutError ? (
          <p className="px-4 text-sm text-red-600">{signOutError}</p>
        ) : null}

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="scrollbar-hidden mx-auto flex h-full w-full max-w-4xl flex-col gap-6 overflow-y-auto px-4 py-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-screamin-green-900">Account</h1>
              <p className="text-sm text-screamin-green-800">
                Manage your account profile and billing details.
              </p>
            </div>

            <div className="inline-flex w-fit border border-screamin-green-200 bg-screamin-green-50 p-1">
              <button
                type="button"
                onClick={() => setSection("account")}
                className={cn(
                  "px-4 py-2 text-sm font-medium",
                  section === "account"
                    ? "bg-screamin-green-800 text-white"
                    : "text-screamin-green-900 hover:bg-screamin-green-100",
                )}
              >
                Account
              </button>
              <button
                type="button"
                onClick={() => setSection("billing")}
                className={cn(
                  "px-4 py-2 text-sm font-medium",
                  section === "billing"
                    ? "bg-screamin-green-800 text-white"
                    : "text-screamin-green-900 hover:bg-screamin-green-100",
                )}
              >
                Billing
              </button>
            </div>

            {section === "account" ? (
              <section className="space-y-4">
                <div className="border border-screamin-green-200 bg-white p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-screamin-green-800" />
                    <h2 className="text-lg font-semibold text-screamin-green-900">
                      Profile
                    </h2>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-screamin-green-900">
                        Full Name
                      </label>
                      <Input defaultValue={userName} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-screamin-green-900">
                        Email
                      </label>
                      <Input defaultValue={userEmail} type="email" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button className="bg-screamin-green-800 text-white hover:bg-screamin-green-700">
                      Save Changes
                    </Button>
                  </div>
                </div>

                <div className="border border-screamin-green-200 bg-white p-5">
                  <h2 className="text-lg font-semibold text-screamin-green-900">
                    Security
                  </h2>
                  <p className="mt-1 text-sm text-screamin-green-800">
                    Password is managed through your sign-in settings.
                  </p>
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      className="border-screamin-green-200 hover:bg-screamin-green-50"
                    >
                      Update Password
                    </Button>
                  </div>
                </div>
              </section>
            ) : (
              <section className="space-y-4">
                <div className="border border-screamin-green-200 bg-white p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-screamin-green-800" />
                    <h2 className="text-lg font-semibold text-screamin-green-900">
                      Usage This Month
                    </h2>
                  </div>
                  {usageLoading ? (
                    <p className="text-sm text-screamin-green-700">Loading usage data...</p>
                  ) : usage ? (
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-wide text-screamin-green-700">
                          Total Tokens
                        </p>
                        <p className="text-2xl font-bold text-screamin-green-900">
                          {usage.totalTokens.toLocaleString()}
                        </p>
                        <p className="text-xs text-screamin-green-600">
                          {usage.promptTokens.toLocaleString()} prompt / {usage.completionTokens.toLocaleString()} completion
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-wide text-screamin-green-700">
                          Requests
                        </p>
                        <p className="text-2xl font-bold text-screamin-green-900">
                          {usage.requestCount.toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-wide text-screamin-green-700">
                          Estimated Cost
                        </p>
                        <p className="text-2xl font-bold text-screamin-green-900">
                          ${(usage.promptTokens * COST_PER_PROMPT_TOKEN + usage.completionTokens * COST_PER_COMPLETION_TOKEN).toFixed(2)}
                        </p>
                        <p className="text-xs text-screamin-green-600">
                          Based on $3/M input, $15/M output tokens
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-screamin-green-700">No usage data available.</p>
                  )}
                </div>

                <div className="mb-2 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-screamin-green-800" />
                  <h2 className="text-lg font-semibold text-screamin-green-900">
                    Choose Your Plan
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {/* Starter */}
                  <div className="flex flex-col border border-screamin-green-200 bg-white p-5">
                    <p className="text-xs uppercase tracking-wide text-screamin-green-700">
                      Starter
                    </p>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-screamin-green-900">$0</span>
                      <span className="text-sm text-screamin-green-700">/month</span>
                    </div>
                    <p className="mt-2 text-sm text-screamin-green-800">
                      Get started with basic agent workflows and data collection.
                    </p>
                    <Separator className="my-4 bg-screamin-green-200" />
                    <ul className="flex-1 space-y-2 text-sm text-screamin-green-900">
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-screamin-green-800" />
                        100 agent runs / month
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-screamin-green-800" />
                        1 concurrent agent
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-screamin-green-800" />
                        Community support
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-screamin-green-800" />
                        Basic data export
                      </li>
                    </ul>
                    <div className="mt-5">
                      <Button
                        variant="outline"
                        className="w-full border-screamin-green-200 hover:bg-screamin-green-50"
                        disabled
                      >
                        Current Plan
                      </Button>
                    </div>
                  </div>

                  {/* Pro */}
                  <div className="relative flex flex-col border-2 border-screamin-green-800 bg-white p-5">
                    <span className="absolute -top-3 left-4 bg-screamin-green-800 px-2 py-0.5 text-xs font-medium text-white">
                      Popular
                    </span>
                    <p className="text-xs uppercase tracking-wide text-screamin-green-700">
                      Pro
                    </p>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-screamin-green-900">$29</span>
                      <span className="text-sm text-screamin-green-700">/month</span>
                    </div>
                    <p className="mt-2 text-sm text-screamin-green-800">
                      For teams scaling their data collection pipelines.
                    </p>
                    <Separator className="my-4 bg-screamin-green-200" />
                    <ul className="flex-1 space-y-2 text-sm text-screamin-green-900">
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-screamin-green-800" />
                        5,000 agent runs / month
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-screamin-green-800" />
                        10 concurrent agents
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-screamin-green-800" />
                        Priority support
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-screamin-green-800" />
                        Advanced data export & API access
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-screamin-green-800" />
                        Custom agent templates
                      </li>
                    </ul>
                    <div className="mt-5">
                      <Button className="w-full bg-screamin-green-800 text-white hover:bg-screamin-green-700">
                        Upgrade to Pro
                      </Button>
                    </div>
                  </div>

                  {/* Enterprise */}
                  <div className="flex flex-col border border-screamin-green-200 bg-white p-5">
                    <p className="text-xs uppercase tracking-wide text-screamin-green-700">
                      Enterprise
                    </p>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-screamin-green-900">$99</span>
                      <span className="text-sm text-screamin-green-700">/month</span>
                    </div>
                    <p className="mt-2 text-sm text-screamin-green-800">
                      Unlimited power for large-scale operations.
                    </p>
                    <Separator className="my-4 bg-screamin-green-200" />
                    <ul className="flex-1 space-y-2 text-sm text-screamin-green-900">
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-screamin-green-800" />
                        Unlimited agent runs
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-screamin-green-800" />
                        Unlimited concurrent agents
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-screamin-green-800" />
                        Dedicated support & SLA
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-screamin-green-800" />
                        SSO & team management
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-screamin-green-800" />
                        Custom integrations & webhooks
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-screamin-green-800" />
                        Audit logs & compliance
                      </li>
                    </ul>
                    <div className="mt-5">
                      <Button className="w-full bg-screamin-green-800 text-white hover:bg-screamin-green-700">
                        Upgrade to Enterprise
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border border-screamin-green-200 bg-white p-5">
                  <h2 className="text-lg font-semibold text-screamin-green-900">
                    Billing History
                  </h2>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between border border-screamin-green-100 bg-screamin-green-50 px-3 py-2 text-sm">
                      <span className="text-screamin-green-900">No invoices yet</span>
                      <span className="text-screamin-green-700">-</span>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
