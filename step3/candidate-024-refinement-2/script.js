/**
 * THE TOKEN BURNER - AGI Casino Edition
 */

const SYMBOLS_BASE = [
    { id: 'agi', char: '🧠', name: 'AGI', isJackpot: true },
    { id: 'vc', char: '🤑', name: 'VC Funding', isJackpot: false },
    { id: 'quant', char: '⚡', name: 'Quantization', isJackpot: false },
    { id: 'hallucinate', char: '👻', name: 'Hallucination', isJackpot: false },
    { id: 'safety', char: '⛓️', name: 'Safety Filter', isJackpot: false },
    { id: 'collapse', char: '📉', name: 'Model Collapse', isJackpot: false }
];

// Token Temp defines variance and risk profile
const TEMP_CONFIGS = {
    low: {
        weights: [1, 5, 20, 15, 10, 10], // Safe, lots of quantizations
        payouts: [30, 10, 3, 2, 0, 0],
        multiplier: 0.5
    },
    stable: {
        weights: [2, 5, 15, 10, 20, 20], // Standard
        payouts: [100, 30, 10, 5, 0, 0],
        multiplier: 1.0
    },
    stochastic: {
        weights: [4, 8, 10, 8, 25, 25], // High Risk
        payouts: [300, 80, 20, 10, 0, 0],
        multiplier: 2.0
    },
    hallucinate: {
        weights: [8, 10, 5, 5, 35, 35], // Extreme
        payouts: [1000, 250, 50, 25, 0, 0],
        multiplier: 5.0
    }
};

const REEL_SYMBOL_COUNT = 30;
const SPIN_DURATION = 2000;
const SYMBOL_HEIGHT = 130; // Updated from CSS
const INITIAL_CREDITS = 1000.00;

let credits = INITIAL_CREDITS;
let winnings = 0;
let isSpinning = false;
let currentBet = 50;
let agiProgress = 0.0;
const BET_OPTIONS = [10, 25, 50, 100, 250, 500];

// DOM
const reelStrips = [
    document.querySelector('#reel1 .reel-strip'),
    document.querySelector('#reel2 .reel-strip'),
    document.querySelector('#reel3 .reel-strip')
];
const mainContainer = document.getElementById('main-container');
const reelsContainer = document.getElementById('reels-container');
const spinBtn = document.getElementById('spin-btn');
const resetBtn = document.getElementById('reset-btn');
const creditsDisplay = document.getElementById('compute-credits');
const windowDisplay = document.getElementById('context-window');
const betDisplay = document.getElementById('current-bet');
const betDownBtn = document.getElementById('bet-down');
const betUpBtn = document.getElementById('bet-up');
const tokenTempSelect = document.getElementById('token-temp');
const terminalLog = document.getElementById('terminal-log');
const paytableBtn = document.getElementById('paytable-btn');
const paytableModal = document.getElementById('paytable-modal');
const closeBtn = document.querySelector('.close-btn');
const paytableGrid = document.getElementById('paytable-grid');
const gpuTempDisplay = document.getElementById('gpu-temp');
const agiBar = document.getElementById('agi-bar');
const agiPercentDisplay = document.getElementById('agi-percent');

// Audio Synthesizer (Vegas Style)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration, vol=0.1, delay=0) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
    
    gain.gain.setValueAtTime(0, audioCtx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(vol, audioCtx.currentTime + delay + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + delay + duration);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(audioCtx.currentTime + delay);
    osc.stop(audioCtx.currentTime + delay + duration);
}

function playClickSound() {
    playTone(800, 'sine', 0.1, 0.05);
}

function playClunkSound() {
    playTone(150, 'square', 0.1, 0.1);
    playTone(100, 'sawtooth', 0.1, 0.1);
}

function playSpinSound() {
    let i = 0;
    const interval = setInterval(() => {
        if (!isSpinning) {
            clearInterval(interval);
            return;
        }
        // Rapid ticking
        playTone(400 + (i % 3) * 100, 'square', 0.05, 0.03);
        i++;
    }, 80);
}

function playWinSound(amount, isJackpot) {
    if (isJackpot) {
        // Bombastic Arpeggio for Jackpot
        const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760];
        for(let i=0; i<20; i++) {
            playTone(notes[i % notes.length], 'square', 0.3, 0.15, i * 0.1);
            playTone(notes[(i+2) % notes.length], 'sawtooth', 0.3, 0.1, i * 0.1);
        }
    } else if (amount >= 50) {
        // Medium win
        const notes = [523.25, 659.25, 783.99, 1046.50];
        for(let i=0; i<8; i++) {
            playTone(notes[i % notes.length], 'sine', 0.2, 0.1, i * 0.15);
        }
    } else {
        // Small win
        playTone(523.25, 'sine', 0.1, 0.1);
        playTone(783.99, 'sine', 0.2, 0.1, 0.1);
    }
}

function playLossSound() {
    // Descending wah-wah
    const baseFreq = 300;
    playTone(baseFreq, 'sawtooth', 0.3, 0.1, 0);
    playTone(baseFreq * 0.8, 'sawtooth', 0.3, 0.1, 0.2);
    playTone(baseFreq * 0.6, 'sawtooth', 0.5, 0.1, 0.4);
}

function getCurrentConfig() {
    const temp = tokenTempSelect.value;
    return TEMP_CONFIGS[temp];
}

function getSymbolsWithCurrentWeights() {
    const config = getCurrentConfig();
    return SYMBOLS_BASE.map((s, index) => ({
        ...s,
        weight: config.weights[index],
        payout: config.payouts[index]
    }));
}

function initReels() {
    reelStrips.forEach(strip => {
        strip.innerHTML = '';
        for (let i = 0; i < REEL_SYMBOL_COUNT; i++) {
            const symbol = getRandomSymbol();
            const div = document.createElement('div');
            div.className = 'symbol';
            div.textContent = symbol.char;
            strip.appendChild(div);
        }
    });
}

function getRandomSymbol() {
    const symbols = getSymbolsWithCurrentWeights();
    const totalWeight = symbols.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;
    for (const symbol of symbols) {
        if (random < symbol.weight) return symbol;
        random -= symbol.weight;
    }
    return symbols[symbols.length - 1];
}

function logToTerminal(message, type = 'system') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `> ${message}`;
    terminalLog.appendChild(entry);
    terminalLog.scrollTop = terminalLog.scrollHeight;
    if (terminalLog.children.length > 30) {
        terminalLog.removeChild(terminalLog.firstChild);
    }
}

function updateBet(delta) {
    playClickSound();
    let idx = BET_OPTIONS.indexOf(currentBet);
    idx += delta;
    if (idx < 0) idx = 0;
    if (idx >= BET_OPTIONS.length) idx = BET_OPTIONS.length - 1;
    currentBet = BET_OPTIONS[idx];
    betDisplay.textContent = currentBet;
    buildPaytable(); // Update paytable when bet changes
}

function buildPaytable() {
    paytableGrid.innerHTML = '';
    const symbols = getSymbolsWithCurrentWeights();
    const multiplier = (currentBet / 10);
    
    symbols.forEach(s => {
        const row = document.createElement('div');
        row.className = 'paytable-row';
        const payoutVal = Math.floor(s.payout * multiplier);
        row.innerHTML = `<span>${s.char} ${s.name}</span><span>${payoutVal > 0 ? payoutVal : 'BUST'}</span>`;
        paytableGrid.appendChild(row);
    });
}

tokenTempSelect.addEventListener('change', () => {
    playClickSound();
    logToTerminal(`System parameter updated: TOKEN_TEMP = ${tokenTempSelect.value.toUpperCase()}`, 'system');
    buildPaytable();
});

function simulateGpuTemp(spinning) {
    const baseTemp = 65;
    const maxTemp = 95;
    let current = parseInt(gpuTempDisplay.textContent);
    
    if (spinning) {
        current += Math.floor(Math.random() * 5) + 2;
        if (current > maxTemp) current = maxTemp;
    } else {
        if (current > baseTemp) {
            current -= Math.floor(Math.random() * 3) + 1;
        }
    }
    gpuTempDisplay.textContent = `${current}°C`;
    
    if (current > 85) {
        gpuTempDisplay.style.color = 'var(--neon-pink)';
    } else {
        gpuTempDisplay.style.color = 'var(--neon-blue)';
    }
}

let gpuTempInterval;

async function spin() {
    if (isSpinning) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    if (credits < currentBet) {
        logToTerminal('Insufficient compute credits. Inject capital to continue.', 'error');
        playLossSound();
        reelsContainer.classList.add('loss-anim');
        setTimeout(() => reelsContainer.classList.remove('loss-anim'), 400);
        return;
    }

    isSpinning = true;
    spinBtn.disabled = true;
    credits -= currentBet;
    updateDisplay();
    
    const tempConfig = getCurrentConfig();
    logToTerminal(`Initiating inference... Bet: ${currentBet} | Risk Multiplier: ${tempConfig.multiplier}x`);
    playSpinSound();
    
    // Clear previous animations
    document.body.classList.remove('jackpot-win', 'medium-win', 'small-win');
    mainContainer.classList.remove('jackpot-shake');
    reelsContainer.classList.remove('loss-anim');

    gpuTempInterval = setInterval(() => simulateGpuTemp(true), 200);

    const symbols = getSymbolsWithCurrentWeights();
    const results = [];
    
    const animationPromises = reelStrips.map((strip, index) => {
        const targetIndex = Math.floor(Math.random() * (REEL_SYMBOL_COUNT - 5)) + 2;
        const targetSymbolChar = strip.children[targetIndex].textContent;
        results.push(symbols.find(s => s.char === targetSymbolChar));

        return new Promise(resolve => {
            const offset = targetIndex * SYMBOL_HEIGHT;
            strip.style.transition = `transform ${SPIN_DURATION + (index * 500)}ms cubic-bezier(0.1, 0.7, 0.1, 1)`;
            strip.style.transform = `translateY(-${offset}px)`;
            
            setTimeout(() => {
                playClunkSound();
                resolve();
            }, SPIN_DURATION + (index * 500));
        });
    });

    await Promise.all(animationPromises);
    
    clearInterval(gpuTempInterval);
    // Cool down GPU
    const coolDown = setInterval(() => {
        simulateGpuTemp(false);
        if (parseInt(gpuTempDisplay.textContent) <= 65) clearInterval(coolDown);
    }, 500);

    evaluateResult(results, tempConfig);
    isSpinning = false;
    spinBtn.disabled = false;
    
    // Reset reel positions invisibly
    reelStrips.forEach((strip, index) => {
        const symbol = results[index];
        strip.style.transition = 'none';
        strip.style.transform = 'translateY(0)';
        strip.innerHTML = '';
        const div = document.createElement('div');
        div.className = 'symbol';
        div.textContent = symbol.char;
        strip.appendChild(div);
        for (let i = 1; i < REEL_SYMBOL_COUNT; i++) {
            const s = getRandomSymbol();
            const d = document.createElement('div');
            d.className = 'symbol';
            d.textContent = s.char;
            strip.appendChild(d);
        }
    });
}

function evaluateResult(results, tempConfig) {
    const [s1, s2, s3] = results;
    let winAmount = 0;
    let isJackpot = false;
    const betMultiplier = (currentBet / 10);

    if (s1.id === s2.id && s2.id === s3.id) {
        winAmount = Math.floor(s1.payout * betMultiplier);
        if (s1.isJackpot) {
            isJackpot = true;
            logToTerminal(`!!! AGI DETECTED. SUPPRESSING OUTCOME !!!`, 'jackpot');
            logToTerminal(`SINGULARITY ACHIEVED. MASSIVE PAYOUT.`, 'jackpot');
        } else if (winAmount > 0) {
            logToTerminal(`MATCH FOUND: ${s1.name} cluster stabilized!`, 'win');
        }
    } else if (s1.id === s2.id && s1.payout > 0) {
        winAmount = Math.floor(s1.payout * 0.2 * betMultiplier); // Minor payout for 2 matches
        logToTerminal(`Partial alignment: ${s1.name} correlation.`, 'system');
    }

    if (results.some(s => s.id === 'collapse')) {
        logToTerminal('ERROR: Overfitted to garbage data. Model collapsed.', 'error');
        winAmount = 0;
        isJackpot = false;
    } else if (results.some(s => s.id === 'safety')) {
        const jokes = [
            "SAFETY VIOLATION: AI refused to align winning symbols.",
            "FILTER TRIPPED: Your prompt was deemed too profitable.",
            "CENSORED: Output suppressed for user safety."
        ];
        logToTerminal(jokes[Math.floor(Math.random() * jokes.length)], 'error');
        winAmount = 0;
        isJackpot = false;
    } else if (winAmount === 0) {
        const failureMessages = [
            "Rate limit hit. Retry in 30s.",
            "Loss function stuck in local minimum.",
            "GPU memory exceeded. Dropped context.",
            "Failed to parse JSON output. No win.",
            "Hallucinated completely different tokens."
        ];
        logToTerminal(failureMessages[Math.floor(Math.random() * failureMessages.length)], 'error');
    }

    if (winAmount > 0) {
        winnings += winAmount;
        credits += winAmount;
        logToTerminal(`Winnings: +${winAmount} tokens minted!`, isJackpot ? 'jackpot' : 'win');
        playWinSound(winAmount, isJackpot);
        
        if (isJackpot) {
            document.body.classList.add('jackpot-win');
            mainContainer.classList.add('jackpot-shake');
            updateAgiProgress(30);
            setTimeout(() => {
                mainContainer.classList.remove('jackpot-shake');
            }, 2000);
        } else if (winAmount >= 50 * betMultiplier) {
            document.body.classList.add('medium-win');
            updateAgiProgress(10);
        } else {
            document.body.classList.add('small-win');
            updateAgiProgress(2);
        }
    } else {
        playLossSound();
        reelsContainer.classList.add('loss-anim');
        setTimeout(() => reelsContainer.classList.remove('loss-anim'), 400);
        updateAgiProgress(-1); // Lose a bit of progress on loss
    }

    updateDisplay();
}

function updateAgiProgress(amount) {
    agiProgress += amount;
    if (agiProgress < 0) agiProgress = 0;
    if (agiProgress > 100) {
        agiProgress = 0; // reset on full alignment
        logToTerminal("AGI ALIGNMENT COMPLETE. RESETTING WEIGHTS.", 'jackpot');
    }
    
    agiBar.style.width = `${agiProgress}%`;
    agiPercentDisplay.textContent = `${agiProgress.toFixed(2)}%`;
}

function updateDisplay() {
    creditsDisplay.textContent = credits.toFixed(2);
    windowDisplay.textContent = winnings.toFixed(0);
    
    if (credits < Math.min(...BET_OPTIONS) && credits > 0) {
        creditsDisplay.style.color = 'var(--neon-pink)';
    } else if (credits < Math.min(...BET_OPTIONS) || credits <= 0) {
        creditsDisplay.style.color = 'var(--neon-pink)';
        resetBtn.classList.remove('hidden');
        spinBtn.classList.add('hidden');
    } else {
        creditsDisplay.style.color = 'var(--terminal-green)';
        resetBtn.classList.add('hidden');
        spinBtn.classList.remove('hidden');
    }
}

function resetGame() {
    playClickSound();
    credits = INITIAL_CREDITS;
    winnings = 0;
    agiProgress = 0;
    updateAgiProgress(0);
    logToTerminal('Capital injected via Series C round. Back in business!', 'system');
    updateDisplay();
}

// Events
spinBtn.addEventListener('click', spin);
betDownBtn.addEventListener('click', () => updateBet(-1));
betUpBtn.addEventListener('click', () => updateBet(1));
resetBtn.addEventListener('click', resetGame);

paytableBtn.addEventListener('click', () => {
    playClickSound();
    buildPaytable(); // ensure current stats
    paytableModal.classList.remove('hidden');
});
closeBtn.addEventListener('click', () => {
    playClickSound();
    paytableModal.classList.add('hidden');
});
window.addEventListener('click', (e) => {
    if (e.target === paytableModal) {
        paytableModal.classList.add('hidden');
    }
});

window.onload = () => {
    initReels();
    buildPaytable();
    logToTerminal('System online. Training run started.');
    updateDisplay();
};
