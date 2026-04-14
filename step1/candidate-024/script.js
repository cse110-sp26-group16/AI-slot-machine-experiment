/**
 * THE TOKEN BURNER - AI Satire Slot Machine
 * Logic for the satirical slot machine app.
 */

const SYMBOLS = [
    { char: '🧠', name: 'AGI', weight: 1, payout: 100 },
    { char: '🤑', name: 'VC Funding', weight: 3, payout: 50 },
    { char: '⚡', name: 'Quantization', weight: 10, payout: 10 },
    { char: '👻', name: 'Hallucination', weight: 8, payout: 5 },
    { char: '⛓️', name: 'Safety Filter', weight: 15, payout: 0 },
    { char: '📉', name: 'Model Collapse', weight: 15, payout: 0 }
];

// Configuration
const REEL_SYMBOL_COUNT = 30; // Number of symbols in the expanded strip
const SPIN_DURATION = 2000; // ms
const SYMBOL_HEIGHT = 120; // px (must match CSS)

// State
let credits = 500.00;
let winnings = 0;
let isSpinning = false;

// DOM Elements
const reelStrips = [
    document.querySelector('#reel1 .reel-strip'),
    document.querySelector('#reel2 .reel-strip'),
    document.querySelector('#reel3 .reel-strip')
];
const spinBtn = document.getElementById('spin-btn');
const creditsDisplay = document.getElementById('compute-credits');
const windowDisplay = document.getElementById('context-window');
const betSelect = document.getElementById('bet-amount');
const terminalLog = document.getElementById('terminal-log');

/**
 * Initialize the reels with random symbols
 */
function initReels() {
    reelStrips.forEach(strip => {
        strip.innerHTML = '';
        // Create a long strip of symbols for the scrolling effect
        for (let i = 0; i < REEL_SYMBOL_COUNT; i++) {
            const symbol = getRandomSymbol();
            const div = document.createElement('div');
            div.className = 'symbol';
            div.textContent = symbol.char;
            strip.appendChild(div);
        }
    });
}

/**
 * Get a random symbol based on weights
 */
function getRandomSymbol() {
    const totalWeight = SYMBOLS.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;
    for (const symbol of SYMBOLS) {
        if (random < symbol.weight) return symbol;
        random -= symbol.weight;
    }
    return SYMBOLS[SYMBOLS.length - 1];
}

/**
 * Log message to the terminal
 */
function logToTerminal(message, type = 'system') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `> ${message}`;
    terminalLog.appendChild(entry);
    terminalLog.scrollTop = terminalLog.scrollHeight;
    
    // Keep only last 20 entries
    if (terminalLog.children.length > 20) {
        terminalLog.removeChild(terminalLog.firstChild);
    }
}

/**
 * Perform the spin
 */
async function spin() {
    if (isSpinning) return;
    
    const bet = parseInt(betSelect.value);
    if (credits < bet) {
        logToTerminal('Insufficient compute credits. Please pivot or seek Series A.', 'error');
        return;
    }

    // Reset state
    isSpinning = true;
    spinBtn.disabled = true;
    credits -= bet;
    updateDisplay();
    
    logToTerminal(`Initiating inference... Cost: ${bet} credits.`);
    logToTerminal(`Temperature set to ${betSelect.options[betSelect.selectedIndex].text}...`);

    const results = [];
    const animationPromises = reelStrips.map((strip, index) => {
        // Pick a target symbol from the top of the strip (we'll reset position after)
        const targetIndex = Math.floor(Math.random() * (REEL_SYMBOL_COUNT - 5)) + 2;
        const targetSymbolChar = strip.children[targetIndex].textContent;
        results.push(SYMBOLS.find(s => s.char === targetSymbolChar));

        // Animation logic
        return new Promise(resolve => {
            const offset = targetIndex * SYMBOL_HEIGHT;
            const extraSpins = (3 + index) * SYMBOL_HEIGHT * 5; // Visual flair
            
            strip.style.transition = `transform ${SPIN_DURATION + (index * 500)}ms cubic-bezier(0.45, 0.05, 0.55, 0.95)`;
            strip.style.transform = `translateY(-${offset}px)`;
            
            setTimeout(resolve, SPIN_DURATION + (index * 500));
        });
    });

    await Promise.all(animationPromises);
    
    evaluateResult(results);
    isSpinning = false;
    spinBtn.disabled = false;
}

/**
 * Evaluate the win/loss
 */
function evaluateResult(results) {
    const [s1, s2, s3] = results;
    let winAmount = 0;

    // Check for 3 of a kind
    if (s1.char === s2.char && s2.char === s3.char) {
        winAmount = s1.payout * (parseInt(betSelect.value) / 10);
        logToTerminal(`MATCH FOUND: ${s1.name} cluster detected!`, 'win');
    } 
    // Check for 2 of a kind (starting from left)
    else if (s1.char === s2.char) {
        winAmount = Math.floor(s1.payout * 0.5 * (parseInt(betSelect.value) / 10));
        logToTerminal(`Partial alignment: ${s1.name} correlation found.`, 'system');
    }
    // Special case: Model Collapse or Safety Filter
    else if (results.some(s => s.name === 'Model Collapse')) {
        logToTerminal('Inference failed: Model collapse detected. Weights degraded.', 'error');
    }
    else {
        const failureMessages = [
            "Inference complete. Result: Hallucinated nonsense.",
            "Token probability below threshold.",
            "Alignment failed. Values drifted.",
            "Prompt rejected by internal simulation.",
            "Context window exceeded. Purging memory."
        ];
        logToTerminal(failureMessages[Math.floor(Math.random() * failureMessages.length)]);
    }

    // Satirical "Safety Filter" check
    if (winAmount > 0 && Math.random() < 0.15) {
        logToTerminal(`SAFETY VIOLATION: Win of ${winAmount} refused for public safety.`, 'error');
        winAmount = 0;
    }

    if (winAmount > 0) {
        winnings += winAmount;
        credits += winAmount;
        logToTerminal(`Winnings: ${winAmount} tokens synthesized.`, 'win');
    }

    updateDisplay();
}

/**
 * Update the UI
 */
function updateDisplay() {
    creditsDisplay.textContent = credits.toFixed(2);
    windowDisplay.textContent = winnings;
    
    // Visual feedback for credits
    if (credits < 50) creditsDisplay.style.color = 'var(--neon-pink)';
    else creditsDisplay.style.color = 'var(--terminal-green)';
}

// Event Listeners
spinBtn.addEventListener('click', spin);

// Start the app
window.onload = () => {
    initReels();
    logToTerminal('System online. AGI is definitely coming next year.');
};
