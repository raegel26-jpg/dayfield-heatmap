# Dayfield - Development Progress

Updated: 2026-04-06

## Overall Status: Deployed to dayfield365.vercel.app. Mobile + desktop responsive. Comprehensive mobile audit complete.

## How to Update This Document

**When updating progress.md, always follow this process:**
1. **Review First**: Read the entire document to understand most recent updates
2. **Use System Date**: Always use today's date from the environment for timestamps
3. **Update Progress**: Add new achievements with dates and specific details
4. **Remove Contradictions**: If a decision has changed, keep only the latest version
5. **Eliminate Duplication**: Consolidate similar information into single sections
6. **Assess Next Steps**: Update outstanding tasks based on what was completed
7. **Maintain Structure**: Keep the established sections and formatting

---

## Completed Milestones
- 2026-04-01 — PRD and CLAUDE.md reviewed and reconciled
- 2026-04-01 — Project scaffolded: Vite + React 18 + TypeScript + Tailwind CSS 3, Three.js, html2canvas, Radix UI, CVA
- 2026-04-01 — Types, constants, questions data, SessionContext, and core lib built
- 2026-04-01 — All screens built: LandingScreen, GameScreen, EndScreen + EndHeatmapCard
- 2026-04-01 — WebGL shader integrated with forwardRef uniform updates
- 2026-04-01 — LiquidButton integrated with rounded-[inherit] fix for backdrop filter layer
- 2026-04-01 — Removed 4 vibe options; hardcoded 'rgb' vibe with single Start button
- 2026-04-01 — Integrated GlowCard (spotlight-card.tsx) with RGB color mode
- 2026-04-01 — Font switched to Figtree (400 regular, 700 bold)
- 2026-04-01 — Game screen: absolute positioning, narrative collapse on reveal, Apple-grade animations
- 2026-04-01 — Heatmap: horizontal rows (month label + dots), 12px dots with box-shadow glow
- 2026-04-02 — **Accuracy system**: day-specific % accuracy per question (`src/lib/accuracy.ts`)
- 2026-04-02 — **Glass circles**: GlassCircle component for accuracy display, coin-spin animation on question change
- 2026-04-02 — **Nav toolbar**: Home (top-left), Music/Inverse/FAQ/Feedback (top-right). Modals for FAQ + Feedback
- 2026-04-02 — **Inverse colour mode**: `filter: invert(1)` on html element with hint toast
- 2026-04-02 — **Card swipe transitions**: slide-out-left / slide-in-from-right between landing→game→end
- 2026-04-02 — **End screen**: Cumulative 365-dot heatmap, per-question accuracy, dominant month, closing message
- 2026-04-02 — **Mobile responsive**: Full mobile layout with transposed heatmap (months as columns, days as rows)
- 2026-04-02 — **Mobile dot sizing**: CSS variables `--dot-size: 11px`, `--dot-gap: 1.5px`, `--field-gap: 3px`
- 2026-04-02 — **Dual shader beams on mobile**: Second shader rotated 180° with `mix-blend-mode: screen`, scaled to fill viewport
- 2026-04-02 — **Gyroscope glow**: DeviceOrientationEvent API replaces cursor tracking on mobile, retry-until-granted for iOS permission
- 2026-04-02 — **Mobile glass cards**: Border + shadow removed via CSS media query, frosted glass preserved
- 2026-04-02 — **Mobile nav**: FAQ/Feedback moved to bottom-right on mobile, hidden from top bar
- 2026-04-02 — **End card responsive**: 340px mobile / 496px desktop, increased element sizes, inward question padding
- 2026-04-02 — **Next button on Q5**: Overridden CLAUDE.md spec — Next button now shows on all questions including final
- 2026-04-02 — **Meta tags**: OG image, Twitter card (summary_large_image), theme-color, preview.png
- 2026-04-02 — **Vercel Analytics**: `@vercel/analytics/react` integrated
- 2026-04-02 — **Deployed**: GitHub repo `raegel26-jpg/dayfield-heatmap`, domain `dayfield365.vercel.app`
- 2026-04-06 — **Mobile audit — critical fixes**: Dynamic GlowCard height `calc(100dvh-130px)` replacing fixed 680px, smaller dots on short phones (`@media max-height:700px` → `--dot-size: 9px`), heatmap overflow clipping, Next button repositioned to `bottom-[12px]`
- 2026-04-06 — **Mobile audit — text legibility**: Narrative/reveal text 10px→12px, month labels 6px→8px (game) / 7px→9px (end card), accuracy label 10px→12px
- 2026-04-06 — **Mobile audit — touch fixes**: `:hover` wrapped in `@media (hover:hover) and (pointer:fine)`, modal close button 18px→40px tap target, nav icon buttons 36px→40px, GlowCard `touch-action` changed from `none` to `pan-y`, modal backdrop `role="button"` for iOS Safari tap reliability
- 2026-04-06 — **Mobile audit — safe areas**: `viewport-fit=cover` added, all fixed header/footer elements use `env(safe-area-inset-*)` for notch/home indicator
- 2026-04-06 — **Mobile audit — layout**: Footer "Built by" left-aligned on mobile to avoid FAQ/Feedback button collision, end screen `overflow-y-auto` for short phones, reduced end screen padding, end card accuracy rows `px-4` on mobile
- 2026-04-06 — **Mobile audit — misc**: Text zone `top` fixed from `-5px` to `0`, orientation-aware stagger direction via `matchMedia` listener, font `display=optional` to eliminate FOUT

## Current Focus
- Final visual polish and testing on physical devices

## Key Decisions
- **Font**: Figtree (semibold + regular)
- **Design system**: GlowCard (RGB glow) + LiquidButton (liquid glass) + GlassCircle
- **Vibe**: Hardcoded to 'rgb' — single aesthetic path
- **Shader**: RGB-split sine-wave, uniform updates via ref, never remounted
- **Heatmap**: Desktop = horizontal rows; Mobile = transposed columns (bottom-aligned, bottom-to-top reveal)
- **Dot rendering**: CSS variable sizing (17px desktop, 11px mobile, 9px on short phones ≤700px), memoized React components
- **Game card**: 1000x580px desktop, 340×calc(100dvh-130px) mobile, absolute positioning
- **End card**: 496px desktop, 340px mobile
- **Accuracy**: Day-specific circular distance — 100% if peak in guessed month, scales down by distance
- **Animation**: Apple ease-out curves, staggered entrances, card swipe transitions (1800ms)
- **Mobile beams**: Dual shader canvases, second rotated 180° with screen blend, scaled 1.3-1.5x
- **Mobile glass**: No border/shadow (CSS media query), frosted glass preserved
- **Domain**: dayfield365.vercel.app

## Open Questions
- Gyroscope glow may need further testing on physical iOS devices
- Music autoplay behaviour across different mobile browsers
- Music file (2.3MB) could be compressed to ~700KB with ffmpeg (96kbps AAC) — needs `brew install ffmpeg`
