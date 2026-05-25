# API Reference

## Location
`services/{service}/api/{domain}/`

## Structure
```
api/{domain}/
  ├── index.ts          # typed client
  ├── types.ts          # API method signatures
  └── actions/
      └── *.ts          # Other operations
```

## Rules
- **Domain = page fit**: Group api domains by which screen they serve, not around resources (tables). If the screen's needs change, the api response changes too. A domain may be shared across multiple pages, but generally group the content tailored to a main page into a single domain.
- **Minimal args**: userId/session is obtained internally. Do not accept them as parameters. (After auth integration, import `getServerSession` from `@/server/auth/{service}`)
- **Server actions**: All methods are `'use server'` async functions
- **DB access**: Always go through `@/server/repository` (no direct DB access, no inline mock code)
  - Mock data is managed under `src/server/repository/_data/`. See repository `.ai.md`.
- **Ownership check**: For findAll and other queries, filter and return only resources owned by the currently logged-in user (public resources are an exception)
- **Frontend-friendly**: Transform into a shape the UI can use directly
  ```typescript
  // Raw from repository
  { likeCount: 3, userId: 'abc' }
  // Transformed in api
  { likeCount: 3, isLikedByMe: true, displayCount: '3 likes' }
  ```
- **Type safety**: Define `DomainAPI` interface in types.ts
- **findAll**: Second argument is `PageRequest`, response is `Pageable<T>` — import from `@/server/repository/types`
- **Timestamp**:
  - Input: KST string → convert to UTC before passing to repository
  - Response: UTC timestamp → convert to a KST-formatted date string
  ```typescript
  // Input (KST string → UTC)
  const utcDate = new Date(kstDateString)
  // Response (UTC → KST format)
  const formatted = utcDate.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })
  ```


## Write Order
1. **types.ts first** — define the API interface and response types while thinking about which screen will use them
2. actions/*.ts — implement server actions
3. index.ts — create the typed client

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
  /** Create an item */
  create: (request: CreateRequest) => Promise<void>

  /** List query — lists always return Pageable<T> */
  findAll: (filter: FindAllFilter, pageable: PageRequest) => Promise<Pageable<Simple>>

  /** Detail query */
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

- `'use server'` required
- Every export must be wrapped with `createAction` (enforced by ESLint `api-create-action`)
- Declare the internal function with `_` prefix and export the result wrapped by `createAction`
- `createAction` handles bypassing Next.js serialization (parallel execution) and exposing error messages in one step

### Throw errors with `ActionError`

- Any message you want to show to the user **must** be thrown via `new ActionError("...")`
- Plain `new Error(...)` is masked by Next.js and only a generic message reaches the client (forbidden by ESLint `api-action-error`)
- Errors thrown by libraries or unexpected throws will be auto-masked if left as is

**Pattern:**
```typescript
'use server'

import { createAction, ActionError } from '@/lib/utils'

async function _create(request: CreateRequest): Promise<void> {
  if (!request.name) throw new ActionError('Name is required')
  // ...
}

export const create = createAction(_create)
```

## index.ts

- Export wrapped with `resolveActions()` (enforced by ESLint `api-structure`)
- Do not export individual functions — export only as an object
- No type annotations (let inference handle it)
- Do not re-export directly with `export { X } from './actions/...'`
- `resolveActions` automatically deep-snapshots any comwit proxy (state) passed as an argument. The caller (state action) does not need to wrap with `snapshot()`.

**Pattern:**
```typescript
import { resolveActions } from '@/lib/utils'

export * from './types'

import { create } from './actions/create'
import { find } from './actions/find'
import { findAll } from './actions/find-all'

export const domain = resolveActions({ create, find, findAll })
```

**Caller side:**
```typescript
// Single call — just await it
const item = await domain.find(id)

// Parallel calls — Promise.all runs them in parallel automatically
const [items, stats] = await Promise.all([
  domain.findAll(filter, pageable),
  domain.getStats(),
])

// ActionError messages are re-thrown as plain Error and caught by try/catch
try {
  await domain.create(request)
} catch (e) {
  toast(e.message) // ActionError message or a masked generic message
}
```
