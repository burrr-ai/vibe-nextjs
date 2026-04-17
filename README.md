# vibe-nextjs

An opinionated Next.js starter built for **vibe coding** — chat-driven, AI-assistant-first development on top of Cloudflare's edge stack.

## Why this template

- **AI-first project layout.** A `.claude/` skill set (`db-setup`, `auth-setup`, `storage-setup`, `refactoring`, `first-request`) lets a Claude/LLM agent provision real infra (D1, R2, better-auth) on demand instead of leaving the user to wire it up by hand.
- **Screen-first, DB-later workflow.** Repository-pattern mocks under `src/server/repository/_data/` keep the UI flowing while persistence lands later — no premature schema decisions.
- **Strict layered architecture.** `page → state → api → repository` enforced by ESLint and `.ai.md` guides per layer, so an agent (or a human) writes code in the right place by default.
- **Service split out of the box.** `src/services/{app,admin}/...` cleanly separates user and admin surfaces; add another service when you have a genuinely different user type.
- **Cloudflare-native.** Next.js 15 + App Router via `@opennextjs/cloudflare`, deploying to Workers with D1 (SQLite) + R2 (object storage) bindings already scaffolded.
- **Modern, sane defaults.** React 19, TypeScript, Tailwind v4, Radix UI + MUI, Drizzle ORM, better-auth, comwit state, zod, react-hook-form, sonner, overlay-kit.
- **Secrets via `.env`.** Cloudflare/R2 credentials live in `.env` (gitignored). No infra secrets are hardcoded in skill assets — see `.env.example`.
- **Fast feedback loop.** `pnpm run validate` (typecheck + lint) gates every change; Turbopack-powered dev server via `.tools/start-dev-server.sh`.

## Quick start

```bash
pnpm install
cp .env.example .env   # fill in Cloudflare + R2 values
pnpm dev
```

Open <http://localhost:3000>.

## Stack

Next.js 15 · React 19 · TypeScript · Tailwind v4 · Drizzle ORM · D1 · R2 · better-auth · comwit · Radix UI · MUI · OpenNext on Cloudflare Workers.

## Project layout

```
src/
  services/{service}/      api/ · state/ · page/      (layered, per-service)
  app/                     Next.js App Router (routing only)
  lib/                     Shared components, hooks, utils
  server/
    config.ts              Server-only config (sensitive constants)
    db/, repository/       DB access + mock data gateway
.claude/skills/            Agent-invokable setup skills
```

See `CLAUDE.md` for the full development guide.
