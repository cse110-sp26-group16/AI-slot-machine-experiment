const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];
const spinButton = document.getElementById('spin-button');
const tokenDisplay = document.getElementById('token-count');
const messageDisplay = document.getElementById('message');

let tokens = 1000;
const costPerSpin = 10;
let isSpinning = false;

// AI-themed symbols and their "weights" / values
const symbols = [
    { emoji: '💩', name: 'Garbage Output', value: 0, weight: 40 },
    { emoji: '📉', name: 'GPU Shortage', value: 0, weight: 30 },
    { emoji: '💸', name: 'API Bill', value: 5, weight: 20 },
    { emoji: '🧠', name: 'Parameters', value: 20, weight: 15 },
    { emoji: '🚀', name: 'Hype', value: 50, weight: 10 },
    { emoji: '🤖', name: 'AGI', value: 200, weight: 2 } // Jackpot
];

// Funny messages based on outcomes
const messages = {
    lose: [
        "Model hallucinated. Try again.",
        "Rate limit exceeded. Tokens consumed.",
        "Your prompt was not optimized. Lost tokens.",
        "GPU out of memory. Request failed.",
        "AI decided your query was irrelevant."
    ],
    smallWin: [
        "Slightly coherent output generated!",
        "API responded successfully.",
        "You optimized your prompt! +Tokens",
        "Found a cached response. Lucky you."
    ],
    bigWin: [
        "Model achieved sentience! Huge payout!",
        "Zero-shot reasoning successful!",
        "Seed investors are impressed!",
        "You cracked the prompt engineering meta!"
    ],
    jackpot: [
        "AGI ACHIEVED! THE SINGULARITY IS HERE!",
        "UNLIMITED COMPUTE UNLOCKED!"
    ],
    bankrupt: [
        "Startup failed. Out of runway.",
        "Your cloud provider terminated your account.",
        "You've been replaced by a shell script."
    ]
};

// Flatten symbols array based on weights for random selection
const weightedSymbols = [];
symbols.forEach(symbol => {
    for (let i = 0; i < symbol.weight; i++) {
        weightedSymbols.push(symbol);
    }
});

function getRandomSymbol() {
    const randomIndex = Math.floor(Math.random() * weightedSymbols.length);
    return weightedSymbols[randomIndex];
}

function updateMessage(text, type) {
    messageDisplay.textContent = text;
    messageDisplay.className = ''; // Reset classes
    if (type) {
        messageDisplay.classList.add(`message-${type}`);
    }
}

function getRandomMessage(category) {
    const msgs = messages[category];
    return msgs[Math.floor(Math.random() * msgs.length)];
}

function spin() {
    if (tokens < costPerSpin) {
        updateMessage(getRandomMessage('bankrupt'), 'lose');
        return;
    }

    if (isSpinning) return;

    // Deduct cost
    tokens -= costPerSpin;
    tokenDisplay.textContent = tokens;
    isSpinning = true;
    spinButton.disabled = true;
    updateMessage("Processing query... Generating...", "");

    // Add spinning animation
    reels.forEach(reel => reel.classList.add('spinning'));

    // Determine results beforehand
    const results = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];

    // Stop reels one by one
    let stoppedReels = 0;
    
    reels.forEach((reel, index) => {
        setTimeout(() => {
            reel.classList.remove('spinning');
            reel.textContent = results[index].emoji;
            stoppedReels++;

            if (stoppedReels === 3) {
                checkWin(results);
            }
        }, 500 + (index * 500)); // Stagger stops: 500ms, 1000ms, 1500ms
    });
}

function checkWin(results) {
    isSpinning = false;
    spinButton.disabled = false;

    const [s1, s2, s3] = results;
    let winAmount = 0;

    // Check for 3 of a kind
    if (s1.emoji === s2.emoji && s2.emoji === s3.emoji) {
        winAmount = s1.value * 10; // Multiplier for 3 of a kind
        
        if (s1.name === 'AGI') {
            updateMessage(getRandomMessage('jackpot'), 'jackpot');
        } else if (winAmount > 0) {
            updateMessage(getRandomMessage('bigWin') + ` (+${winAmount})`, 'win');
        } else {
            // 3 craps
            updateMessage("Consistent garbage output.", 'lose');
        }
    } 
    // Check for 2 of a kind
    else if (s1.emoji === s2.emoji || s2.emoji === s3.emoji || s1.emoji === s3.emoji) {
        // Find the matching symbol
        const match = s1.emoji === s2.emoji ? s1 : (s2.emoji === s3.emoji ? s2 : s1);
        winAmount = match.value * 2; // Multiplier for 2 of a kind

        if (winAmount > 0) {
            updateMessage(getRandomMessage('smallWin') + ` (+${winAmount})`, 'win');
        } else {
            updateMessage(getRandomMessage('lose'), 'lose');
        }
    } 
    // Complete miss
    else {
        updateMessage(getRandomMessage('lose'), 'lose');
    }

    if (winAmount > 0) {
        tokens += winAmount;
        tokenDisplay.textContent = tokens;
    }

    if (tokens < costPerSpin) {
        spinButton.textContent = "OUT OF COMPUTE";
        spinButton.disabled = true;
        setTimeout(() => updateMessage(getRandomMessage('bankrupt'), 'lose'), 1500);
    }
}

spinButton.addEventListener('click', spin);
