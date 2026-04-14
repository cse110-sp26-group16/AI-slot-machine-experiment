const SYMBOLS = ['🤖', '⚡', '🧠', '📄', '🍄', '🔥', '📊'];
const COST_PER_SPIN = 100;
const STATUS_MESSAGES = [
    "Discarding training data...",
    "Hallucinating a jackpot...",
    "Quantizing weights...",
    "Exceeding context window...",
    "Prompting the GPU gods...",
    "Vectorizing your hope...",
    "RLHF in progress...",
    "Pre-training new failures..."
];

let tokens = 10000;
let isSpinning = false;

// DOM Elements
const tokenDisplay = document.getElementById('token-count');
const statusText = document.getElementById('status-text');
const mainBtn = document.getElementById('main-btn');
const reels = [
    document.getElementById('reel-1'),
    document.getElementById('reel-2'),
    document.getElementById('reel-3')
];
const gameLog = document.getElementById('game-log');

function addLog(msg) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = `> ${msg}`;
    gameLog.prepend(entry);
    if (gameLog.children.length > 10) gameLog.lastChild.remove();
}

function getRandomSymbol() {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

async function spin() {
    if (isSpinning || tokens < COST_PER_SPIN) return;

    isSpinning = true;
    tokens -= COST_PER_SPIN;
    updateUI();
    
    mainBtn.disabled = true;
    statusText.textContent = STATUS_MESSAGES[Math.floor(Math.random() * STATUS_MESSAGES.length)];
    addLog(`Deducted 100 tokens. Inference started.`);

    // Start spinning animation
    const spinIntervals = reels.map((reel, i) => {
        return setInterval(() => {
            reel.innerHTML = `<div class="symbol">${getRandomSymbol()}</div>`;
        }, 80);
    });

    const results = [];
    
    // Stop reels one by one
    for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 800 + (i * 600)));
        clearInterval(spinIntervals[i]);
        const finalSymbol = getRandomSymbol();
        results.push(finalSymbol);
        reels[i].innerHTML = `<div class="symbol">${finalSymbol}</div>`;
        reels[i].style.transform = 'scale(1.2)';
        setTimeout(() => reels[i].style.transform = 'scale(1)', 200);
    }

    isSpinning = false;
    mainBtn.disabled = false;
    checkWin(results);
}

function checkWin(results) {
    const [s1, s2, s3] = results;
    let winAmount = 0;
    let message = "";

    if (s1 === s2 && s2 === s3) {
        if (s1 === '🤖') {
            winAmount = 10000;
            message = "AGI ACHIEVED! Tokens generated out of thin air.";
        } else if (s1 === '⚡') {
            winAmount = 2000;
            message = "Compute Surplus! Efficiency increased.";
        } else if (s1 === '🔥') {
            winAmount = 5000;
            message = "H100 Cluster Found! Scalability unlocked.";
        } else {
            winAmount = 500;
            message = "Matching pattern detected in latent space.";
        }
    } else if (s1 === s2 || s2 === s3 || s1 === s3) {
        winAmount = 150;
        message = "Partial convergence. Minority of weights aligned.";
    } else if (results.includes('🍄')) {
        winAmount = 0;
        message = "CRITICAL ERROR: Hallucination detected. Context lost.";
        statusText.style.color = "#ff007b";
    } else {
        message = "Response quality: Low. No useful tokens generated.";
        statusText.style.color = "#0f0";
    }

    if (winAmount > 0) {
        tokens += winAmount;
        statusText.textContent = `WIN: +${winAmount} TOKENS`;
        statusText.style.color = "var(--primary)";
        addLog(message);
        document.querySelector('.app-container').classList.add('winning-glow');
        setTimeout(() => {
            document.querySelector('.app-container').classList.remove('winning-glow');
        }, 1000);
    } else {
        statusText.textContent = message;
        addLog("Inference failed to find profit.");
    }

    updateUI();
}

function updateUI() {
    tokenDisplay.textContent = tokens;
    if (tokens < COST_PER_SPIN) {
        mainBtn.textContent = "OUT OF TOKENS (REFRESH)";
        mainBtn.disabled = true;
        statusText.textContent = "Funding exhausted. Request more VC capital.";
    }
}

mainBtn.addEventListener('click', spin);
document.getElementById('spin-button').addEventListener('click', spin);

// Initialization
updateUI();
