# Monthology - Development Progress

Updated: 2026-04-02

## Overall Status: Core build complete. UI/UX polish phase — accuracy system, nav toolbar, Apple-grade animations, inverse mode.

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
- 2026-04-01 — Q5 timing fix: auto-advance extended from 6s to 20s so users can read the 100-word reveal
- 2026-04-01 — Q5 flat trick fix: global min/max normalization across all 365 values (not per-cluster) so the flat dataset renders visually flat
- 2026-04-01 — Removed 4 vibe options from landing page; hardcoded 'dark' vibe, replaced with single Start button
- 2026-04-01 — Integrated GlowCard (spotlight-card.tsx) with RGB color mode (hue 0→360 full spectrum)
- 2026-04-01 — Integrated liquid-glass.tsx component (GlassEffect, GlassDock, GlassButton, GlassFilter)
- 2026-04-01 — Font switched from Cormorant Garamond + Space Grotesk to Figtree (400 regular, 700 bold)
- 2026-04-01 — Landing page: GlowCard with RGB glow (650px), LiquidButton Start button (100px wide), liquid glass effect
- 2026-04-01 — Game screen: wrapped in 1000x600px GlowCard with RGB glow, question text constrained to 600x60px
- 2026-04-01 — GlowCard spotlight-card.tsx updated: frosted → liquid glass (thinner border, lower opacity, edge highlights, reduced blur)
- 2026-04-01 — Heatmap layout changed from 4-column grid to horizontal rows (month label left, dots flowing right, 12 rows stacked)
- 2026-04-01 — Dots sized to 12px, removed "Dark" vibe label from ProgressBar
- 2026-04-01 — Production build clean: 0 type errors
- 2026-04-01 — Game screen restructured: flex column → absolute positioning to prevent heatmap jumping between questions
- 2026-04-01 — Narrative text hides on reveal (opacity + maxHeight collapse), reveal text appears below question
- 2026-04-01 — Pixel-level positioning: heatmap paddingTop 81px, marginLeft -20px, Next button bottom 20px, Start button mt-[21px]
- 2026-04-01 — Reveal text font reduced to text-xs
- 2026-04-02 — **Accuracy system**: day-specific % accuracy per question (`src/lib/accuracy.ts`). Calculates circular day-of-year distance from guessed month to peak day. Stored in GuessRecord, shown on reveal + end screen
- 2026-04-02 — **Glass accuracy circles**: Two liquid glass circles (GlassCircle component) flanking the question text — left shows "This Q" accuracy, right shows running "Average". Uses same liquid glass shadow/filter as LiquidButton
- 2026-04-02 — **Nav toolbar**: Home button (top-left), Inverse/FAQ/Feedback (top-right with gap separating inverse from info buttons). All liquid glass icon buttons. FAQ and Feedback open glass-style modals. Visible during game phase only
- 2026-04-02 — **Inverse colour mode**: Toggle button applies `filter: invert(1)` to entire page — full inversion of everything including shader
- 2026-04-02 — **Cursor glow standardised**: Removed `overflow-hidden` from game screen GlowCard so outer glow bleeds past card edges, matching landing page behaviour
- 2026-04-02 — **Apple-grade text animations**: Staggered entrance (narrative 250ms, question 400ms), Apple ease-out curves, no more `transition-all`, narrative collapses cleanly on reveal, reveal text bumped to text-sm
- 2026-04-02 — **Spacing overhaul**: narrative leading-relaxed, 16px gaps between text sections, question font-semibold + leading-normal, consistent vertical rhythm
- 2026-04-02 — **End screen accuracy**: Per-question accuracy percentages shown in EndHeatmapCard (included in PNG download)

## Current Focus
- In-browser testing of full 5-question flow with accuracy display
- Mobile responsiveness (game card, nav buttons, glass circles)
- Gyroscope support for mobile glow effect (DeviceOrientationEvent API — free browser API, needs iOS permission prompt)

## Key Decisions
- **Font**: Figtree (semibold + regular) — clean, modern sans-serif from Google Fonts
- **Design system**: GlowCard (spotlight-card) with RGB cursor-tracking glow + LiquidButton (liquid glass) + GlassCircle for data display
- **Vibe**: Hardcoded to 'rgb' — single aesthetic path
- **Shader**: Using designali RGB-split sine-wave shader, uniform updates via ref
- **Heatmap layout**: Horizontal rows (month label + dots in a line), not grid clusters
- **Dot rendering**: 12px memoized React components with CSS box-shadow glow
- **Landing page**: GlowCard (650px) with liquid glass effect, LiquidButton Start
- **Game screen**: GlowCard (1000x580px), absolute positioning for stable layout, no overflow-hidden
- **Accuracy calculation**: Day-specific circular distance — peak day across 365 values vs guessed month range. 100% if peak is in guessed month, scales down by distance (max 182 days = 0%)
- **Animation easing**: Apple ease-out `cubic-bezier(0, 0, 0.58, 1)` for entrances, spring-like `cubic-bezier(0.25, 0.46, 0.45, 0.94)` for layout shifts
- **Nav toolbar**: Home separated top-left, utilities top-right with visual grouping (inverse | FAQ + feedback)
- **Inverse mode**: Full CSS `filter: invert(1)` on html element — inverts everything uniformly

## Open Questions
- Mobile responsiveness for the 1000px game card — may need responsive breakpoints
- Gyroscope implementation for mobile glow — use DeviceOrientationEvent to map tilt to --x/--y CSS vars
- Google Fonts loading strategy for Figtree
