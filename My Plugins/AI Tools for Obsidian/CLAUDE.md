# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This folder contains two separate Obsidian plugin projects:

### 1. AI Tools for Obsidian (`aitoolsforobsidian-master/aitoolsforobsidian-master/`)

The main plugin that enables chatting with AI coding agents (Claude Code, Codex, Gemini CLI) directly inside Obsidian. Built on Agent Client Protocol (ACP).

**Tech Stack**: React 19, TypeScript, Obsidian API, Agent Client Protocol

**Key Documentation**:
- `CLAUDE.md` - Detailed architecture and development guide
- `ARCHITECTURE.md` - Full architecture documentation
- `AGENTS.md` - LLM developer guide

**Development Commands**:
```bash
cd aitoolsforobsidian-master/aitoolsforobsidian-master
npm install
npm run dev          # Watch mode development
npm run build        # Production build (runs tsc then esbuild)
npm run format       # Prettier formatting
npm run format:check # Check formatting
npm run lint         # ESLint
npm run lint:fix     # Auto-fix lint issues
```

### 2. Obsidian Sample Plugin Plus (`obsidian-sample-plugin-plus-master/`)

A template for Obsidian plugin development with AI-assisted development tools (OpenSkills system) and ESLint 9 configuration matching Obsidian's review bot.

**Development Commands**:
```bash
cd obsidian-sample-plugin-plus-master
pnpm install
pnpm obsidian-dev-skills  # Initialize AI skills
pnpm dev                   # Watch mode
pnpm build                 # Production build
pnpm lint                  # ESLint check
pnpm lint:fix              # Auto-fix lint issues
```

## Project-Specific Guidance

When working in either project, refer to the project's own `CLAUDE.md` or `AGENTS.md` for detailed architecture, patterns, and conventions specific to that codebase.

## AI Tools for Obsidian - Quick Reference

Since this is the primary project, here are the critical architectural points:

**Architecture Pattern**: React Hooks (hooks own state/logic, components render, adapters integrate external systems)

**Critical Files**:
- `src/components/chat/ChatView.tsx` - Main view, hook composition, adapter instantiation
- `src/hooks/useAgentSession.ts` - Session lifecycle, agent switching
- `src/hooks/useChat.ts` - Message state, streaming updates
- `src/adapters/acp/acp.adapter.ts` - ACP process, JSON-RPC wiring

**Architectural Rules**:
- Domain layer (`src/domain/`) must have zero external dependencies (no `obsidian`, no `@agentclientprotocol/sdk`)
- Add new behavior as hooks in `src/hooks/`, compose in `ChatView.tsx`
- Non-React business logic goes in `src/shared/` as pure functions

**Obsidian Plugin Review Requirements**:
- No `innerHTML`/`outerHTML` - use `createEl`/`createDiv`/`createSpan`
- Don't detach leaves in `onunload`
- Styles in CSS only - no JS style manipulation
- Use `Platform` interface - not `process.platform`

**Naming Conventions**:
- Ports: `*.port.ts`
- Adapters: `*.adapter.ts`
- Hooks: `use*.ts`
- Components: `PascalCase.tsx`
- Utilities/Models: `kebab-case.ts`
