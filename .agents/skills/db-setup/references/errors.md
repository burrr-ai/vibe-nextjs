# Error Handling Reference

This document provides common errors and solutions for DB setup.

## Important: Authentication

**Wrangler authentication is handled via environment variables.**

Do NOT run `wrangler login`. The system uses:
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

These must be set in the environment before running wrangler commands.

## Common Errors

### 1. Missing Environment Variables

**Error:**
```
❌ CLOUDFLARE_ACCOUNT_ID not found
❌ CLOUDFLARE_API_TOKEN not found
```

**Solution:**
Verify environment variables are set:
```bash
echo $CLOUDFLARE_ACCOUNT_ID
echo $CLOUDFLARE_API_TOKEN
```

If missing, check:
1. `.env` file exists and is properly loaded
2. Environment variables are exported in shell session
3. CI/CD secrets are configured (if in automation)

**Do NOT attempt `wrangler login`** - authentication is environment-based only.

### 2. Database ID Not Found

**Error:**
```
❌ Cannot read database_id from wrangler.jsonc
```

**Solution:**
Verify wrangler.jsonc has d1_databases array:
```json
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "project-name",
      "database_id": "..."
    }
  ]
}
```

### 3. Migration Generation Fails

**Error:**
```
❌ drizzle-kit generate failed
```

**Common causes:**
- Invalid TypeScript syntax in schema.ts
- Missing drizzle-orm or drizzle-kit packages
- Incorrect import paths

**Solution:**
1. Verify schema.ts syntax
2. Check package.json for dependencies
3. Run `pnpm install` if packages missing

### 4. Migration Application Fails

**Error:**
```
❌ drizzle-kit migrate failed
```

**Common causes:**
- Invalid database_id in drizzle.config.ts
- Missing Cloudflare API credentials
- Network connectivity issues

**Solution:**
1. Verify drizzle.config.ts has correct database_id
2. Check CLOUDFLARE_API_TOKEN is valid
3. Test connection to Cloudflare API

## Validation Checks

Before each step, validate prerequisites:

### Check Project Initialization
```bash
bash -c PROJECT_ID=$(npm pkg get id | tr -d '"')
if [ "$PROJECT_ID" = "undefined" ] || [ -z "$PROJECT_ID" ]; then
  echo "❌ Project not initialized"
  exit 1
fi
```

### Check DB Not Already Set Up
```bash
DB_STATUS=$(npm pkg get cg.plugins.db)
if [ "$DB_STATUS" != "undefined" ]; then
  echo "✅ DB already configured"
  exit 0
fi
```

### Verify Wrangler Configuration
```bash
if [ ! -f "wrangler.jsonc" ]; then
  echo "❌ wrangler.jsonc not found"
  exit 1
fi
```
