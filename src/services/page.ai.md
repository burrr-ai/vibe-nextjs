# Page 레이어

## 위치
`services/{service}/page/{route}/`

## 구조

**Always split page into separate section files.** Don't put everything in one file.

```
page/{route}/
  ├── index.tsx           # Compose sections only
  ├── hero-section.tsx
  ├── features-section.tsx
  └── cta-section.tsx
```

- `index.tsx` imports and arranges sections
- Each section is its own file
- Keeps code organized and maintainable

## Layout

```
page/layout/
  ├── index.tsx       # 서버 컴포넌트: getMe 호출 → client 렌더
  └── client.tsx      # 클라이언트: UserInit + App UI
```

- 서버 컴포넌트(`index.tsx`): 서버에서 데이터 fetch (getMe 등)
- 클라이언트 컴포넌트(`client.tsx`): UserInit + UI (Header, Nav, Footer 등)
- Root Layout은 `src/lib/layout/root-layout/`에 위치 (글로벌: StateProvider, OverlayProvider, Toaster)

## 규칙
- `'use client'` 필수 (layout 서버 컴포넌트 제외)
- `<img />` 사용 (`<Image />` 금지)
- API 직접 import 금지 → state 경유
- layout/index.tsx는 서버 컴포넌트, layout/client.tsx는 클라이언트
- **클라이언트 데이터 가공 금지** → 모든 가공은 API에서:
  - `.filter().length`, `.reduce()` 등 집계 금지 → API에서 group/sum
  - `.filter(o => o.status === 'x')` 등 상태 필터링 금지 → API에서 where 조건
  - `.slice(0, N)` 등 잘라내기 금지 → API에서 limit/order by
  - 이유: 페이지네이션 시 현재 페이지 데이터만으로 잘못된 수치가 나옴, 전체 데이터가 아닌 부분 데이터를 가공하는 것은 항상 틀림

## UI Components

- Use shadcn from `@lib/components/ui`
- Tailwind v4
- **Animation**: Tailwind CSS animations by default. For complex effects, use `motion` from `motion/react` (avoid relayout: prefer scale, translate, opacity over x, y, width, height)
- Use regular `<img>` tags (NOT Next.js `<Image>` component - Cloudflare Workers compatibility)
- For initial design: use Unsplash images (`https://images.unsplash.com/...`)
- Icons: use `lucide-react` package

## How to Use Domain State

### Import domain state

```tsx
import { useDomain } from "@/services/{service}/state/{domain}";
import type { DomainType } from "@/services/{service}/state/{domain}";
```

### Rules

- One domain hook call per file
- No destructuring - use namespace style
- Access via `domain.field` and `domain.actions.method()`

### Example

```tsx
// Good: One call, namespace style
const product = useProduct((state) => ({
  products: state.products,
  actions: state.actions,
}));

// Bad: Multiple calls for same domain
const products = useProduct((state) => state.products);
const actions = useProduct((state) => state.actions);

// Bad: Destructuring
const { products, actions } = useProduct();
```

### Query 데이터 사용

query 필드는 `data` 외에도 로딩/에러 상태를 함께 제공한다.

```tsx
const product = useProduct((state) => ({
  products: state.products,
  actions: state.actions,
}));

// isLoading — 최초 로딩 (캐시 없음)
if (product.products.isLoading) return <Skeleton />

// isError — 에러 발생
if (product.products.isError) return <Error error={product.products.error} />

// data — 실제 데이터
return product.products.data.items.map((p) => <Card key={p.id} product={p} />)
```

### isFetching — 백그라운드 재조회

`isFetching`은 refetch, 페이지 전환 등 백그라운드 요청 중일 때 `true`.
`isLoading`과 달리 기존 데이터가 유지된 채로 동작한다.

```tsx
const product = useProduct((state) => ({
  products: state.products,
  actions: state.actions,
}));

if (product.products.isLoading) return <Skeleton />

return (
  <div>
    {product.products.isFetching && <Spinner className="fixed top-4 right-4" />}
    {product.products.data.items.map((p) => <Card key={p.id} product={p} />)}
    <Pagination
      currentPage={product.products.data.page}
      totalPages={product.products.data.totalPages}
      onPageChange={(page) => product.actions.loadProducts(page)}
    />
  </div>
)
```

> `isLoading` = 첫 로딩 (data 없음) · `isFetching` = 백그라운드 재조회 (data 있음)

## SSR Detail Pages

### SEO Critical (import data from app router)

```tsx
"use client";
export default function PostDetail({ initialData }) {
  const post = usePost();
  post.actions.setCurrentPost(initialData); // This method must not cause re-render

  /**
   * (생략)
   */
}
```

### Non-SEO (Client loading)

```tsx
"use client";
export default function PostDetail({ id }) {
  const post = usePost((state) => ({
    current: state.current,
    actions: state.actions,
  }));

  useEffect(() => {
    post.actions.loadCurrentPost(id);
  }, [id]);

  /**
   * (생략)
   */
}
```
