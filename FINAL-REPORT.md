# Final Report — AI Slot Machine Experiment

## Experiment Overview

We used Gemini Code Assist (gemini-3.1-pro-preview) to generate a slot machine web app 50 times from an identical prompt, then refined the best candidates through 4 rounds of structured single-turn prompting. The goal was to measure variation, drift, and what constrained refinement actually buys.

**Model:** gemini-3.1-pro-preview (via Gemini Code Assist, Google One AI Pro tier)

**Prompt:** "Create a slot machine app that uses vanilla web technology like HTML, CSS, JavaScript, and platform APIs. The slot machine should make fun of AI, as in you are winning tokens and spending tokens."

## Phase 1 — Baseline (50 Runs)

### Consistency

All 50 candidates ran in the browser. Every run produced a 3-file structure (HTML, CSS, JS). This was the most consistent aspect — the model reliably understood the assignment.

### Variation

Despite identical prompts, output varied significantly:

| Metric | Range |
|---|---|
| Lines of code | ~260 – 803 |
| Total tokens | ~14,500 – 147,700 |
| Themes/names | Token Burner, Hallucination Engine, Neural Slots, Token Grinder, etc. |

- **Visual style** ranged from minimal white layouts to neon cyberpunk terminals
- **AI satire depth** ranged from surface-level emoji labels to fake GPU readouts and VC funding jokes
- **Feature completeness** varied — some had adjustable bets and sound, others were bare-bones spinners
- **Animation quality** was the biggest differentiator between "fine" and "impressive"

### Key Observation

The model was consistent at the structural level (always produces working vanilla web code) but highly variable at the creative level (naming, theming, features, visual polish). This is drift in practice — not broken outputs, but a wide quality spread from identical inputs.

## Phase 2 — Refinement Rounds

### Selection Funnel

| Step | Candidates | Selected | Prompt Focus |
|---|---|---|---|
| Step 1 → 2 | 50 → 5 | 8, 20, 24, 34, 45 | Casino visuals, animations, sound, bet adjustment, AI jokes |
| Step 2 → 3 | 5 → 3 | 20, 24, 34 | Terminal aesthetic, TOKEN TEMP variance, paytable, scaled animations |
| Step 3 → 4 | 3 → 2 | 24, 34 | Polish, particles, streak counter, more AI jokes, layered sound |
| Step 4 → 5 | 2 → 1 | 34 | Glitch header, glow pulse, localStorage streak, ambient hum, boot sequence |

### What Refinement Improved

Each round genuinely added features and polish when it worked:
- Step 2 added casino mechanics: adjustable bets, sound effects, win/loss animations, paytable
- Step 3 added cohesion: consistent terminal aesthetic, TOKEN TEMP controlling actual game variance
- Step 4 added particles, streak counter, more varied AI satire messages, glitch/static effects
- Step 5 added final polish: glitch header animation, glow pulse on landing, localStorage persistence, ambient hum, fake boot sequence

### What Refinement Broke

**Candidate 024 broke in Step 4.** The same prompt that successfully refined 034 caused 024 to:
- Reference a `streakDisplay` variable that was never declared
- Output duplicate code at the end of the file
- Render an empty UI with non-functional spin button

This was the single most important finding: **refinement can cause regression.** A working app became non-functional in one turn. The model added streak logic to the JS but forgot to add the HTML element or DOM query for it.

### Refinement Ceiling

By Step 5, the prompt was focused on micro-polish (glitch animations, ambient hum, localStorage). The 200-word constraint means each round can only address a handful of issues. Major architectural changes (e.g., switching from emoji to custom graphics) were never feasible within the constraint.

## Final Candidate — Candidate 034

**"Neural Compute Node"** — a green terminal/hacker-themed AI slot machine.

### Features
- 3 reels with weighted probability distributions
- TOKEN TEMP selector controlling actual risk/reward variance
- Adjustable bet amount with +/- controls
- Paytable modal showing multipliers and temp risk descriptions
- Streak counter with BEST STREAK persisting via localStorage
- GPU temperature fluctuating dynamically during spins
- Terminal log with 15+ unique AI satire messages
- Particle bursts on wins, scaled to win size
- Glitch/static overlay on losses
- White screen flash before jackpot particles
- Fake boot sequence on system reboot
- Web Audio API sound effects (spin ticking, reel stop thud, win fanfare, loss wah-wah, ambient hum)
- CRT scanline overlay and active glitch text animation

### Code Stats Across Refinements

| Step | LOC | Tokens Used | Working? |
|---|---|---|---|
| Step 1 (baseline) | 528 | 67,052 | Yes |
| Step 2 (refinement 1) | ~600 | — | Yes |
| Step 3 (refinement 2) | ~1109 | — | Yes |
| Step 4 (refinement 3) | 1109 | 284,375 | Yes |
| Step 5 (refinement 4) | 1296 | 91,712 | Yes |

034 survived all 4 refinement rounds without breaking — the only candidate to do so in the final stages.

## Performance Observations (Gemini)

| Metric | Observation |
|---|---|
| Wall-clock time | 8–50 minutes per refinement run |
| API error rate | 53–69% of requests were errors/retries |
| Agent active vs wall time | Often less than half (significant idle/retry time) |
| Output quality | Generally good when it succeeds, but fragile — 024 broke from a valid prompt |

The high error rate and long wall times are notable. The model frequently retried internally, and sessions that should take minutes often took 20–50 minutes.

## Conclusions

### How consistent is the output from identical inputs?
Structurally consistent (always valid HTML/CSS/JS, always a slot machine), but creatively variable. LOC ranged 3x, themes were unique across runs, feature sets varied significantly. You cannot predict what you'll get.

### What does drift look like in practice?
Not broken outputs — but a wide quality bell curve. Some runs produced polished, feature-rich apps. Others produced bare-minimum spinners. Same prompt, same model, wildly different results.

### What does a single refinement turn realistically improve?
It can add 2-4 concrete features or polish items per turn within the 200-word constraint. But it can also break things. Refinement is not guaranteed to be additive.

### Where does simple prompting hit a ceiling?
Around Step 4-5. By then, prompts are asking for micro-polish (animation easing, localStorage, ambient audio) rather than meaningful feature additions. The 200-word constraint limits scope, and the model's context about the existing codebase becomes the bottleneck.

### How would you talk about these tools honestly?
They're excellent for rapid prototyping — you can get a working, themed web app in under a minute. But the output is a lottery. You'll need to generate multiple candidates and evaluate them, not trust a single run. Refinement helps but carries real risk of regression. For production work, human review and editing remain essential.
