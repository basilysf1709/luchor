# Repository Guidelines

## Project Structure & Module Organization
This repository currently centers on the `web/` frontend (Next.js 16 + TypeScript). Main locations:
- `web/src/app/`: App Router entrypoints (`layout.tsx`, `page.tsx`) and global styles.
- `web/src/components/`: application components; reusable primitives live in `web/src/components/ui/`.
- `web/src/hooks/`: custom React hooks (for example `use-mobile.ts`).
- `web/src/lib/`: shared utilities and integrations (for example `utils.ts`, `db.ts`).
- `agent/`: Agent DSL layer — declarative tool/agent/handoff definitions and runtime bridge to AI SDK v6.
- `web/src/app/api/chat/`: Chat API route that proxies requests to the deployed agent service.
- `web/src/components/chat/`: Chat UI components (ChatPage, AgentIndicator).
- `web/src/components/assistant-ui/`: assistant-ui scaffolded components (Thread, ToolFallback, etc.).
- `web/public/assets/`: static files such as logos.
- `research-papers/`: reference material, not part of runtime code.

## Build, Test, and Development Commands
Run web commands from `web/`:
- `npm run dev`: start local dev server at `http://localhost:3000`.
- `npm run lint`: run ESLint (Next.js core-web-vitals + TypeScript rules).
- `npm run build`: create a production build.
- `npm run start`: serve the production build.

Run agent commands from `agent/`:
- `npm install`: install agent service dependencies.
- `npm run dev`: start the agent microservice in watch mode.
- `npm run start`: start the agent microservice once.

Typical flow:
```bash
cd web
npm run lint
npm run build
```

## Coding Style & Naming Conventions
- Language: TypeScript (`strict: true` in `tsconfig.json`).
- Indentation: 2 spaces; keep imports grouped and ordered consistently.
- React components: PascalCase export names; file names are typically kebab-case (for example `app-sidebar.tsx`).
- Hooks: `use-*.ts` naming in `src/hooks/`.
- Use path alias `@/*` for `src/*` imports.
- Prefer `cn()` from `src/lib/utils.ts` for composing Tailwind class names.

## Testing Guidelines
No dedicated test runner is configured yet. Until one is added, treat `npm run lint` and `npm run build` as required pre-PR checks. For new tests, use `*.test.ts` / `*.test.tsx` naming and place them close to the code they validate.

## Commit & Pull Request Guidelines
Recent commits use short, imperative subjects (for example `Update header: ...`). Follow this style:
- Keep subject concise and action-oriented.
- Scope each commit to one logical change.
- In PRs, include: summary, why the change is needed, verification steps, and screenshots for UI updates.
- Link related issue/task IDs when available.

## AI Chat Architecture
- **Web chat route** (`web/src/app/api/chat/route.ts`) — forwards chat requests to the external agent service URL.
- **assistant-ui** (`@assistant-ui/react`, `@assistant-ui/react-ai-sdk`) — pre-built chat UI primitives.
- **Agent DSL** (`agent/`) — `defineTool()` and `defineAgent()` builders with handoff support.
- Runtime engine (`agent/runtime/`) bridges DSL definitions to AI SDK v6 `ToolSet` format.
- **Agent HTTP service** (`agent/server.ts`) exposes `/health` and `/api/chat`.
- **Agent runtime** (`agent/chat-runtime.ts`) uses Vercel AI SDK v6 (`ai`, `@ai-sdk/anthropic`) for streaming and tool execution.
- Handoffs use `transfer_to_<agent>` tools returning `{ __handoff: true, targetAgent }` markers.
- AI SDK v6 uses `inputSchema` (not `parameters`), async `convertToModelMessages()`, and `stopWhen: stepCountIs(n)` instead of `maxSteps`.

## Security & Configuration Tips
- Keep secrets in `.env`/`.env.local`; never commit credentials.
- `AGENT_SERVICE_CHAT_URL` must be set for the web chat proxy route.
- `ANTHROPIC_API_KEY` must be set in the separately deployed agent service environment.
- If using `src/lib/db.ts`, ensure `DATABASE_URL` is set locally before running features that require DB access.
