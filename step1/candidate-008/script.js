const symbols = [
    { emoji: '🤖', name: 'Bot', value: 10 },
    { emoji: '🧠', name: 'Brain', value: 20 },
    { emoji: '🖥️', name: 'GPU', value: 50 },
    { emoji: '📈', name: 'Stonks', value: 100 },
    { emoji: '🗑️', name: 'Trash', value: 2 },  // Hallucination
    { emoji: '✨', name: 'Magic', value: 500 } // AGI
];

const SPIN_COST = 100;
let balance = 10000;
let isSpinning = false;

const balanceEl = document.getElementById('token-balance');
const spinBtn = document.getElementById('spin-button');
const messageBoard = document.getElementById('message-board');
const reels = [
    document.getElementById('reel-1'),
    document.getElementById('reel-2'),
    document.getElementById('reel-3')
];

// Funny messages for different outcomes
const loseMessages = [
    "Model hallucinated. Tokens burned.",
    "CUDA Out of Memory. Try again.",
    "Your prompt was filtered by safety guidelines.",
    "API Rate Limit Exceeded. You lose.",
    "Spent 100 tokens to generate 'Hello World'.",
    "Overfit! All parameters reduced to noise."
];

const winMessages = [
    "Zero-shot success! Have some tokens.",
    "GPU goes brrrrr! Big payout!",
    "Context window expanded!",
    "Weights optimized perfectly."
];

const jackpotMessages = [
    "AGI ACHIEVED! (Temporarily) 💰💰💰",
    "SINGULARITY REACHED! YOU OWN ALL THE COMPUTE!"
];

function updateBalanceDisplay() {
    balanceEl.textContent = balance.toLocaleString();
    if (balance < SPIN_COST) {
        spinBtn.disabled = true;
        spinBtn.textContent = "Out of Compute";
        showMessage("You need more funding for your startup.", "lose-text");
    }
}

function getRandomSymbol() {
    // Slight weighting to make trash/bots more common
    const rand = Math.random();
    if (rand < 0.3) return symbols[0]; // Bot
    if (rand < 0.6) return symbols[4]; // Trash
    if (rand < 0.8) return symbols[1]; // Brain
    if (rand < 0.9) return symbols[2]; // GPU
    if (rand < 0.98) return symbols[3]; // Stonks
    return symbols[5]; // Magic (Rare)
}

function showMessage(text, className) {
    messageBoard.textContent = text;
    messageBoard.className = `message-board ${className}`;
}

async function spin() {
    if (isSpinning || balance < SPIN_COST) return;

    isSpinning = true;
    balance -= SPIN_COST;
    updateBalanceDisplay();
    spinBtn.disabled = true;
    showMessage("Training model... (Spinning)", "neutral-text");

    // Add spinning animation
    reels.forEach(reel => reel.classList.add('spinning'));

    // Simulate spin duration
    const spinDuration = 2000; // 2 seconds
    const interval = 100; // change symbol every 100ms
    
    let spinInterval = setInterval(() => {
        reels.forEach(reel => {
            reel.textContent = symbols[Math.floor(Math.random() * symbols.length)].emoji;
        });
    }, interval);

    // Stop spinning after duration
    await new Promise(resolve => setTimeout(resolve, spinDuration));
    
    clearInterval(spinInterval);
    reels.forEach(reel => reel.classList.remove('spinning'));

    // Determine final result
    const finalSymbols = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
    
    reels.forEach((reel, index) => {
        reel.textContent = finalSymbols[index].emoji;
    });

    evaluateResult(finalSymbols);
    
    isSpinning = false;
    if (balance >= SPIN_COST) {
        spinBtn.disabled = false;
    }
}

function evaluateResult(resultSymbols) {
    const s1 = resultSymbols[0];
    const s2 = resultSymbols[1];
    const s3 = resultSymbols[2];

    let winnings = 0;

    // Check for wins
    if (s1.emoji === s2.emoji && s2.emoji === s3.emoji) {
        // 3 of a kind
        winnings = s1.value * 20; // Big multiplier
        if (s1.emoji === '✨') {
             showMessage(jackpotMessages[Math.floor(Math.random() * jackpotMessages.length)], "win-text");
        } else {
             showMessage(`3 ${s1.name}s! ${winMessages[Math.floor(Math.random() * winMessages.length)]} +${winnings} tokens`, "win-text");
        }
    } else if (s1.emoji === s2.emoji || s2.emoji === s3.emoji || s1.emoji === s3.emoji) {
        // 2 of a kind
        const matchedSymbol = s1.emoji === s2.emoji ? s1 : s3;
        winnings = matchedSymbol.value * 2;
        showMessage(`Minor optimization. +${winnings} tokens.`, "neutral-text");
    } else {
        // Lose
        showMessage(loseMessages[Math.floor(Math.random() * loseMessages.length)], "lose-text");
    }

    if (winnings > 0) {
        balance += winnings;
        updateBalanceDisplay();
    }
}

// Event Listeners
spinBtn.addEventListener('click', spin);

// Initial setup
updateBalanceDisplay();
