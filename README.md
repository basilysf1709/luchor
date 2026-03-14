<p align="center">
  <img src="web/public/assets/logo.svg" width="200" alt="Luchor logo" />
</p>

<h1 align="center">luchor</h1>

---

<p align="center"><b>General Purpose Agent</b></p>

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
