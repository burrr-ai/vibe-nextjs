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

## Execution Flow

### Pre-Step: Clean Up Unused Files

**MUST run before Step 1.** Delete all unused files in one shot:

```bash
bash .claude/skills/refactoring/knip-clean.sh
```

This reduces codebase size before refactoring starts.

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

### Steps 2-4: Single Pass

| Step | File | Description |
|------|------|-------------|
| 2 | `references/step2.md` | Schema changes (1x) |
| 3 | `references/step3.md` | Repository/API implementation (1x) |
| 4 | `references/step4.md` | README update (1x) |

### Final Step 1: Dead Code Cleanup

**After Step 4, clean up any unused code created during refactoring:**

```bash
bash .claude/skills/refactoring/knip-clean.sh
pnpm run validate
```

### Final Step 2: Commit & Push

```bash
touch .refactoring-done
git add .
git commit -m "refactoring"
git push origin main
```

## Master Checklist

For each subagent spawn:
- [ ] Read references/stepN.md
- [ ] Replace {PROJECT_PATH} with actual path
- [ ] Spawn NEW Task (fresh context)
- [ ] Wait for result
- [ ] Check staged file count (for Step 1)
- [ ] Decide: repeat or commit

## Example: Step 1 Execution

```
# Outer loop 1
  Inner 1: Task("Step 1 iter 1") → staged 12 files → continue
  Inner 2: Task("Step 1 iter 2") → staged 8 files → continue
  Inner 3: Task("Step 1 iter 3") → staged 3 files → exit inner
  Commit

# Outer loop 2
  Inner 1: Task("Step 1 iter 1") → staged 4 files → exit inner
  Commit

# Outer loop 3
  Inner 1: Task("Step 1 iter 1") → staged 2 files → exit inner
  Commit

→ Proceed to Step 2
```
