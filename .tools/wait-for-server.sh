
#!/bin/bash

# 포트 번호 (기본값: 3000)
PORT=${1:-3000}

# 타임아웃 시간 (초, 기본값: 300 = 5분)
TIMEOUT=${2:-300}

# 재시도 간격 (초)
RETRY_INTERVAL=0.5

# 시작 시간
START_TIME=$(date +%s)

echo "Waiting for server on localhost:$PORT (timeout: ${TIMEOUT}s)..."

while true; do
  # 현재 시간
  CURRENT_TIME=$(date +%s)
  ELAPSED=$((CURRENT_TIME - START_TIME))

  # 타임아웃 체크
  if [ $ELAPSED -ge $TIMEOUT ]; then
    echo "ERROR: Timeout after ${TIMEOUT}s - Server not ready"
    exit 1
  fi

  # curl로 서버 체크 (성공하면 exit 0, 실패하면 계속)
  if curl -s -f -o /dev/null "http://localhost:$PORT" 2>/dev/null; then
    echo "SUCCESS: Server is ready on localhost:$PORT (took ${ELAPSED}s)"
    exit 0
  fi

  # 재시도 대기
  echo "Server not ready yet... (elapsed: ${ELAPSED}s)"
  sleep $RETRY_INTERVAL
done
