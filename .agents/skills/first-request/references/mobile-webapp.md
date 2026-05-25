# Mobile Web App Layout Reference

For mobile-first web apps — app-like layout with bottom navigation.

## Requirements

### 1. App Container
- Max width limited: `max-w-md`
- Centered on screen
- Height fixed to viewport: `h-dvh`
- **No shadow on container** — do not use `shadow-*` to visually separate the app container on desktop

### 2. Scroll Behavior
- Scroll inside app container (main), NOT body
- Hide scrollbar globally

```css
/* globals.css */
* {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
*::-webkit-scrollbar {
  display: none;
}
```

### 3. Bottom Navigation
- Fixed at bottom
- Icon + label structure
- Current tab highlighted
- **Safe area bottom padding**: `pb-[env(safe-area-inset-bottom,8px)]` on nav — ensures tap targets aren't blocked by iPhone home indicator. Fallback 8px for non-notch devices.

```tsx
// Example structure
<nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t pb-[env(safe-area-inset-bottom,8px)]">
  <div className="flex justify-around py-3">
    {tabs.map((tab) => (
      <Link
        key={tab.href}
        href={tab.href}
        className={cn(
          "flex flex-col items-center gap-1 text-xs",
          isActive ? "text-primary" : "text-muted-foreground"
        )}
      >
        <tab.icon className="size-5" />
        <span>{tab.label}</span>
      </Link>
    ))}
  </div>
</nav>
```

### 4. App Bar
- Each page implements own app bar
- Use `sticky top-0` (allows different designs per page)

```tsx
// Example app bar
<header className="sticky top-0 z-10 bg-white border-b px-4 py-3">
  <h1 className="text-lg font-semibold">Page Title</h1>
</header>
```

### 5. Viewport Safe Area

For `env(safe-area-inset-bottom)` to work, the viewport must include `viewport-fit=cover`:

```tsx
// src/app/layout.tsx
import { Viewport } from 'next'

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}
```

### 6. Layout Structure (with Ssgoi)

Configure the Ssgoi provider and the mobile container together in the web app layout client (`src/services/app/page/layout/client.tsx`). **Ssgoi applies only to the web app (mobile) service** — do not add it to other service layouts such as admin.

```tsx
// src/services/app/page/layout/client.tsx
'use client'

import { Ssgoi } from '@ssgoi/react'
import { drill, fade } from '@ssgoi/react/view-transitions'
import { BottomNav } from '@/lib/components/bottom-nav'

const ssgoiConfig = {
  transitions: [
    { from: '*', to: '/post/*', transition: drill({ direction: 'enter' }) },
    { from: '/post/*', to: '*', transition: drill({ direction: 'exit' }) },
  ],
  defaultTransition: fade(),
}

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md h-dvh flex flex-col">
      <main className="flex-1 overflow-y-auto relative z-0 overflow-x-clip">
        <Ssgoi config={ssgoiConfig}>{children}</Ssgoi>
      </main>
      <BottomNav />
    </div>
  )
}
```

The `relative z-0 overflow-x-clip` on `<main>` is required because Ssgoi clones the OUT page with `position: absolute`. For detailed configuration such as transition options and hero, see https://ssgoi.dev/llms.txt.

## Folder Structure

```
src/
  app/
    (app)/
      layout.tsx       # only imports the service layout (route group)
      page.tsx         # / route
  services/
    app/
      page/
        layout/
          index.tsx    # server component (getMe, etc.)
          client.tsx   # client layout (Ssgoi + mobile container + BottomNav)
        {route}/
          index.tsx    # page (wrapped with SsgoiTransition)
  lib/
    components/
      bottom-nav.tsx   # bottom nav
```

## page.ai.md insert (REQUIRED)

When applying this reference, **paste the block below verbatim — no edits, no summarizing — at the end of `src/services/page.ai.md`.** Do not skip this step — subsequent page-layer work references these rules.

<!-- BEGIN page.ai.md insert -->
````markdown
## Page Transitions (Ssgoi, web app only)

> Ssgoi page transitions apply **only to web app (mobile) service pages**. Do not add them to other service pages such as admin.

### Effects (available transitions)

Provided by `@ssgoi/react/view-transitions`: `drill` (detail enter/exit), `fade` (default), `slide` (left/right), `scroll`, `swap`, `sheet`, `hero`, `depth`.

### Layout config example

In the web app layout client (`src/services/app/page/layout/client.tsx`), match per-route transitions with `<Ssgoi config={...}>`. `<main>` requires `relative z-0 overflow-x-clip`.

```tsx
'use client'

import { Ssgoi } from '@ssgoi/react'
import { drill, fade } from '@ssgoi/react/view-transitions'

const ssgoiConfig = {
  transitions: [
    { from: '*', to: '/post/*', transition: drill({ direction: 'enter' }) },
    { from: '/post/*', to: '*', transition: drill({ direction: 'exit' }) },
  ],
  defaultTransition: fade(),
}

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md h-dvh flex flex-col">
      <main className="flex-1 overflow-y-auto relative z-0 overflow-x-clip">
        <Ssgoi config={ssgoiConfig}>{children}</Ssgoi>
      </main>
    </div>
  )
}
```

### Wrapping pages

Wrap each page with `<SsgoiTransition id="/route">` (`id` must match the actual route path).

```tsx
import { SsgoiTransition } from '@ssgoi/react'

<SsgoiTransition id="/route" as="div">{/* page content */}</SsgoiTransition>
```

For detailed configuration (transition options, hero, advanced usage, etc.), see https://ssgoi.dev/llms.txt.
````
<!-- END page.ai.md insert -->
