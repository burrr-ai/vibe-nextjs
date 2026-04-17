
#!/bin/bash

# 포트 번호 설정 (기본값: 3000)
PORT=${1:-3000}

# 스크립트 디렉토리의 상위 디렉토리로 이동 (.tools의 부모 디렉토리)
cd "$(dirname "$0")/.." || exit 1

# 기존 포트 사용 프로세스 종료
echo "Checking port $PORT..."
./.tools/kill-port.sh "$PORT"

# 잠깐 대기 (프로세스 정리 시간)
sleep 1

echo "Starting development server on port $PORT..."
setsid pnpm run dev > dev_server.log 2> dev_server_error.log &

echo "Development server started (PID: $!)"
echo "Logs: dev_server.log, dev_server_error.log"
