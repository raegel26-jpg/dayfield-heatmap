# Monthology — Product Requirements Document
> AI Coding Agent Reference | Version 2.0 — Final

---

## 1. Core Concept & Vibe

Monthology is a single-page, interactive data storytelling experience. The user picks a visual theme, is guided through 5 branching questions about real-world monthly statistics, clicks a month on a 365-dot heatmap to guess the answer, and the grid reveals the truth. Each next question branches based on which month they clicked. It ends with a downloadable heatmap snapshot of their full session path.

**Aesthetic:** Dark, cinematic, shader-driven. Black background with a full-screen animated WebGL sine-wave shader. The heatmap grid glows with a theme-specific palette. Every state transition feels liquid, not snappy.

**Voice & Tone:** Stark, declarative, trusts silence. Inspired by Jenny Offill and Maggie Nelson. Short sentences. Never explains itself. The question arrives like a fact, not a game show.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | React + Vite + TypeScript |
| Styling | Tailwind CSS |
| Shader | Three.js (`WebGLShader` component — see Section 9) |
| Share card | `html2canvas` |
| Deployment | Vercel (standalone domain) |
| Data | Hardcoded JSON (`questions.json`) |
| State | In-memory React state only — fully stateless, no localStorage |
| Dependencies | `three`, `@radix-ui/react-slot`, `class-variance-authority`, `html2canvas` |

---

## 3. E2E User Flow

### 3.1 Landing Screen
- Full-screen WebGL shader plays behind everything
- Centered card with frosted glass treatment (liquid glass button aesthetic)
- Title: **"Monthology"**
- Tagline: *"The calendar knows more than you think."*
- 4 vibe buttons in a 2×2 grid — vibe sets aesthetic only, not content
- Clicking a vibe sets `selectedVibe` in state and transitions to game screen

### 3.2 Game Screen — Guess Phase
- Shader background persists, color-shifted per vibe (via uniform tweaks)
- Top: Question counter `(1 / 5)` and current vibe label
- Middle: Question copy (large, typographic, centered)
- Below question: the heatmap grid
  - **365 dots total**, grouped into 12 month clusters
  - Each cluster contains ~28–31 dots (one per day)
  - Layout: 3 rows of 4 month clusters (quarterly feel)
  - All dots are **dim/dark** by default — barely visible
  - Month label sits below each cluster
  - Clicking anywhere within a cluster = guessing that month
  - Hovering a cluster highlights all its dots with a subtle glow

### 3.3 Game Screen — Reveal Phase
- Clicked cluster immediately pulses (glow keyframe, 400ms)
- All 365 dots animate in with their real daily values — staggered left to right (~6ms delay per dot, ~2.2s total sweep)
- Each dot colored by its individual daily value using the vibe gradient (low = dim, high = bright)
- Correct answer cluster gets the brightest glow
- User's clicked cluster gets a secondary ring marker (right or wrong)
- Fact reveal text appears below the grid after dots finish animating
- **Auto-advances after 3.5 seconds** (Q1–Q4) or **6 seconds** (Q5) — no manual Next button

### 3.4 Branching Logic
- After each reveal, next question is selected based on the **season** of the clicked month:
  - Winter: Dec / Jan / Feb
  - Spring: Mar / Apr / May
  - Summer: Jun / Jul / Aug
  - Autumn: Sep / Oct / Nov
  - If the guessed month matches the correct answer AND the question defines a `correct` branch, that takes priority (Q1 only)
- Each question node in `questions.json` has a `branches` map keyed by season
- All branch rules manually curated — no fallback logic needed

### 3.5 End Screen
- Appears after Q5 resolves
- Shows the **session heatmap** — a 3×4 cluster grid colored by how many times the user clicked each month across all 5 questions
- Overlaid metadata:
  - Title: **"My Month Map"**
  - Site name: **Monthology**
  - Most-clicked month label: e.g. *"Your month: September"*
- Two buttons:
  - **Download PNG** — uses `html2canvas` to capture the end card div
  - **Play Again** — resets all state, returns to landing screen

---

## 4. Vibe System

Vibe sets three layers simultaneously. Content pool is shared across all vibes.

| Vibe | Heatmap Palette | Shader Uniforms | Feel |
|---|---|---|---|
| 🖤 Dark | Amber `#92400e` → Crimson `#dc2626` | `xScale: 1.2, yScale: 0.6, distortion: 0.08` | Slow, heavy |
| 🤍 Warm | Peach `#fed7aa` → Rose `#fb7185` | `xScale: 0.8, yScale: 0.3, distortion: 0.02` | Gentle, low |
| 🌌 Cosmic | Cyan `#22d3ee` → Violet `#7c3aed` | `xScale: 1.5, yScale: 0.8, distortion: 0.04` | Wide, sweeping |
| 🎲 Surprise Me | RGB split (original shader) | `xScale: 1.0, yScale: 0.5, distortion: 0.05` | Chaotic, max |

---

## 5. Question Flow & Copy

### Session structure: 5 questions total
- Q1: Entry (everyone)
- Q2: 5 branch paths by season of clicked month
- Q3: 4 thematic threads
- Q4: 2 converging paths
- Q5: Final question (everyone) → End screen

---

### Q1 — Entry · All users

**Copy:**
> The world makes the most babies in one month.
> Not because of that month.
> Because of what happened nine months before it.
>
> You've lived through both. You just didn't know they were the same story.
>
> **Which month has the most births globally?**

**Correct answer:** September
**Source:** WHO / CDC daily birth estimates
**Dataset:** Daily birth estimates, 365 dots

**Reveal (correct):**
> September. Most of those babies were made on New Year's Eve. The calendar remembers what we forget by morning.

**Reveal (wrong):**
> September — not [guessedMonth]. Most of those babies were made on New Year's Eve. The calendar remembers what we forget by morning.

**Branch rules:**
- Sep (correct) → Q2-Correct
- Jun / Jul / Aug → Q2-Summer
- Dec / Jan / Feb → Q2-Winter
- Oct / Nov → Q2-Autumn
- Mar / Apr / May → Q2-Spring

---

### Q2 — Season Branches (5 paths)

#### Q2-Correct (clicked Sep)

**Copy:**
> You got it.
>
> September babies. December nights.
> It takes nine months to make a life — which means most of us began in the dark, in the last hours of a year people were already letting go of.
>
> Stay with that.
>
> **Which month has the most conceptions globally?**

**Correct answer:** December
**Source:** Birth data offset 266 days
**Dataset:** Estimated daily conceptions, 365 dots

**Reveal:**
> December. Every year, without fail. The world goes cold. People draw close. Nine months later, September fills up again.

**Branch rules:**
- Dec / Jan / Feb → Q3-Dark
- Jun / Jul / Aug → Q3-Heat
- Sep / Oct / Nov → Q3-Chaos
- Mar / Apr / May → Q3-Life

---

#### Q2-Summer (clicked Jun / Jul / Aug)

**Copy:**
> You reached for summer.
>
> The body knows summer before the mind does — the length of the day, the weight of the air. There's a reason we say heat like it means more than temperature.
>
> **Which month is the hottest on Earth, averaged globally?**

**Correct answer:** July
**Source:** NOAA global surface temperature records
**Dataset:** Daily average global temperature, 365 dots

**Reveal:**
> July. Most of the planet's land sits in the north. When the northern hemisphere tilts toward the sun — the whole world follows.

**Branch rules:**
- Jun / Jul / Aug → Q3-Heat
- Dec / Jan / Feb → Q3-Dark
- Sep / Oct / Nov → Q3-Chaos
- Mar / Apr / May → Q3-Life

---

#### Q2-Winter (clicked Dec / Jan / Feb)

**Copy:**
> You went for winter.
>
> The months when we slow down. Stay inside. Share the same air in the same rooms for weeks on end.
> Closeness has a cost.
>
> **Which month do the most people fall ill globally?**

**Correct answer:** January
**Source:** CDC FluView / WHO seasonal illness data
**Dataset:** Daily respiratory illness cases, 365 dots

**Reveal:**
> January. We come home from the holidays carrying something. We always do.

**Branch rules:**
- Dec / Jan / Feb → Q3-Dark
- Jun / Jul / Aug → Q3-Heat
- Sep / Oct / Nov → Q3-Chaos
- Mar / Apr / May → Q3-Life

---

#### Q2-Autumn (clicked Oct / Nov)

**Copy:**
> You chose autumn.
>
> The year starting to let go. Light pulling back. A specific kind of restlessness that lives in those months — in us, and in the planet itself.
>
> **Which month sees the most natural disasters globally?**

**Correct answer:** September
**Source:** EM-DAT International Disaster Database
**Dataset:** Daily disaster event count, 365 dots

**Reveal:**
> September. Hurricane season peaks. Monsoons surge. Wildfires crest. The same month that holds the most births holds the most destruction. The earth doesn't separate the two.

**Branch rules:**
- Sep / Oct / Nov → Q3-Chaos
- Jun / Jul / Aug → Q3-Heat
- Dec / Jan / Feb → Q3-Dark
- Mar / Apr / May → Q3-Life

---

#### Q2-Spring (clicked Mar / Apr / May)

**Copy:**
> You picked spring.
>
> Something in you knew things were beginning again. That's not nothing — most people don't notice the calendar turning until it's already turned.
>
> **When do the most flower species reach peak bloom globally?**

**Correct answer:** May
**Source:** USA National Phenology Network
**Dataset:** Daily flowering species count, 365 dots

**Reveal:**
> May. The same species, roughly the same days, every year. A clock older than any we've built. It doesn't need winding.

**Branch rules:**
- Mar / Apr / May → Q3-Life
- Jun / Jul / Aug → Q3-Heat
- Dec / Jan / Feb → Q3-Dark
- Sep / Oct / Nov → Q3-Chaos

---

### Q3 — Thematic Threads (4 threads)

#### Q3-Dark

**Copy:**
> Life arrives in a rhythm.
> So does its end.
>
> We rarely say it out loud. The data doesn't have that problem.
>
> **Which month do the most people die globally?**

**Correct answer:** January
**Source:** WHO Global Mortality Database
**Dataset:** Daily death estimates, 365 dots

**Reveal:**
> January. The same month that holds the most illness holds the most loss. The calendar doesn't flinch. Neither should we.

**Branch rules:** All seasons → Q4 by season of clicked month

---

#### Q3-Heat

**Copy:**
> Heat doesn't just change how we feel.
> It moves the entire living world.
>
> Billions of creatures — following signals they didn't choose, crossing continents on instinct, every year, on time.
>
> **Which month sees the peak of bird migration globally?**

**Correct answer:** May (with a second peak in September)
**Source:** eBird / Cornell Lab of Ornithology
**Dataset:** Daily migration counts, 365 dots

**Reveal:**
> May. Billions of birds moving north as the hemisphere warms. September pulls them back. They've been doing this longer than we've been watching.

**Branch rules:** All seasons → Q4 by season of clicked month

---

#### Q3-Chaos

**Copy:**
> The ocean has its own calendar.
> Older than ours. Indifferent to it.
>
> We go to the sea when it's warmest. We're not the only ones who noticed.
>
> **Which month sees the most shark attacks globally?**

**Correct answer:** July
**Source:** Florida Museum of Natural History — International Shark Attack File
**Dataset:** Daily shark attack incidents, 365 dots

**Reveal:**
> July. Warmer water. More swimmers. More sharks near shore, following the fish that follow the heat. Guess we weren't the only ones keeping track of the weather.

**Branch rules:** All seasons → Q4 by season of clicked month

---

#### Q3-Life

**Copy:**
> The same instinct that opens flowers moves through people too.
>
> We dress it up differently. Give it candlelight, a ring, a knee on cold ground. But underneath — it's seasonal. It always has been.
>
> **Which month sees the most marriage proposals globally?**

**Correct answer:** December
**Source:** The Knot Global Wedding Report — 20,000+ couples surveyed
**Dataset:** Daily proposal estimates, 365 dots

**Reveal:**
> December. Nearly one in five proposals happen in a single month. We choose to begin things when everything else feels like it's ending.

**Branch rules:** All seasons → Q4 by season of clicked month

---

### Q4 — Converging Paths (2 paths)

#### Q4-Commerce (Summer / Autumn branches arrive here)

**Copy:**
> Biology. Weather. Migration. Love.
>
> And then there's this — billions of people, alone with their screens, adding things to baskets in the middle of the night.
>
> The calendar shapes desire too. Maybe especially desire.
>
> **Which month sees the most online shopping globally?**

**Correct answer:** November
**Source:** Adobe Digital Economy Index / Alibaba Singles' Day data
**Dataset:** Daily global e-commerce revenue estimates, 365 dots

**Reveal:**
> November. In the US: Cyber Monday. In China: Singles' Day — the largest shopping event in human history, every November 11th. Two cultures. One month. The same hunger.

**Branch rules:** All → Q5-Final

---

#### Q4-Human Cycles (Winter / Spring / Correct branches arrive here)

**Copy:**
> We begin things in cycles.
> We end them in cycles too.
>
> Divorce lawyers noticed it long before researchers did. They've been watching it repeat, quietly, without surprise.
>
> **Which month sees the most divorces filed globally?**

**Correct answer:** March (second spike in August)
**Source:** University of Washington 14-year study / CDC
**Dataset:** Daily divorce filing estimates, 365 dots

**Reveal:**
> March. People decide over the holidays. They survive January. Then March comes — and they act. August is the other peak. Summer is over. The kids are back at school. There's nothing left to wait for.

**Branch rules:** All → Q5-Final

---

### Q5 — Final Question · Everyone

**Copy:**
> You've seen where babies come from.
> Where the heat lives. Where the birds go.
> Where love starts and marriages end.
>
> One more.
> This one is different.
>
> **Which month has the most daylight hours — averaged across the entire planet?**

**Correct answer:** Trick question — no answer. Every month is equal.
**Source:** Astronomical data
**Dataset:** Daily daylight hours averaged globally, 365 dots — nearly flat

**Reveal:**
> There isn't one.
>
> Averaged across both hemispheres, every month receives almost exactly the same amount of sunlight. The planet doesn't have a brightest month.
>
> Only we do — because of where we happen to be standing.
>
> Every rhythm you just saw. Every spike, every cycle, every pattern — it exists because of your particular patch of ground and its particular relationship with the sun.
>
> The calendar was never global.
> It was always just yours.

→ **End screen**

---

## 6. Data Model / Schema

### 6.1 `questions.json` structure

```json
{
  "questions": [
    {
      "id": "q_births_01",
      "isEntry": true,
      "text": "Which month has the most births globally?",
      "copyFull": "The world makes the most babies in one month...",
      "dataset": {
        "jan": [42, 41, 43, 42, 41, 40, 42, 43, 41, 40, 42, 41, 43, 42, 41, 40, 42, 43, 41, 40, 42, 41, 43, 42, 41, 40, 42, 43, 41, 40, 42],
        "feb": [38, 37, 36, 38, 37, 36, 38, 37, 36, 38, 37, 36, 38, 37, 36, 38, 37, 36, 38, 37, 36, 38, 37, 36, 38, 37, 36, 38],
        "sep": [52, 53, 52, 51, 53, 52, 54, 53, 52, 51, 53, 52, 54, 53, 52, 51, 53, 52, 54, 53, 52, 51, 53, 52, 54, 53, 52, 51, 53, 52]
      },
      "correctMonth": "sep",
      "revealCorrect": "September. Most of those babies were made on New Year's Eve. The calendar remembers what we forget by morning.",
      "revealWrong": "September — not {guessedMonth}. Most of those babies were made on New Year's Eve. The calendar remembers what we forget by morning.",
      "source": "WHO / CDC",
      "branches": {
        "correct": "q_conceptions_01",
        "summer": "q_heat_01",
        "winter": "q_illness_01",
        "autumn": "q_disasters_01",
        "spring": "q_bloom_01"
      }
    }
  ]
}
```

**Dataset shape:** Each month key holds an array of daily values — 28, 29, 30, or 31 floats depending on the month. Values normalized 0–100 for rendering. Raw source values stored in `/src/data/raw/` for reference.

### 6.2 Season mapping utility

```typescript
const SEASON_MAP: Record<string, 'winter' | 'spring' | 'summer' | 'autumn'> = {
  jan: 'winter', feb: 'winter', mar: 'spring',
  apr: 'spring', may: 'spring', jun: 'summer',
  jul: 'summer', aug: 'summer', sep: 'autumn',
  oct: 'autumn', nov: 'autumn', dec: 'winter',
};

const resolveBranch = (
  month: string,
  correctMonth: string,
  branches: Record<string, string>
): string => {
  if (month === correctMonth && branches.correct) return branches.correct;
  return branches[SEASON_MAP[month]];
};
```

### 6.3 Session State (in-memory, React only)

```typescript
type Vibe = 'dark' | 'warm' | 'cosmic' | 'surprise';

type GuessRecord = {
  questionId: string;
  guessedMonth: string;
  correctMonth: string;
  wasCorrect: boolean;
};

type Phase = 'landing' | 'guess' | 'reveal' | 'end';

type SessionState = {
  vibe: Vibe | null;
  currentQuestionId: string | null;
  guessHistory: GuessRecord[];
  phase: Phase;
};
```

### 6.4 Derived end-screen data

```typescript
const monthClickMap = guessHistory.reduce((acc, record) => {
  acc[record.guessedMonth] = (acc[record.guessedMonth] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

const dominantMonth = Object.entries(monthClickMap)
  .sort(([, a], [, b]) => b - a)[0][0];
```

---

## 7. Component Architecture

```
App
├── SessionProvider (React Context — holds SessionState)
│
├── WebGLShader (fixed background, full-screen canvas)
│   └── Props: vibe → adjusts uniforms dynamically
│
├── LandingScreen
│   └── VibeGrid (2×2 button grid)
│       └── VibeButton × 4
│
├── GameScreen
│   ├── ProgressBar (question counter 1/5)
│   ├── QuestionCopy (renders copy with line breaks preserved)
│   ├── HeatmapField (3×4 cluster layout)
│   │   └── MonthCluster × 12
│   │       ├── DayDot × 28–31 (memoized, each with daily value)
│   │       └── MonthLabel
│   └── RevealText (animates in post-reveal, holds for 3.5s then auto-advances)
│
└── EndScreen
    ├── EndHeatmapCard (ref'd for html2canvas capture)
    │   ├── SessionClusterGrid (3×4, frequency-colored)
    │   ├── DominantMonthLabel
    │   └── SiteWatermark
    ├── DownloadButton
    └── PlayAgainButton
```

---

## 8. Heatmap Dot Visual Spec

### Dot states

| State | Appearance |
|---|---|
| `idle` | Near-black fill, 5% opacity vibe color border |
| `hover` (cluster) | All dots in cluster glow at 30% vibe color |
| `guessed` | Full pulse animation, 100% vibe color border |
| `revealed` | Fill mapped from daily value using vibe gradient |

### Color intensity calculation

```typescript
const intensity = (value - minValue) / (maxValue - minValue); // 0.0 → 1.0
const dotColor = interpolateColor(vibeConfig.lowColor, vibeConfig.highColor, intensity);
```

### Dot sizing
- Each dot: 6px × 6px, 2px gap
- Cluster: auto-fit ~7 columns per month
- Month label: 11px centered below cluster, muted

---

## 9. Animation Spec

| Event | Animation |
|---|---|
| Vibe selection → game | Fade + scale, 300ms |
| Guess → reveal | Clicked cluster pulse, glow keyframe 400ms |
| Dots reveal | Staggered fill, ~6ms delay per dot, left to right (~2.2s total sweep) |
| Fact text | Fade in from below, 200ms, after dots finish |
| Auto-advance | Cross-fade to next question, 400ms |
| End screen entry | All clusters pulse simultaneously, 600ms |

All easing: `cubic-bezier(0.4, 0, 0.2, 1)` — liquid, not mechanical.

---

## 10. Shader Integration

Use the provided `WebGLShader` component verbatim from `/components/ui/web-gl-shader.tsx`. Mount as `fixed` full-screen canvas behind all UI (`z-index: 0`, UI at `z-index: 10+`).

Expose uniform updates via `useImperativeHandle` — do NOT remount on vibe change:

```typescript
const VIBE_UNIFORMS = {
  dark:     { xScale: 1.2, yScale: 0.6, distortion: 0.08 },
  warm:     { xScale: 0.8, yScale: 0.3, distortion: 0.02 },
  cosmic:   { xScale: 1.5, yScale: 0.8, distortion: 0.04 },
  surprise: { xScale: 1.0, yScale: 0.5, distortion: 0.05 },
};
```

---

## 11. End Card / Share Spec

Fixed dimensions: `480px × 320px` (landscape, consistent for `html2canvas`)

- Black background, no shader
- 3×4 session cluster grid — frequency-colored (more clicks = more intense)
- Top-left: **"Monthology"** wordmark, small, muted
- Bottom-left: *"Your month: [dominantMonth]"*
- Bottom-right: `monthology.vercel.app`

---

## 12. Questions Data Spec

**Total question nodes required: 11**
- 1 entry (Q1)
- 5 second-layer questions (Q2 branches)
- 4 third-layer questions (Q3 threads)
- 2 fourth-layer questions (Q4 convergence)
- Q5 is hardcoded — trick question, no branch

**All datasets require:**
- 365 daily values (one per calendar day)
- Values normalized 0–100 for rendering
- Raw source documented per question
- Monthly peak clearly identifiable

**Data sources by question:**

| Question | Source |
|---|---|
| Q1 Births | WHO / CDC daily birth estimates |
| Q2-Correct Conceptions | Birth data offset 266 days |
| Q2-Summer Temperature | NOAA global surface temperature |
| Q2-Winter Illness | CDC FluView / WHO |
| Q2-Autumn Natural Disasters | EM-DAT International Disaster Database |
| Q2-Spring Blooming | USA National Phenology Network |
| Q3-Dark Deaths | WHO Global Mortality Database |
| Q3-Heat Migration | eBird / Cornell Lab of Ornithology |
| Q3-Chaos Shark Attacks | Florida Museum of Natural History ISAF |
| Q3-Life Proposals | The Knot Global Wedding Report |
| Q4-Commerce Shopping | Adobe Digital Economy Index / Alibaba |
| Q4-Human Cycles Divorces | University of Washington / CDC |
| Q5 Daylight | Astronomical data |

---

## 13. File Structure

```
/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── web-gl-shader.tsx       ← provided, copy verbatim
│   │   │   └── liquid-glass-button.tsx ← provided, copy verbatim
│   │   ├── LandingScreen.tsx
│   │   ├── GameScreen.tsx
│   │   ├── EndScreen.tsx
│   │   ├── HeatmapField.tsx
│   │   ├── MonthCluster.tsx
│   │   ├── DayDot.tsx
│   │   ├── VibeGrid.tsx
│   │   ├── RevealText.tsx
│   │   ├── EndHeatmapCard.tsx
│   │   └── ProgressBar.tsx
│   ├── context/
│   │   └── SessionContext.tsx
│   ├── data/
│   │   ├── questions.json
│   │   └── raw/
│   ├── types/
│   │   └── index.ts
│   ├── lib/
│   │   ├── utils.ts
│   │   └── season.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── vite.config.ts
```

---

## 14. State & Edge Cases

| Scenario | Behaviour |
|---|---|
| User clicks dot during reveal | Ignore — cluster disabled during reveal |
| Auto-advance timer fires on unmount | Cancel `setTimeout` in `useEffect` cleanup |
| `html2canvas` fails | Toast: *"Screenshot failed — try a manual screenshot"* |
| Branch resolves to missing question ID | Console error + fallback to Q1 entry |
| Q5 trick question — any month clicked | All valid. Reveal fires regardless of guess. |
| WebGL not supported | Fallback: solid `#000000` background, no crash |
| Mobile touch | Full touch support — `onClick` on clusters works natively |
| Wrong reveal copy | `{guessedMonth}` replaced dynamically with actual month name |

---

## 15. Negative Constraints

- Do NOT use any external API — all data hardcoded in `questions.json`
- Do NOT use localStorage or sessionStorage — fully in-memory
- Do NOT add routing — true single-page, single-route app
- Do NOT add a backend — Vercel static deploy only
- Do NOT use Next.js — Vite + React only
- Do NOT auto-advance in under 4 seconds
- Do NOT disable the shader on mobile — optimise but keep running
- Do NOT use generic fonts (Inter, Roboto, Arial)
- Do NOT use heavy per-dot components — keep `DayDot` as a lightweight, `React.memo`'d presentational component for performance
