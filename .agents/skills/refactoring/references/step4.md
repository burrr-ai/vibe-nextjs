# Step 4: Real API Implementation (Selected Domains Only)

## Project Path
{PROJECT_PATH}

## Selected Domains
{SELECTED_DOMAINS}

**Only implement real API for these domains. Skip others.**

## Prerequisites

Check and invoke skills if needed:
- Auth needed but not set up → `auth-setup` skill
- Image upload needed → `upload-image` skill (R2)
- Image generation needed → `image-generation` skill
- DB needed but not set up → `db-setup` skill

## Your Task

### 1. Replace Mock with Real DB (Selected Domains Only)

For each repository in `src/server/repository/{domain}.ts` where domain is in {SELECTED_DOMAINS}:
- Replace `_data/` mock imports with real DB queries
- API layer (`src/services/{service}/api/`) is NOT modified — it already calls repository
- Follow patterns in `.ai.md` files

**Skip domains NOT in {SELECTED_DOMAINS}.**

### 2. Auth Integration

- Use auth session to get user ID in server actions
- Verify `services/{service}/state/user` integration

### 3. Move Mock to Legacy (Selected Domains Only)

**After moving, use the type checker to identify parts that are not yet connected:**

For each domain in {SELECTED_DOMAINS}:
```bash
# 1. Move to the _legacy_mock folder
mkdir -p src/server/repository/_legacy_data
mv src/server/repository/_data/{domain}.ts src/server/repository/_legacy_data/{domain}.ts

# 2. Remove the _data folder if it is empty
[ -z "$(ls -A src/server/repository/_data 2>/dev/null)" ] && rm -rf src/server/repository/_data
```

### 4. Validate & Find Unconnected Parts

```bash
pnpm run validate
```

**If type errors occur:**
- Find files referenced by `_data` imports from the error messages
- Those files are the parts not yet connected to the real DB
- Connect them one by one

**After resolving all type errors:**
- Report: list of repositories that have been connected
- Keep `_legacy_data` for reference (can be deleted later)

Report:
- Selected domains processed: {SELECTED_DOMAINS}
- Repositories implemented for which domains
- Mocks moved to _legacy_data for which domains
- Remaining mocks (if any)
- Any issues
