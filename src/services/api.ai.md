# API Reference

## 위치
`services/{service}/api/{domain}/`

## 구조
```
api/{domain}/
  ├── index.ts          # typed client
  ├── types.ts          # API method signatures
  └── actions/
      └── *.ts          # Other operations
```

## 규칙
- **도메인 = 페이지 핏**: api 도메인은 리소스(테이블) 중심이 아니라, 어느 화면에서 쓰일지를 기준으로 묶는다. 프론트 화면에서 필요한 내용이 바뀌면 api 응답도 바뀔 수 있다. 여러 페이지에서 공통으로 쓸 수도 있지만, 대체로 메인 페이지에 핏한 내용들을 하나의 도메인으로 묶는 것을 추천한다.
- **Minimal args**: userId/session은 내부에서 가져온다. parameter로 받지 않는다. (auth 연동 후 `getServerSession`은 `@/server/auth/{service}`에서 import)
- **Server actions**: All methods are `'use server'` async functions
- **DB 접근**: `@/server/repository` 경유 (직접 DB 접근 금지, 직접 목코드 작성 금지)
  - mock 데이터는 `src/server/repository/_data/`에서 관리. repository `.ai.md` 참조.
- **소유권 확인**: findAll 등 조회 시 현재 로그인 유저 소유의 리소스만 필터링하여 반환 (public 리소스는 예외)
- **Frontend-friendly**: UI에서 바로 쓸 수 있는 형태로 변환하여 반환
  ```typescript
  // repository에서 온 원본
  { likeCount: 3, userId: 'abc' }
  // api에서 변환 후
  { likeCount: 3, isLikedByMe: true, displayCount: '3개' }
  ```
- **Type safety**: Define `DomainAPI` interface in types.ts
- **findAll**: 두 번째 인자 `PageRequest`, 응답 `Pageable<T>` — `@/server/repository/types` 에서 import
- **Timestamp**:
  - 입력: KST 문자열 → UTC로 변환하여 repository에 전달
  - 응답: UTC timestamp → KST 기준 포맷된 날짜 문자열로 변환하여 반환
  ```typescript
  // 입력 (KST 문자열 → UTC)
  const utcDate = new Date(kstDateString)
  // 응답 (UTC → KST 포맷)
  const formatted = utcDate.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })
  ```


## 작성 순서
1. **types.ts 먼저** — 어떤 화면에서 쓰일지 생각하며 API 인터페이스와 응답 타입을 정의
2. actions/*.ts — server action 구현
3. index.ts — typed client 생성

## types.ts

- Define API interface with JSDoc
- Define Resource types
  - List Item type suffix `Simple`
  - Detail Item type suffix `Detail`
  - Request type suffix `Request`

**Example:**
```typescript
import type { PageRequest, Pageable } from '@/server/repository/types'

export interface DomainAPI {
  /** 항목 생성 */
  create: (request: CreateRequest) => Promise<void>

  /** 목록 조회 — 리스트는 항상 Pageable<T> 리턴 */
  findAll: (filter: FindAllFilter, pageable: PageRequest) => Promise<Pageable<Simple>>

  /** 상세 조회 */
  find: (id: string) => Promise<Detail>
}

export type FindAllFilter = {
  search?: string
}

export type Simple = {
  id: string
  name: string
}

export type Detail = Simple & {
  description: string
}

export type CreateRequest = {
  name: string
}
```

## actions/*.ts (Server Actions)

- `'use server'` 필수
- 모든 export는 `createParallelAction`으로 감싸야 함 (ESLint `api-parallel-action` 강제)
- 내부 함수는 `_` prefix로 선언, `createParallelAction`으로 감싼 결과를 export

**Pattern:**
```typescript
'use server'

import { createParallelAction } from '@/lib/utils'

async function _create(request: CreateRequest): Promise<void> {
  // ...
}

export const create = createParallelAction(_create)
```

## index.ts

- `resolveActions()`로 감싸서 export (ESLint `api-structure` 강제)
- 개별 함수 export 금지 — 객체로만 export
- 타입 어노테이션 없음 (추론에 맡김)
- `export { X } from './actions/...'` 직접 re-export 금지

**Pattern:**
```typescript
import { resolveActions } from '@/lib/utils'

export * from './types'

import { create } from './actions/create'
import { find } from './actions/find'
import { findAll } from './actions/find-all'

export const domain = resolveActions({ create, find, findAll })
```

**호출 측:**
```typescript
// 단일 호출 — 그냥 await 하면 됨
const item = await domain.find(id)

// 병렬 호출 — Promise.all 쓰면 자동으로 병렬 실행
const [items, stats] = await Promise.all([
  domain.findAll(filter, pageable),
  domain.getStats(),
])
```
