# CLAUDE.md — Monthology
> Briefing file for Claude Code sessions. Read this before touching anything.

---

## What this is

Monthology is a single-page data storytelling experience. The user picks a visual theme, answers 5 questions about real-world monthly statistics by clicking on a 365-dot heatmap, and ends with a downloadable snapshot of their session path.

It is **not a quiz.** It is not a dashboard. It is a piece of interactive writing that happens to use data. Every decision — code, layout, animation, copy — should serve that.

Full spec lives in `monthology-prd.md`. This file tells you how to *think* while building it.

---

## The two things that matter, in order

### 1. Smooth narrative experience
The user should never feel like they're using software. They should feel like something is being revealed to them.

This means:
- Transitions between questions must be seamless. No flashes, no layout shifts, no loading jank.
- The narrative text and the heatmap are one thing, not two. The copy sets up the question. The dots answer it. They breathe together.
- Auto-advance timing is non-negotiable: 3.5s for Q1–Q4, 6s for the final question. Do not shorten these. The user needs time to read and feel the reveal.
- The reveal text appears *after* the dots finish animating (~2.2s). Never before.
- The experience moves forward on its own. The user's only job is to click a month. Everything else is handled.
- Do NOT show a score. Do NOT frame this as right/wrong. The user guessed a month. The calendar answered. That's it.

### 2. Cool aesthetic
The visual language is: dark, alive, glowing. The shader is the world. The dots are breathing inside it.

This means:
- The WebGL shader runs at all times behind everything. Never pause it, never hide it, never let it flicker on transition.
- Dots are never fully off. In idle state they glow at 8% — barely there, but present. The heatmap feels like it's waiting.
- On reveal, dots animate left to right across all 365, not all at once. The sweep is the moment.
- Color is the only language. No icons, no progress rings, no checkmarks. A brighter dot means more. That's enough.
- The liquid glass button component from `web-gl-shader.tsx` / `liquid-glass-button.tsx` is the design reference. Everything UI should feel like it belongs to that world.
- Typography must be editorial. Do not use Inter, Roboto, or Arial. Pick something that has weight and character — a serif or distinctive display font that makes the narrative copy feel intentional.
- The end card should look like a artifact worth saving. Simple, dark, glowing dots, clean type. Someone should want to screenshot it even without the download button.

---

## The copy is sacred

Every word on screen was written deliberately. Do not rewrite it, summarize it, or truncate it for space. If the layout can't fit the copy, fix the layout.

The narrative text before each question is not a description. It is the experience. It must appear before the question text, in full, at readable size.

The reveal text is dynamic — `{guessedMonth}` must be replaced at render time with the full capitalized month name (e.g. "July", not "jul").

Full copy for all 5 questions lives in Section 5 of the PRD.

---

## The 365-dot grid

This is the core visual. It is not a 12-cell grid. It is 365 individual dots, grouped into 12 month clusters.

- Each cluster has the correct number of dots for that month (Jan = 31, Feb = 28, etc.)
- Dots are arranged in a tight sub-grid within each cluster (~7 columns)
- Month label sits below each cluster
- The entire cluster is the click target — not individual dots
- On hover, all dots in the cluster lift together
- On reveal, dots fill left to right, ~6ms stagger per dot, 200ms fill transition (~2.2s total sweep)

Do not simplify this to 12 cells to save time. The 365-dot field is the point.

---

## Branching logic

Branching is season-based, not month-specific.

```
Winter: Dec, Jan, Feb
Spring: Mar, Apr, May
Summer: Jun, Jul, Aug
Autumn: Sep, Oct, Nov
Correct: the exact correct answer month (takes priority)
```

The `resolveBranch()` function lives in `src/lib/season.ts`. Use it. Do not inline branching logic elsewhere.

---

## The shader

The `WebGLShader` component in `/components/ui/web-gl-shader.tsx` is provided. Copy it verbatim. Do not modify the shader code.

When vibe changes, update the uniforms via ref — do NOT remount the shader. Remounting causes a visible flash. The shader must run continuously from landing screen to end screen.

Uniform values per vibe:
```
dark:     xScale 1.2, yScale 0.6, distortion 0.08
warm:     xScale 0.8, yScale 0.3, distortion 0.02
cosmic:   xScale 1.5, yScale 0.8, distortion 0.04
surprise: xScale 1.0, yScale 0.5, distortion 0.05
```

---

## What vibe does and does not do

**Does:** Changes shader uniforms. Changes dot palette. Changes visual feel.
**Does not:** Change which questions appear. Change the question order. Filter content.

All vibes see the same questions. Vibe is skin, not substance.

---

## Q5 is special

The final question is a trick. The heatmap renders nearly flat — all 365 dots at near-equal intensity. This is not a bug. This is the reveal.

Do not auto-advance at 3.5s. Give it 6 seconds. The reveal copy is the longest in the experience. The user needs to read it.

Do not add a "Next" button to Q5. The experience ends. Let it end.

---

## State rules

- All state is in-memory React only. No localStorage. No sessionStorage. No backend.
- Session resets completely on Play Again. Clean slate.
- `guessHistory` grows to exactly 5 entries — one per question.
- The end screen is derived from `guessHistory`. Nothing is stored separately.

---

## Things you must not do

- Do not show a score or correct/incorrect count anywhere
- Do not add a skip button or manual Next button (except Play Again on end screen)
- Do not fetch data at runtime — everything is hardcoded in `questions.json`
- Do not use React Router — this is a single route, single page
- Do not remount the shader on vibe change
- Do not auto-advance Q5 in under 6 seconds
- Do not simplify the 365-dot grid to 12 cells
- Do not rewrite the copy
- Do not use Inter, Roboto, or Arial

---

## File map

```
src/components/ui/web-gl-shader.tsx     ← shader, copy verbatim
src/components/ui/liquid-glass-button.tsx ← button, copy verbatim
src/components/LandingScreen.tsx
src/components/GameScreen.tsx
src/components/EndScreen.tsx
src/components/HeatmapField.tsx         ← 365-dot container
src/components/MonthCluster.tsx         ← one month's dots + label
src/components/DayDot.tsx               ← single dot
src/components/VibeGrid.tsx
src/components/RevealText.tsx
src/components/EndHeatmapCard.tsx
src/components/ProgressBar.tsx
src/context/SessionContext.tsx
src/data/questions.json
src/lib/season.ts                       ← resolveBranch()
src/lib/utils.ts
src/types/index.ts
```

---

## When in doubt

Ask: does this serve the narrative, or does it serve the software?

If it serves the software — the score, the loading state, the helper text, the tooltip — cut it.

If it serves the narrative — the timing, the copy, the dot animation, the shader — protect it.
