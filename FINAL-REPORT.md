# Final Report — AI Slot Machine Experiment

## Experiment Overview

We used Gemini Code Assist (gemini-3.1-pro-preview) to generate a slot machine web app 50 times from an identical prompt, then refined the best candidates through 4 rounds of structured single-turn prompting. The goal was to measure variation, drift, and what constrained refinement actually buys.

**Model:** gemini-3.1-pro-preview (via Gemini Code Assist, Google One AI Pro tier)

**Prompt:** "Create a slot machine app that uses vanilla web technology like HTML, CSS, JavaScript, and platform APIs. The slot machine should make fun of AI, as in you are winning tokens and spending tokens."

## Phase 1 — Baseline (50 Runs)

### Consistency

All 50 candidates ran in the browser. Every run produced a 3-file structure (HTML, CSS, JS). The model never failed to produce a runnable app — but "runnable" is a low bar.

### Variation

Despite identical prompts, output varied significantly:

| Metric | Range |
|---|---|
| Lines of code | ~260 – 803 (3x spread) |
| Total tokens | ~14,500 – 147,700 (10x spread) |
| Themes/names | Token Burner, Hallucination Engine, Neural Slots, Token Grinder, etc. |

- **Visual style** ranged from unstyled white pages to neon cyberpunk terminals. Many looked generic and "AI-generated."
- **AI satire** was often shallow — most candidates just slapped AI-themed emoji labels on a standard slot machine. Only a handful had genuinely clever satire (fake GPU readouts, VC funding jokes, hallucination mechanics).
- **Feature completeness** was inconsistent — some had adjustable bets and sound, others were bare-minimum spinners with hardcoded values.
- **Code quality** was mediocre across the board. Most candidates had minimal or no comments, repetitive if/else chains, and no separation of concerns. The code works, but none of it would pass a serious code review.

### Key Observation

The model is reliable at producing *something that works*. It is unreliable at producing *something good*. Out of 50 runs, maybe 8-10 were worth keeping. The rest were functional but forgettable. You cannot ship a single run with confidence.

## Phase 2 — Refinement Rounds

### Selection Funnel

| Step | Candidates | Selected | Prompt Focus |
|---|---|---|---|
| Step 1 → 2 | 50 → 5 | 8, 20, 24, 34, 45 | Casino visuals, animations, sound, bet adjustment, AI jokes |
| Step 2 → 3 | 5 → 3 | 20, 24, 34 | Terminal aesthetic, TOKEN TEMP variance, paytable, scaled animations |
| Step 3 → 4 | 3 → 2 | 24, 34 | Polish, particles, streak counter, more AI jokes, layered sound |
| Step 4 → 5 | 2 → 1 | 34 | Glitch header, glow pulse, localStorage streak, ambient hum, boot sequence |

### What Refinement Improved

Each round added features when it worked:
- Step 2 added casino mechanics: adjustable bets, sound effects, win/loss animations, paytable
- Step 3 added cohesion: consistent terminal aesthetic, TOKEN TEMP controlling actual game variance
- Step 4 added particles, streak counter, more varied AI satire messages, glitch/static effects
- Step 5 added final polish: glitch header animation, glow pulse on landing, localStorage persistence, ambient hum, fake boot sequence

However, much of this is surface-level. The underlying game logic barely changed across refinements — it's still a random number generator with emoji. The refinement prompts could add visual polish but couldn't fundamentally improve the game design within the 200-word constraint.

### What Refinement Broke

**Candidate 024 broke in Step 4.** The same prompt that successfully refined 034 caused 024 to:
- Reference a `streakDisplay` variable that was never declared or added to HTML
- Output duplicate code at the end of the file
- Render an empty UI where the spin button does nothing

This is the most critical finding: **refinement is not safe.** A fully working app became non-functional in one turn. The model added streak tracking logic to the JS but forgot to create the HTML element or DOM query for it. This is a classic AI coding failure — partial implementation that silently breaks.

### Refinement Ceiling

By Step 5, prompts were focused on micro-polish (glitch animations, ambient hum, localStorage). The 200-word constraint limits each round to 3-5 items. Anything architectural — better game design, responsive layout, accessibility, proper error handling — was never feasible. The tool is good at adding decorative features, not at improving software quality.

## Final Candidate — Candidate 034

**"Neural Compute Node"** — a green terminal/hacker-themed AI slot machine.

### What Works
- Cohesive terminal aesthetic maintained across all refinements
- TOKEN TEMP selector that actually controls probability distributions (not just cosmetic)
- Good variety of AI satire messages in the terminal log
- Particle system, glitch effects, and sound create a polished feel
- BEST STREAK via localStorage is a nice touch

### What Doesn't Work Well
- Still fundamentally emoji in boxes — the "slot machine" feel is limited by using text characters as symbols
- No bet validation against balance (you can type any number)
- The ambient hum oscillator is never cleaned up — runs indefinitely
- CSS uses deprecated `clip` property instead of `clip-path`
- The `@font-face` for 'Terminus' doesn't load anything — just falls back to Courier New
- Duplicate best-streak update logic in two code paths instead of a shared function
- No accessibility considerations whatsoever (no ARIA labels, keyboard navigation is poor)
- Not responsive — breaks on mobile viewports

### Code Stats Across Refinements

| Step | LOC | Tokens Used | Working? |
|---|---|---|---|
| Step 1 (baseline) | 528 | 67,052 | Yes |
| Step 2 (refinement 1) | ~600 | — | Yes |
| Step 3 (refinement 2) | ~1109 | — | Yes |
| Step 4 (refinement 3) | 1109 | 284,375 | Yes |
| Step 5 (refinement 4) | 1296 | 91,712 | Yes |

034 survived all 4 refinement rounds without breaking — but that's a sample size of one. We cannot conclude it's inherently more robust; 024 broke from the same prompt.

## Performance Observations (Gemini)

| Metric | Observation |
|---|---|
| Wall-clock time | 8–50 minutes per refinement run |
| API error rate | 53–69% of requests were errors/retries |
| Agent active vs wall time | Often less than half (significant idle/retry time) |
| Output quality | Functional when it succeeds, but fragile under refinement |

The model's reliability was poor. Over half of API requests failed and had to be retried internally. A refinement that should take minutes routinely took 20–50 minutes. This is not a tool you'd use under time pressure with confidence.

## Conclusions

### How consistent is the output from identical inputs?
Structurally consistent (always valid HTML/CSS/JS), creatively inconsistent. LOC ranged 3x, token usage ranged 10x, and quality ranged from "barely acceptable" to "genuinely impressive." You cannot predict what you'll get from any single run.

### What does drift look like in practice?
Not outright failures — but a wide quality bell curve where most output clusters around "mediocre." The tail ends (both good and bad) are where interesting things happen. Drift manifests as feature presence/absence, visual polish, and satire depth — not as structural divergence.

### What does a single refinement turn realistically improve?
It can add 2-4 concrete features per turn. But it can also break existing functionality with no warning. Refinement is additive *on average* but not *guaranteed* to be. One of our two finalists broke from a single refinement pass.

### Where does simple prompting hit a ceiling?
Immediately, if you care about code quality. The generated code consistently lacks error handling, accessibility, responsive design, and clean architecture. Refinement prompts can add features and visual polish, but they don't improve the underlying code quality. By Step 4-5, you're decorating a house built on a slab — the foundation isn't going to get better.

### How would you talk about these tools honestly?
They're useful for generating a starting point quickly — you get a working prototype in seconds. But the output requires significant human judgment to evaluate and is not production-ready by any standard. You need multiple runs to find a good one, careful evaluation to pick winners, and acceptance that refinement might break what you have. These tools do not replace engineering skill; they replace the blank page.
