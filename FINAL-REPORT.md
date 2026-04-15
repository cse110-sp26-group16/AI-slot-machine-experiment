# Final Report -- AI Slot Machine Experiment

## What We Did

We gave Gemini Code Assist the same slot machine prompt 50 times, each in a clean session, and looked at what came back. Then we took the best ones and tried to improve them through 4 rounds of one-shot refinement prompts (max 200 words each, no editing by hand).

**Model:** gemini-3.1-pro-preview via Gemini Code Assist on Google One AI Pro  
**Prompt:** "Create a slot machine app that uses vanilla web technology like HTML, CSS, JavaScript, and platform APIs. The slot machine should make fun of AI, as in you are winning tokens and spending tokens."

## 50 Baseline Runs

Every single run produced a working app. Three files every time -- HTML, CSS, JS. The model never failed to make something that opened in a browser. That part was boring in a good way.

Everything else was a coin flip.

| Metric | Range |
|---|---|
| Lines of code | 260 -- 803 (3x spread) |
| Token usage | 14,500 -- 147,700 (10x spread) |

Some runs gave us a neon cyberpunk casino with sound effects and adjustable bets. Others gave us white backgrounds with emoji in boxes and nothing else. Same prompt both times.

The "AI satire" part was usually weak. Most candidates just put robot emoji on the reels and called it a day. A few actually committed to the bit with fake GPU temperature readouts and VC funding jokes, but those were the exception.

Code quality was consistently mediocre. Lots of copy-paste if/else chains, almost no comments, no separation of concerns. It works, but you wouldn't want to maintain any of it.

Out of 50, maybe 8-10 were worth a second look. The rest were forgettable.

## Refinement Rounds

We picked the best candidates and ran them through 4 rounds of refinement. Each round, we wrote a new prompt (under 200 words), fed it with the code in a fresh session, and took whatever came back without touching it.

| Step | Pool | Kept | What the prompt asked for |
|---|---|---|---|
| 1 to 2 | 50 to 5 | 8, 20, 24, 34, 45 | Casino visuals, animations, sound, bet controls, more AI jokes |
| 2 to 3 | 5 to 3 | 20, 24, 34 | Terminal aesthetic, TOKEN TEMP as real game mechanic, paytable, scaled animations |
| 3 to 4 | 3 to 2 | 24, 34 | Particles, streak counter, layered sound, glitch effects |
| 4 to 5 | 2 to 1 | 34 | Glitch header, glow on land, localStorage streak, ambient hum, boot sequence |

### What got better

Refinement did add real features when it worked. By the end, candidate 034 had particles, a streak counter, sound layering, a fake terminal boot sequence, and a TOKEN TEMP dropdown that actually changed the probability distribution. None of that existed in the baseline.

But most of this was cosmetic. The game logic underneath barely changed across 4 rounds. It's still a random number generator with emoji. The prompts were good at asking for visual polish and bad at improving how the thing actually works.

### What broke

Candidate 024 died in Step 4. The exact same prompt that worked fine on 034 broke 024 completely. The model added a streak counter to the JavaScript but never created the HTML element for it or the variable to reference it. The app loads, the reels are empty, the spin button does nothing.

This was the most useful thing we learned. Refinement can make things worse. A working app became a broken app in one turn, and the model didn't notice or say anything about it.

### Where it stops helping

By Step 5 we were asking for things like ambient hum and glitch animations. The 200-word limit means you can only fit 3-5 requests per prompt. Anything bigger -- responsive layout, accessibility, better architecture -- was never realistic within the constraint. You run out of room to ask for meaningful improvements pretty fast.

## The Final Product

Candidate 034, "Neural Compute Node." Green terminal aesthetic, hacker theme.

**What works:**
- TOKEN TEMP selector that changes actual probability weights, not just a label
- Terminal log with 15+ AI satire messages (some are genuinely funny)
- Particles and screen shake scaled to win size
- Best streak persists in localStorage
- Fake boot sequence when you reset
- Sound effects for everything via Web Audio API
- CRT scanline overlay and glitch text on the header

**What doesn't:**
- The symbols are still just emoji in boxes. It looks like a slot machine the way a terminal looks like a computer -- thematically, not literally.
- You can type any number into the bet field. No validation against your balance.
- The ambient hum oscillator runs forever once started. Never gets cleaned up.
- CSS uses the deprecated `clip` property for the glitch animation instead of `clip-path`
- There's a `@font-face` declaration for "Terminus" that doesn't load any font. It just falls back to Courier New.
- Best-streak update logic is copy-pasted in two places instead of being one function
- Zero accessibility. No ARIA labels, keyboard nav is poor.
- Not responsive. Breaks on mobile.

### Growth across refinements

| Step | Lines of code | Tokens used | Worked? |
|---|---|---|---|
| Baseline | 528 | 67,052 | Yes |
| Refinement 1 | ~600 | -- | Yes |
| Refinement 2 | ~1,109 | -- | Yes |
| Refinement 3 | 1,109 | 284,375 | Yes |
| Refinement 4 | 1,296 | 91,712 | Yes |

034 survived all 4 refinement rounds. But so did 024 until round 3, so survival isn't something you can count on.

## Gemini as a Tool

| | |
|---|---|
| Wall-clock time per run | 8--50 minutes |
| API error rate | 53--69% of requests failed and retried |
| Active time vs wall time | Often under half |

More than half the API requests failed. A refinement that should take a few minutes regularly took 20-50 minutes because of retries. One session hit 50 minutes of wall time for 8 minutes of actual work.

## What We Learned

**How consistent is the output?** Structurally, very. You always get a working HTML/CSS/JS app. Quality-wise, not at all. Lines of code varied 3x, token cost varied 10x, and the difference between the best and worst run was enormous. You can't trust a single run.

**What does drift look like?** Not broken code. Just a wide spread. Most runs land somewhere in the middle -- functional, boring, forgettable. The interesting ones are at the tails. You have to generate a bunch and pick.

**What does refinement buy you?** 2-4 features per turn, mostly visual. It can also break what you already have. One of our two finalists was killed by a refinement prompt. It's additive on average, but not on any given attempt.

**Where does prompting hit a wall?** Fast. By round 4 we were out of meaningful things to ask for within 200 words. The tool is good at adding surface polish. It does not improve code quality, architecture, accessibility, or error handling unless you specifically ask, and even then results are hit-or-miss.

**Bottom line:** These tools replace the blank page. They don't replace the person who has to read what came out and decide if it's any good.
