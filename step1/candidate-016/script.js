const SYMBOLS = [
    { char: '🤖', name: 'AGI', weight: 1 },
    { char: '🔌', name: 'HALLUCINATION', weight: 5 },
    { char: '🔋', name: 'TOKEN', weight: 10 },
    { char: '🏢', name: 'VC FUNDING', weight: 3 },
    { char: '📉', name: 'MODEL COLLAPSE', weight: 5 },
    { char: '🧠', name: 'NEURAL NET', weight: 8 },
    { char: '🖥️', name: 'H100 GPU', weight: 2 }
];

const SPIN_PHRASES = [
    "Optimizing weights...",
    "Crawling the web...",
    "Tokenizing prompt...",
    "Scaling to 100T parameters...",
    "Refining safety filters...",
    "Aligning with human values...",
    "Pre-training foundation model...",
    "Fine-tuning on synthetic data...",
    "Calculating loss function..."
];

const WIN_PHRASES = [
    "JACKPOT! Emergent behavior detected.",
    "BINGO! Context window expanded by 128k.",
    "SUCCESS! Scaling laws are holding.",
    "WIN! Model is now self-improving.",
    "PROFIT! Venture Capitalists are knocking."
];

const LOSS_PHRASES = [
    "FAILURE: Model hallucinated a win but yielded nothing.",
    "ERROR: Rate limit exceeded (Metaphorically).",
    "LOSS: Token budget depleted by useless inference.",
    "COLLAPSE: Mode collapse detected in output.",
    "STAGNATION: Weights failed to converge."
];

let state = {
    tokens: 1000,
    contextWindow: 0,
    isSpinning: false,
    reelStates: [0, 0, 0]
};

const spinButton = document.getElementById('spin-button');
const tokenBalanceEl = document.getElementById('token-balance');
const contextWindowEl = document.getElementById('context-window');
const statusLogEl = document.getElementById('status-log');
const reelStrips = [
    document.getElementById('reel1').querySelector('.reel-strip'),
    document.getElementById('reel2').querySelector('.reel-strip'),
    document.getElementById('reel3').querySelector('.reel-strip')
];

// Initialize Reels
function initReels() {
    reelStrips.forEach((strip, index) => {
        // Create a long strip of random symbols
        let html = '';
        // We add many symbols for the "scrolling" effect
        for (let i = 0; i < 50; i++) {
            const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            html += `<div class="symbol">${symbol.char}<span class="symbol-name">${symbol.name}</span></div>`;
        }
        strip.innerHTML = html;
        // Set initial position
        strip.style.transform = `translateY(0px)`;
    });
}

function updateUI() {
    tokenBalanceEl.textContent = state.tokens;
    contextWindowEl.textContent = state.contextWindow;
    spinButton.disabled = state.isSpinning || state.tokens < 50;
}

function logMessage(msg, color = '#00ff00') {
    statusLogEl.textContent = msg;
    statusLogEl.style.color = color;
}

function getRandomSymbolIndex() {
    // Weighted random selection
    const totalWeight = SYMBOLS.reduce((acc, sym) => acc + sym.weight, 0);
    let random = Math.random() * totalWeight;
    for (let i = 0; i < SYMBOLS.length; i++) {
        if (random < SYMBOLS[i].weight) return i;
        random -= SYMBOLS[i].weight;
    }
    return 0;
}

async function spin() {
    if (state.isSpinning || state.tokens < 50) return;

    state.isSpinning = true;
    state.tokens -= 50;
    updateUI();

    logMessage(SPIN_PHRASES[Math.floor(Math.random() * SPIN_PHRASES.length)]);
    document.querySelectorAll('.reel').forEach(r => r.classList.add('spinning'));

    const results = [
        getRandomSymbolIndex(),
        getRandomSymbolIndex(),
        getRandomSymbolIndex()
    ];

    const symbolHeight = 150;
    const stripLength = 50;

    // Trigger animations with different delays
    const animations = reelStrips.map((strip, i) => {
        return new Promise(resolve => {
            // Calculate a position that ends on the result symbol
            // We want to scroll past many symbols first
            const rounds = 5 + (i * 2); 
            const finalPos = -((rounds * SYMBOLS.length + results[i]) % (stripLength - 1)) * symbolHeight;
            
            strip.style.transition = `transform ${2 + i * 0.5}s cubic-bezier(0.45, 0.05, 0.55, 0.95)`;
            strip.style.transform = `translateY(${finalPos}px)`;
            
            setTimeout(() => {
                document.getElementById(`reel${i+1}`).classList.remove('spinning');
                resolve();
            }, 2000 + i * 500);
        });
    });

    await Promise.all(animations);

    state.isSpinning = false;
    evaluateResult(results);
    updateUI();
}

function evaluateResult(results) {
    const s1 = SYMBOLS[results[0]];
    const s2 = SYMBOLS[results[1]];
    const s3 = SYMBOLS[results[2]];

    if (s1.char === s2.char && s2.char === s3.char) {
        // Win!
        let prize = 0;
        switch(s1.char) {
            case '🤖': prize = 1000; break; // AGI
            case '🖥️': prize = 500; break;  // GPU
            case '🏢': prize = 250; break;  // VC
            case '🧠': prize = 150; break;  // Neural
            case '🔋': prize = 100; break;  // Token
            case '📉': prize = 50; break;   // Collapse
            case '🔌': prize = 20; break;   // Hallucination
        }
        
        state.tokens += prize;
        state.contextWindow += prize * 10;
        logMessage(WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)], '#ff00ff');
    } else {
        // Loss
        logMessage(LOSS_PHRASES[Math.floor(Math.random() * LOSS_PHRASES.length)], '#ff3333');
    }
}

spinButton.addEventListener('click', spin);

// Start the simulation
initReels();
updateUI();
logMessage("SYSTEM READY. INITIALIZING WEIGHTS...");
