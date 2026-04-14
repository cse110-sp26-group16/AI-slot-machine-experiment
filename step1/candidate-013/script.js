const SYMBOLS = [
    { icon: '✨', name: 'AGI', weight: 1, payout: 500 },
    { icon: '🧠', name: 'Neural Net', weight: 3, payout: 100 },
    { icon: '🖥️', name: 'GPU Cluster', weight: 4, payout: 50 },
    { icon: '🤖', name: 'AI Assistant', weight: 5, payout: 25 },
    { icon: '🗄️', name: 'Data Server', weight: 6, payout: 10 },
    { icon: '🐛', name: 'Bug', weight: 8, payout: 0 }
];

const COST_PER_SPIN = 10;
let tokens = 1000;
let isSpinning = false;

// DOM Elements
const tokenDisplay = document.getElementById('token-balance');
const spinBtn = document.getElementById('spin-btn');
const messageDisplay = document.getElementById('message');
const reels = [
    document.querySelector('#reel-1 .reel-strip'),
    document.querySelector('#reel-2 .reel-strip'),
    document.querySelector('#reel-3 .reel-strip')
];

// Generate weighted symbol pool
const symbolPool = [];
SYMBOLS.forEach(symbol => {
    for (let i = 0; i < symbol.weight; i++) {
        symbolPool.push(symbol);
    }
});

function getRandomSymbol() {
    const randomIndex = Math.floor(Math.random() * symbolPool.length);
    return symbolPool[randomIndex];
}

function initReels() {
    reels.forEach(reel => {
        reel.innerHTML = '';
        const initialSymbol = getRandomSymbol();
        const div = document.createElement('div');
        div.className = 'symbol';
        div.textContent = initialSymbol.icon;
        reel.appendChild(div);
        reel.dataset.currentSymbol = JSON.stringify(initialSymbol);
    });
}

function updateTokens(amount) {
    tokens += amount;
    tokenDisplay.textContent = tokens;
}

function setSystemMessage(msg) {
    messageDisplay.textContent = `> ${msg}`;
}

async function spinReel(reelIndex) {
    const reel = reels[reelIndex];
    reel.classList.add('spinning');
    
    // Total spins (visual only) - each reel spins slightly longer
    const spinCount = 20 + (reelIndex * 15); 
    const spinDuration = 50; // ms per symbol change
    
    return new Promise(resolve => {
        let currentSpin = 0;
        
        const spinInterval = setInterval(() => {
            const randomSymbol = getRandomSymbol();
            reel.innerHTML = `<div class="symbol">${randomSymbol.icon}</div>`;
            currentSpin++;
            
            if (currentSpin >= spinCount) {
                clearInterval(spinInterval);
                reel.classList.remove('spinning');
                const finalSymbol = getRandomSymbol();
                reel.innerHTML = `<div class="symbol">${finalSymbol.icon}</div>`;
                reel.dataset.currentSymbol = JSON.stringify(finalSymbol);
                resolve(finalSymbol);
            }
        }, spinDuration);
    });
}

async function executeSpin() {
    if (isSpinning) return;
    if (tokens < COST_PER_SPIN) {
        setSystemMessage("ERROR: INSUFFICIENT COMPUTE TOKENS.");
        return;
    }

    isSpinning = true;
    spinBtn.disabled = true;
    updateTokens(-COST_PER_SPIN);
    setSystemMessage("PROMPTING LLM... CALCULATING WEIGHTS...");

    // Spin all reels and wait for them to finish
    // We start them concurrently, but their duration is staggered via spinCount
    const results = await Promise.all([
        spinReel(0),
        spinReel(1),
        spinReel(2)
    ]);

    evaluateResults(results);

    isSpinning = false;
    spinBtn.disabled = false;
}

function evaluateResults(results) {
    const [s1, s2, s3] = results;

    if (s1.icon === s2.icon && s2.icon === s3.icon) {
        // 3 match
        const winAmount = s1.payout;
        if (s1.icon === '🐛') {
            setSystemMessage("FATAL ERROR! 3 BUGS DETECTED. SYSTEM CRASH IMMINENT.");
        } else {
            updateTokens(winAmount);
            if (s1.icon === '✨') {
                setSystemMessage(`AGI ACHIEVED! MAX PAYOUT: +${winAmount} TOKENS!`);
            } else {
                setSystemMessage(`PATTERN MATCHED: 3x ${s1.name.toUpperCase()}. +${winAmount} TOKENS.`);
            }
        }
    } else if (s1.icon === s2.icon || s2.icon === s3.icon || s1.icon === s3.icon) {
        // 2 match (consolation prize)
        const match = s1.icon === s2.icon ? s1 : (s2.icon === s3.icon ? s2 : s3);
        if (match.icon === '🐛') {
             setSystemMessage("HALLUCINATION DETECTED. CONTEXT DEGRADED.");
        } else {
            const consolation = Math.floor(match.payout * 0.2); // 20% payout
            updateTokens(consolation);
            setSystemMessage(`PARTIAL WEIGHT ALIGNMENT (2x ${match.name.toUpperCase()}). +${consolation} TOKENS.`);
        }
    } else {
        // Loss
        setSystemMessage("CONTEXT LIMIT EXCEEDED. ZERO GRADIENT. LOSS.");
    }
}

// Initialization
spinBtn.addEventListener('click', executeSpin);
initReels();
