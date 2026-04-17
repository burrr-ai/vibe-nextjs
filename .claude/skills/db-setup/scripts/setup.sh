#!/bin/bash

set -e  # Exit on error

echo "🚀 Starting Database Setup..."
echo ""

# Step 0: Check if DB is already configured
echo "📋 Checking if DB is already configured..."
DB_CONFIG=$(npm pkg get cg.plugins.db)
if [ "$DB_CONFIG" != "undefined" ] && [ "$DB_CONFIG" != "{}" ]; then
  echo "⚠️  Database is already configured. Skipping setup."
  exit 0
fi
echo "✅ Database not configured yet, proceeding..."
echo ""

# Step 1: Get project ID
echo "📋 Step 1/8: Getting project ID..."
PROJECT_ID=$(npm pkg get id | tr -d "\"")
echo "📋 Project ID: $PROJECT_ID"
echo ""

# Step 2: Create D1 database with remote binding
echo "📋 Step 2/8: Creating D1 database..."
npx wrangler d1 create --update-config --use-remote --binding DB ${PROJECT_ID}
npm run cf-typegen
echo "✅ D1 database created"
echo ""

# Step 3: Extract database ID and update config
echo "📋 Step 3/8: Extracting database ID..."
DATABASE_ID=$(node -e "
  const fs = require('fs');
  const jsonc = require('jsonc-parser');
  const content = fs.readFileSync('wrangler.jsonc', 'utf8');
  const config = jsonc.parse(content);
  console.log(config.d1_databases[0].database_id);
")
echo "🔑 Database ID: $DATABASE_ID"

npm pkg set cg.plugins.db.createdAt="$(date -Iseconds)"
npm pkg set cg.plugins.db.databaseId="$DATABASE_ID"
echo "✅ package.json updated"
echo ""

# Step 4: Create database structure
echo "📋 Step 4/8: Creating database structure..."
mkdir -p src/server/db
echo "✅ Directory created"
echo ""

# Step 5: Copy template files
echo "📋 Step 5/8: Copying template files..."
cp .claude/skills/db-setup/assets/db-index.ts src/server/db/index.ts
cp .claude/skills/db-setup/assets/schema.ts src/server/db/schema.ts
cp .claude/skills/db-setup/assets/drizzle.config.ts drizzle.config.ts
echo "✅ Template files copied"
echo ""

# Step 6: Replace database ID in config
echo "📋 Step 6/8: Replacing database ID in config..."

# 1. 직접 JSON 파싱으로 값 추출 (npm pkg get은 마스킹할 수 있음)
ACTUAL_DB_ID=$(node -e "
  try {
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const id = (pkg && pkg.cg && pkg.cg.plugins && pkg.cg.plugins.db && pkg.cg.plugins.db.databaseId) || '';
    console.log(id);
  } catch (e) {
    console.log('');
  }
")

# 2. 값이 비어있는지 확인
if [ -z "$ACTUAL_DB_ID" ]; then
  echo "❌ Error: Database ID not found in package.json"
  exit 1
fi

echo "🔑 Using Database ID: $ACTUAL_DB_ID"

# 3. 파일 존재 확인
if [ ! -f "drizzle.config.ts" ]; then
  echo "❌ Error: drizzle.config.ts not found"
  exit 1
fi

# 4. 패턴 존재 확인
if ! grep -q "{{DATABASE_ID}}" drizzle.config.ts; then
  echo "⚠️  Warning: {{DATABASE_ID}} pattern not found in drizzle.config.ts"
  echo "   Database ID may have already been replaced"
else
  # 5. 안전한 sed 사용 (구분자를 | 로 변경하여 / 문제 회피)
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|{{DATABASE_ID}}|$ACTUAL_DB_ID|g" drizzle.config.ts
  else
    sed -i "s|{{DATABASE_ID}}|$ACTUAL_DB_ID|g" drizzle.config.ts
  fi

  # 6. 변경 확인
  if grep -q "$ACTUAL_DB_ID" drizzle.config.ts; then
    echo "✅ Database ID replaced: $ACTUAL_DB_ID"
  else
    echo "❌ Error: Replacement failed"
    exit 1
  fi
fi
echo ""

# Step 7: Generate and apply migrations
echo "📋 Step 7/8: Generating and applying migrations..."
npx drizzle-kit generate
npx drizzle-kit migrate
echo "✅ Migrations applied"
echo ""

# Step 8: Restart dev server
echo "📋 Step 8/8: Restarting dev server..."
.tools/start-dev-server.sh 3000
echo "✅ Dev server restarted"
echo ""

echo "🎉 Database Setup Complete!"
echo ""
echo "📋 Project ID: ${PROJECT_ID}"
echo "🔑 Database ID: ${DATABASE_ID}"
echo ""
echo "You can now use the database in your application!"
echo "Import from: src/server/db"
