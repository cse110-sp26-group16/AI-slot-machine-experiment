const tokensDisplay = document.getElementById('token-count');
const contextWindowDisplay = document.getElementById('context-window');
const spinBtn = document.getElementById('spin-btn');
const messageDisplay = document.getElementById('message');
const reels = [
    document.getElementById('reel1').querySelector('.reel-content'),
    document.getElementById('reel2').querySelector('.reel-content'),
    document.getElementById('reel3').querySelector('.reel-content')
];

let tokens = 1000;
const SPIN_COST = 50;
let isSpinning = false;
let contextUsed = 0;

// The AI-themed symbols
const symbols = [
    { char: '🧠', name: 'AGI Breakthrough', value: 500, prob: 0.05 }, // Rare jackpot
    { char: '💡', name: 'Perfect Code', value: 200, prob: 0.15 },     // Great output
    { char: '💾', name: 'Training Data', value: 100, prob: 0.20 },    // Good output
    { char: '🗑️', name: 'Garbage Output', value: 10, prob: 0.20 },    // Low value
    { char: '💸', name: 'API Billing', value: 0, prob: 0.20 },        // Penalty
    { char: '🍄', name: 'Hallucination', value: 0, prob: 0.20 }       // Major Penalty
];

const symbolChars = symbols.map(s => s.char);

function getRandomSymbol() {
    const rand = Math.random();
    let cumulative = 0;
    for (let s of symbols) {
        cumulative += s.prob;
        if (rand <= cumulative) {
            return s;
        }
    }
    return symbols[symbols.length - 1]; // Fallback
}

function updateUI() {
    tokensDisplay.textContent = tokens;
    contextWindowDisplay.textContent = `${contextUsed}%`;
    if (contextUsed >= 80) {
        contextWindowDisplay.style.color = 'var(--neon-red)';
    } else {
        contextWindowDisplay.style.color = 'inherit';
    }
}

function spinReel(reelElement, duration) {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            reelElement.textContent = symbolChars[Math.floor(Math.random() * symbolChars.length)];
        }, 50);

        reelElement.parentElement.classList.add('spinning');

        setTimeout(() => {
            clearInterval(interval);
            const finalSymbol = getRandomSymbol();
            reelElement.textContent = finalSymbol.char;
            reelElement.parentElement.classList.remove('spinning');
            resolve(finalSymbol);
        }, duration);
    });
}

function evaluateResult(results) {
    messageDisplay.className = '';
    
    // Check for 3 of a kind
    if (results[0].char === results[1].char && results[1].char === results[2].char) {
        const symbol = results[0];
        
        if (symbol.char === '🍄') {
            const lost = 200;
            tokens -= lost;
            messageDisplay.textContent = `Major Hallucination! The AI confidently lied. Lost ${lost} tokens!`;
            messageDisplay.classList.add('lose');
            contextUsed += 30;
        } else if (symbol.char === '💸') {
             const lost = 300;
             tokens -= lost;
             messageDisplay.textContent = `API limits exceeded! You accidentally ran an infinite loop. Lost ${lost} tokens!`;
             messageDisplay.classList.add('lose');
             contextUsed = 0; // Instance crashed and restarted
        }
        else {
            const won = symbol.value * 10;
            tokens += won;
            messageDisplay.textContent = `JACKPOT! 3x ${symbol.name}! The prompt was perfect. Won ${won} tokens!`;
            messageDisplay.classList.add('win');
            contextUsed = 0; // Perfect output clears context as it solved the problem
        }
    } else if (results[0].char === results[1].char || results[1].char === results[2].char || results[0].char === results[2].char) {
         // Two of a kind
         const matchedSymbol = results[0].char === results[1].char ? results[0] : results[2];
         if (matchedSymbol.char === '🍄' || matchedSymbol.char === '💸') {
             messageDisplay.textContent = `Confusing output... The AI almost understood you.`;
             contextUsed += 15;
         } else {
             const won = matchedSymbol.value;
             tokens += won;
             messageDisplay.textContent = `Partial match! 2x ${matchedSymbol.name}. Recovered ${won} tokens.`;
             messageDisplay.classList.add('win');
             contextUsed += 10;
         }
    } else {
        // No match
        if (results.some(s => s.char === '🍄')) {
             messageDisplay.textContent = `The response contains mild hallucinations. Please verify facts.`;
             messageDisplay.classList.add('lose');
             contextUsed += 20;
        } else {
             messageDisplay.textContent = `Output generated, but it completely ignored your system prompt.`;
             contextUsed += 15;
        }
    }

    // Context window mechanic
    if (contextUsed >= 100) {
        messageDisplay.textContent = `Context Limit Exceeded! Forcing memory flush... Cost: 150 tokens.`;
        messageDisplay.classList.add('lose');
        tokens -= 150;
        contextUsed = 0;
    }

    // Token limit checks
    if (tokens < 0) {
        tokens = 0;
    }

    if (tokens < SPIN_COST) {
        spinBtn.disabled = true;
        spinBtn.textContent = "Insufficient Tokens (Buy More API Credits)";
        messageDisplay.textContent = "You are out of tokens! The AI refuses to speak to you.";
        messageDisplay.classList.add('lose');
    }

    updateUI();
}

spinBtn.addEventListener('click', async () => {
    if (isSpinning || tokens < SPIN_COST) return;

    isSpinning = true;
    spinBtn.disabled = true;
    tokens -= SPIN_COST;
    updateUI();
    messageDisplay.textContent = "Generating response... (Thinking)";
    messageDisplay.className = '';

    // Spin reels with staggered durations
    const spinPromises = [
        spinReel(reels[0], 1000),
        spinReel(reels[1], 1500),
        spinReel(reels[2], 2000)
    ];

    const results = await Promise.all(spinPromises);
    
    evaluateResult(results);
    
    isSpinning = false;
    if (tokens >= SPIN_COST) {
        spinBtn.disabled = false;
    }
});

// Initial UI setup
updateUI();
