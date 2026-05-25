---
name: auth-setup
description: Install Better Auth on Drizzle + D1 for one or more services. Triggers - "set up auth", "log in", "sign up", "add auth". Requires db-setup first.
---

# auth-setup

Set up per-service authentication using Better Auth with Drizzle ORM on SQLite (D1). Each service (`app`, `admin`, `supplier`, …) gets its own prefixed tables, cookies, base path, and auth instance.

Previously this skill tried to do heavy string templating inside a shell script. That proved fragile across macOS vs Linux `sed`. Now: the script does only the trivial shell work, and YOU (the AI) handle every file creation and edit, reading the `.ref` files in `assets/` as reference templates and substituting placeholders yourself.

## Preconditions

- `db-setup` completed. Verify with `npm pkg get cg.plugins.db` — it should print a config object, not `undefined`/`{}`.
- You know which services need auth. For a typical project: `app` (end users) and `admin` (operators).

## Naming conventions

Apply these consistently when substituting placeholders in the `.ref` files. Do the substitution yourself — do not try to drive it with `sed \U` or similar, since BSD sed (macOS) does not support case folding.

| Placeholder | Meaning | Example for `app` | Example for `admin` |
|---|---|---|---|
| `{service}` | lower-case service name | `app` | `admin` |
| `{Service}` | PascalCase, first letter upper | `App` | `Admin` |
| `{SERVICE}` | UPPER_SNAKE | `APP` | `ADMIN` |
| `{basePath}` | Better Auth base path | `/app/api/auth` | `/admin/api/auth` |
| `{homePath}` | post-signIn/signUp redirect path (service home) | `/` | `/admin` |
| `{loginPath}` | post-signOut redirect path (login screen) | `/login` | `/admin/login` |

## Steps

Repeat steps 1–6 for each target service. Steps 7–9 run once at the end.

### 1. Run the helper script

```bash
bash .agents/skills/auth-setup/scripts/setup.sh <service1> [service2] ...
```

This only creates directories and prints a random 64-char hex secret per service. It does NOT generate any TS files. Capture the printed secret(s); you will paste them into `src/server/config.ts` in step 2.

### 2. Secret in `src/server/config.ts`

Add one entry per service inside the `} as const;` block, using the secret from step 1:

```ts
{SERVICE}_AUTH_SECRET: "<secret>",
```

Use `Edit`, not `sed`, so you can place it exactly before `} as const;`.

### 3. Drizzle schema file

Reference: `assets/auth-schema.ts.ref`.

Copy the reference into `src/server/db/plugin/auth/{service}-schema.ts`, replacing every `{service}` and `{Service}` as above.

Critical:
- Do NOT keep any `import 'server-only'` line. drizzle-kit loads this file during `pnpm drizzle-kit generate/migrate` in a plain Node context; `server-only` makes it throw. The reference already omits it; keep it that way.
- Files under `src/server/db/plugin/**` are the only repository-layer files exempt from the `server-only` convention. Repository files that CONSUME these tables still import `server-only`.

### 4. Schema export

Append to `src/server/db/schema.ts`:

```ts
export * from "./plugin/auth/{service}-schema"
```

### 5. Auth server instance

Reference: `assets/auth-server.ts.ref`.

Copy into `src/server/auth/{service}.ts`, substituting placeholders. Exports `get{Service}Auth` and `get{Service}ServerSession`.

Critical:
- Better Auth's Drizzle adapter looks up tables by the EXACT keys `user`, `session`, `account`, `verification`. Because our tables are prefixed (`{service}_auth__user`, etc.), the adapter must receive an explicit mapping. The reference already shows the correct shape:

  ```ts
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: {service}AuthUser,
      session: {service}AuthSession,
      account: {service}AuthAccount,
      verification: {service}AuthVerification,
    },
  }),
  ```

  Do NOT shortcut this with `import * as schema from "@/server/db/schema"` followed by `schema: schema`. At runtime Better Auth will throw `[# Drizzle Adapter]: The model "user" was not found in the schema object`.

### 6. Auth client + API route

- Reference `assets/auth-client.ts.ref` → copy to `src/lib/auth-client/{service}.ts`.
- Reference `assets/auth-route.ts.ref` → copy to `src/app/({service})/{service}/api/auth/[...all]/route.ts`.

Cookie compat note: `auth-server.ts` issues `SameSite=None; Secure` cookies so
the app works inside an HTTPS iframe (preview). Direct `http://localhost:3000`
access also works because modern browsers treat `localhost` as a secure context
and accept `Secure` cookies over plain HTTP. No per-request rewriting needed.

### 7. Replace mocks

If the project was scaffolded with mock state/auth files, swap them for the real ones:

- `src/services/{service}/state/user/actions/auth.ts` ← reference `assets/auth-actions.ts.ref`
- `src/services/{service}/api/user/actions/get-me.ts` ← reference `assets/get-me.ts.ref`

Both references use `{service}Auth` / `get{Service}ServerSession` you created in steps 5–6. Adapt the `User` shape and hook name if the state domain uses a prefixed hook (e.g. `useAdminUser`) or if the admin service omits `signUp`.

If the project has a member profile table (e.g. `{service}_member_profile`) keyed by the auth user id, extend `getMe` to join that table and return the enriched user.

### 8. Migrate DB

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

Use `pnpm`, not `npx`. AGENTS.md mandates pnpm for drizzle commands.

### 9. Record plugin metadata

```bash
npm pkg set cg.plugins.auth.createdAt="$(date -Iseconds)" cg.plugins.auth.provider="better-auth"
```

### 10. Restart dev server

```bash
.tools/start-dev-server.sh 3000
```

### 11. Remove this skill

```bash
rm -rf .agents/skills/auth-setup
```

## Auth guard — in layouts, not middleware

After auth is wired up, **do not** create `src/middleware.ts` to guard routes. Edge middleware can only inspect cookie names; it cannot verify session signatures, detect expiry, or see revoked sessions. Guard in a Server Component layout instead:

- Group protected routes under a route group, e.g. `src/app/({service})/(protected)/...` or `src/app/({service})/{service}/(protected)/...`.
- Keep login / signup pages OUTSIDE that group.
- Create `{...}/(protected)/layout.tsx`:

  ```tsx
  import { redirect } from 'next/navigation'
  import { get{Service}ServerSession } from '@/server/auth/{service}'

  export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const session = await get{Service}ServerSession()
    if (!session?.user) redirect('/login')
    return <>{children}</>
  }
  ```

Trade-off: you lose a `next=<original-path>` query on the redirect (RSCs cannot read the current pathname without middleware). Accept this for MVP; users navigate back manually after login.

## Pitfalls recap

- **Placeholder substitution**: do it yourself. `sed \U` does not work on macOS BSD sed.
- **`import 'server-only'` in Drizzle schema**: breaks `pnpm drizzle-kit generate/migrate`. Never add it under `src/server/db/plugin/**`.
- **Drizzle adapter schema**: must explicitly map `user`/`session`/`account`/`verification`. Shortcut `schema: schema` fails at runtime.
- **Package manager**: use `pnpm drizzle-kit …`, not `npx drizzle-kit …`.
- **Auth guard**: always in a Server Component layout, never in middleware.

## Member table ID sync (if applicable)

Projects that add a `{service}_member_profile` table should key it by the auth user id:

- On sign-up completion, create the profile row with `id = session.user.id`.
- `getMe` joins the profile table and returns the merged object.
