#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ASSETS_DIR="$SCRIPT_DIR/../assets"
PROJECT_ROOT="$SCRIPT_DIR/../../../.."

if [ $# -eq 0 ]; then
  echo "Usage: $0 <service1> [service2] ..."
  echo "Example: $0 app admin supplier"
  exit 1
fi

to_pascal() {
  echo "$1" | sed -E 's/(^|_)([a-z])/\U\2/g'
}

to_upper_snake() {
  echo "$1" | tr '[:lower:]' '[:upper:]'
}

generate_secret() {
  openssl rand -hex 32
}

for SERVICE in "$@"; do
  PASCAL=$(to_pascal "$SERVICE")
  UPPER=$(to_upper_snake "$SERVICE")
  BASE_PATH="/${SERVICE}/api/auth"

  echo "=== Setting up auth for: $SERVICE (${PASCAL}, ${UPPER}) ==="

  # Skip if already exists
  if [ -f "$PROJECT_ROOT/src/server/auth/${SERVICE}.ts" ]; then
    echo "  [SKIP] src/server/auth/${SERVICE}.ts already exists"
    continue
  fi

  # 1. Auth server instance
  mkdir -p "$PROJECT_ROOT/src/server/auth"
  sed -e "s/{service}/${SERVICE}/g" \
      -e "s/{Service}/${PASCAL}/g" \
      -e "s/{SERVICE}/${UPPER}/g" \
      -e "s|{basePath}|${BASE_PATH}|g" \
      "$ASSETS_DIR/auth-server.ts.ref" \
    | grep -v '^// ===' | grep -v '^// 치환' | grep -v '^//   {' | grep -v '^// 위치' | grep -v '^// 레퍼' \
    > "$PROJECT_ROOT/src/server/auth/${SERVICE}.ts"
  echo "  [OK] src/server/auth/${SERVICE}.ts"

  # 2. Auth schema
  mkdir -p "$PROJECT_ROOT/src/server/db/plugin/auth"
  sed -e "s/{service}/${SERVICE}/g" \
      -e "s/{Service}/${PASCAL}/g" \
      "$ASSETS_DIR/auth-schema.ts.ref" \
    | grep -v '^// ===' | grep -v '^// 치환' | grep -v '^//   {' | grep -v '^//   테이블' | grep -v '^//   export' | grep -v '^// 레퍼' | grep -v '^// 서비스' \
    > "$PROJECT_ROOT/src/server/db/plugin/auth/${SERVICE}-schema.ts"
  echo "  [OK] src/server/db/plugin/auth/${SERVICE}-schema.ts"

  # 3. Auth client
  mkdir -p "$PROJECT_ROOT/src/lib/auth-client"
  sed -e "s/{service}/${SERVICE}/g" \
      -e "s|{basePath}|${BASE_PATH}|g" \
      "$ASSETS_DIR/auth-client.ts.ref" \
    | grep -v '^// ===' | grep -v '^// 치환' | grep -v '^//   {' | grep -v '^// 레퍼' | grep -v '^// 서비스' \
    > "$PROJECT_ROOT/src/lib/auth-client/${SERVICE}.ts"
  echo "  [OK] src/lib/auth-client/${SERVICE}.ts"

  # 4. API route
  ROUTE_DIR="$PROJECT_ROOT/src/app/(${SERVICE})/${SERVICE}/api/auth/[...all]"
  mkdir -p "$ROUTE_DIR"
  sed -e "s/{service}/${SERVICE}/g" \
      -e "s/{Service}/${PASCAL}/g" \
      "$ASSETS_DIR/auth-route.ts.ref" \
    | grep -v '^// ===' | grep -v '^// 치환' | grep -v '^//   {' | grep -v '^// 위치' | grep -v '^// 레퍼' \
    > "$ROUTE_DIR/route.ts"
  echo "  [OK] src/app/(${SERVICE})/${SERVICE}/api/auth/[...all]/route.ts"

  # 5. Add schema export to src/server/db/schema.ts
  EXPORT_LINE="export * from \"./plugin/auth/${SERVICE}-schema\""
  if ! grep -qF "$EXPORT_LINE" "$PROJECT_ROOT/src/server/db/schema.ts" 2>/dev/null; then
    echo "$EXPORT_LINE" >> "$PROJECT_ROOT/src/server/db/schema.ts"
    echo "  [OK] Added schema export"
  fi

  # 6. Add secret to src/server/config.ts
  SECRET_KEY="${UPPER}_AUTH_SECRET"
  if ! grep -qF "$SECRET_KEY" "$PROJECT_ROOT/src/server/config.ts" 2>/dev/null; then
    SECRET_VALUE=$(generate_secret)
    # Insert before "} as const;"
    sed -i '' "s|} as const;|  ${SECRET_KEY}: \"${SECRET_VALUE}\",\n} as const;|" "$PROJECT_ROOT/src/server/config.ts"
    echo "  [OK] Added ${SECRET_KEY} to config"
  fi

  echo "  [DONE] $SERVICE"
  echo ""
done

echo "=== Auth setup complete ==="
echo ""
echo "Next steps (AI handles these):"
echo "  1. Replace mock auth actions in services/{service}/state/user/actions/auth.ts"
echo "  2. Replace mock get-me in services/{service}/api/user/actions/get-me.ts"
echo "  3. Run: npx drizzle-kit generate && npx drizzle-kit migrate"
echo "  4. Restart dev server"
