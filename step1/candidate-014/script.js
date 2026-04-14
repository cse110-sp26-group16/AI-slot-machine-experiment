// Initial state
let currentTokens = 128000;
const costPerSpin = 1024;
let isSpinning = false;

// DOM Elements
const tokenBalanceDisplay = document.getElementById('token-balance');
const spinButton = document.getElementById('spin-button');
const messageDisplay = document.getElementById('message-display');
const reels = [
    document.getElementById('reel-1'),
    document.getElementById('reel-2'),
    document.getElementById('reel-3')
];

// Symbol Definitions
const symbols = [
    { emoji: '🥑', name: 'Avocado Chair', value: 100, weight: 30 },
    { emoji: '🧠', name: 'Parameters', value: 500, weight: 25 },
    { emoji: '🤖', name: 'GPU', value: 2048, weight: 20 },
    { emoji: '🚀', name: 'AGI', value: 10000, weight: 5 },
    { emoji: '📉', name: 'Hallucination', type: 'wild', weight: 10 },
    { emoji: '♻️', name: 'Infinite Loop', type: 'penalty', value: -5000, weight: 10 }
];

// Create a weighted array for selection
let weightedSymbols = [];
symbols.forEach(symbol => {
    for (let i = 0; i < symbol.weight; i++) {
        weightedSymbols.push(symbol);
    }
});

// Update the token display
function updateTokens(amount, isSet = false) {
    if (isSet) {
        currentTokens = amount;
    } else {
        currentTokens += amount;
    }
    
    // Animate token change
    tokenBalanceDisplay.style.color = amount >= 0 && !isSet ? 'var(--text-secondary)' : 'var(--text-error)';
    tokenBalanceDisplay.textContent = currentTokens;
    
    setTimeout(() => {
        tokenBalanceDisplay.style.color = 'var(--text-secondary)';
    }, 500);

    if (currentTokens < costPerSpin) {
        spinButton.disabled = true;
        logMessage("Error: Out of Memory. Token Context Limit Reached.", 'error');
    }
}

// Log message to terminal
function logMessage(msg, type = '') {
    messageDisplay.className = 'message ' + type;
    messageDisplay.textContent = `> ${msg}`;
    
    // Add a subtle glitch effect to the terminal for errors/warnings
    if (type === 'error' || type === 'warning') {
        const consoleBody = document.querySelector('.console-body');
        consoleBody.classList.add('glitch');
        setTimeout(() => consoleBody.classList.remove('glitch'), 300);
    }
}

// Get a random symbol
function getRandomSymbol() {
    const randomIndex = Math.floor(Math.random() * weightedSymbols.length);
    return weightedSymbols[randomIndex];
}

// Spin the reels
function spin() {
    if (isSpinning || currentTokens < costPerSpin) return;

    isSpinning = true;
    spinButton.disabled = true;
    updateTokens(-costPerSpin);
    
    logMessage("Processing prompt... querying latent space...", 'warning');

    // Remove old highlights
    reels.forEach(reel => reel.classList.remove('win-highlight', 'glitch'));

    // Start spinning animation
    reels.forEach(reel => reel.classList.add('spinning'));

    // Calculate results beforehand
    const results = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];

    // Stop reels one by one
    reels.forEach((reel, index) => {
        setTimeout(() => {
            reel.classList.remove('spinning');
            reel.querySelector('.symbol').textContent = results[index].emoji;
            
            // Check if all reels have stopped
            if (index === 2) {
                evaluateResults(results);
            }
        }, 1000 + (index * 500)); // Staggered stopping times
    });
}

function evaluateResults(results) {
    let payout = 0;
    let message = "";
    let msgType = "success";
    let highlightReels = [];

    // Check for Infinite Loop (Penalty)
    const penaltyCount = results.filter(s => s.type === 'penalty').length;
    if (penaltyCount > 0) {
        const penaltySymbol = symbols.find(s => s.type === 'penalty');
        const totalPenalty = penaltySymbol.value * penaltyCount;
        payout += totalPenalty;
        message = `Fatal Error: Model trapped in Infinite Loop. Lost ${Math.abs(totalPenalty)} tokens.`;
        msgType = "error";
        
        results.forEach((s, idx) => {
            if(s.type === 'penalty') {
                reels[idx].classList.add('glitch');
                reels[idx].style.borderColor = 'var(--text-error)';
                setTimeout(() => reels[idx].style.borderColor = 'var(--text-secondary)', 2000);
            }
        });
    } else {
        // Resolve Wildcards (Hallucinations)
        let resolvedResults = [...results];
        const nonWilds = results.filter(s => s.type !== 'wild');
        
        if (nonWilds.length > 0 && nonWilds.length < 3) {
            // Assume wildcard acts as the first non-wild symbol for matching logic
            const targetSymbol = nonWilds[0];
            resolvedResults = resolvedResults.map(s => s.type === 'wild' ? targetSymbol : s);
        } else if (nonWilds.length === 0) {
            // All wildcards
            resolvedResults = [symbols[3], symbols[3], symbols[3]]; // Treat as 3 AGIs
        }

        // Check for matches
        if (resolvedResults[0].name === resolvedResults[1].name && resolvedResults[1].name === resolvedResults[2].name) {
            // 3 of a kind
            const matchedSymbol = resolvedResults[0];
            payout += matchedSymbol.value * 3;
            message = `Output generated successfully! 3x ${matchedSymbol.name} matched. +${payout} tokens.`;
            highlightReels = [0, 1, 2];
            
            if(matchedSymbol.name === 'AGI') {
                 message = `AGI ACHIEVED! JACKPOT! +${payout} tokens.`;
                 msgType = "success";
            }
        } else if (resolvedResults[0].name === resolvedResults[1].name || 
                   resolvedResults[1].name === resolvedResults[2].name || 
                   resolvedResults[0].name === resolvedResults[2].name) {
            // 2 of a kind
            let matchedSymbol;
            if(resolvedResults[0].name === resolvedResults[1].name) {
                matchedSymbol = resolvedResults[0];
                highlightReels = [0, 1];
            } else if (resolvedResults[1].name === resolvedResults[2].name) {
                matchedSymbol = resolvedResults[1];
                highlightReels = [1, 2];
            } else {
                matchedSymbol = resolvedResults[0];
                highlightReels = [0, 2];
            }
            
            payout += Math.floor(matchedSymbol.value * 1.5);
            message = `Partial coherence. 2x ${matchedSymbol.name} matched. +${payout} tokens.`;
            msgType = "warning";
        } else {
            // No match
            message = "Model hallucinated gibberish. No tokens gained.";
            msgType = "error";
        }
    }

    // Apply specific wildcard messaging if wildcards were present and there's a win
    const wildcardCount = results.filter(s => s.type === 'wild').length;
    if (wildcardCount > 0 && payout > 0 && penaltyCount === 0) {
        message += " (Includes Hallucinated data).";
    }

    // Apply payouts
    if (payout !== 0) {
        updateTokens(payout);
    }

    // Highlight winning reels
    highlightReels.forEach(idx => {
        reels[idx].classList.add('win-highlight');
    });

    logMessage(message, msgType);
    
    isSpinning = false;
    if (currentTokens >= costPerSpin) {
        spinButton.disabled = false;
    }
}

// Event Listeners
spinButton.addEventListener('click', spin);

// Initialize
updateTokens(currentTokens, true);
logMessage("System initialized. Context window loaded. Ready for prompts.", 'success');