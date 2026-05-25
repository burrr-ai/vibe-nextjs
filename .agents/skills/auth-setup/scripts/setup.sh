#!/bin/bash
# auth-setup helper — handles ONLY the mechanical shell work.
# Everything that involves editing existing TS files (schema.ts exports,
# config.ts secret insertion, adapting mock files, substituting placeholders
# in .ref templates, etc.) is handled by the AI following SKILL.md.
#
# Usage: bash setup.sh <service1> [service2] ...
# Example: bash setup.sh app admin

set -euo pipefail

if [ $# -eq 0 ]; then
  echo "Usage: $0 <service1> [service2] ..."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR/../../../.."

for SERVICE in "$@"; do
  echo "=== $SERVICE ==="

  # 1. Create required directories (idempotent)
  mkdir -p "$PROJECT_ROOT/src/server/auth"
  mkdir -p "$PROJECT_ROOT/src/server/db/plugin/auth"
  mkdir -p "$PROJECT_ROOT/src/lib/auth-client"
  mkdir -p "$PROJECT_ROOT/src/app/(${SERVICE})/${SERVICE}/api/auth/[...all]"

  # 2. Generate a secret for the service (AI inserts it into config.ts)
  SECRET="$(openssl rand -hex 32)"
  echo "  secret: ${SECRET}"

  echo "  directories ready; AI handles file content per SKILL.md"
  echo ""
done

echo "=== done ==="
