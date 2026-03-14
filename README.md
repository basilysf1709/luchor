<p align="center">
  <img src="web/public/assets/logo.svg" width="200" alt="Luchor logo" />
</p>

<h1 align="center">luchor</h1>

---

<p align="center"><b>Multi-Agent Web Data Collection</b></p>

<p align="center">
A multi-agent system for web data collection powered by AI. Declarative agent DSL, handoff orchestration, async deep research, and a real-time streaming chat interface.<br/>
One platform. Multiple agents. Structured output.
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> &bull;
  <a href="#architecture">Architecture</a> &bull;
  <a href="#agents">Agents</a> &bull;
  <a href="https://github.com/basilysf1709/luchor">GitHub</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/stack-Next.js%20%7C%20AI%20SDK%20v6-blue" alt="stack" />
  <img src="https://img.shields.io/badge/agents-Claude%20%7C%20Multi--Agent-green" alt="agents" />
  <img src="https://img.shields.io/badge/license-MIT-orange" alt="license" />
  <img src="https://img.shields.io/badge/language-TypeScript-blue" alt="language" />
</p>

---

## Quick Start

```bash
# Clone
git clone https://github.com/basilysf1709/luchor.git
cd luchor

# Agent service
cd agent
npm install
cp .env.example .env   # add your ANTHROPIC_API_KEY
npm run dev

# Web frontend (in another terminal)
cd web
npm install
cp .env.example .env   # add DATABASE_URL, AGENT_SERVICE_CHAT_URL
npm run dev
```

## Architecture

```
┌─────────────┐         ┌──────────────────┐
│  Next.js 16 │ ──────▶ │  Agent Service   │
│  Web Client │ stream  │  (AI SDK v6)     │
└─────────────┘         └──────────────────┘
       │                        │
       │                  ┌─────┴─────┐
       │                  │ Orchestrator│
       │                  └─────┬─────┘
       │               ┌───────┼───────┐
       │               ▼       ▼       ▼
       │           Tools   Handoffs  Sub-Agents
       │
  ┌────┴────┐
  │ PG + DB │  ◀── Token usage tracking
  └─────────┘
```

## Agents

| Agent | Description |
|-------|-------------|
| **Orchestrator** | Routes requests, manages design workflows, delegates research |
| **Deep Researcher** | Async background agent for thorough multi-step research |

## Key Features

- **Declarative Agent DSL** — `defineAgent()` / `defineTool()` for clean agent definitions
- **Handoff Pattern** — Agents delegate via `transfer_to_<agent>` tools
- **Async Sub-Agents** — Background `generateText` tasks with polling, zero context bloat
- **Streaming Chat** — Real-time AI SDK v6 streaming with agent indicator
- **Token Tracking** — Per-user usage metering with TransformStream tap
- **Better Auth** — Email/password authentication with session management

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, shadcn/ui, assistant-ui |
| Agent Runtime | Vercel AI SDK v6, Anthropic Claude |
| Database | PostgreSQL (PlanetScale), Drizzle ORM |
| Auth | Better Auth |

## License

MIT
