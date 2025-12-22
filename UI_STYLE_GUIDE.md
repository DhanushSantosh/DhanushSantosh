# UI Style Guide

This guide documents how base UI styling and animations are implemented in this repo so future UI changes stay consistent.

## Stack + entry points
- Tailwind CSS v4 is enabled via `@import "tailwindcss";` in `src/app/globals.css`.
- Theme tokens are defined as CSS variables in `:root` and mapped to Tailwind tokens via `@theme inline` in `src/app/globals.css`.
- Framer Motion is the motion system; `src/components/MotionProvider.tsx` wraps the app with `LazyMotion` + `MotionConfig` via `src/components/MotionRoot.tsx`.
- Client islands are preferred for interactivity; keep sections server-rendered when possible and use small client controllers.

## Design tokens (base UI styling)
### Colors
Defined in `src/app/globals.css`:
- `--background`: `#000000`
- `--foreground`: `#f5f5f5`
- `--muted`: `#8e92a9`
- `--accent`: `#ffffff`
- `--accent-bright`: `#f5f5f5`

These are exposed to Tailwind as:
- `--color-background`, `--color-foreground`, `--color-muted`, `--color-accent`

### Typography
- Primary sans family is local Geist (`src/app/layout.tsx`) injected as CSS vars:
  - `--font-geist-sans` and `--font-geist-mono`
- `--font-sans` and `--font-mono` are composed in `:root` and used by Tailwind.
- Poetic display font:
  - Custom font-face `XerocoreRoyal` in `src/app/globals.css`
  - Utility class `.font-poetic` applies the script stack, ligatures, and smoothing

### Global resets & utilities
Defined in `src/app/globals.css`:
- `html { scroll-behavior: smooth; }`
- `.no-scrollbar` removes scrollbars across browsers.
- `@variant hover-hover (@media (hover: hover));` is used to scope hover-only interactions.

## Base surfaces + layout patterns
Common UI surfaces use a consistent dark glass feel:
- Section containers:
  - `bg-black` or `bg-black/80`
  - `border border-white/10`
  - `rounded-3xl` or `rounded-[32px]`
  - Soft shadows like `shadow-[0_0_45px_rgba(0,0,0,0.8)]`
  - Examples: `src/sections/StatsSection.tsx`, `src/sections/ContactSection.tsx`, `src/sections/ExperienceSection.tsx`

Cards follow the same vocabulary with tighter rounding:
- `rounded-2xl`, `border-white/10` or `border-white/5`, `bg-white/5` or `bg-black`
- Example: `src/sections/ProjectsSection.tsx` and `src/app/about/page.tsx`

## Typography system
Use these patterns to keep headings and copy aligned:
- Eyebrow label: `text-xs` or `text-sm`, `uppercase`, `tracking-[0.4em]`, `text-white/50`.
- Section title: `text-3xl` to `text-5xl`, `font-semibold`, `text-balance`.
- Body copy: `text-base` to `text-lg`, `leading-relaxed`, `text-white/70`.
- Poetic footer text uses `.font-poetic` plus a soft neon text-shadow.

## Interaction styling
### Buttons & links
Two primary button styles are reused across sections:
- Primary (filled):
  - `rounded-full border border-white bg-white text-black`
  - `transition hover:bg-white hover:shadow-[0_0_35px_rgba(255,255,255,0.55)]`
- Secondary (outlined):
  - `rounded-full border border-white/10 text-white`
  - `transition hover:border-white/40 hover:shadow-[0_0_28px_rgba(95,225,255,0.45)]`

See `src/sections/HeroSection.tsx`, `src/sections/ProjectsSection.tsx`, `src/sections/ContactSection.tsx`.

### Hover media gating
Use the `hover-hover:` variant to avoid hover effects on touch devices:
- Example: `hover-hover:group-hover:-translate-y-1` in `src/sections/ExpertiseSection.tsx`

### Cursor glow blocking
The cursor glow effect can be disabled per element:
- Add `data-cursor-block` to interactive elements.
- `src/components/CursorFluid.tsx` checks `[data-cursor-block]` and suppresses glow.
- Common usage is on buttons/links in `HeroSection`, `ProjectsSection`, `ContactSection`, `SiteHeader`.

## Animation system (how it works)
### Framer Motion primitives
`MotionProvider` is already mounted in `src/app/layout.tsx`, so individual components can use `framer-motion` without re-wrapping.

### Scroll-reveal wrapper
`src/components/Reveal.tsx` is the standard reveal animation:
- Starts hidden: `{ opacity: 0, y: 32 }`
- Enters visible: `{ opacity: 1, y: 0 }`
- Transition: `duration: 0.9`, `ease: [0.16, 1, 0.3, 1]`
- Uses `useInView` with `once: true` and a top/bottom margin to trigger slightly before fully in view.
- Uses `useReducedMotion()` to skip animation for users that request reduced motion.

Usage:
```tsx
<Reveal className="space-y-6">
  <h2>Section Title</h2>
  <p>Section copy...</p>
</Reveal>
```

### Text animation (Hero sentence)
`src/components/HeroSentenceCycler.tsx`:
- Uses `AnimatePresence` and character-level `m.span` nodes.
- Staggered child transitions (`staggerChildren: 0.03`).
- Each character animates opacity + translate over `0.5s` with `easeOut`.
- A sentence-level blur is used to preserve the cinematic look without per-character filter cost.

### 3D progressive detail
`src/components/OrbitalSculpture.tsx` keeps the first paint lightweight and ramps to full fidelity:
- Starts with reduced geometry detail and skips marker/arc rendering.
- Promotes to full detail during idle time (`requestIdleCallback`) to avoid blocking initial load.
- Map outlines are loaded during idle time via `useWorldLines`.

### Modal animation
`src/components/VideoModal.tsx`:
- Backdrop fades in/out via opacity.
- Modal scales `0.95 -> 1` with matching opacity.
- Uses `AnimatePresence` for exit animations.

### Scroll-driven visibility
`src/hooks/useRafScroll.ts` throttles scroll handlers with `requestAnimationFrame`.
Used by:
- `src/components/SiteHeader.tsx` to toggle sticky + blur header after 24px.
- `src/components/BackToTopButton.tsx` to fade in after 360px.

### CSS keyframe animations
Defined in `src/app/globals.css`:
- `@keyframes arc-rotate` and `@keyframes arc-reverse` power `PhotoFrame` orbit arcs.
- `.animate-arc-rotate` and `.animate-arc-reverse` apply constant rotation.
Used in `src/components/PhotoFrame.tsx`.

### Cursor glow (CSS + JS)
- `body::before` renders a radial gradient that follows the pointer using CSS vars:
  - `--cursor-x`, `--cursor-y`, `--cursor-visible`, `--cursor-glow-factor`
- `src/components/CursorFluid.tsx` updates these vars on pointer move.
- Automatically disabled for `prefers-reduced-motion`, no hover, or coarse pointers.

### 3D motion (Orbital sculpture)
While not a UI animation, the 3D hero is animated in `src/components/OrbitalSculpture.tsx`:
- `react-three-fiber` + `useFrame` drive globe rotation, pulsing rings, and arc traversal.
- `src/components/DynamicSculpture.tsx` chooses `full`, `lite`, or `static` mode based on device hints.
- `src/components/SculptureViewportGate.tsx` defers mounting until the hero is near viewport and prefetches the 3D bundle on idle when device hints allow it.
- The full preset is the highest fidelity; adaptive DPR reduces load if needed.

## Client islands (SSR-first)
Use server-rendered sections with small client controllers to keep hydration minimal:
- Projects: `src/sections/ProjectsSection.tsx` + `src/components/ProjectsDemoController.tsx`
  - Buttons carry `data-project-demo`.
- Expertise: `src/sections/ExpertiseSection.tsx` + `src/components/ExpertiseSelectionController.tsx`
  - Buttons carry `data-tech-item` and `data-active` toggles.
  - Active styling is driven by CSS in `src/app/globals.css` under `.tech-item[data-active="true"]`.

## Implementation steps (for new UI work)
1. Start with existing token usage: use `bg-black`, `border-white/10`, `text-white/70`, and `rounded-2xl/3xl` to match the current surfaces.
2. Wrap new sections in `<Reveal>` to keep entry motion consistent, and pass `delay` if you need a staggered layout.
3. Keep sections server-rendered when possible; add a small client controller if interactivity is required.
4. For new `framer-motion` components, rely on `MotionProvider` and respect reduced-motion behavior.
5. Use `hover-hover:` for hover-only interactions and `data-cursor-block` on interactive elements to tame the cursor glow.
6. Reuse button styles (filled vs outlined) before inventing new patterns.
