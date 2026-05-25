# vibe-nextjs

A Next.js 15 (App Router) base template tuned for **AI-assisted product development**: a non-developer "founder" talks to an LLM coding agent (Claude Code / Codex), and the project's structure, ESLint rules, and skill prompts keep the generated code maintainable as it grows.

The template ships an opinionated layout (`page → state → api → repository`), a set of `.ai.md` guide files that the agent reads before touching each layer, and Cloudflare-friendly defaults (Workers + D1 + R2 via OpenNext).

---

## Quick start

```bash
pnpm install
cp .env.example .env      # then fill in your Cloudflare credentials
pnpm dev                  # http://localhost:3000
```

Type-check + lint in one shot:

```bash
pnpm run validate
```

---

## `.env` setup

The agent provisions Cloudflare resources (D1 databases, R2 buckets) for you whenever you ask for DB or file upload — it calls the `wrangler` CLI under the hood. For that to work non-interactively, put your Cloudflare credentials in `.env` at the repo root. `.env` is git-ignored.

Copy the template:

```bash
cp .env.example .env
```

```dotenv
# Cloudflare account that owns the D1 database / R2 bucket.
# https://dash.cloudflare.com → right sidebar
CLOUDFLARE_ACCOUNT_ID=

# Cloudflare API token. Easiest path:
#   https://dash.cloudflare.com/profile/api-tokens → "Create Token"
#   → use the "Edit Cloudflare Workers" template, or a custom token with
#     Workers Scripts: Edit, D1: Edit, R2 Storage: Edit
CLOUDFLARE_API_TOKEN=
```

That's it — these credentials are only read by `wrangler` (and by `drizzle-kit` via the D1 HTTP driver during migrations). The deployed app uses Cloudflare **bindings** at runtime, so no access keys end up in product code. Reading `process.env` directly from product code is also forbidden by ESLint; always go through `src/server/config.ts`.

---

## What this project is, and how it stays maintainable

A vibe-coded MVP is easy to start and quickly turns into spaghetti — components reach into the database, state lives wherever it was first typed, and every new screen wires itself up a little differently. This template prevents that by codifying a single shape for every feature and letting ESLint enforce it.

### One dependency direction

```
page ──> state ──> api ──> repository
```

- `repository/` is the only place that touches the database (or mock data in `_data/`).
- `api/` is Server Actions that call the repository.
- `state/` holds client/server state (via `comwit`) and calls APIs.
- `page/` is UI. It never imports from `api` or `repository` directly.

When the agent adds a feature it works **bottom-up**: repository → api → state → page. That ordering falls out naturally once you read each layer's `.ai.md`.

### ESLint as architecture enforcement

`eslint-rules/` contains custom rules that fail the build (or `pnpm run validate`) if the conventions are broken — for example:

- `no-page-mock-import` — pages can't reach into `_data/` mock fixtures
- `no-db-in-api` — Server Actions can't import Drizzle directly; they go through the repository
- `client-component-no-api-import` — `"use client"` components can't import `api/`
- `state-structure`, `api-structure`, `app-structure` — folder shape is mandatory
- `kebab-case-filename`, `no-next-image`, `no-anchor-tag`, `no-root-app-folder` — surface-level hygiene
- `api-only-server-action`, `api-action-error`, `api-create-action` — Server Action shape
- `index-only-import`, `no-direct-comwit-import`, `no-multiple-state-hook-calls` — import discipline for state

These rules make agent-written code rejectable on contact with `pnpm run validate`, which means the agent self-corrects instead of silently drifting.

### Skills (LLM playbooks shipped in the repo)

Two parallel skill trees ship with the project:

- `.claude/skills/` — for Claude Code
- `.agents/skills/` — for Codex / generic agent runtimes

Each skill is a small Markdown playbook the agent invokes at the right moment:

| Skill | When it triggers |
|-------|------------------|
| `first-request` | The very first message of a new project — plan, confirm, then build. |
| `db-setup` | "Connect a DB", "add D1" — provisions Drizzle + D1. |
| `auth-setup` | "Add login / sign up" — installs Better Auth (requires `db-setup` first). |
| `storage-setup` | "Add image / file upload" — provisions an R2 bucket and exposes a server-side `uploadFile(file)`. |
| `refactoring` | "Refactor please" — multi-step pass that re-aligns the codebase against the `.ai.md` guides. |

### The refactoring skill

`refactoring/` is the safety valve. As features accumulate, drift creeps in — a mock import that survived, a Server Action that quietly imports Drizzle, a state hook called from a page. Asking the agent to run the refactoring skill walks every layer's `.ai.md`, fixes violations in order (step0 → step5), and ends with a clean `pnpm run validate`. Run it whenever the project starts feeling messy.

---

## Project layout

```
src/
  services/             # split by audience (default: app, admin)
    {service}/
      api/{domain}/     # Server Actions
      state/{domain}/   # state (comwit)
      page/{route}/     # UI
  app/                  # Next.js App Router — routing only
  lib/                  # shared components, hooks, utilities
  server/               # server-only
    config.ts           # the ONLY file that reads process.env
    db/                 # Drizzle schema + client
    repository/         # single gateway for DB + mock data
    storage/            # R2 uploads (after storage-setup runs)
```

Every layer has a `.ai.md` next to it — read those before editing if you're contributing manually.

---

## Tech stack

- **Next.js 15.4** (App Router, Turbopack dev)
- **React 19**
- **TypeScript 5**
- **Tailwind v4** + shadcn-style primitives + Radix UI
- **Drizzle ORM** on Cloudflare D1
- **Better Auth** for auth
- **R2** for object storage (via `@aws-sdk/client-s3` S3-compatible API)
- **OpenNext** for Cloudflare Workers deployment
- **comwit** for state
- **pnpm** as the package manager
