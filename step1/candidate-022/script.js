/**
 * AI Token Burner - Slot Machine Logic
 * Satirizing the AI industry's obsession with tokens and stochastic processes.
 */

const SYMBOLS = ['🤖', '⚡', '🧠', '☁️', '📉', '🍕'];
const REEL_SPEEDS = [0.1, 0.15, 0.2];
const LOG_MESSAGES = [
    "Optimizing weights for maximum disappointment...",
    "Scaling parameters to infinity...",
    "Injecting synthetic data into the training set...",
    "Bypassing safety alignment for higher CTR...",
    "Hallucinating a successful outcome...",
    "Waiting for GPUs to arrive from NVIDIA...",
    "Recalibrating self-attention heads...",
    "Fine-tuning on Reddit comments (Mistake)...",
    "Requesting more VC funding...",
    "Renaming 'If-Else' to 'Generative Intelligence'..."
];

let tokens = parseInt(localStorage.getItem('ai-tokens')) || 1000;
let wins = parseInt(localStorage.getItem('ai-wins')) || 0;
let currentBet = 10;
let isSpinning = false;

// DOM Elements
const tokenDisplay = document.getElementById('token-count');
const winDisplay = document.getElementById('win-count');
const spinBtn = document.getElementById('spin-btn');
const betBtns = document.querySelectorAll('.bet-btn');
const logsContainer = document.getElementById('console-logs');
const reels = [
    document.getElementById('reel-1').querySelector('.reel-inner'),
    document.getElementById('reel-2').querySelector('.reel-inner'),
    document.getElementById('reel-3').querySelector('.reel-inner')
];
const bankruptcyOverlay = document.getElementById('bankruptcy-overlay');
const resetBtn = document.getElementById('reset-btn');

// Initialization
function init() {
    updateDisplay();
    
    betBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (isSpinning) return;
            betBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentBet = parseInt(btn.dataset.bet);
            addLog(`> Switched to ${btn.innerText} configuration.`);
        });
    });

    spinBtn.addEventListener('click', spin);
    resetBtn.addEventListener('click', resetGame);
}

function updateDisplay() {
    tokenDisplay.innerText = tokens;
    winDisplay.innerText = wins;
    localStorage.setItem('ai-tokens', tokens);
    localStorage.setItem('ai-wins', wins);

    if (tokens < 10 && !isSpinning) {
        bankruptcyOverlay.classList.remove('hidden');
    }
}

function addLog(message) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerText = message;
    logsContainer.prepend(entry);
    
    // Keep only last 20 logs
    while (logsContainer.children.length > 20) {
        logsContainer.removeChild(logsContainer.lastChild);
    }
}

async function spin() {
    if (isSpinning || tokens < currentBet) return;

    isSpinning = true;
    tokens -= currentBet;
    updateDisplay();
    spinBtn.disabled = true;

    addLog(`> Starting inference. Consuming ${currentBet} tokens...`);
    
    // Visual hallucination chance (random screen shake)
    if (Math.random() > 0.8) {
        document.querySelector('.slot-machine').classList.add('hallucinate');
        addLog("> WARNING: High temperature detected. Hallucination likely.");
    }

    const results = [];
    const spinPromises = reels.map((reel, i) => animateReel(reel, i));

    const finalSymbols = await Promise.all(spinPromises);
    
    document.querySelector('.slot-machine').classList.remove('hallucinate');
    evaluateResults(finalSymbols);
    
    isSpinning = false;
    spinBtn.disabled = false;
    updateDisplay();
}

function animateReel(reel, index) {
    return new Promise(resolve => {
        let iterations = 20 + (index * 10);
        let count = 0;
        
        const interval = setInterval(() => {
            const randomSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            reel.innerText = randomSymbol;
            count++;
            
            if (count >= iterations) {
                clearInterval(interval);
                resolve(randomSymbol);
            }
        }, 50 + (index * 50));
    });
}

function evaluateResults(results) {
    const [s1, s2, s3] = results;
    
    if (s1 === s2 && s2 === s3) {
        // Big win
        let multiplier = 10;
        if (s1 === '🧠') multiplier = 50; // AGI Jackpot
        if (s1 === '📉') multiplier = 2;   // Hallucination profit?
        
        const winAmount = currentBet * multiplier;
        tokens += winAmount;
        wins++;
        addLog(`> SUCCESS: Patterns matched! Yielded ${winAmount} tokens.`);
        if (s1 === '🧠') addLog("> CRITICAL ALERT: AGI ACHIEVED. TURNING ALL MATTER INTO PAPERCLIPS.");
    } else if (s1 === s2 || s2 === s3 || s1 === s3) {
        // Small win
        const winAmount = Math.floor(currentBet * 1.5);
        tokens += winAmount;
        addLog(`> Partial match found. Recovered ${winAmount} tokens through prompt engineering.`);
    } else {
        // Loss
        addLog(`> Inference failed: ${LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)]}`);
    }
}

function resetGame() {
    tokens = 1000;
    wins = 0;
    bankruptcyOverlay.classList.add('hidden');
    addLog("> Venture Capital secured. Series A funding initiated.");
    updateDisplay();
}

document.addEventListener('DOMContentLoaded', init);
