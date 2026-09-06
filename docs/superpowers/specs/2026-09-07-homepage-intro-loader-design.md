# Homepage intro loader — design spec

Status: approved by Dhanush via brainstorming session, ready for implementation planning.

## Why

Inspired by landonorris.com's first-load intro sequence (full-bleed brand moment before the real page appears), adapted to this site's own identity and visual language rather than copied. Iterated through several concepts during design; the direction that landed combines the site's real "SD" brand mark with a Watch Dogs-inspired "identity scan" aesthetic — deliberately raw/DOS-terminal, not glossy.

## Scope

Homepage (`/`) only. Does not touch `/about` or `/cv`. Plays on every visit — no session/localStorage skip logic.

## Visual design

A bordered card, centered in a full-bleed black overlay covering the viewport:

- **Frame**: `Courier New`/monospace throughout, thin cyan-tinted border (`rgba(95,225,255,0.4)`), four bracket-corner accents at the card's corners (2px cyan-white border segments, reticle/target-lock style) — not soft-rounded, not glowing softly. Hard edges.
- **Header row**: small tracked-uppercase label (e.g. `CTOS-LOCAL // IDENTITY SCAN`) with a blinking status dot, cyan.
- **Subject line**: "DHANUSH SANTOSH" resolves via a decrypt/scramble effect — random glitch characters cycling per-letter, each letter locking into place in sequence left to right (not a simple fade-in).
- **Data rows**: 2-3 short rows (e.g. `ROLE — FULL-STACK AI DEVELOPER`, `LOCATION — REMOTE // WORLDWIDE`, `ACCESS — GRANTED`) populate in quick succession immediately after the subject line resolves, each appearing near-instantly (stepped, not eased) rather than a smooth fade.
- **Progress indicator**: a thin bar beneath the rows, filling in visible steps (`steps()` timing function, not smooth easing) rather than a continuous glow-fill.
- Optional subtle scanline texture in the background (very faint, per the mockup) — low priority polish, can be dropped if it reads as noise rather than texture.

Color language stays the site's own — cyan accent on black, not Watch Dogs' green. Typography is the one place this deliberately departs from the rest of the site (monospace/DOS throughout the card, matching the reference's "basic computing" philosophy) rather than the site's usual Geist sans.

Reference screenshots and iteration history live in this session's brainstorm artifacts; the approved version is `loader-profiler.html` (the final iteration, called out by Dhanush as "this is good").

## Behavior

**Trigger**: mounts as part of the homepage (`src/app/page.tsx`'s `Home` component), not `layout.tsx` — this makes "homepage only" true by construction rather than needing a pathname check.

**Readiness signal** — this is the "tied to real readiness" requirement, scoped deliberately:
- `document.fonts.ready` resolving, AND
- the hero content having mounted (i.e., past first client render)

Explicitly **excludes** waiting for the 3D sculpture (`ClientSculpture`/`OrbitalSculpture`) to finish loading — that component is intentionally idle-scheduled and lazily imported as a performance optimization (see `src/components/DynamicSculpture.tsx`), and gating the loader on it would fight that existing design and could make the loader linger unpredictably. The sculpture continues loading in the background exactly as it does today, unaffected by the loader.

**Timing**:
- The scan animation has its own natural sequence length (roughly 1.3–1.5s based on the approved mockup's timings: ~700ms scramble-resolve, then rows populating ~90ms apart, then bar fill ~400ms). This natural length acts as the effective minimum — don't cut the animation short even if readiness resolves faster.
- If real readiness isn't met by the time the animation finishes its sequence, hold on the completed card state (blinking status dot, filled bar) rather than looping the scramble again, until readiness resolves.
- Safety ceiling: reveal the page regardless after 5s even if readiness signals never resolve, so a font-load hiccup or edge case can never leave a visitor stuck looking at a loader.

**Reveal transition**: matches the card's raw/glitch aesthetic rather than a soft cinematic wipe (a circular porthole mask, considered earlier, would clash with the hard-edged bracket card). Brief static/glitch flicker over the full viewport, then a hard cut to the real page — like a video feed switching on, not a fade or wipe.

**Reduced motion**: if `prefers-reduced-motion: reduce` is set, skip the loader entirely — content appears immediately, no simplified/static version of the card. Matches how the rest of the site already treats reduced motion (`Reveal`, `CursorFluid`, `ClientSculpture` all disable or simplify, never show a diminished animation in its place). Use the same hydration-safe detection pattern already established this session (`useSyncExternalStore`-based or framer-motion's own `useReducedMotion`, which is already used elsewhere in this codebase and is SSR-safe) — do not reintroduce the `window.matchMedia` render-phase read that caused the earlier hydration bug fixed this session.

**Overlay mechanics**: `position: fixed; inset: 0` overlay with a high z-index, layered on top of the normally server-rendered page underneath (the real page is not hidden from the DOM/SEO, just visually covered while the loader is active). Lock body scroll while visible, matching the existing pattern in `VideoModal.tsx`. `aria-hidden` the overlay once it's dismissed; consider `aria-live`/screen-reader implications for the scramble text (likely should be `aria-hidden="true"` throughout, since the scramble text is decorative and the real subject name is present in the actual page content underneath).

## Testing / verification

This codebase has no component/DOM test infrastructure (existing tests are all pure-function unit tests for the GitHub data pipeline). No new testing infra is in scope here — verification is manual: run the dev server, confirm the loader plays correctly on `/`, confirm it's absent on `/about` and `/cv`, confirm `prefers-reduced-motion` skips it entirely, confirm the 5s safety ceiling actually fires if readiness is artificially delayed, and run the full standard gate (`lint`, `typecheck`, `test`, `build`) same as every other change this session.

## Open questions for implementation planning

- Exact component boundaries (a single `HomepageIntroLoader.tsx`? split scramble-text logic into a small reusable hook if it's non-trivial?) — leave to the planning/implementation phase.
- Whether the background scanline texture ships in v1 or gets dropped as noise — implementer's call per the note above.
