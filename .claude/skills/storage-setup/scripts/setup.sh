#!/bin/bash

set -e  # Exit on error

echo "🚀 Starting R2 Storage Setup..."
echo ""

# Step 1: Check if R2 is already configured
echo "📋 Step 1/11: Checking if R2 is already configured..."
R2_CONFIG=$(npm pkg get cg.plugins.r2)
if [ "$R2_CONFIG" != "undefined" ] && [ "$R2_CONFIG" != "{}" ]; then
  echo "⚠️  R2 is already configured. Skipping setup."
  exit 0
fi
echo "✅ R2 not configured yet, proceeding..."
echo ""

# Step 2: Create bucket name
echo "📋 Step 2/11: Creating bucket name..."
PROJECT_ID=$(pnpm pkg get id | tr -d "\"")
BUCKET_NAME=$(echo "$PROJECT_ID" | tr "_" "-" | tr "[:upper:]" "[:lower:]" | awk "{print \$0\"-storage\"}")
echo "PROJECT_ID: $PROJECT_ID"
echo "BUCKET_NAME: $BUCKET_NAME"
echo ""

# Step 3: Create R2 bucket
echo "📋 Step 3/11: Creating R2 bucket..."
if npx wrangler r2 bucket list | grep -q "${BUCKET_NAME}"; then
  echo "⚠️  Bucket already exists, skipping creation"
else
  npx wrangler r2 bucket create ${BUCKET_NAME} --update-config --use-remote --binding R2
  pnpm run cf-typegen
  echo "✅ Bucket created"
fi
echo ""

# Step 4: Enable dev URL
echo "📋 Step 4/11: Enabling public dev URL..."
pnpm dlx wrangler r2 bucket dev-url enable ${BUCKET_NAME} -y 2>&1 | grep -v "already enabled" || true
echo "✅ Dev URL enabled"
echo ""

# Step 5: Get public URL
echo "📋 Step 5/11: Getting public URL..."
PUBLIC_URL=$(pnpm dlx wrangler r2 bucket dev-url get ${BUCKET_NAME} | grep -oE "https://[^/]+\.r2\.dev" | head -1)
echo "🌐 Public URL: $PUBLIC_URL"
echo ""

# Step 6: Update package.json
echo "📋 Step 6/11: Updating package.json..."
npm pkg set cg.plugins.r2.createdAt="$(date -Iseconds)"
npm pkg set cg.plugins.r2.bucketName="${BUCKET_NAME}"
npm pkg set cg.plugins.r2.binding="R2"
npm pkg set cg.plugins.r2.publicUrl="${PUBLIC_URL}"
echo "✅ package.json updated"
echo ""

# Step 7: Install aws4fetch
echo "📋 Step 7/11: Installing aws4fetch..."
pnpm add aws4fetch
echo "✅ aws4fetch installed"
echo ""

# Step 8: Copy template files
echo "📋 Step 8/11: Copying template files..."
mkdir -p src/server/storage
cp .claude/skills/storage-setup/assets/storage.ts src/server/storage/index.ts
echo "✅ Template files copied"
echo ""

# Step 9: Replace placeholders in template
echo "📋 Step 9/11: Replacing placeholders in template..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' "s|{{PUBLIC_URL}}|${PUBLIC_URL}|g" src/server/storage/index.ts
  sed -i '' "s|{{BUCKET_NAME}}|${BUCKET_NAME}|g" src/server/storage/index.ts
else
  # Linux
  sed -i "s|{{PUBLIC_URL}}|${PUBLIC_URL}|g" src/server/storage/index.ts
  sed -i "s|{{BUCKET_NAME}}|${BUCKET_NAME}|g" src/server/storage/index.ts
fi
echo "✅ Placeholders replaced"
echo ""

# Step 10: Configure R2 CORS for presigned URL uploads
echo "📋 Step 10/11: Configuring R2 CORS..."
echo '{ "rules": [ { "allowed": { "origins": ["*"], "methods": ["PUT"], "headers": ["Content-Type"] }, "maxAgeSeconds": 3600 } ] }' > /tmp/r2-cors-rules.json && npx wrangler r2 bucket cors set ${BUCKET_NAME} --file /tmp/r2-cors-rules.json && rm /tmp/r2-cors-rules.json
echo "✅ CORS configured"
echo ""

# Step 11: Restart dev server
echo "📋 Step 11/11: Restarting dev server..."
.tools/start-dev-server.sh 3000
echo "✅ Dev server restarted"
echo ""

echo "🎉 R2 Storage Setup Complete!"
echo ""
echo "📦 Bucket Name: ${BUCKET_NAME}"
echo "🌐 Public URL: ${PUBLIC_URL}"
echo ""
echo "You can now use R2 storage in your application!"
echo "Import from: src/server/storage"
