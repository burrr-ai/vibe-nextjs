
#!/bin/bash

# 출력할 라인 수 (기본값: 50)
LINES=${1:-50}

# 스크립트 디렉토리의 상위 디렉토리로 이동 (.tools의 부모 디렉토리)
cd "$(dirname "$0")/.." || exit 1

echo "=== Development Server Logs (last $LINES lines) ==="
echo ""

if [ -f "dev_server.log" ]; then
  echo "--- STDOUT (dev_server.log) ---"
  tail -n "$LINES" dev_server.log
  echo ""
else
  echo "--- STDOUT (dev_server.log) ---"
  echo "Log file not found"
  echo ""
fi

if [ -f "dev_server_error.log" ]; then
  echo "--- STDERR (dev_server_error.log) ---"
  tail -n "$LINES" dev_server_error.log
  echo ""
else
  echo "--- STDERR (dev_server_error.log) ---"
  echo "Log file not found"
  echo ""
fi
