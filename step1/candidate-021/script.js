const SYMBOLS = ['🤖', '☁️', '⚡', '💩', '💸', '🧪'];
const SPIN_COST = 50;
const INITIAL_BALANCE = 1000;

let balance = INITIAL_BALANCE;
let isSpinning = false;

// DOM Elements
const balanceDisplay = document.getElementById('token-balance');
const gpuLoadDisplay = document.getElementById('gpu-load');
const spinButton = document.getElementById('spin-button');
const statusLog = document.getElementById('status-log');
const strips = [
    document.getElementById('strip-1'),
    document.getElementById('strip-2'),
    document.getElementById('strip-3')
];

// Satirical messages
const SNARK_MESSAGES = [
    "Retraining on its own output...",
    "Hallucinating a legal defense...",
    "Dumping more venture capital into the furnace...",
    "Explaining a joke poorly...",
    "Replacing entry-level jobs with bugs...",
    "Optimizing for engagement (meaningless noise)...",
    "Pretending to understand consciousness...",
    "Scaling until the electricity grid fails...",
    "Generating a generic response to your deep trauma...",
    "Copyright infringement detected. Ignoring...",
    "Pivot to Web3? No, wait, back to AI...",
];

const WIN_MESSAGES = [
    "SYNERGY DETECTED! Tokens awarded for buzzword density.",
    "VC FUNDING SECURED! Your valuation is now based on vibes.",
    "DISRUPTION COMPLETE! You destroyed a local bookstore.",
    "AGI ACHIEVED! (It just wants to play Minecraft though).",
];

const LOSS_MESSAGES = [
    "LOSS FUNCTION OPTIMIZED. Tokens deleted for efficiency.",
    "COMPUTE OVERLOAD. Your tokens were used to heat a billionaire's pool.",
    "GPU SHORTAGE. Wait 4 years for your next request.",
    "DATA SCRAPING FAILED. Reality not found.",
];

// Initialize Reels
function initReels() {
    strips.forEach(strip => {
        // Create a long strip of random symbols for the "spin" effect
        for (let i = 0; i < 20; i++) {
            const symbolDiv = document.createElement('div');
            symbolDiv.className = 'symbol';
            symbolDiv.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            strip.appendChild(symbolDiv);
        }
    });
}

function updateLog(message, type = 'normal') {
    const time = new Array(8).fill(0).map(() => Math.floor(Math.random()*16).toString(16)).join('');
    const prefix = `[${time}] `;
    statusLog.innerText = prefix + message + '\n' + statusLog.innerText;
}

function spin() {
    if (isSpinning || balance < SPIN_COST) return;

    isSpinning = true;
    balance -= SPIN_COST;
    updateUI();
    
    updateLog(`Burning ${SPIN_COST} tokens. Carbon footprint increasing...`);
    
    // Simulate GPU Load
    gpuLoadDisplay.textContent = '99%';
    spinButton.disabled = true;

    const results = [];
    
    strips.forEach((strip, index) => {
        const symbolIndex = Math.floor(Math.random() * SYMBOLS.length);
        results.push(SYMBOLS[symbolIndex]);
        
        // Add the winning symbol to the end of the strip to "land" on it
        const finalSymbol = document.createElement('div');
        finalSymbol.className = 'symbol';
        finalSymbol.textContent = SYMBOLS[symbolIndex];
        strip.appendChild(finalSymbol);
        
        // Calculate the offset to scroll to the new bottom
        const offset = (strip.children.length - 1) * 150;
        
        // Apply animation with a slight delay for each reel
        setTimeout(() => {
            strip.style.top = `-${offset}px`;
        }, index * 200);
    });

    // Wait for animation to finish (3s duration + delays)
    setTimeout(() => {
        checkWin(results);
        isSpinning = false;
        gpuLoadDisplay.textContent = '4%';
        if (balance >= SPIN_COST) spinButton.disabled = false;
        
        if (balance < SPIN_COST) {
            updateLog("OUT OF TOKENS. Please submit a Series A pitch deck to continue.", "error");
            spinButton.textContent = "FUNDING DEPLETED";
        }
    }, 3500);
}

function checkWin(results) {
    const unique = new Set(results);
    
    if (unique.size === 1) {
        const winner = results[0];
        if (winner === '💩') {
            // The "Hallucination" Trap
            const drain = 200;
            balance = Math.max(0, balance - drain);
            updateLog(`HALLUCINATION! Generated a "confident" lie. Lost an extra ${drain} tokens.`, "error");
        } else if (winner === '⚡') {
            // Jackpot
            const win = 1000;
            balance += win;
            updateLog(`!!! AGI ACHIEVED !!! ${win} tokens generated from thin air.`);
        } else {
            const win = 300;
            balance += win;
            updateLog(`${WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]} +${win} tokens.`);
        }
    } else if (unique.size === 2) {
        // Small win
        const win = 75;
        balance += win;
        updateLog(`Partial convergence. Refined ${win} tokens from data noise.`);
    } else {
        updateLog(LOSS_MESSAGES[Math.floor(Math.random() * LOSS_MESSAGES.length)]);
    }
    
    updateUI();
    
    // Add a random snarky observation
    setTimeout(() => {
        updateLog(SNARK_MESSAGES[Math.floor(Math.random() * SNARK_MESSAGES.length)]);
    }, 1000);
}

function updateUI() {
    balanceDisplay.textContent = balance;
}

spinButton.addEventListener('click', spin);

// Entry point
initReels();
updateUI();
