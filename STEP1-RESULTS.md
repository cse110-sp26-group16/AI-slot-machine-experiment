# Step 1 Results — Baseline Analysis (50 Runs)

## Overview

We ran the original prompt 50 times in clean sessions and evaluated each candidate against our [rubric](RUBRIC.md).

All 50 candidates ran successfully in the browser. Key variation across runs included visual design, AI satire creativity, animation quality, feature completeness, and code organization.

## Top 5 Candidates Selected

### 1. Candidate-018 — "The Hallucination Engine"
<!-- TODO: Team — fill in your reasoning. Here's a starting point: -->
- Most polished thematic design with live GPU temp and VRAM readouts
- Scrolling system logs add immersion
- Weighted probabilities and staggered animations
- Strong AI satire integration throughout

### 2. Candidate-020 — "The Token Grinder"
<!-- TODO: Team — fill in your reasoning -->
- Strongest visual polish with neon cyberpunk aesthetic
- Only candidate with Web Audio API sound effects
- Screen shake and flash animations for wins/losses
- Tagline "COMPUTE OR BE COMPUTED"

### 3. Candidate-015 — "The Token Guzzler"
<!-- TODO: Team — fill in your reasoning -->
- Most feature-complete (adjustable bet, sound, glitch text)
- Smoothest reel animation of all candidates
- Highest LOC (803) reflecting depth of implementation

### 4. Candidate-048 — "LLM Token Casino"
<!-- TODO: Team — fill in your reasoning -->
- Best conciseness-to-quality ratio at only 388 LOC
- Terminal/hacker aesthetic is well-executed
- "SYSTEM CRASH" lose-all mechanic adds gameplay tension

### 5. Candidate-031 — "NEURAL_SLOTS_v1.0"
<!-- TODO: Team — fill in your reasoning -->
- CRT overlay effect gives unique retro terminal feel
- Very smooth animations, visually pleasing color scheme
- Clean code with good comments and proper indentation

## Selection Criteria

<!-- TODO: Team — describe how you weighted the rubric categories to make your picks -->
- Prompt accuracy (all passed)
- Visual appeal and polish
- AI satire creativity and integration
- Code readability and organization
- Feature completeness and gameplay depth
- Absence of bugs

## Notable Observations from 50 Runs

<!-- TODO: Team — fill in observations about variation/drift across all runs -->
- **Variation in naming/theme**: Candidates showed a range of creative titles (Hallucination Engine, Token Grinder, Token Guzzler, etc.)
- **Structural consistency**: Nearly all produced a 3-file structure (HTML, CSS, JS)
- **Feature drift**: Some candidates included sound, adjustable bets, or special mechanics while others stayed minimal
- **LOC range**: From ~260 to ~803 lines, showing significant output length variation
- **AI satire approaches**: Ranged from surface-level emoji use to deep thematic integration with fake GPU stats and hallucination mechanics
