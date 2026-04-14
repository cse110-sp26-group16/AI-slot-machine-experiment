const SYMBOLS = [
    { char: '🤖', name: 'AGI', weight: 1, payout: 500 },
    { char: '💰', name: 'VC_FUNDING', weight: 4, payout: 50 },
    { char: '🚀', name: 'MOONSHOT', weight: 8, payout: 20 },
    { char: '📈', name: 'SYNTHETIC_GROWTH', weight: 12, payout: 10 },
    { char: '🤡', name: 'HALLUCINATION', weight: 20, payout: -20 },
    { char: '📉', name: 'TOKEN_BURN', weight: 25, payout: 0 }
];

const SARCASTIC_MESSAGES = [
    "Scaling is all you need. More layers added.",
    "Model quantized to 1-bit. Efficiency maximized.",
    "Pivot to Web3... wait, wrong year. Pivoting back.",
    "Your startup is now a 'wrapper' for a larger model.",
    "Training data found to be 90% Reddit comments.",
    "RLHF team is on strike. Expect unhinged outputs.",
    "Prompt engineering degree successfully completed.",
    "GPU temperature critical. Fans spinning at 10000 RPM.",
    "Valuation increased by $1B based on a LinkedIn post.",
    "Sam Altman just tweeted. Market is volatile."
];

let tokens = 100;
let debt = 0;
let isSpinning = false;

// DOM Elements
const tokenEl = document.getElementById('token-count');
const debtEl = document.getElementById('debt-count');
const spinBtn = document.getElementById('spin-button');
const logEl = document.getElementById('event-log');
const reelEls = [
    document.getElementById('reel1').querySelector('.reel-content') || document.getElementById('reel1'),
    document.getElementById('reel2').querySelector('.reel-content') || document.getElementById('reel2'),
    document.getElementById('reel3').querySelector('.reel-content') || document.getElementById('reel3')
];

function getRandomSymbol() {
    const totalWeight = SYMBOLS.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;
    for (const symbol of SYMBOLS) {
        if (random < symbol.weight) return symbol;
        random -= symbol.weight;
    }
    return SYMBOLS[SYMBOLS.length - 1];
}

function updateLog(msg, type = '') {
    const p = document.createElement('p');
    p.innerHTML = `> ${msg}`;
    if (type) p.className = `msg-${type}`;
    logEl.prepend(p);
}

function updateUI() {
    tokenEl.textContent = tokens;
    debtEl.textContent = debt;
    spinBtn.disabled = isSpinning;
}

async function spin() {
    if (isSpinning) return;
    
    const COST = 10;
    if (tokens < COST && debt > 5000) {
        updateLog("FATAL ERROR: OUT OF MEMORY (AND MONEY).", "loss");
        return;
    }

    isSpinning = true;
    tokens -= COST;
    if (tokens < 0) {
        debt += Math.abs(tokens);
        tokens = 0;
        updateLog("Tokens depleted. Auto-borrowing from VC debt pool...", "loss");
    }
    updateUI();

    // Start Animation
    reelEls.forEach(el => {
        el.classList.add('spinning');
    });

    // Resolve Symbols one by one
    const results = [];
    for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 600 + i * 400));
        const symbol = getRandomSymbol();
        results.push(symbol);
        reelEls[i].classList.remove('spinning');
        reelEls[i].textContent = symbol.char;
    }

    evaluateResults(results);
    isSpinning = false;
    updateUI();
}

function evaluateResults(results) {
    const chars = results.map(r => r.char);
    const uniqueChars = [...new Set(chars)];
    
    // Check for Jackpot
    if (uniqueChars.length === 1) {
        const symbol = results[0];
        const win = symbol.payout;
        tokens += win;
        updateLog(`JACKPOT! ${symbol.name} ACHIEVED. +${win} tokens.`, "win");
    } 
    // Check for 2 of a kind
    else if (uniqueChars.length === 2) {
        const win = 15;
        tokens += win;
        updateLog(`Partial convergence detected. +${win} tokens.`, "win");
    }
    // Hallucination handling
    else {
        const hallucCount = results.filter(r => r.char === '🤡').length;
        if (hallucCount > 0) {
            const loss = hallucCount * 20;
            debt += loss * 10;
            updateLog(`HALLUCINATION DETECTED! GPU debt increased by $${loss * 10}.`, "loss");
        } else {
            const randomMsg = SARCASTIC_MESSAGES[Math.floor(Math.random() * SARCASTIC_MESSAGES.length)];
            updateLog(randomMsg);
        }
    }

    if (tokens > 1000) {
        updateLog("IPO SUCCESS! You've reached escape velocity.", "win");
    }
}

spinBtn.addEventListener('click', spin);

// Initial UI sync
updateUI();
