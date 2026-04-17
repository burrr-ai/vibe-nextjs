# State 레이어

## 위치
`services/{service}/state/{domain}/`

## 구조

```
state/product/
  ├── types.ts          # State + Actions types
  ├── model.ts          # model() with initial state
  ├── actions/
  │     ├── init.ts     # SSR silent 초기화
  │     ├── load.ts     # loadList, loadDetail (query)
  │     ├── crud.ts     # create, update, delete
  │     └── interact.ts # like, bookmark 등
  └── index.ts          # create() hook + re-exports
```

**types.ts를 먼저 작성한다.** Write order: types.ts → model.ts → actions/\*.ts → index.ts

## 공통 규칙

- **state = 페이지 단위**: 하나의 state 도메인이 해당 페이지 정보를 대부분 충족하도록 리치하게 설계
  - 하나의 state에서 여러 도메인을 load → state 분리가 잘못된 것
  - 하나의 load에서 api 여러 개 호출 → api가 UI에 안 맞는 것
- 의존 흐름: `page → state → api → repository`
- 외부에서는 index.ts 통해서만 import

## types.ts

State + Actions 타입 정의. `Query<TData, TArg>` 로 query 필드 타입 지정.
- list + detail + stats 함께 관리 — CRUD 시 optimistic update + 관련 query 모두 refetch (list, stats 등)
- api의 타입을 re export하거나 추가로 정의

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
  // 일반 데이터 — query 아닌 로컬 상태
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
  // 일반 데이터 조작
  toggleSelect(id: string): void
  clearSelection(): void
  setEditMode(value: boolean): void
}
```

## model.ts

- query 두 가지: `query<TData, TArg>()` (일반), `query.infinite<TData, TArg>()` (무한스크롤)
- `keepPreviousData`: pagination query에서만 사용

```ts
import { model, query, keepPreviousData } from 'comwit'

export const product = model<ProductState>({
  // query 데이터 — 서버에서 fetch
  products: query<Pageable<Product>, { page: number }>({
    initialData: { items: [], total: 0, page: 1, limit: 20, totalPages: 0 },
    queryFn: ({ page }) => api.product.findAll({ page, limit: 20 }),
    placeholderData: keepPreviousData,  // pagination에서만 사용
  }),
  stats: query<ProductStats, void>({
    initialData: { totalCount: 0, pendingCount: 0, activeCount: 0 },
    queryFn: () => api.product.getStats(),
  }),
  currentProduct: null,
  // 일반 데이터 — 로컬 상태, action에서 직접 조작
  selectedIds: [],
  isEditMode: false,
})

// query.infinite — 무한스크롤
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

- Actions에 모든 side effect — UI handler는 action 하나만 호출
- 확인 동작: `popup.confirm()` 사용 (`@/lib/utils/popup`)

### init.ts — SSR silent 초기화

- `silent()`로 서버 데이터 주입. useEffect 사용 금지

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

### load.ts — query 호출

- `query(arg)` 로 서버 데이터 fetch. page에서 action만 호출하면 됨

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

### 일반 데이터 조작 — push, filter, 직접 할당

query가 아닌 일반 필드는 action에서 직접 변경. 배열은 `push`, `pop`, `splice`, 재할당(`filter` 등) 모두 가능.

```ts
export const selectActions = action<Pick<ProductActions, 'toggleSelect' | 'clearSelection' | 'setEditMode'>>(({ state }) => {
  class SelectActions {
    private model = state(product)

    toggleSelect(id: string) {
      const idx = this.model.selectedIds.indexOf(id)
      if (idx >= 0) {
        this.model.selectedIds.splice(idx, 1)   // 제거
      } else {
        this.model.selectedIds.push(id)          // 추가
      }
    }

    clearSelection() {
      this.model.selectedIds = []                // 재할당
    }

    setEditMode(value: boolean) {
      this.model.isEditMode = value              // 단순 할당
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
      // optimistic — stats 카운트 즉시 반영
      this.model.stats.data.totalCount += 1
      this.model.stats.data.pendingCount += 1
      await api.product.create({ title })
      // refetch — list + stats 모두 갱신
      await Promise.all([
        this.model.products.refetch(),
        this.model.stats.refetch(),
      ])
    }

    @OnError((error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Unexpected error')
    })
    async delete(id: string) {
      if (!await popup.confirm({ title: '정말 삭제하시겠어요?' })) return
      // optimistic — list에서 제거 + stats 카운트 차감
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
        throw new Error('삭제에 실패했습니다')
      }
    }
  }
  return new CrudActions()
})
```

### interact.ts — Cross-Domain Auth + List/Current 동기화

`state()`로 다른 도메인 모델 읽기. `@Authorized`로 auth guard. `context`로 router 접근.

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
      // optimistic update — current + list 동기화
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

## UI 사용

- **query 쓰면 UI에서 isLoading 체크 필수**

```tsx
const { products } = useProduct((s) => ({ products: s.products }))
if (products.isLoading) return <Skeleton />
return products.data.items.map((p) => <Card key={p.id} product={p} />)
```

## Decorators

| Decorator | Purpose |
|-----------|---------|
| `@OnError(fn)` | 에러 시 사이드이펙트 (에러는 자동 전파, 콜백에서 re-throw 금지). 기본: `toast.error()` |
| `@OnSuccess(fn)` | 성공 콜백 |
| `@Debounce(ms)` | Debounce |
| `@Throttle(ms)` | Throttle |
| `@Authorized({ when, onDeny })` | Auth guard |
