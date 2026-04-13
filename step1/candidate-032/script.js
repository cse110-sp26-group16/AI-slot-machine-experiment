// Game State
let tokens = 1000;
const costPerSpin = 10;
let isSpinning = false;

// DOM Elements
const tokenDisplay = document.getElementById('token-count');
const spinButton = document.getElementById('spin-button');
const logContent = document.getElementById('message-log');
const reels = [
    document.getElementById('reel-1').querySelector('.symbol'),
    document.getElementById('reel-2').querySelector('.symbol'),
    document.getElementById('reel-3').querySelector('.symbol')
];
const reelContainers = [
    document.getElementById('reel-1'),
    document.getElementById('reel-2'),
    document.getElementById('reel-3')
];

// Symbols: 🤖 (Bot), 🧠 (Brain), 💻 (Compute), ⚡️ (Energy), 🐛 (Bug), 📉 (Loss)
const symbols = ['🤖', '🧠', '💻', '⚡️', '🐛', '📉'];

// Funny Log Messages
const errorMessages = [
    "Error 429: Too Many Requests. Try again.",
    "Model hallucinated a nonexistent dependency.",
    "Context window exceeded. Tokens lost in the void.",
    "AI refused to answer due to alignment constraints.",
    "Compute cluster caught fire. -10 Tokens."
];

const successMessages = [
    "AGI Achieved! The singularity is near.",
    "Zero-shot success! Perfect prompt alignment.",
    "Weights updated successfully. Massive payout."
];

const partialMessages = [
    "Partial match. Model is confused but trying.",
    "Fuzzy logic detected. Small token refund.",
    "Mild hallucination, but the format was JSON."
];

// Utility: Add message to terminal log
function logMessage(text, type = '') {
    const p = document.createElement('p');
    p.textContent = `> ${text}`;
    if (type) p.className = `log-${type}`;
    
    logContent.appendChild(p);
    // Auto-scroll to bottom
    logContent.scrollTop = logContent.scrollHeight;
}

// Utility: Get random symbol
function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

// Utility: Get random message from array
function getRandomMessage(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Main Spin Logic
async function spin() {
    if (isSpinning) return;
    
    if (tokens < costPerSpin) {
        logMessage("INSUFFICIENT TOKENS. PLEASE PURCHASE MORE COMPUTE.", "error");
        return;
    }

    // Start spin
    isSpinning = true;
    spinButton.disabled = true;
    
    // Deduct tokens
    tokens -= costPerSpin;
    updateTokenDisplay();
    logMessage(`Executing prompt... (-${costPerSpin} Tokens)`, "warning");

    // Add spinning animation class
    reelContainers.forEach(container => container.classList.add('spinning'));

    // Simulate network latency / processing time
    const spinDuration = 2000; // 2 seconds
    
    // Visual effect during spin - rapidly change symbols
    const intervalId = setInterval(() => {
        reels.forEach(reel => {
            reel.textContent = getRandomSymbol();
        });
    }, 100);

    // Wait for "API Response"
    await new Promise(resolve => setTimeout(resolve, spinDuration));
    
    clearInterval(intervalId);

    // Stop animations and set final results sequentially for dramatic effect
    const results = [];
    for (let i = 0; i < 3; i++) {
        reelContainers[i].classList.remove('spinning');
        const finalSymbol = getRandomSymbol();
        reels[i].textContent = finalSymbol;
        results.push(finalSymbol);
        
        // Small delay between reels stopping
        if (i < 2) await new Promise(resolve => setTimeout(resolve, 300));
    }

    evaluateResults(results);
    
    isSpinning = false;
    spinButton.disabled = false;
}

function evaluateResults(results) {
    const uniqueSymbols = new Set(results);
    
    if (uniqueSymbols.size === 1) {
        // 3 of a kind - Big Win
        const winAmount = 500;
        tokens += winAmount;
        logMessage(`JACKPOT! ${getRandomMessage(successMessages)} (+${winAmount} Tokens)`, "success");
    } else if (uniqueSymbols.size === 2) {
        // 2 of a kind - Small Win / Refund
        const winAmount = 20;
        tokens += winAmount;
        logMessage(`WARNING: ${getRandomMessage(partialMessages)} (+${winAmount} Tokens)`, "warning");
    } else {
        // Loss
        logMessage(`FAILURE: ${getRandomMessage(errorMessages)}`, "error");
    }
    
    updateTokenDisplay();
}

function updateTokenDisplay() {
    // Add brief flash effect when updated
    tokenDisplay.textContent = tokens;
    tokenDisplay.style.color = '#fff';
    setTimeout(() => {
        tokenDisplay.style.color = '';
    }, 150);
}

// Event Listeners
spinButton.addEventListener('click', spin);

// Initial setup
logMessage("System initialized. Awaiting user prompts.", "success");