# Step 0: Prerequisites Setup

## Project Path
{PROJECT_PATH}

## Your Task

**This step ensures DB and Auth are set up before refactoring begins.**

### 1. Check Database Setup

```bash
ls src/server/db 2>/dev/null && echo "DB_EXISTS" || echo "NO_DB"
```

**If `NO_DB`:**
- Invoke `db-setup` skill using the Skill tool
- Wait for completion before proceeding

### 2. Check Auth Setup

```bash
ls src/server/auth 2>/dev/null && echo "AUTH_EXISTS" || echo "NO_AUTH"
```

**If `NO_AUTH`:**
- Invoke `auth-setup` skill using the Skill tool
- Wait for completion before proceeding

### 3. Validate Setup

After both setups complete:

```bash
pnpm run validate
```

Fix any errors before proceeding.

### 4. Report

Report:
- DB setup status (already existed / newly created)
- Auth setup status (already existed / newly created)
- Any issues encountered

## Important

- Do NOT skip this step
- Do NOT ask user - just invoke skills automatically
- Both db-setup and auth-setup MUST be complete before Step 1
