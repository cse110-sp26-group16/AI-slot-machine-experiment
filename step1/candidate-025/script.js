const SYMBOLS = [
    { char: '🤖', name: 'AGI', weight: 1, payout: 1000 },
    { char: '🖥️', name: 'H100', weight: 3, payout: 500 },
    { char: '🖼️', name: 'AI ART', weight: 8, payout: 200 },
    { char: '📝', name: 'PROSE', weight: 12, payout: 100 },
    { char: '🔌', name: 'PLUG', weight: 15, payout: 50 },
    { char: '📉', name: 'CRASH', weight: 10, payout: 20 },
    { char: '🏢', name: 'PIVOT', weight: 5, payout: -100 } // Loss symbol
];

const SPIN_PHRASES = [
    "Optimizing loss function...",
    "Crawling copyrighted data...",
    "Hallucinating jackpots...",
    "Aligning with human greed...",
    "Fine-tuning on Reddit threads...",
    "Compressing reality...",
    "Expanding context window...",
    "Calculating emergent behavior...",
    "Pre-training on synthetic junk...",
    "Scaling laws in effect..."
];

const WIN_PHRASES = [
    "SUCCESS! VC Funding secured.",
    "JACKPOT! Emergent behavior detected.",
    "BINGO! Model is now sentient.",
    "WIN! Scaling laws are holding.",
    "PROFIT! Rebranding to .ai was a success."
];

const LOSS_PHRASES = [
    "ERROR: Mode collapse detected.",
    "FAILURE: Model hallucinated a win.",
    "COLLAPSE: Pivot to crypto required.",
    "STAGNATION: Weights failed to converge.",
    "BANKRUPT: Compute credits exhausted."
];

let state = {
    tokens: 1000,
    hypeLevel: 1.0,
    isSpinning: false,
    cost: 50
};

// DOM Elements
const tokenBalanceEl = document.getElementById('token-balance');
const hypeLevelEl = document.getElementById('hype-level');
const statusLogEl = document.getElementById('status-log');
const spinButton = document.getElementById('spin-button');
const reelStrips = [
    document.querySelector('#reel-1 .reel-strip'),
    document.querySelector('#reel-2 .reel-strip'),
    document.querySelector('#reel-3 .reel-strip')
];

function init() {
    setupReels();
    updateUI();
    spinButton.addEventListener('click', runInference);
}

function setupReels() {
    reelStrips.forEach(strip => {
        let html = '';
        // Create a long strip for scrolling effect
        for (let i = 0; i < 40; i++) {
            const sym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            html += `<div class="symbol">
                ${sym.char}
                <span class="symbol-name">${sym.name}</span>
            </div>`;
        }
        strip.innerHTML = html;
    });
}

function updateUI() {
    tokenBalanceEl.textContent = Math.floor(state.tokens);
    hypeLevelEl.textContent = state.hypeLevel.toFixed(1) + 'x';
    spinButton.disabled = state.isSpinning || state.tokens < state.cost;
}

function logMessage(msg, color = null) {
    const timestamp = new Date().toLocaleTimeString().split(' ')[0];
    const line = document.createElement('div');
    line.textContent = `[${timestamp}] ${msg}`;
    if (color) line.style.color = color;
    
    statusLogEl.prepend(line);
    if (statusLogEl.children.length > 5) {
        statusLogEl.removeChild(statusLogEl.lastChild);
    }
}

function getRandomSymbol() {
    const totalWeight = SYMBOLS.reduce((sum, sym) => sum + sym.weight, 0);
    let rand = Math.random() * totalWeight;
    for (const sym of SYMBOLS) {
        if (rand < sym.weight) return sym;
        rand -= sym.weight;
    }
    return SYMBOLS[SYMBOLS.length - 1];
}

async function runInference() {
    if (state.isSpinning || state.tokens < state.cost) return;

    state.isSpinning = true;
    state.tokens -= state.cost;
    updateUI();

    logMessage(SPIN_PHRASES[Math.floor(Math.random() * SPIN_PHRASES.length)]);
    document.querySelectorAll('.reel').forEach(r => r.classList.add('spinning'));
    document.querySelector('.win-line').classList.remove('win-flash');

    const results = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
    const symbolHeight = 150;
    
    const animations = reelStrips.map((strip, i) => {
        return new Promise(resolve => {
            const targetIndex = SYMBOLS.indexOf(results[i]);
            // Random number of full spins + target
            const extraSpins = 5 + (i * 2);
            const finalY = -((extraSpins * SYMBOLS.length + targetIndex) * symbolHeight) % (40 * symbolHeight);
            
            strip.style.transition = `transform ${2 + i * 0.5}s cubic-bezier(0.45, 0.05, 0.55, 0.95)`;
            strip.style.transform = `translateY(${finalY}px)`;
            
            setTimeout(() => {
                document.querySelector(`#reel-${i+1}`).classList.remove('spinning');
                resolve();
            }, 2000 + i * 500);
        });
    });

    await Promise.all(animations);

    evaluateResult(results);
    state.isSpinning = false;
    updateUI();
}

function evaluateResult(results) {
    const [r1, r2, r3] = results;
    
    // Check for win
    if (r1.char === r2.char && r2.char === r3.char) {
        const prize = r1.payout * state.hypeLevel;
        state.tokens += prize;
        state.hypeLevel += 0.5; // Success increases hype
        
        logMessage(WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)], '#ff00ff');
        document.querySelector('.win-line').classList.add('win-flash');
    } else {
        // Punitive logic for "PIVOT" symbol
        const pivots = results.filter(r => r.name === 'PIVOT').length;
        if (pivots > 0) {
            state.tokens += (pivots * -100);
            state.hypeLevel = Math.max(0.5, state.hypeLevel - 0.2);
            logMessage(`Pivoted to crypto! Lost ${pivots * 100} tokens.`, '#ff4444');
        } else {
            logMessage(LOSS_PHRASES[Math.floor(Math.random() * LOSS_PHRASES.length)], '#ff4444');
            state.hypeLevel = Math.max(1.0, state.hypeLevel - 0.05); // Minor hype decay on miss
        }
    }
}

// Start
init();
