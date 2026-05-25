# State Layer

## Location
`services/{service}/state/{domain}/`

## comwit Extra API & Detailed Syntax

This doc only covers the frequently used comwit patterns. comwit has many more APIs beyond these.

- `persist()` — automatically sync model fields to localStorage/sessionStorage (login token, theme, recently viewed items, etc.)
- `query.realtime()` — real-time subscription
- `derive` — read-only computed field derived from other fields
- `rules` — per-field validation (accessed via `state.$validation`)
- `@Retry()` — retry on failure (supports exponential backoff)
- `@Queue()` — concurrency control (drop / queue / replace)
- `@Log()`, `@Validate()` — logging / argument validation

For usage, options, and signatures of these APIs, see https://library.comwit.io/llms.txt.

## Structure

```
state/product/
  ├── types.ts          # State + Actions types
  ├── model.ts          # model() with initial state
  ├── actions/
  │     ├── init.ts     # SSR silent initialization
  │     ├── load.ts     # loadList, loadDetail (query)
  │     ├── crud.ts     # create, update, delete
  │     └── interact.ts # like, bookmark, etc.
  └── index.ts          # create() hook + re-exports
```

**Write types.ts first.** Write order: types.ts → model.ts → actions/\*.ts → index.ts

## Common Rules

- Manage list + detail + stats together in the model — on CRUD, do an optimistic update and refetch all related queries (list, stats, etc.)
- Put all side effects in actions (do not expose them in UI components)
  - Call toast sonner, @/lib/uilts/popup (popup.confirm, popup.alert), etc. inside the action
  - If you need state from another model, do not accept it as an argument — cross-import the state model internally
  - Actions should take as few arguments as possible and rely on internal state (so the caller doesn't need to know much)
- Re-export api types or define additional types
- Dependency flow: `page → state → api → repository`

## types.ts

Define State + Actions types. Type query fields with `Query<TData, TArg>`.

```ts
import { Query } from 'comwit'

export type ProductStats = {
  totalCount: number
  pendingCount: number
  activeCount: number
}

export type ProductState = {
  products: Query<Pageable<Product>, { page: number }>
  stats: Query<ProductStats, void>
  currentProduct: Product | null
  // Regular data — local state, not a query
  selectedIds: string[]
  isEditMode: boolean
}

export type ProductActions = {
  init(currentProduct: Product): void
  loadProducts(page: number): Promise<void>
  loadStats(): Promise<void>
  create(title: string): Promise<void>
  delete(id: string): Promise<void>
  like(): Promise<void>
  openDetail(id: string): void
  // Regular data manipulation
  toggleSelect(id: string): void
  clearSelection(): void
  setEditMode(value: boolean): void
}
```

## model.ts

- Two kinds of query: `query<TData, TArg>()` (regular), `query.infinite<TData, TArg>()` (infinite scroll)
- `keepPreviousData`: use only on pagination queries

```ts
import { model, query, keepPreviousData } from 'comwit'

export const product = model<ProductState>({
  // Query data — fetched from server
  products: query<Pageable<Product>, { page: number }>({
    initialData: { items: [], total: 0, page: 1, limit: 20, totalPages: 0 },
    queryFn: ({ page }) => api.product.findAll({ page, limit: 20 }),
    placeholderData: keepPreviousData,  // pagination only
  }),
  stats: query<ProductStats, void>({
    initialData: { totalCount: 0, pendingCount: 0, activeCount: 0 },
    queryFn: () => api.product.getStats(),
  }),
  currentProduct: null,
  // Regular data — local state, mutated directly in actions
  selectedIds: [],
  isEditMode: false,
})

// query.infinite — infinite scroll
export const feed = model<FeedState>({
  posts: query.infinite<Post[], void>({
    initialData: [],
    queryFn: async (_, { cursor }) => {
      const page = cursor ? Number(cursor) : 1
      const res = await api.feed.findAll({ page, limit: 20 })
      return { data: res.items, cursor: String(page + 1), hasMore: page < res.totalPages }
    },
  }),
})
```

Query methods: `.query(arg?)` · `.refetch()` · `.nextFetch()` · `.previousFetch()`
Query data: `data` · `isLoading` · `isFetching` · `isSuccess` · `isError` · `error` · `hasMore` · `cursor`

```ts
// action — infinite query loadMore
async loadMore() {
  await this.model.posts.nextFetch()
}
```

## actions/

- Put all side effects in actions — UI handlers should call a single action
- Confirmation flow: use `popup.confirm()` (`@/lib/utils/popup`)

### init.ts — SSR silent initialization

- Inject server data with `silent()`. Do not use useEffect
- For data that is handled via SSR silent init, do not call `init()` via `useEffect` in a client component — call `actions.init(initialData)` directly during render

```ts
// actions/init.ts
import { silent } from 'comwit'

export const initActions = action<Pick<ProductActions, 'init'>>(({ state }) => {
  class InitActions {
    private model = state(product)
    init(currentProduct: Product) {
      silent(() => { this.model.currentProduct = currentProduct })
    }
  }
  return new InitActions()
})
```

```tsx
// Page — SSR → Client hydration
export default async function Page({ params }: { params: { id: string } }) {
  const product = await api.product.findById(params.id)
  return <ProductDetail initialProduct={product} />
}
function ProductDetail({ initialProduct }) {
  const { actions } = useProduct((s) => ({ actions: s.actions }))
  actions.init(initialProduct) // silent — no re-render
  return <Detail />
}
```

### load.ts — query calls

- Fetch server data with `query(arg)`. The page only needs to call the action

```ts
import { action } from 'comwit'

export const loadActions = action<Pick<ProductActions, 'loadProducts'>>(({ state }) => {
  class LoadActions {
    private model = state(product)

    async loadProducts(page: number) {
      await this.model.products.query({ page })
    }
  }
  return new LoadActions()
})
```

### Regular data manipulation — push, filter, direct assignment

For non-query fields, mutate directly in actions. Arrays support `push`, `pop`, `splice`, reassignment (`filter`, etc.).

```ts
export const selectActions = action<Pick<ProductActions, 'toggleSelect' | 'clearSelection' | 'setEditMode'>>(({ state }) => {
  class SelectActions {
    private model = state(product)

    toggleSelect(id: string) {
      const idx = this.model.selectedIds.indexOf(id)
      if (idx >= 0) {
        this.model.selectedIds.splice(idx, 1)   // remove
      } else {
        this.model.selectedIds.push(id)          // add
      }
    }

    clearSelection() {
      this.model.selectedIds = []                // reassign
    }

    setEditMode(value: boolean) {
      this.model.isEditMode = value              // simple assignment
    }
  }
  return new SelectActions()
})
```

### crud.ts — CRUD + popup.confirm

```ts
import { action, OnError } from 'comwit'
import { toast } from 'sonner'
import { popup } from '@/lib/utils/popup'

export const crudActions = action<Pick<ProductActions, 'create' | 'delete'>>(({ state }) => {
  class CrudActions {
    private model = state(product)

    @OnError((error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Unexpected error')
    })
    async create(title: string) {
      // optimistic — apply stats count immediately
      this.model.stats.data.totalCount += 1
      this.model.stats.data.pendingCount += 1
      await api.product.create({ title })
      // refetch — refresh both list and stats
      await Promise.all([
        this.model.products.refetch(),
        this.model.stats.refetch(),
      ])
    }

    @OnError((error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Unexpected error')
    })
    async delete(id: string) {
      if (!await popup.confirm({ title: 'Are you sure you want to delete?' })) return
      // optimistic — remove from list + decrement stats count
      const snapshot = { items: [...this.model.products.data.items], stats: { ...this.model.stats.data } }
      this.model.products.data.items = this.model.products.data.items.filter((p) => p.id !== id)
      this.model.stats.data.totalCount -= 1
      try {
        await api.product.delete(id)
        await Promise.all([
          this.model.products.refetch(),
          this.model.stats.refetch(),
        ])
      } catch {
        // rollback
        this.model.products.data.items = snapshot.items
        this.model.stats.data = snapshot.stats
        throw new Error('Failed to delete')
      }
    }
  }
  return new CrudActions()
})
```

### interact.ts — Cross-Domain Auth + List/Current sync

Read another domain's model with `state()`. Auth guard with `@Authorized`. Router access via `context`.

```ts
export const interactActions = action<Pick<ProductActions, 'like' | 'openDetail'>, AppContext>(({ state, context }) => {
  class InteractActions {
    private model = state(product)
    private user = state(userModel)

    @Authorized({
      when: () => !!this.user.me,
      onDeny: () => context.router.push('/login'),
    })
    @OnError((error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Unexpected error')
    })
    async like() {
      // optimistic update — sync current + list
      this.model.currentProduct!.likeCount += 1
      this.model.currentProduct!.isLiked = true
      const item = this.model.products.data.items.find((p) => p.id === this.model.currentProduct!.id)
      if (item) { item.likeCount += 1; item.isLiked = true }
      await api.product.like(this.model.currentProduct!.id)
      await this.model.products.refetch()
    }

    openDetail(id: string) { context.router.push(`/product/${id}`) }
  }
  return new InteractActions()
})
```

## UI Usage

- **When using a query, always check isLoading in the UI**

```tsx
const { products } = useProduct((s) => ({ products: s.products }))
if (products.isLoading) return <Skeleton />
return products.data.items.map((p) => <Card key={p.id} product={p} />)
```

## Decorators

| Decorator | Purpose |
|-----------|---------|
| `@OnError(fn)` | Side effect on error (error propagates automatically, do not re-throw in callback). Default: `toast.error()` |
| `@OnSuccess(fn)` | Success callback |
| `@Debounce(ms)` | Debounce |
| `@Throttle(ms)` | Throttle |
| `@Authorized({ when, onDeny })` | Auth guard |

### Reusable decorators — `intercept`

When you need to apply the same precondition (login required, permission check, shared logging, etc.) to multiple actions, create a custom decorator with `intercept`. Use it to wrap an entire class at once instead of repeating `@Authorized` on every method.

The `intercept` factory shares `state`/`context` access, so subscribe to state once at declaration time and run the original method via `execute` on each call. It can be applied to the entire class (all methods) or to individual methods.

```ts
import { intercept } from 'comwit'
import { user } from '@/services/app/state/user/model'
import { popup } from '@/lib/utils/popup'

// Login required — redirect to login page if missing
const LoginRequired = intercept(({ state, context }) => {
  const u = state(user)
  return {
    intercept: (execute, args) => {
      if (!u.me) {
        context.router.push('/login')
        return   // do not call execute → original method blocked
      }
      return execute(...args)   // forward args as-is
    },
  }
})

// Shared delete confirm — if the convention is that the first arg is an id, args can be used too
const ConfirmDelete = intercept(() => ({
  intercept: async (execute, args) => {
    if (!(await popup.confirm({ title: 'Are you sure you want to delete?' }))) return
    return execute(...args)
  },
}))
```

**Apply to the whole class** — every method goes through LoginRequired

```ts
@LoginRequired
class PostCrudActions {
  async create(title: string) { ... }
  async update(id: string, title: string) { ... }

  @ConfirmDelete   // class + method decorator combo — both must pass
  async delete(id: string) { ... }
}
```

**Apply to individual methods only** — reads are open, writes require login

```ts
class MixedActions {
  async readOnlyList() { ... }            // anyone can call

  @LoginRequired
  async create(title: string) { ... }     // login required
}
```

- Class decorators and method decorators can be combined. Execution order is **outer (class) → inner (method)**.
- If `execute` is not called, the original method does not run (blocked via early return).
- Combine with existing `@OnError` for error handling — no need to handle toast inside intercept.
