# Step 3: Schema Setup (Selected Domains Only)

## Project Path

{PROJECT_PATH}

## Selected Domains

{SELECTED_DOMAINS}

**Only create schema for these domains. Skip others.**

## Prerequisites

**DB and Auth should already be set up from Step 0.**

Verify:
```bash
ls src/server/db && ls src/server/auth
```

If either is missing, something went wrong in Step 0. Report error and stop.

## Your Task

### 1. Analyze Mock Data (Selected Domains Only)

Review `src/server/repository/_data/{domain}.ts` for each selected domain:

- List entities in selected domains
- Map relationships between entities

**Skip domains NOT in {SELECTED_DOMAINS}.**

### 2. Create DBML

Convert selected domain mock data to DBML format.

### 3. Check Existing Schema

If `src/server/db/schema/` already has schema files:

- **Reuse existing schema** - do not recreate
- Only add new tables/fields for selected domains
- Maintain consistency with existing naming conventions

### 4. Generate Drizzle Schema

Convert DBML to Drizzle ORM schema in `src/server/db/schema/`

### 5. Apply Schema Changes

**IMPORTANT: Do NOT create tables directly in the database.**

Use Drizzle Kit commands to apply schema:

```bash
pnpm drizzle-kit generate  # Generate migration files
pnpm drizzle-kit migrate   # Apply migrations to database
```

**If migration fails:**

- **STOP immediately** - do not proceed further
- Report the error to the user
- Do NOT attempt to fix or retry without user confirmation

### 6. Member Table (if auth needed)

If project needs authentication:

- Create `member` table
- Use `user.id` from better-auth as `member.id` (same value, not FK)

### 7. Seed Mock Data (Selected Domains, NEW TABLES ONLY)

**IMPORTANT: Only seed data for NEWLY CREATED tables in selected domains.**

- Do NOT re-seed existing tables
- Check which tables were created in migration
- Only create seed data for selected domain tables

#### 7.1 Find Database ID

Look for `database_id` in `wrangler.jsonc` (or `wrangler.toml`):

```jsonc
// wrangler.jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "...",
      "database_id": "<YOUR_DATABASE_ID>"  // Use this value
    }
  ]
}
```

#### 7.2 Create Seed Script (Selected Domains Only)

Based on mock data in `src/server/repository/_data/{domain}.ts`:

- Create `scripts/seed-<table_name>.sql` for each NEW table
- Only include INSERT statements for selected domain tables
- Skip tables that already exist in the database
- Respect foreign key relationships (insert parent tables first)

#### 7.3 Execute Seed

Run the seed script using wrangler:

```bash
pnpm wrangler d1 execute <database_name> --remote --file=scripts/seed-<table_name>.sql
```

**Note:** Replace `<database_name>` with the actual database name from `wrangler.jsonc`.

### 8. Validate

```bash
pnpm run validate
```

Report:
- Selected domains processed: {SELECTED_DOMAINS}
- Schema created for which tables
- Seed data inserted for which tables
- Any issues
