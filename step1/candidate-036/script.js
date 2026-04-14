const SYMBOLS = [
    { emoji: '🤖', weight: 1, name: 'AGI', multiplier: 50 },
    { emoji: '🧠', weight: 3, name: 'Big Brain', multiplier: 20 },
    { emoji: '⚡', weight: 5, name: 'H100 GPU', multiplier: 10 },
    { emoji: '📄', weight: 8, name: 'Training Data', multiplier: 5 },
    { emoji: '🗑️', weight: 10, name: 'Garbage Collection', multiplier: 2 },
    { emoji: '💀', weight: 5, name: 'Hallucination', multiplier: -1 } // Penalty!
];

// Create a flat array based on weights for easy random selection
const REEL_STRIP = [];
SYMBOLS.forEach(symbol => {
    for (let i = 0; i < symbol.weight; i++) {
        REEL_STRIP.push(symbol);
    }
});

let tokens = 10000;
let isSpinning = false;

const tokenDisplay = document.getElementById('token-count');
const spinButton = document.getElementById('spin-button');
const betInput = document.getElementById('bet-input');
const messageDisplay = document.getElementById('message');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];

function updateTokens(amount) {
    tokens += amount;
    tokenDisplay.textContent = Math.max(0, tokens);
    
    // Add a little animation class
    tokenDisplay.style.transform = amount > 0 ? 'scale(1.2)' : 'scale(0.8)';
    tokenDisplay.style.color = amount > 0 ? 'var(--win-color)' : 'var(--lose-color)';
    
    setTimeout(() => {
        tokenDisplay.style.transform = 'scale(1)';
        tokenDisplay.style.color = 'var(--accent-glow)';
    }, 300);
}

function getRandomSymbol() {
    const randomIndex = Math.floor(Math.random() * REEL_STRIP.length);
    return REEL_STRIP[randomIndex];
}

function showMessage(text, type = 'normal') {
    messageDisplay.textContent = text;
    messageDisplay.className = '';
    if (type !== 'normal') {
        messageDisplay.classList.add(type);
    }
}

async function spin() {
    if (isSpinning) return;
    
    const bet = parseInt(betInput.value);
    
    if (isNaN(bet) || bet <= 0) {
        showMessage("Invalid prompt parameters (bet amount).", "error");
        return;
    }
    
    if (bet > tokens) {
        showMessage("Insufficient context window (tokens). Buy more compute!", "error");
        return;
    }

    isSpinning = true;
    spinButton.disabled = true;
    updateTokens(-bet); // Deduct bet immediately
    showMessage("Generating inference...", "normal");

    // Add spinning class for CSS animation
    reels.forEach(reel => reel.classList.add('spinning'));

    // Determine final symbols
    const results = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];

    // Simulate stopping one by one
    for (let i = 0; i < reels.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500 + (i * 300)));
        reels[i].classList.remove('spinning');
        reels[i].querySelector('.symbol').textContent = results[i].emoji;
    }

    evaluateWin(results, bet);

    isSpinning = false;
    spinButton.disabled = false;
    
    if (tokens <= 0) {
        showMessage("GPU Cluster Burned Down. Game Over.", "lose");
        spinButton.disabled = true;
    }
}

function evaluateWin(results, bet) {
    const [s1, s2, s3] = results;

    // Check for 3 of a kind
    if (s1.emoji === s2.emoji && s2.emoji === s3.emoji) {
        if (s1.emoji === '💀') {
            // Massive hallucination penalty
            const penalty = bet * 2;
            updateTokens(-penalty);
            showMessage(`Massive Hallucination! Lost ${penalty} tokens. AI went rogue.`, 'lose');
        } else {
            const winAmount = bet * s1.multiplier;
            updateTokens(winAmount);
            showMessage(`${s1.name} Match! Inference successful. +${winAmount} tokens!`, 'win');
        }
    } else {
        // Did we get any hallucinations?
        const hallucinations = results.filter(r => r.emoji === '💀').length;
        if (hallucinations > 0) {
             showMessage(`Model hallucinated. Output unusable.`, 'lose');
        } else {
             showMessage(`Output collapsed. Try tweaking the temperature (spin again).`, 'normal');
        }
    }
}

spinButton.addEventListener('click', spin);

// Allow pressing Enter in the input to spin
betInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        spin();
    }
});
