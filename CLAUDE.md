# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # ESLint
npm start        # Start production server
```

## Architecture

This is the **web frontend** for Luchor, a multi-agent web data collection system. Built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4.

### Key Directories

- `src/app/` — Next.js App Router pages and layouts
- `src/components/ui/` — shadcn/ui components (Radix UI + Tailwind)
- `src/components/` — App-level components (e.g., `app-sidebar.tsx`)
- `src/hooks/` — Custom React hooks
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)

### Import Aliases

Path aliases are configured in `tsconfig.json`: `@/*` maps to `./src/*`.

### UI Component System

- **shadcn/ui** with "new-york" style — add components via `npx shadcn@latest add <component>`
- Components use **Radix UI** primitives for accessibility
- Variants are defined with **class-variance-authority (CVA)**
- Icons: `lucide-react` (primary), `react-icons` (for brand icons like Discord/GitHub)

### Styling

- **Tailwind CSS v4** — theme is defined in `src/app/globals.css` using `@theme` directives (no `tailwind.config.js`)
- Custom color palette: "screamin-green" scale with primary at `--color-screamin-green-800`
- CSS variables define the full design token system (radius, colors, sidebar dimensions)
- Font: PT Sans (loaded from Google Fonts in `layout.tsx`)
- Use the `cn()` utility from `@/lib/utils` for conditional/merged class names

### AI Chat System

- **Vercel AI SDK v6** (`ai`, `@ai-sdk/anthropic`) for streaming/state management with Claude
- **assistant-ui** (`@assistant-ui/react`, `@assistant-ui/react-ai-sdk`) for pre-built chat UI components
- **Agent DSL** (`src/lib/agents/`) — declarative agent/tool/handoff definitions

#### Agent DSL (`src/lib/agents/`)

- `define-tool.ts` — `defineTool({ name, description, parameters: z.object(...), execute })`
- `define-agent.ts` — `defineAgent({ name, description, instructions, tools?, handoffs?, maxSteps? })`
- `types.ts` — `ToolDefinition`, `AgentDefinition`, `MessageMetadata`, `ConversationState`
- `tools/` — Tool implementations (e.g., `search-web.ts`, `analyze-data.ts`)
- `agents/` — Agent definitions (orchestrator, researcher, analyst)
- `runtime/` — Bridges DSL to AI SDK v6 format:
  - `resolve-tools.ts` — converts `ToolDefinition[]` + handoffs into AI SDK `ToolSet`
  - `resolve-agent.ts` — builds agent registry, system prompts, extracts conversation state from message parts

#### Handoff Pattern

Agents can delegate via `handoffs: [otherAgent]`. Each handoff becomes a `transfer_to_<name>` tool that returns `{ __handoff: true, targetAgent }`. The API route detects these markers in `onStepFinish` and writes agent metadata to the stream.

#### AI SDK v6 Notes

- Uses `inputSchema` (not `parameters`) for tool definitions
- `execute` signature: `(input, options) => OUTPUT`
- `convertToModelMessages()` is async — must `await` it
- `maxSteps` replaced by `stopWhen: stepCountIs(n)`
- Stream metadata via `writer.write({ type: "message-metadata", messageMetadata: {...} })`
- Tool parts have type `tool-${toolName}` with fields directly on the part (no nested `toolInvocation`)

#### Key Files

- `src/app/api/chat/route.ts` — POST handler: resolves active agent, streams via `createUIMessageStream` + `streamText`
- `src/components/chat/chat-page.tsx` — wraps `Thread` with `useChatRuntime()` + `AssistantRuntimeProvider`
- `src/components/chat/agent-indicator.tsx` — badge showing active agent name
- `src/components/assistant-ui/thread.tsx` — customized assistant-ui thread component

### Conventions

- Interactive components require `"use client"` directive
- React Server Components are enabled (`rsc: true` in `components.json`)
- Sidebar state persists via cookies
