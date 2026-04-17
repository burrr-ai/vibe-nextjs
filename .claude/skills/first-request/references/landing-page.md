# Landing Page Reference

This reference guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement interfaces with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Default: Light Theme

Unless user explicitly requests dark theme, always use **light theme**.

## Images Are Key

**Use Unsplash images aggressively.** Landing pages need visual impact.

- Fullscreen hero images
- Large section backgrounds
- Varied placements: full-width, split, asymmetric overlap
- Don't be shy — more images = more impact

**Big images throughout the page.** Not just hero — sprinkle large images across sections.

What counts as "big":
- Full viewport width/height
- Half-page splits
- Oversized with overflow/crop
- Background covering entire section

Landing pages without big images feel empty. Make images a core visual element, not decoration.

## Hero Section

**First impression matters.** Options for hero:

- **Full-bleed image** — 100vh, image covers viewport, text overlay
- **Split layout** — Image one side, text the other
- **Video background** — Looping ambient video
- **Minimal text-only** — Bold typography, no image

Choose based on brand and content. Full-bleed is impactful but not mandatory.

## Fancy Effects (When User Wants "화려하게")

Ask user which style they prefer:

| Style | Description |
|-------|-------------|
| **Horizontal slide** | Scroll down triggers horizontal section movement |
| **Stack/overlay** | Top section stays fixed, next section slides up and covers it |
| **Pin & reveal** | Section pinned while inner content animates/changes |
| **Parallax** | Layers move at different speeds for depth |
| **Staggered reveals** | Elements appear sequentially (motion/react is enough) |

### When to Use What

| Library | Use For |
|---------|---------|
| `motion/react` | Basic animations: fade in, slide up, opacity, staggered reveals |
| `gsap` | Scroll-pin, horizontal scroll, slide transitions, parallax |

**Important:** Use `motion/react` as default. GSAP only for scroll-pin and horizontal scroll effects — simple opacity/fade animations don't work well with GSAP.

## Landing Page Structure (Planning)

A landing page must capture the reader's heart. Follow this flow:

1. **Hook** — Grab attention immediately. Bold headline, striking visual.
2. **Problem** — Present the pain point. "이런 문제 있지 않으세요?"
3. **Solution** — Introduce your product/service as the answer.
4. **Benefits** — Show what they gain. Features → Benefits.
5. **Social Proof** — Testimonials, logos, numbers. Build trust.
6. **CTA** — Clear call to action. "지금 시작하기", "무료로 체험하기"

**Key Principle:** Don't just describe — make them *feel* the problem, then offer relief.

---

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are many flavors to choose from. Design one that is true to the aesthetic direction.
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

## Frontend Aesthetics Guidelines

Focus on:

- **Typography**: By default, use noto-sans-kr set in src/app/global.css. Only change fonts when the user explicitly requests it. When changing, choose beautiful, unique, and interesting fonts. Pair a distinctive display font with a refined body font. Typography can be small or large - orchestrate it well for impact.
- **Color & Theme**: Use light theme by default. Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Images**: Use diverse images from Unsplash to enhance the design. Varied image placements and compositions contribute to effective, memorable interfaces. Images should support the overall aesthetic direction.
- **Motion**: Use Tailwind CSS animations by default (transition, animate-*). For complex effects (scroll-triggered, parallax, staggered reveals), use `motion` from `motion/react`.
- **Spatial Composition**: Create unexpected layouts. Use asymmetry, overlap, diagonal flow, grid-breaking elements. Consider Z-pattern, F-pattern eye flow, bento grids, fullscreen sections, diverse image placements. Choose generous negative space OR controlled density.
- **Cards & Components**: Fix heights for consistency - set fixed line counts and heights for text areas to maintain uniform card sizes. Avoid isolated card blocks with borders and shadows. Instead, use clean grids with minimal separation - let whitespace and layout define boundaries, not visual barriers. Create a compact, cohesive feel.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.
- **Mobile Compatibility**: Essential. Horizontally arranged elements must stack vertically on mobile. Adjust font sizes for mobile environments.

Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details.

## Icons

**NEVER use emojis as icons.** Use `lucide-react`, `@mui/icons-material`, or custom SVG.

## What AI Should Avoid

**Fonts:**

- Overused font families: Inter, Roboto, Arial, Space Grotesk, system fonts
- Use noto-sans-kr unless explicitly requested otherwise

**Colors & Patterns:**

- Cliched color schemes (especially purple gradients on white backgrounds)
- Predictable layouts and component patterns
- Cookie-cutter designs

**Card Styles:**

- Card borders and drop shadows creating isolated blocks
- Background colors on every card forcing visual separation
- Excessive card styles: radius over 4px, thick dividing lines
- Overly vertical card layouts
- Excessive gaps between grid items - keep spacing tight and intentional
- Oversized font sizes in card content - maintain compact, scannable text hierarchy
- Loose element positioning within cards - keep content elements close and organized

**Core Principles:**

- No design should be the same
- Never converge on common choices across generations
- Make unexpected choices that feel genuinely designed for the context

---

Remember: Claude is capable of extraordinary creative work. Don't hold back - show what can truly be created when thinking outside the box and committing fully to a distinctive vision.

## Folder Structure

```
src/page/
  └── home/
      ├── index.tsx

src/layout/
  └── app-layout
```
