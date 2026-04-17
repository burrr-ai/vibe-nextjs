---
name: refactoring
description: Refactor project based on .ai.md guidelines. Triggers - "리팩토링 해줘", "refactor"
---

# Refactoring Skill

## Critical Rules

1. **MUST use Task tool** - Never refactor code directly. Always spawn subagent.
2. **Fresh subagent every time** - Each Task spawn creates NEW context. Never reuse subagent.
3. **Read stepN.md first** - Pass content to subagent prompt with project path.

## How to Spawn Subagent

```
Task(
  description: "Step N iteration M",
  subagent_type: "general-purpose",
  prompt: "<content of references/stepN.md with {PROJECT_PATH} replaced>"
)
```

## First: Check Mock Status

```bash
ls src/server/repository/_data 2>/dev/null && echo "MOCK_EXISTS" || echo "NO_MOCK"
```

**If `MOCK_EXISTS`** → Full refactoring (Step 0-5)

**If `NO_MOCK`** → Maintenance mode (Step 1, 3-5 only)

---

## Full Refactoring Flow (Mock Exists)

### Pre-Step: Clean Up Unused Files

**MUST run before Step 0.** Delete all unused files in one shot:

```bash
bash .claude/skills/refactoring/knip-clean.sh
```

This reduces codebase size before refactoring starts.

### Step 0: Prerequisites Setup (1x)

**MUST run after Pre-Step.**

Spawn subagent with `references/step0.md`:
- Invokes `db-setup` skill if `src/server/db/` doesn't exist
- Invokes `auth-setup` skill if `src/server/auth/` doesn't exist

### Step 1: Structure Refactoring (3 outer loops)

```
OUTER LOOP (3x):
│
├─ INNER LOOP (max 8x OR newly staged ≤5):
│   ├─ Spawn NEW subagent (fresh context)
│   ├─ Subagent: fix violations, run validate, git add .
│   ├─ Check: how many NEW files staged this iteration?
│   └─ If newly staged ≤5 → exit inner loop
│
├─ Commit all staged changes
└─ Repeat outer loop (fresh start)
```

### Step 2: Mock Data Normalization

Spawn subagent with `references/step2.md` (max 5x inner, 1x outer)

### Step 2.5: Ask User to Connect Real DB (CRITICAL)

**After Step 2, ask user to connect mock to real DB.**

1. List mock domains:
```bash
ls src/server/repository/_data 2>/dev/null
```

2. Ask user in plain text (NOT AskUserQuestion tool):

```
현재 임시 데이터로 동작하는 기능들:
- 회원 (user)
- 상품 (product)
- 주문 (order)
...

전부 다 실제로 연동할까요?
```

**Translate domain names to Korean for non-developers:**
- user → 회원
- product → 상품
- order → 주문
- post → 게시글
- comment → 댓글
- like → 좋아요
- cart → 장바구니
- payment → 결제
- etc.

3. Based on response:
- **"네" / "응" / "ㅇㅇ"** → Pass all domains to Step 3-4
- **Partial selection** (e.g., "회원만", "상품이랑 주문만") → Pass selected domains only
- **"나중에" / "아니"** → Skip Step 3-4, go to Step 5

### Step 3: Schema Setup (Selected Domains Only)

Spawn subagent with `references/step3.md`:
- Replace `{SELECTED_DOMAINS}` with user-selected domains
- Only create schema for selected domains

### Step 4: Real DB Implementation (Selected Domains Only)

Spawn subagent with `references/step4.md`:
- Replace `{SELECTED_DOMAINS}` with user-selected domains
- Only implement real DB calls in repository for selected domains (replace `_data` mock with actual DB queries)
- API layer is NOT modified — it already calls repository
- **Delete only selected domain mock files from `_data/`** (NOT entire _data folder)

### Step 5: README Update

Spawn subagent with `references/step5.md`

### Final: Dead Code Cleanup

```bash
bash .claude/skills/refactoring/knip-clean.sh
pnpm run validate
```

### Self-Update Check

**Only if ALL mocks are gone:**
```bash
[ -z "$(ls -A src/server/repository/_data 2>/dev/null)" ] && echo "ALL_MOCKS_GONE" || echo "MOCKS_REMAIN"
```

- If `ALL_MOCKS_GONE` → Spawn subagent with `references/self-update.md`
- If `MOCKS_REMAIN` → Skip self-update (can run refactoring again later)

---

## Maintenance Mode (No Mock)

When `src/server/repository/_data` doesn't exist:

1. Pre-Step: knip-clean
2. Step 1: Structure refactoring
3. Step 3: Schema changes (if needed)
4. Step 4: API implementation
5. Step 5: README update
6. Final: knip-clean + validate

---

## Master Checklist

For each subagent spawn:
- [ ] Read references/stepN.md
- [ ] Replace {PROJECT_PATH} with actual path
- [ ] Replace {SELECTED_DOMAINS} if applicable
- [ ] Spawn NEW Task (fresh context)
- [ ] Wait for result
- [ ] Check staged file count (for Step 1)
- [ ] Decide: repeat or commit
