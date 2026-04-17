---
name: auth-setup
description: Better-auth setup. Triggers - "인증 설정", "로그인", "회원가입". Requires db-setup first.
---

## Overview

서비스별 독립 인증 시스템을 구성한다.
스크립트가 기계적 파일 생성을 담당하고, AI는 기존 코드 연동을 담당한다.

## Workflow

### 1. 사전 확인
- db-setup 완료 확인 (`npm pkg get cg.plugins.db`)
- `src/services/` 스캔하여 서비스 목록 파악
- 어떤 서비스에 auth를 추가할지 판단

### 2. 스크립트 실행
```bash
bash .claude/skills/auth-setup/scripts/setup.sh <service1> [service2] ...
```
스크립트가 생성하는 파일:
- `src/server/auth/{service}.ts` — Auth 인스턴스
- `src/server/db/plugin/auth/{service}-schema.ts` — Drizzle 테이블
- `src/lib/auth-client/{service}.ts` — 클라이언트
- `src/app/({service})/{service}/api/auth/[...all]/route.ts` — API 라우트
- `src/server/db/schema.ts`에 export 추가
- `src/server/config.ts`에 시크릿 추가

### 3. AI가 처리할 작업
기존 mock을 실제 인증으로 교체 (레퍼런스 참고):
- `services/{service}/state/user/actions/auth.ts` ← `assets/auth-actions.ts.ref`
- `services/{service}/api/user/actions/get-me.ts` ← `assets/get-me.ts.ref`

### 4. 마이그레이션 & 서버 재시작
```bash
npx drizzle-kit generate
npx drizzle-kit migrate
.tools/start-dev-server.sh 3000
```

### 5. 메타데이터 업데이트
```bash
npm pkg set cg.plugins.auth.createdAt="$(date -Iseconds)" cg.plugins.auth.provider="better-auth"
```

## 네이밍 규칙

| 서비스명 | PascalCase | UPPER_SNAKE | basePath |
|----------|-----------|-------------|----------|
| app | App | APP | /app/api/auth |
| admin | Admin | ADMIN | /admin/api/auth |
| supplier | Supplier | SUPPLIER | /supplier/api/auth |

## Member Table ID Sync

회원가입 시 {service}_member 테이블 row는 auth user와 동일한 ID를 사용한다:
- signUp → member row 생성: `id = session.user.id`
- getMe → member 테이블 조회: `session.user.id` 기준
