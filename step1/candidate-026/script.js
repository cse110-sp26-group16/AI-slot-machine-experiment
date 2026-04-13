const symbols = ['🤖', '🧠', '💸', '📉', '♻️', '⚡️', '🪐'];
const symbolWeights = [10, 10, 10, 10, 10, 10, 10]; // Equal probability for now

let tokens = 1000000;
const SPIN_COST = 10000;

const reels = [
    document.getElementById('reel-1').querySelector('.reel-strip'),
    document.getElementById('reel-2').querySelector('.reel-strip'),
    document.getElementById('reel-3').querySelector('.reel-strip')
];

const spinButton = document.getElementById('spin-button');
const tokenDisplay = document.getElementById('token-balance');
const statusMessage = document.getElementById('status-message');

const AI_STATUS_MESSAGES = [
    "Hallucinating a jackpot...",
    "Optimizing neural weights...",
    "Scraping the entire internet...",
    "Waiting for GPU quota...",
    "Finetuning your luck...",
    "Aligning with user intent...",
    "Prompt engineering the outcome...",
    "Synthesizing results...",
    "Quantizing the reels..."
];

const WIN_MESSAGES = [
    "AGI Achieved! Huge payout!",
    "Viral Growth! Tokens incoming.",
    "Seed Funding Secured!",
    "Model actually worked!",
    "Your startup was acquired!"
];

const LOSE_MESSAGES = [
    "Model Collapsed. Try again.",
    "Hallucination detected. No win.",
    "GPU Out of Memory. Spin again.",
    "Bias detected. Outcome nullified.",
    "Overselling your capabilities...",
    "Your VC pulled the funding."
];

function updateUI() {
    tokenDisplay.textContent = tokens.toLocaleString();
    if (tokens < SPIN_COST) {
        spinButton.disabled = true;
        spinButton.textContent = "Insufficient Tokens (Bankrupt)";
        statusMessage.textContent = "Series D failed. Company liquidated.";
    }
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

async function spin() {
    if (tokens < SPIN_COST) return;

    // Reset state
    tokens -= SPIN_COST;
    updateUI();
    spinButton.disabled = true;
    statusMessage.textContent = AI_STATUS_MESSAGES[Math.floor(Math.random() * AI_STATUS_MESSAGES.length)];
    statusMessage.classList.remove('win-animation');

    // Start spinning
    reels.forEach((reel, index) => {
        // Add multiple symbols to the strip for the animation effect
        reel.innerHTML = '';
        for (let i = 0; i < 10; i++) {
            const div = document.createElement('div');
            div.className = 'symbol';
            div.textContent = getRandomSymbol();
            reel.appendChild(div);
        }
        reel.classList.add('spinning');
    });

    const finalSymbols = [];

    // Stop reels one by one
    for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 800 + (i * 400)));
        const finalSymbol = getRandomSymbol();
        finalSymbols.push(finalSymbol);
        
        const reel = reels[i];
        reel.classList.remove('spinning');
        reel.innerHTML = `<div class="symbol">${finalSymbol}</div>`;
    }

    evaluate(finalSymbols);
    spinButton.disabled = false;
}

function evaluate(results) {
    const [s1, s2, s3] = results;
    let winAmount = 0;
    let message = "";

    if (s1 === s2 && s2 === s3) {
        // Jackpot
        winAmount = SPIN_COST * 50;
        message = WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)];
        statusMessage.classList.add('win-animation');
    } else if (s1 === s2 || s2 === s3 || s1 === s3) {
        // Small win
        winAmount = SPIN_COST * 2;
        message = "Incremental Improvement! Minor payout.";
    } else {
        // Loss
        message = LOSE_MESSAGES[Math.floor(Math.random() * LOSE_MESSAGES.length)];
    }

    if (winAmount > 0) {
        tokens += winAmount;
        statusMessage.style.color = 'var(--accent)';
    } else {
        statusMessage.style.color = 'var(--danger)';
    }

    statusMessage.textContent = message;
    updateUI();
}

spinButton.addEventListener('click', spin);
updateUI();
