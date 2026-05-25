# Page Layer

## Location
`services/{service}/page/{route}/`

## Structure

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
  ├── index.tsx       # Server component: calls getMe → renders client
  └── client.tsx      # Client: UserInit + App UI
```

- Server component (`index.tsx`): fetches data on the server (getMe, etc.)
- Client component (`client.tsx`): UserInit + UI (Header, Nav, Footer, etc.)
- Root Layout lives at `src/lib/layout/root-layout/` (global: StateProvider, OverlayProvider, Toaster)

## Rules
- `'use client'` required (except for layout server components)
- Use `<img />` (`<Image />` is forbidden)
- For internal routing, use `<Link>` from `next/link` (do not use `<a>`). For external links (`http://`, `https://`, `mailto:`, `tel:`, `#anchor`), `<a>` is allowed
- Do not import api directly → go through state
- layout/index.tsx is a server component; layout/client.tsx is a client component
- **No client-side data processing** → all processing happens in the API:
  - No aggregations like `.filter().length`, `.reduce()` → group/sum in the API
  - No status filtering like `.filter(o => o.status === 'x')` → use where conditions in the API
  - No truncation like `.slice(0, N)` → use limit/order by in the API
  - Reason: when paginating, computing from only the current page's data produces wrong numbers; processing partial data instead of the full dataset is always wrong

## UI Components

- Use shadcn from `@lib/components/ui`
- **Do not use native input/textarea/select directly** → use `@lib/components/ui` components (`Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Calendar` (date), `Editor` (rich text, Tiptap), etc.). If a needed component is missing, add it first and then use it.
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

### Using Query Data

Query fields expose loading/error state alongside `data`.

```tsx
const product = useProduct((state) => ({
  products: state.products,
  actions: state.actions,
}));

// isLoading — initial load (no cache)
if (product.products.isLoading) return <Skeleton />

// isError — error occurred
if (product.products.isError) return <Error error={product.products.error} />

// data — actual data
return product.products.data.items.map((p) => <Card key={p.id} product={p} />)
```

### isFetching — background refetch

`isFetching` is `true` during a background request such as refetch or page change.
Unlike `isLoading`, the existing data is preserved while it runs.

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

> `isLoading` = first load (no data) · `isFetching` = background refetch (data present)

## SSR Detail Pages

### SEO Critical (import data from app router)

```tsx
"use client";
export default function PostDetail({ initialData }) {
  const post = usePost();
  post.actions.setCurrentPost(initialData); // This method must not cause re-render

  /**
   * (omitted)
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
   * (omitted)
   */
}
```
