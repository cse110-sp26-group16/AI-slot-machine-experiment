const symbols = [
    { emoji: '🧠', name: 'LLM', value: 10, probability: 0.15 },      // Low payout, somewhat common
    { emoji: '🤖', name: 'Agent', value: 20, probability: 0.15 },    // Med payout
    { emoji: '💸', name: 'Tokens', value: 30, probability: 0.15 },   // High payout
    { emoji: '📉', name: 'GPU Shortage', value: 5, probability: 0.25 }, // Very common, low payout
    { emoji: '🚀', name: 'AGI', value: 100, probability: 0.05 },     // Jackpot
    { emoji: '🗑️', name: 'Hallucination', value: 0, probability: 0.25 } // Dud
];

let tokens = 1000;
const betAmount = 10;
let isSpinning = false;

const tokenDisplay = document.getElementById('token-count');
const spinButton = document.getElementById('spin-button');
const messageDisplay = document.getElementById('message');
const reels = [
    document.getElementById('reel-1').querySelector('.symbols'),
    document.getElementById('reel-2').querySelector('.symbols'),
    document.getElementById('reel-3').querySelector('.symbols')
];

function updateTokenDisplay() {
    tokenDisplay.textContent = tokens;
}

function getRandomSymbol() {
    const rand = Math.random();
    let cumulativeProbability = 0;
    for (const symbol of symbols) {
        cumulativeProbability += symbol.probability;
        if (rand <= cumulativeProbability) {
            return symbol;
        }
    }
    return symbols[symbols.length - 1]; // Fallback
}

function spin() {
    if (isSpinning) return;
    
    if (tokens < betAmount) {
        messageDisplay.textContent = "Rate limit exceeded! Out of tokens.";
        messageDisplay.className = 'lose-text';
        return;
    }

    isSpinning = true;
    tokens -= betAmount;
    updateTokenDisplay();
    spinButton.disabled = true;
    messageDisplay.textContent = "Generating response... Please hold...";
    messageDisplay.className = '';

    // Add spinning animation class
    reels.forEach(reel => reel.parentElement.classList.add('spinning'));

    const spinDurations = [1000, 1500, 2000]; // Staggered stop times
    const results = [];

    reels.forEach((reel, index) => {
        setTimeout(() => {
            reel.parentElement.classList.remove('spinning');
            const resultSymbol = getRandomSymbol();
            results.push(resultSymbol);
            reel.textContent = resultSymbol.emoji;

            // If it's the last reel, evaluate results
            if (index === reels.length - 1) {
                evaluateWin(results);
            }
        }, spinDurations[index]);
    });
}

function evaluateWin(results) {
    isSpinning = false;
    spinButton.disabled = false;

    const [s1, s2, s3] = results;

    if (s1.emoji === s2.emoji && s2.emoji === s3.emoji) {
        // 3 of a kind
        if (s1.emoji === '🗑️') {
            messageDisplay.textContent = "Maximum Hallucination! You lose everything (just kidding, but no win).";
            messageDisplay.className = 'lose-text';
        } else if (s1.emoji === '🚀') {
            const winAmount = s1.value * 10;
            tokens += winAmount;
            messageDisplay.textContent = `AGI ACHIEVED! You won ${winAmount} tokens! Now you are obsolete.`;
            messageDisplay.className = 'win-text';
        } else {
            const winAmount = s1.value * 3;
            tokens += winAmount;
            messageDisplay.textContent = `Consistent output! You won ${winAmount} tokens!`;
            messageDisplay.className = 'win-text';
        }
    } else if (s1.emoji === s2.emoji || s2.emoji === s3.emoji || s1.emoji === s3.emoji) {
        // 2 of a kind
        let match = s1.emoji === s2.emoji ? s1 : (s2.emoji === s3.emoji ? s2 : s1);
        if (match.emoji !== '🗑️') {
            const winAmount = match.value;
            tokens += winAmount;
            messageDisplay.textContent = `Partial convergence. You recouped ${winAmount} tokens.`;
            messageDisplay.className = 'win-text';
        } else {
             messageDisplay.textContent = "The model is confused. No tokens for you.";
             messageDisplay.className = 'lose-text';
        }
    } else {
        // No match
        const responses = [
            "Output truncated. Please buy more tokens.",
            "As an AI language model, I took your tokens.",
            "I'm sorry, I cannot fulfill this request (you lost).",
            "GPU cluster overheated. Tokens burned.",
            "Context window exceeded. Try again.",
            "Prompt injection detected. Tokens confiscated."
        ];
        messageDisplay.textContent = responses[Math.floor(Math.random() * responses.length)];
        messageDisplay.className = 'lose-text';
    }
    updateTokenDisplay();
}

// Initial setup
spinButton.addEventListener('click', spin);
// Set initial random symbols
reels.forEach(reel => {
    reel.textContent = getRandomSymbol().emoji;
});
