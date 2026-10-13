# Homepage intro loader — shipped design

This document describes the homepage intro implemented in `src/components/HomepageIntroLoader.tsx`. The earlier Watch Dogs-inspired identity scan was explored, then replaced. Its monospace card, CTOS header, role rows, and stepped progress bar are not part of the site.

## Scope and visual design

`src/app/page.tsx` mounts the intro on the homepage only. A full-viewport black overlay shows “Dhanush Santosh” in the site's normal type style. The name enters with the same sentence blur and character stagger used by `src/components/HeroSentenceCycler.tsx`, holds briefly, then blurs out. The overlay crossfades to the already rendered page. There is no scan card, glitch effect, or progress indicator.

## When it plays

- It plays once per browser tab session. `sessionStorage` records that playback started. Later homepage loads in the same tab, including client-side navigation back from `/about` or `/projects/*`, skip it. If storage is unavailable, playback may recur.
- `prefers-reduced-motion: reduce` skips the intro entirely.
- A `<noscript>` style hides the overlay for visitors without JavaScript, leaving the server-rendered page visible.

## Readiness and dismissal

The overlay covers the page from the initial render to avoid a flash before hydration. While it plays, body scroll is locked. It waits for both `document.fonts.ready` and the name reveal, hold, and blur-out sequence. It deliberately does not wait for the lazily loaded 3D sculpture. A safety timeout dismisses the overlay if font readiness stalls; dismissal unlocks scrolling and fades the overlay away. The animated overlay is decorative and marked `aria-hidden` because the real page carries the accessible content.

## Verification

In a fresh browser tab, confirm the intro appears on `/` and then stays skipped after reloading or navigating away and back. Confirm it does not appear on `/about` or a case-study page, is skipped with reduced motion, and cannot block the page with JavaScript disabled. Check that the page becomes usable if font readiness is delayed.
