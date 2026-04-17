---
name: db-setup
description: D1 database setup with Drizzle ORM. Triggers - "DB 연동", "데이터베이스 설정", "D1 추가", or when DB needed.
---

## Workflow

- [ ] `bash -c '.claude/skills/db-setup/scripts/setup.sh'`
- [ ] Add row to table in `## 4. Tech Stack & Rules` section in CLAUDE.md:
  ```
  | Database | Schema changes via `drizzle-kit generate` + `drizzle-kit migrate` ONLY |
  ```
- [ ] Add subsection after table in `## 4. Tech Stack & Rules` section in CLAUDE.md (before `### Code Quality`):
  ```
  ### Database Schema Changes

  **NEVER manually edit migration files or DB directly.** Always use Drizzle Kit:

  \`\`\`bash
  pnpm drizzle-kit generate  # Generate migration from schema changes
  pnpm drizzle-kit migrate   # Apply migration to DB
  \`\`\`
  ```
- [ ] `rm -rf .claude/skills/db-setup`
