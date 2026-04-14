// Configuration
const SYMBOLS = [
    { icon: '⚡', name: 'H100', weight: 1, payout: 100 },
    { icon: '🔗', name: 'CUDA', weight: 3, payout: 20 },
    { icon: '🔥', name: 'PyTorch', weight: 5, payout: 10 },
    { icon: '🪙', name: 'Token', weight: 10, payout: 5 },
    { icon: '😵', name: 'Hallucination', weight: 2, payout: 0 }, // Special: Wild/Chaos
    { icon: '🚫', name: 'OOM', weight: 2, payout: -1 } // Special: Loss
];

const REEL_COUNT = 3;
const SYMBOLS_PER_REEL = 20; // Length of the strip for spinning
const SYMBOL_HEIGHT = 128; // Matches CSS

// State
let balance = 1000;
let currentBet = 10;
let isSpinning = false;

// DOM Elements
const balanceDisplay = document.getElementById('balance');
const currentBetDisplay = document.getElementById('current-bet');
const messageDisplay = document.getElementById('message');
const logDisplay = document.getElementById('log-display');
const spinBtn = document.getElementById('spin-btn');
const betIncBtn = document.getElementById('bet-inc');
const betDecBtn = document.getElementById('bet-dec');
const strips = [
    document.getElementById('strip-1'),
    document.getElementById('strip-2'),
    document.getElementById('strip-3')
];

// Initialize
function init() {
    setupReels();
    updateUI();
    addEventListeners();
}

function setupReels() {
    strips.forEach((strip, index) => {
        strip.innerHTML = '';
        // Create initial strip
        for (let i = 0; i < 5; i++) {
            const symbol = getRandomSymbol();
            strip.appendChild(createSymbolElement(symbol));
        }
    });
}

function getRandomSymbol() {
    const totalWeight = SYMBOLS.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;
    for (const symbol of SYMBOLS) {
        if (random < symbol.weight) return symbol;
        random -= symbol.weight;
    }
    return SYMBOLS[0];
}

function createSymbolElement(symbol) {
    const div = document.createElement('div');
    div.className = 'symbol';
    div.innerHTML = symbol.icon;
    div.dataset.name = symbol.name;
    return div;
}

function updateUI() {
    balanceDisplay.textContent = Math.floor(balance);
    currentBetDisplay.textContent = currentBet;
    spinBtn.disabled = isSpinning || balance < currentBet;
    betIncBtn.disabled = isSpinning || balance < currentBet + 10;
    betDecBtn.disabled = isSpinning || currentBet <= 10;
}

function addLog(text, type = '') {
    const div = document.createElement('div');
    div.className = `log-line ${type}`;
    div.textContent = `> ${text}`;
    logDisplay.prepend(div);
    if (logDisplay.childNodes.length > 50) logDisplay.lastChild.remove();
}

async function spin() {
    if (isSpinning || balance < currentBet) return;

    isSpinning = true;
    balance -= currentBet;
    updateUI();
    
    addLog(`Deducting ${currentBet} credits for inference...`, 'error');
    messageDisplay.textContent = 'RUNNING STOCHASTIC GRADIENT DESCENT...';
    
    const results = [];
    
    // Animate each reel
    const spinPromises = strips.map((strip, i) => {
        return new Promise(resolve => {
            const finalSymbols = [];
            // Generate symbols for the spin animation
            for (let j = 0; j < SYMBOLS_PER_REEL; j++) {
                finalSymbols.push(getRandomSymbol());
            }
            
            // The first one is the actual result (it will end up at index 0 after prepending)
            const result = finalSymbols[0];
            results.push(result);

            // Prepend new symbols to the strip so they appear "above" the current view
            finalSymbols.reverse().forEach(s => {
                strip.prepend(createSymbolElement(s));
            });

            // Calculate offset to start from (the bottom of the new symbols)
            const offset = (SYMBOLS_PER_REEL) * SYMBOL_HEIGHT;
            
            // Reset transition for instant jump to the "top" of the new symbols
            strip.style.transition = 'none';
            strip.style.transform = `translateY(-${offset}px)`;
            
            // Force reflow
            strip.offsetHeight;

            // Animate to 0 (the result symbol)
            strip.style.transition = `transform ${2 + i * 0.5}s cubic-bezier(0.1, 0, 0.1, 1)`;
            strip.style.transform = 'translateY(0)';

            setTimeout(() => {
                // Cleanup old symbols below to prevent DOM bloat
                while (strip.children.length > 5) {
                    strip.lastChild.remove();
                }
                resolve();
            }, (2 + i * 0.5) * 1000);
        });
    });

    await Promise.all(spinPromises);
    
    evaluateResults(results);
    isSpinning = false;
    updateUI();
}

function evaluateResults(results) {
    const names = results.map(r => r.name);
    addLog(`Result: [${names.join(' | ')}]`);

    // Check for OOM (Special Loss)
    if (names.includes('OOM')) {
        const oomCount = names.filter(n => n === 'OOM').length;
        const loss = currentBet * oomCount;
        balance = Math.max(0, balance - loss);
        messageDisplay.textContent = 'OUT OF MEMORY ERROR! CREDITS PURGED.';
        addLog(`CRITICAL ERROR: CUDA_OUT_OF_MEMORY. Purged ${loss} credits.`, 'error');
        return;
    }

    // Check for Hallucinations (Wild/Chaos)
    const hallucinationCount = names.filter(n => n === 'Hallucination').length;
    if (hallucinationCount > 0) {
        if (Math.random() < 0.2) {
            const chaos = Math.floor(Math.random() * currentBet * 5);
            balance -= chaos;
            messageDisplay.textContent = 'MODEL COLLAPSE: NEGATIVE HALLUCINATION.';
            addLog(`WARNING: Model hallucinated a debt of ${chaos} credits.`, 'error');
            return;
        }
        addLog('Hallucination detected. Re-routing attention weights...');
    }

    // Basic Wins
    let winAmount = 0;
    
    // Three of a kind
    if (names[0] === names[1] && names[1] === names[2]) {
        const symbol = results[0];
        winAmount = symbol.payout * currentBet;
        messageDisplay.textContent = `SUCCESSFUL INFERENCE! +${winAmount}`;
        addLog(`GLOBAL MINIMA FOUND. Reward: ${winAmount} credits.`, 'success');
    } 
    // Two of a kind (starting from left)
    else if (names[0] === names[1] || names[1] === names[2]) {
        const symbol = names[0] === names[1] ? results[0] : results[1];
        if (symbol.payout > 0) {
            winAmount = Math.floor(symbol.payout * currentBet * 0.5);
            messageDisplay.textContent = `PARTIAL CONVERGENCE: +${winAmount}`;
            addLog(`Local optima found. Reward: ${winAmount} credits.`, 'success');
        }
    } else {
        messageDisplay.textContent = 'INFERENCE FAILED: MODEL OUTPUT NOISE.';
        addLog('Inference complete. Accuracy: 0.0001%');
    }

    // Hallucination Bonus (Wild replacement)
    if (hallucinationCount > 0 && winAmount > 0) {
        const bonus = winAmount * hallucinationCount;
        winAmount += bonus;
        addLog(`Hallucination boosted output by ${bonus}!`, 'success');
    }

    balance += winAmount;
}

function addEventListeners() {
    spinBtn.addEventListener('click', () => {
        spin();
    });

    betIncBtn.addEventListener('click', () => {
        if (balance >= currentBet + 10) {
            currentBet += 10;
            updateUI();
        }
    });

    betDecBtn.addEventListener('click', () => {
        if (currentBet > 10) {
            currentBet -= 10;
            updateUI();
        }
    });

    // Random technical jargon logs
    setInterval(() => {
        if (!isSpinning) {
            const jargon = [
                "Adjusting learning rate to 1e-5...",
                "Quantizing to 4-bit for efficiency...",
                "Pruning redundant neurons...",
                "Scraping more training data (legally grey)...",
                "Cooling fans at 80%...",
                "Awaiting H100 shipment...",
                "Optimizing attention heads...",
                "Backpropagating errors..."
            ];
            addLog(jargon[Math.floor(Math.random() * jargon.length)]);
            
            // Random temp fluctuations
            document.getElementById('gpu-temp').textContent = `GPU: ${40 + Math.floor(Math.random() * 40)}°C`;
            document.getElementById('vram-usage').textContent = `VRAM: ${Math.floor(Math.random() * 80)}/80GB`;
        }
    }, 5000);
}

// Start the engine
init();
