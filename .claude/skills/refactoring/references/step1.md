# Step 1: Structure Refactoring Based on .ai.md

## Project Path

{PROJECT_PATH}

## Your Task

### 0. Read Architecture Rules (DO FIRST)

Read these files to understand the architecture:

- `src/services/.ai.md`
- `src/services/api.ai.md`
- `src/services/state.ai.md`
- `src/services/page.ai.md`
- `src/server/repository/.ai.md`

Data flow: `page → state → api → repository`

**서비스 구조:** 기본은 app(사용자)과 admin(관리자). 전혀 다른 유저 유형과 그에 맞춘 화면이 있다면 별도 서비스로 분리.

### 1. Identify Domains

List all domains in the project (e.g., user, product, order)

### 2. Check Already Staged Files

```bash
git diff --cached --name-only
```

**IMPORTANT**: Skip files already staged. Focus only on unstaged files.

### 3. Parallel Investigation (3 Subagents)

Run 3 agents in parallel to find violations:

**Agent 1: API Violations**

- Missing `src/services/{service}/api/{domain}/` structure (must have types.ts, index.ts)
- Route handlers in `src/app/api/**` (must convert to server actions)
- Exception: `src/app/api/auth/**` is allowed

**Agent 2: State Violations**

- Missing `src/services/{service}/state/{domain}/` structure (must have types.ts, model.ts, actions/, index.ts)
- Auth checks in UI components (must use `@Authorized` decorator in actions)
- Auth state outside `state/user/` (must be centralized)

**Agent 3: Page Violations**

- Missing `src/services/{service}/page/{route}/` structure
- Hardcoded data in components (must move to `src/server/repository/_data/`)
- Direct api imports in pages (must go through state layer)
- Client-side data processing: `.filter()`, `.slice()`, `.reduce()`, `.length` 등으로 데이터 가공하는 코드 → API에서 조인/집계하여 내려줘야 함

Merge violation lists from all agents.

### 4. Fix Violations (Unstaged Files Only)

For each violation found, fix according to .ai.md rules.

**Rules:**

- Mock first: mock data in `src/server/repository/_data/`
- Keep existing real API integrations unchanged
- Image upload uses R2 integration (if needed, trigger `storage-setup` skill)
- Server actions can receive files directly: `file: File | File[]`

### 5. Validate

```bash
pnpm run validate
```

Fix any errors before proceeding.

### 6. Stage Changes

```bash
git add .
```

### 7. Loop Check

If violations remain → go back to step 2
If no violations → proceed to report

### 8. Report (REQUIRED)

You MUST report:

1. **Newly staged file count** (files YOU staged in this iteration)
2. Files fixed in this iteration
3. Any remaining violations found

Example:

```
NEWLY STAGED FILES: 7
Fixed: src/services/app/api/user/types.ts, src/services/app/api/user/index.ts, ...
Remaining: src/services/app/state/product needs refactoring
```
