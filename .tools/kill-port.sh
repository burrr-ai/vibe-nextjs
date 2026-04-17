#!/bin/bash

# 포트 번호를 인자로 받음
PORT=${1:-3000}

# 해당 포트를 사용하는 프로세스 PID 찾기
PIDS=$(ss -lptn "sport = :$PORT" 2>/dev/null | grep -oP 'pid=\K[0-9]+' || true)

# PID가 있으면 종료, 없으면 메시지 출력
if [ -z "$PIDS" ]; then
  echo "No process found using port $PORT"
  exit 0
fi

# 찾은 모든 PID의 프로세스 그룹 종료
for PID in $PIDS; do
  PGID=$(ps -o pgid= -p $PID 2>/dev/null | tr -d ' ')
  if [ -n "$PGID" ]; then
    echo "Killing process group $PGID (PID: $PID) on port $PORT"
    kill -9 -$PGID 2>/dev/null || true
  fi
done

echo "Port $PORT is now free"
