#!/bin/bash

set -e  # Exit on error

echo "🚀 Starting R2 Storage Setup..."
echo ""

# Step 1: Check if R2 is already configured
echo "📋 Step 1/8: Checking if R2 is already configured..."
R2_CONFIG=$(npm pkg get cg.plugins.r2)
if [ "$R2_CONFIG" != "undefined" ] && [ "$R2_CONFIG" != "{}" ]; then
  echo "⚠️  R2 is already configured. Skipping setup."
  exit 0
fi
echo "✅ R2 not configured yet, proceeding..."
echo ""

# Step 2: Create bucket name
echo "📋 Step 2/8: Creating bucket name..."
PROJECT_ID=$(pnpm pkg get id | tr -d "\"")
BUCKET_NAME=$(echo "$PROJECT_ID" | tr "_" "-" | tr "[:upper:]" "[:lower:]" | awk "{print \$0\"-storage\"}")
echo "PROJECT_ID: $PROJECT_ID"
echo "BUCKET_NAME: $BUCKET_NAME"
echo ""

# Step 3: Create R2 bucket
echo "📋 Step 3/8: Creating R2 bucket..."
if npx wrangler r2 bucket list | grep -q "${BUCKET_NAME}"; then
  echo "⚠️  Bucket already exists, skipping creation"
else
  npx wrangler r2 bucket create ${BUCKET_NAME} --update-config --use-remote --binding R2
  pnpm run cf-typegen
  echo "✅ Bucket created"
fi
echo ""

# Step 4: Enable dev URL
echo "📋 Step 4/8: Enabling public dev URL..."
pnpm dlx wrangler r2 bucket dev-url enable ${BUCKET_NAME} -y 2>&1 | grep -v "already enabled" || true
echo "✅ Dev URL enabled"
echo ""

# Step 5: Get public URL
echo "📋 Step 5/8: Getting public URL..."
PUBLIC_URL=$(pnpm dlx wrangler r2 bucket dev-url get ${BUCKET_NAME} | grep -oE "https://[^/]+\.r2\.dev" | head -1)
echo "🌐 Public URL: $PUBLIC_URL"
echo ""

# Step 6: Update package.json
echo "📋 Step 6/8: Updating package.json..."
npm pkg set cg.plugins.r2.createdAt="$(date -Iseconds)"
npm pkg set cg.plugins.r2.bucketName="${BUCKET_NAME}"
npm pkg set cg.plugins.r2.binding="R2"
npm pkg set cg.plugins.r2.publicUrl="${PUBLIC_URL}"
echo "✅ package.json updated"
echo ""

# Step 7: Copy template files
echo "📋 Step 7/8: Copying template files..."
mkdir -p src/server/storage
cp .claude/skills/storage-setup/assets/storage.ts src/server/storage/index.ts
echo "✅ Template files copied"
echo ""

# Step 8: Replace placeholders in template
echo "📋 Step 8/8: Replacing placeholders in template..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s|{{PUBLIC_URL}}|${PUBLIC_URL}|g" src/server/storage/index.ts
  sed -i '' "s|{{BUCKET_NAME}}|${BUCKET_NAME}|g" src/server/storage/index.ts
else
  sed -i "s|{{PUBLIC_URL}}|${PUBLIC_URL}|g" src/server/storage/index.ts
  sed -i "s|{{BUCKET_NAME}}|${BUCKET_NAME}|g" src/server/storage/index.ts
fi
echo "✅ Placeholders replaced"
echo ""

echo "🎉 R2 Storage Setup Complete!"
echo ""
echo "📦 Bucket Name: ${BUCKET_NAME}"
echo "🌐 Public URL:  ${PUBLIC_URL}"
echo ""
echo "⚠️  Required environment variables (add to .env.local):"
echo "   CLOUDFLARE_ACCOUNT_ID=<your cloudflare account id>"
echo "   R2_ACCESS_KEY_ID=<R2 API token access key id>"
echo "   R2_SECRET_ACCESS_KEY=<R2 API token secret access key>"
echo ""
echo "   Make sure src/server/config.ts exposes these (read via process.env)."
echo ""
echo "Usage:"
echo "  import { uploadFile } from '@/server/storage';"
echo "  const { publicUrl } = await uploadFile(file, 'avatars');"
