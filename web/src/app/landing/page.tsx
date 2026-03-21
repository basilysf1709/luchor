"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Bot,
  Check,
  Globe,
  Blocks,
  Workflow,
  Terminal,
  Plug,
  Database,
  Zap,
  Shield,
  Users,
  ChevronDown,
  ChevronUp,
  Search,
  MessageSquare,
  BarChart3,
  FileText,
  Menu,
  X,
} from "lucide-react";
import { FaDiscord, FaGithub } from "react-icons/fa";
import {
  SiGmail,
  SiSlack,
  SiNotion,
  SiGithub,
  SiLinear,
  SiPlanetscale,
  SiFigma,
  SiVercel,
  SiJira,
  SiStripe,
} from "react-icons/si";

const features = [
  {
    name: "Multi-Agent System",
    description:
      "Deploy specialized agents that collaborate on complex tasks — research, analysis, code generation, and more.",
    icon: Bot,
  },
  {
    name: "Web & Data Access",
    description:
      "Browse the web, extract structured data, query databases, and interact with APIs — all through natural language.",
    icon: Globe,
  },
  {
    name: "Automation Pipelines",
    description:
      "Schedule recurring tasks, chain agent workflows, and trigger actions automatically based on events.",
    icon: Workflow,
  },
  {
    name: "MCP Server Integrations",
    description:
      "Connect to PlanetScale, GitHub, Slack, Linear, and more through the Model Context Protocol.",
    icon: Plug,
  },
  {
    name: "Skills & Tools",
    description:
      "Extend agent capabilities with composable skills and tools — or build your own custom ones.",
    icon: Blocks,
  },
  {
    name: "CLI & API Access",
    description:
      "Full command-line interface and API for scripting, CI/CD integration, and programmatic control.",
    icon: Terminal,
  },
];

const plans = [
  {
    name: "Starter",
    price: "$0",
    description: "Get started with basic agent workflows and task automation.",
    features: [
      "100 agent runs / month",
      "1 concurrent agent",
      "Community support",
      "Basic data export",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    description: "For teams scaling their agent-powered workflows.",
    features: [
      "5,000 agent runs / month",
      "10 concurrent agents",
      "Priority support",
      "Advanced data export & API access",
      "Custom agent templates",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    description: "Unlimited power for large-scale operations.",
    features: [
      "Unlimited agent runs",
      "Unlimited concurrent agents",
      "Dedicated support & SLA",
      "SSO & team management",
      "Custom integrations & webhooks",
      "Audit logs & compliance",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const faqs = [
  {
    question: "What is Luchor?",
    answer:
      "Luchor is a general-purpose multi-agent platform. It uses AI-powered agents that collaborate to research, analyze, automate tasks, and interact with external services.",
  },
  {
    question: "How do agents work together?",
    answer:
      "Agents use a handoff pattern — an orchestrator agent delegates specialized tasks to researcher, analyst, or other agents. Each agent has its own tools and instructions.",
  },
  {
    question: "Can I connect my own data sources?",
    answer:
      "Yes. Luchor supports MCP (Model Context Protocol) servers, so you can connect databases like PlanetScale, services like GitHub and Slack, and build custom integrations.",
  },
  {
    question: "Is there a CLI?",
    answer:
      "Yes. Install it with `npm install -g luchor` and use commands like `luchor run`, `luchor task`, and `luchor agent` to control agents from your terminal.",
  },
  {
    question: "Do I need to write code to use Luchor?",
    answer:
      "No. The web UI provides a chat interface where you can instruct agents in natural language. For advanced workflows, you can use the CLI or API.",
  },
];

function FaqItem({ faq }: { faq: (typeof faqs)[number] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-sm font-medium text-gray-900">{faq.question}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" />
        )}
      </button>
      {open && (
        <p className="pb-5 text-sm text-gray-600">{faq.answer}</p>
      )}
    </div>
  );
}

function ProductMockup() {
  return (
    <div className="mx-auto mt-10 hidden max-w-6xl px-6 md:block">
      <div className="overflow-hidden border border-gray-200 bg-white shadow-2xl shadow-black/10">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-5 py-3.5">
          <div className="flex gap-2">
            <span className="h-3.5 w-3.5 rounded-full bg-gray-300" />
            <span className="h-3.5 w-3.5 rounded-full bg-gray-300" />
            <span className="h-3.5 w-3.5 rounded-full bg-gray-300" />
          </div>
          <div className="ml-4 flex-1 bg-gray-200/60 px-4 py-1.5 text-sm text-gray-400">
            luchor.app
          </div>
        </div>
        {/* App content */}
        <div className="flex h-[460px]">
          {/* Sidebar mock */}
          <div className="w-56 shrink-0 border-r border-gray-100 bg-gray-50/50 p-4">
            <div className="mb-5 flex items-center gap-2.5">
              <Image src="/assets/logo.svg" alt="Luchor" width={20} height={20} />
              <span className="text-sm font-bold text-gray-900">Luchor</span>
            </div>
            <div className="space-y-1">
              {[
                { icon: Search, label: "Search", active: false },
                { icon: MessageSquare, label: "Agents", active: true },
                { icon: Workflow, label: "Automations", active: false },
                { icon: Blocks, label: "Skills", active: false },
                { icon: Plug, label: "MCP Servers", active: false },
                { icon: Database, label: "Storage", active: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2.5 px-3 py-2 text-sm ${
                    item.active
                      ? "bg-screamin-green-100 font-medium text-screamin-green-900"
                      : "text-gray-500"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
          {/* Main content mock */}
          <div className="flex flex-1 flex-col">
            {/* Agent header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-3.5">
              <div className="flex items-center gap-2.5">
                <Bot className="h-5 w-5 text-screamin-green-800" />
                <span className="text-sm font-medium text-gray-900">Orchestrator</span>
                <span className="bg-screamin-green-100 px-2.5 py-0.5 text-xs text-screamin-green-800">
                  Running
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-1">
                  <span className="flex h-6 w-6 items-center justify-center bg-screamin-green-200 text-[10px] font-medium text-screamin-green-900">R</span>
                  <span className="flex h-6 w-6 items-center justify-center bg-blue-200 text-[10px] font-medium text-blue-900">A</span>
                  <span className="flex h-6 w-6 items-center justify-center bg-amber-200 text-[10px] font-medium text-amber-900">S</span>
                </div>
              </div>
            </div>
            {/* Chat area */}
            <div className="flex-1 space-y-4 overflow-hidden p-6">
              <div className="flex gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center bg-screamin-green-800">
                  <Bot className="h-4 w-4 text-white" />
                </span>
                <div className="bg-gray-50 px-4 py-2.5 text-sm text-gray-700">
                  Researching competitor landscape. Handing off to Researcher agent for deep analysis...
                </div>
              </div>
              <div className="ml-10 flex gap-4">
                <div className="border border-gray-200 px-4 py-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FileText className="h-3.5 w-3.5" />
                    report.json
                  </div>
                  <p className="mt-1.5 text-xs font-medium text-gray-900">12 insights found</p>
                </div>
                <div className="border border-gray-200 px-4 py-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <BarChart3 className="h-3.5 w-3.5" />
                    Analysis
                  </div>
                  <p className="mt-1.5 text-xs font-medium text-gray-900">Summary ready</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center bg-blue-600">
                  <Search className="h-4 w-4 text-white" />
                </span>
                <div className="bg-gray-50 px-4 py-2.5 text-sm text-gray-700">
                  Analyst agent completed. Results exported and synced to PlanetScale.
                </div>
              </div>
            </div>
            {/* Actions */}
            <div className="border-t border-gray-100 px-6 py-3">
              <div className="flex items-center gap-3">
                {["Run task", "New automation", "Export data", "New agent"].map((action) => (
                  <span
                    key={action}
                    className="border border-gray-200 px-3 py-1.5 text-xs text-gray-600"
                  >
                    {action}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {/* Right panel mock */}
          <div className="w-52 shrink-0 border-l border-gray-100 p-4">
            <p className="mb-3 text-xs font-medium text-gray-900">Agent Activity</p>
            <div className="space-y-3">
              {[
                { agent: "Orchestrator", status: "Coordinating", color: "bg-screamin-green-500" },
                { agent: "Researcher", status: "Analyzing", color: "bg-blue-500" },
                { agent: "Analyst", status: "Complete", color: "bg-amber-500" },
              ].map((a) => (
                <div key={a.agent} className="bg-gray-50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${a.color}`} />
                    <span className="text-xs font-medium text-gray-900">{a.agent}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-gray-500">{a.status}</p>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <p className="mb-3 text-xs font-medium text-gray-900">Quick Actions</p>
              <div className="space-y-1.5">
                {["View logs", "Stop agent", "Export results", "Schedule run"].map((action) => (
                  <div
                    key={action}
                    className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                  >
                    {action}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero card */}
      <div className="p-2 sm:p-4">
        <div className="relative overflow-hidden bg-white">
          {/* Nav inside the card */}
          <nav className="relative z-20 flex items-center justify-between px-4 py-4 sm:px-8 sm:py-5">
            <div className="flex items-center gap-8">
              <Link href="/landing" className="flex items-center gap-2">
                <Image
                  src="/assets/logo.svg"
                  alt="Luchor"
                  width={22}
                  height={22}
                />
                <span className="text-lg font-bold">Luchor</span>
              </Link>
              <div className="hidden items-center gap-6 md:flex">
                <a href="#features" className="text-sm text-gray-600 hover:text-black">
                  Features
                </a>
                <a href="#pricing" className="text-sm text-gray-600 hover:text-black">
                  Pricing
                </a>
                <a href="#faq" className="text-sm text-gray-600 hover:text-black">
                  FAQ
                </a>
              </div>
            </div>
            <div className="hidden items-center gap-4 md:flex">
              <a
                href="https://github.com/basilysf1709/luchor"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-black"
              >
                GitHub
              </a>
              <Link
                href="/"
                className="border border-screamin-green-800 bg-screamin-green-800 px-4 py-2 text-sm font-medium text-white hover:bg-screamin-green-700"
              >
                Launch App
              </Link>
            </div>
            <button
              className="flex h-9 w-9 items-center justify-center text-gray-700 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </nav>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="relative z-20 border-b border-gray-100 px-4 pb-4 md:hidden">
              <div className="flex flex-col gap-3">
                <a href="#features" className="text-sm text-gray-600 hover:text-black" onClick={() => setMobileMenuOpen(false)}>
                  Features
                </a>
                <a href="#pricing" className="text-sm text-gray-600 hover:text-black" onClick={() => setMobileMenuOpen(false)}>
                  Pricing
                </a>
                <a href="#faq" className="text-sm text-gray-600 hover:text-black" onClick={() => setMobileMenuOpen(false)}>
                  FAQ
                </a>
                <a
                  href="https://github.com/basilysf1709/luchor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-black"
                >
                  GitHub
                </a>
                <Link
                  href="/"
                  className="inline-flex w-fit border border-screamin-green-800 bg-screamin-green-800 px-4 py-2 text-sm font-medium text-white hover:bg-screamin-green-700"
                >
                  Launch App
                </Link>
              </div>
            </div>
          )}

          {/* Hero content with flanking logos */}
          <div className="relative px-4 pb-8 pt-12 sm:px-8 sm:pt-20">
            {/* Logo fans — same height container so SVG aligns with logos */}
            {/* 5 logos * 40px + 4 gaps * 20px = 280px */}
            <div className="pointer-events-none absolute inset-x-0 top-1/2 hidden h-[280px] -translate-y-1/2 lg:block">
              {/* SVG lines — coordinates match the 280px-tall logo column */}
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 280" preserveAspectRatio="none" fill="none">
                {/* Left side — horizontal line from center, then curves splitting to each logo */}
                {/* Horizontal trunk */}
                <line x1="350" y1="140" x2="270" y2="140" stroke="#afffb6" strokeWidth="1.5" />
                {/* Curved branches from split point to each logo */}
                <path d="M270 140 Q230 140 170 20" fill="none" stroke="#afffb6" strokeWidth="1.5" />
                <path d="M270 140 Q220 140 170 80" fill="none" stroke="#afffb6" strokeWidth="1.5" />
                <line x1="270" y1="140" x2="170" y2="140" stroke="#afffb6" strokeWidth="1.5" />
                <path d="M270 140 Q220 140 170 200" fill="none" stroke="#afffb6" strokeWidth="1.5" />
                <path d="M270 140 Q230 140 170 260" fill="none" stroke="#afffb6" strokeWidth="1.5" />
                {/* Right side — horizontal line from center, then curves splitting to each logo */}
                {/* Horizontal trunk */}
                <line x1="650" y1="140" x2="730" y2="140" stroke="#afffb6" strokeWidth="1.5" />
                {/* Curved branches from split point to each logo */}
                <path d="M730 140 Q770 140 830 20" fill="none" stroke="#afffb6" strokeWidth="1.5" />
                <path d="M730 140 Q780 140 830 80" fill="none" stroke="#afffb6" strokeWidth="1.5" />
                <line x1="730" y1="140" x2="830" y2="140" stroke="#afffb6" strokeWidth="1.5" />
                <path d="M730 140 Q780 140 830 200" fill="none" stroke="#afffb6" strokeWidth="1.5" />
                <path d="M730 140 Q770 140 830 260" fill="none" stroke="#afffb6" strokeWidth="1.5" />
              </svg>

              {/* Left logos */}
              <div className="absolute left-[15%] top-0 flex h-full flex-col justify-between">
                {[
                  { icon: SiGmail, label: "Gmail" },
                  { icon: SiSlack, label: "Slack" },
                  { icon: SiNotion, label: "Notion" },
                  { icon: SiGithub, label: "GitHub" },
                  { icon: SiLinear, label: "Linear" },
                ].map((item) => (
                  <div key={item.label} className="relative z-10 flex h-10 w-10 items-center justify-center border border-gray-200 bg-white text-gray-700">
                    <item.icon size={16} />
                  </div>
                ))}
              </div>

              {/* Right logos */}
              <div className="absolute right-[15%] top-0 flex h-full flex-col justify-between">
                {[
                  { icon: SiPlanetscale, label: "PlanetScale" },
                  { icon: SiFigma, label: "Figma" },
                  { icon: SiVercel, label: "Vercel" },
                  { icon: SiJira, label: "Jira" },
                  { icon: SiStripe, label: "Stripe" },
                ].map((item) => (
                  <div key={item.label} className="relative z-10 flex h-10 w-10 items-center justify-center border border-gray-200 bg-white text-gray-700">
                    <item.icon size={16} />
                  </div>
                ))}
              </div>
            </div>

            {/* Center content */}
            <div className="relative z-10 text-center">
              <h1 className="mx-auto max-w-3xl text-3xl font-bold leading-[1.1] tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                Build powerful workflows
                <br />
                with AI agents
              </h1>
              <p className="mx-auto mt-4 max-w-lg text-sm text-gray-500 sm:mt-6 sm:text-base">
                Finally, a multi-agent platform that doesn&apos;t overcomplicate it
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row">
                <Link
                  href="/"
                  className="border border-screamin-green-800 bg-screamin-green-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-screamin-green-700"
                >
                  Try for free
                </Link>
                <a
                  href="https://github.com/basilysf1709/luchor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-screamin-green-200 bg-white px-6 py-2.5 text-sm font-medium text-screamin-green-900 hover:bg-screamin-green-50"
                >
                  View on GitHub
                </a>
              </div>
            </div>
          </div>

          {/* Product mockup */}
          <ProductMockup />

        </div>
      </div>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Everything you need to build with agents
          </h2>
          <p className="mt-3 text-gray-600">
            A complete platform for building, deploying, and managing AI-powered agent workflows.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-16 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="group border border-gray-200 p-6 transition-colors hover:border-gray-300"
            >
              <span className="flex h-10 w-10 items-center justify-center bg-screamin-green-50 text-screamin-green-800">
                <feature.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-sm font-medium text-gray-900">
                {feature.name}
              </h3>
              <p className="mt-2 text-sm text-gray-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">How it works</h2>
            <p className="mt-3 text-gray-600">
              Three steps to powerful agent workflows.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-10 sm:mt-16 md:grid-cols-3 md:gap-8">
            {[
              {
                step: "01",
                title: "Describe your task",
                description:
                  "Tell an agent what you need in natural language. Research, analyze, automate — or let the agent figure it out.",
                icon: Zap,
              },
              {
                step: "02",
                title: "Agents collaborate",
                description:
                  "Specialized agents coordinate — researching, analyzing, connecting to services, and producing structured output.",
                icon: Users,
              },
              {
                step: "03",
                title: "Export & automate",
                description:
                  "Get results in any format, push to your database, or trigger downstream actions. Schedule recurring runs.",
                icon: Database,
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center bg-screamin-green-800 text-sm font-bold text-white">
                  {item.step}
                </span>
                <h3 className="mt-4 text-base font-medium text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Pricing</h2>
          <p className="mt-3 text-gray-600">
            Start free. Scale as you grow.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-16 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col p-6 ${
                plan.highlighted
                  ? "border-2 border-screamin-green-800 bg-white"
                  : "border border-gray-200 bg-white"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-4 bg-screamin-green-800 px-3 py-0.5 text-xs font-medium text-white">
                  Popular
                </span>
              )}
              <p className="text-xs uppercase tracking-wide text-screamin-green-700">
                {plan.name}
              </p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-screamin-green-900">
                  {plan.price}
                </span>
                <span className="text-sm text-screamin-green-700">/month</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
              <ul className="mt-6 flex-1 space-y-2 text-sm text-gray-900">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-screamin-green-800" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Link
                  href="/"
                  className={`flex w-full items-center justify-center py-2.5 text-sm font-medium ${
                    plan.highlighted
                      ? "bg-screamin-green-800 text-white hover:bg-screamin-green-700"
                      : "border border-gray-200 text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust / Security */}
      <section className="border-y border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-6 sm:py-16">
          <Shield className="mx-auto h-8 w-8 text-screamin-green-800" />
          <h2 className="mt-4 text-xl font-bold text-screamin-green-900 sm:text-2xl">
            Built for security & reliability
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-screamin-green-700">
            Enterprise-grade infrastructure with SOC 2 compliance, encrypted data at rest and
            in transit, role-based access control, and 99.9% uptime SLA.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Frequently asked questions
          </h2>
        </div>
        <div className="mt-12">
          {faqs.map((faq) => (
            <FaqItem key={faq.question} faq={faq} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
        <div className="bg-screamin-green-800 px-6 py-12 text-center sm:px-8 sm:py-16">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Start building with agents today
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-screamin-green-100">
            Deploy your first agent workflow in minutes. No credit card required.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 bg-white px-6 py-3 text-sm font-medium text-screamin-green-900 hover:bg-screamin-green-50"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-6 sm:flex-row sm:justify-between sm:gap-0 sm:px-6 sm:py-8">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/logo.svg"
              alt="Luchor"
              width={20}
              height={20}
            />
            <span className="text-sm font-bold">Luchor</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://discord.gg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-black"
            >
              <FaDiscord size={16} />
            </a>
            <a
              href="https://github.com/basilysf1709/luchor"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-black"
            >
              <FaGithub size={16} />
            </a>
          </div>
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Luchor. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
