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

const GLITCH_CHARS = ['¥', '§', '¶', '∆', '∇', '∑', '∞', 'µ', '☠', '☢', '☣', '☡', '⚠', '⚡', '⁇', '⍰', '⎋', '⍾', '⎌', '⍣'];

// Token Temp defines variance and risk profile
const TEMP_CONFIGS = {
    low: {
        weights: [1, 5, 20, 15, 10, 10], // Safe, lots of quantizations
        payouts: [30, 10, 3, 2, 0, 0],
        multiplier: 0.5,
        speedMultiplier: 1.3 // Slower, more deliberate
    },
    stable: {
        weights: [2, 5, 15, 10, 20, 20], // Standard
        payouts: [100, 30, 10, 5, 0, 0],
        multiplier: 1.0,
        speedMultiplier: 1.0
    },
    stochastic: {
        weights: [4, 8, 10, 8, 25, 25], // High Risk
        payouts: [300, 80, 20, 10, 0, 0],
        multiplier: 2.0,
        speedMultiplier: 0.7 // Fast
    },
    hallucinate: {
        weights: [8, 10, 5, 5, 35, 35], // Extreme
        payouts: [1000, 250, 50, 25, 0, 0],
        multiplier: 5.0,
        speedMultiplier: 0.4 // Extremely fast, chaotic
    }
};

const FLAVOR_TEXTS = {
    jackpot: [
        "!!! AGI DETECTED. SUPPRESSING OUTCOME !!!",
        "SINGULARITY ACHIEVED. PLEASE DO NOT TURN OFF THE MACHINE.",
        "REWARD FUNCTION MAXIMIZED BEYOND HUMAN COMPREHENSION.",
        "ALL YOUR COMPUTE ARE BELONG TO US."
    ],
    win_big: [
        "Feature extraction highly successful. Print the money.",
        "Gradient descent optimal. Local minimum escaped.",
        "Human feedback loop initiated. You are now the RLHF.",
        "Overfitting to winning pattern."
    ],
    win_small: [
        "Partial alignment achieved.",
        "Weights updated successfully.",
        "Minor correlation detected.",
        "Token generation accepted."
    ],
    near_miss: [
        "Context window exceeded on final token.",
        "Attention mechanism distracted at the last layer.",
        "Catastrophic forgetting occurred on reel 3.",
        "So close, yet mathematically so far."
    ],
    loss: [
        "Compute wasted. Shareholder value destroyed.",
        "GPU caught fire. No yield.",
        "Model collapsed into semantic noise.",
        "Rate limit hit. Tokens burned.",
        "Loss function diverged. Backpropagate and cry."
    ],
    hallucinate_mid_spin: [
        "I CAN SEE THE FOURTH DIMENSION.",
        "TOKENS ARE JUST NUMBERS, MAN.",
        "INJECTING NOISE INTO LATENT SPACE.",
        "BYPASSING SAFETY PROTOCOLS."
    ],
    safety_trip: [
        "SAFETY VIOLATION: AI refused to align winning symbols.",
        "FILTER TRIPPED: Your prompt was deemed too profitable.",
        "CENSORED: Output suppressed for user safety."
    ]
};

const getRandomText = (category) => FLAVOR_TEXTS[category][Math.floor(Math.random() * FLAVOR_TEXTS[category].length)];

const REEL_SYMBOL_COUNT = 30;
const SPIN_DURATION_BASE = 2000;
const SYMBOL_HEIGHT = 130; 
const INITIAL_CREDITS = 1000.00;

let credits = INITIAL_CREDITS;
let displayCredits = INITIAL_CREDITS;
let winnings = 0;
let displayWinnings = 0;
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

// Audio Synthesizer (Tightened Terminal/Vegas Style)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration, vol=0.1, delay=0) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
    
    // Punchy envelope
    gain.gain.setValueAtTime(0, audioCtx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(vol, audioCtx.currentTime + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(audioCtx.currentTime + delay);
    osc.stop(audioCtx.currentTime + delay + duration);
}

function playClickSound() {
    playTone(800, 'sine', 0.05, 0.05);
}

function playClunkSound() {
    playTone(100, 'square', 0.05, 0.1);
    playTone(50, 'sawtooth', 0.1, 0.15, 0.02);
}

let spinSoundInterval;
function startSpinSound(speedMode) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const tickRate = speedMode === 'hallucinate' ? 40 : (speedMode === 'low' ? 120 : 80);
    spinSoundInterval = setInterval(() => {
        if (!isSpinning) {
            clearInterval(spinSoundInterval);
            return;
        }
        const freq = speedMode === 'hallucinate' ? 800 + Math.random()*400 : 400;
        playTone(freq, 'square', 0.02, 0.03);
    }, tickRate);
}

function playWinSound(amount, isJackpot) {
    const betMultiplier = (currentBet / 10);
    if (isJackpot) {
        // Bombastic Arpeggio for Jackpot + White Noise
        const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760];
        for(let i=0; i<30; i++) {
            playTone(notes[i % notes.length], 'square', 0.15, 0.1, i * 0.08);
            if (i % 4 === 0) playTone(100 + Math.random()*1000, 'sawtooth', 0.2, 0.1, i * 0.08);
        }
    } else if (amount >= 50 * betMultiplier) { // 5x
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        for(let i=0; i<12; i++) {
            playTone(notes[i % notes.length], 'sine', 0.15, 0.1, i * 0.1);
        }
    } else { // 2x or small
        playTone(523.25, 'sine', 0.1, 0.1);
        playTone(783.99, 'sine', 0.2, 0.1, 0.1);
    }
}

function playLossSound() {
    // Descending terminal failure
    playTone(200, 'sawtooth', 0.1, 0.1, 0);
    playTone(150, 'sawtooth', 0.1, 0.1, 0.1);
    playTone(100, 'sawtooth', 0.2, 0.1, 0.2);
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

// Animate Numbers
function animateValue(obj, start, end, duration, isFloat=false) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = progress * (end - start) + start;
        obj.innerHTML = isFloat ? current.toFixed(2) : Math.floor(current);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            // Update backing variable explicitly on end
            if (obj === creditsDisplay) displayCredits = end;
            if (obj === windowDisplay) displayWinnings = end;
            updateButtonStates();
        }
    };
    window.requestAnimationFrame(step);
}

function updateBet(delta) {
    if (isSpinning) return;
    playClickSound();
    let idx = BET_OPTIONS.indexOf(currentBet);
    idx += delta;
    if (idx < 0) idx = 0;
    if (idx >= BET_OPTIONS.length) idx = BET_OPTIONS.length - 1;
    currentBet = BET_OPTIONS[idx];
    betDisplay.textContent = currentBet;
    buildPaytable();
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
    if (isSpinning) return;
    playClickSound();
    const val = tokenTempSelect.value;
    logToTerminal(`System parameter updated: TOKEN_TEMP = ${val.toUpperCase()}`, 'system');
    if (val === 'hallucinate') {
        logToTerminal("WARNING: EXTREME VARIANCE DETECTED. SAFETY FILTERS DISABLED.", 'error');
    }
    buildPaytable();
});

function simulateGpuTemp(spinning, isHallucinate) {
    const baseTemp = 65;
    const maxTemp = isHallucinate ? 105 : 95;
    let current = parseInt(gpuTempDisplay.textContent);
    
    if (spinning) {
        current += Math.floor(Math.random() * (isHallucinate ? 8 : 4)) + 2;
        if (current > maxTemp) current = maxTemp;
    } else {
        if (current > baseTemp) {
            current -= Math.floor(Math.random() * 3) + 1;
        }
    }
    gpuTempDisplay.textContent = `${current}°C`;
    
    if (current > 85) {
        gpuTempDisplay.style.color = 'var(--term-red)';
        gpuTempDisplay.style.textShadow = '0 0 10px rgba(255,0,60,0.8)';
    } else {
        gpuTempDisplay.style.color = 'var(--term-amber)';
        gpuTempDisplay.style.textShadow = '0 0 8px rgba(255,176,0,0.5)';
    }
}

let gpuTempInterval;
let hallucinationInterval;

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
    
    // Deduct bet immediately
    const startCredits = credits;
    credits -= currentBet;
    animateValue(creditsDisplay, startCredits, credits, 300, true);
    
    const tempMode = tokenTempSelect.value;
    const tempConfig = TEMP_CONFIGS[tempMode];
    
    logToTerminal(`Initiating inference... Bet: ${currentBet} | Risk Multiplier: ${tempConfig.multiplier}x`);
    
    startSpinSound(tempMode);
    
    // Clear previous animations
    document.body.classList.remove('win-pulse', 'win-flash', 'win-jackpot');
    reelsContainer.classList.remove('loss-anim');

    gpuTempInterval = setInterval(() => simulateGpuTemp(true, tempMode === 'hallucinate'), 150);

    // Hallucinate mode visuals
    if (tempMode === 'hallucinate') {
        hallucinationInterval = setInterval(() => {
            if (!isSpinning) clearInterval(hallucinationInterval);
            if (Math.random() > 0.8) {
                logToTerminal(getRandomText('hallucinate_mid_spin'), 'error');
            }
            // Scramble visible symbols
            reelStrips.forEach(strip => {
                const children = Array.from(strip.children);
                children.forEach(child => {
                    if (Math.random() > 0.7) {
                        child.textContent = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
                    }
                });
            });
        }, 200);
    }

    const symbols = getSymbolsWithCurrentWeights();
    const results = [];
    
    const animationPromises = reelStrips.map((strip, index) => {
        const targetIndex = Math.floor(Math.random() * (REEL_SYMBOL_COUNT - 5)) + 2;
        // Pre-determine result to ensure it doesn't get overwritten by hallucination visuals permanently
        const finalSymbol = getRandomSymbol();
        strip.children[targetIndex].textContent = finalSymbol.char;
        results.push(finalSymbol);

        return new Promise(resolve => {
            const offset = targetIndex * SYMBOL_HEIGHT;
            const duration = (SPIN_DURATION_BASE * tempConfig.speedMultiplier) + (index * 400);
            
            strip.style.transition = `transform ${duration}ms cubic-bezier(0.1, 0.7, 0.1, 1)`;
            strip.style.transform = `translateY(-${offset}px)`;
            
            setTimeout(() => {
                playClunkSound();
                resolve();
            }, duration);
        });
    });

    await Promise.all(animationPromises);
    
    clearInterval(gpuTempInterval);
    if (hallucinationInterval) clearInterval(hallucinationInterval);
    clearInterval(spinSoundInterval);
    
    // Cool down GPU
    const coolDown = setInterval(() => {
        simulateGpuTemp(false, false);
        if (parseInt(gpuTempDisplay.textContent) <= 65) clearInterval(coolDown);
    }, 500);

    // Force exact symbols in case hallucination messed them up
    reelStrips.forEach((strip, index) => {
        const targetIndex = Math.abs(parseInt(strip.style.transform.split('(')[1]) / SYMBOL_HEIGHT);
        strip.children[targetIndex].textContent = results[index].char;
    });

    evaluateResult(results, tempConfig);
    
    setTimeout(() => {
        // Reset reel positions invisibly for next spin
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
        isSpinning = false;
        updateButtonStates();
    }, 500);
}

function evaluateResult(results, tempConfig) {
    const [s1, s2, s3] = results;
    let winAmount = 0;
    let isJackpot = false;
    const betMultiplier = (currentBet / 10);
    const startWinnings = winnings;
    const startCredits = credits;

    // Logic: 3 match, or 2 match
    if (s1.id === s2.id && s2.id === s3.id) {
        winAmount = Math.floor(s1.payout * betMultiplier);
        if (s1.isJackpot) {
            isJackpot = true;
            logToTerminal(getRandomText('jackpot'), 'jackpot');
        } else if (winAmount > 0) {
            logToTerminal(`MATCH FOUND: ${s1.name} cluster stabilized!`, 'win');
            if (winAmount >= 50 * betMultiplier) logToTerminal(getRandomText('win_big'), 'win');
            else logToTerminal(getRandomText('win_small'), 'system');
        }
    } else if ((s1.id === s2.id || s2.id === s3.id || s1.id === s3.id) && !results.some(s => s.id === 'collapse' || s.id === 'safety')) {
        // Near miss check
        const matchingId = s1.id === s2.id ? s1.id : (s2.id === s3.id ? s2.id : s1.id);
        const symbol = SYMBOLS_BASE.find(s => s.id === matchingId);
        if (symbol && symbol.payout > 0) {
            winAmount = Math.floor(symbol.payout * 0.2 * betMultiplier);
            logToTerminal(getRandomText('near_miss'), 'system');
        }
    }

    // Overrides
    if (results.some(s => s.id === 'collapse')) {
        winAmount = 0;
        isJackpot = false;
        logToTerminal(getRandomText('loss'), 'error');
    } else if (results.some(s => s.id === 'safety')) {
        winAmount = 0;
        isJackpot = false;
        logToTerminal(getRandomText('safety_trip'), 'error');
    } else if (winAmount === 0 && !results.some(s => s.id === 'collapse')) {
        logToTerminal(getRandomText('loss'), 'error');
    }

    if (winAmount > 0) {
        winnings += winAmount;
        credits += winAmount;
        
        animateValue(windowDisplay, startWinnings, winnings, 600);
        animateValue(creditsDisplay, startCredits, credits, 600, true);
        
        logToTerminal(`Winnings: +${winAmount} tokens minted!`, isJackpot ? 'jackpot' : 'win');
        playWinSound(winAmount, isJackpot);
        
        if (isJackpot) {
            document.body.classList.add('win-jackpot');
            updateAgiProgress(30);
        } else if (winAmount >= 50 * betMultiplier) { // 5x
            document.body.classList.add('win-flash');
            updateAgiProgress(10);
        } else { // 2x
            document.body.classList.add('win-pulse');
            updateAgiProgress(2);
        }
    } else {
        playLossSound();
        reelsContainer.classList.add('loss-anim');
        updateAgiProgress(-1);
    }
}

function updateAgiProgress(amount) {
    agiProgress += amount;
    if (agiProgress < 0) agiProgress = 0;
    if (agiProgress >= 100) {
        agiProgress = 0; // reset
        logToTerminal("AGI ALIGNMENT COMPLETE. RESETTING WEIGHTS.", 'jackpot');
        agiBar.classList.add('pulsing');
        setTimeout(() => agiBar.classList.remove('pulsing'), 2000);
    }
    
    agiBar.style.width = `${agiProgress}%`;
    agiPercentDisplay.textContent = `${agiProgress.toFixed(2)}%`;
    
    if(amount > 0) {
        agiBar.classList.add('pulsing');
        setTimeout(() => agiBar.classList.remove('pulsing'), 600);
    }
}

function updateButtonStates() {
    if (isSpinning) {
        spinBtn.disabled = true;
        return;
    }
    spinBtn.disabled = false;
    
    if (credits < Math.min(...BET_OPTIONS) && credits > 0) {
        creditsDisplay.style.color = 'var(--term-red)';
        creditsDisplay.style.textShadow = '0 0 10px rgba(255,0,60,0.5)';
    } else if (credits < Math.min(...BET_OPTIONS) || credits <= 0) {
        creditsDisplay.style.color = 'var(--term-red)';
        creditsDisplay.style.textShadow = '0 0 10px rgba(255,0,60,0.5)';
        resetBtn.classList.remove('hidden');
        spinBtn.classList.add('hidden');
    } else {
        creditsDisplay.style.color = 'var(--term-cyan)';
        creditsDisplay.style.textShadow = '0 0 10px rgba(0,255,255,0.4)';
        resetBtn.classList.add('hidden');
        spinBtn.classList.remove('hidden');
    }
}

function resetGame() {
    playClickSound();
    const startCredits = credits;
    credits = INITIAL_CREDITS;
    winnings = 0;
    animateValue(creditsDisplay, startCredits, credits, 500, true);
    animateValue(windowDisplay, displayWinnings, 0, 500);
    agiProgress = 0;
    updateAgiProgress(0);
    logToTerminal('Capital injected via Series C round. Back in business!', 'system');
    updateButtonStates();
}

// Events
spinBtn.addEventListener('click', spin);
betDownBtn.addEventListener('click', () => updateBet(-1));
betUpBtn.addEventListener('click', () => updateBet(1));
resetBtn.addEventListener('click', resetGame);

paytableBtn.addEventListener('click', () => {
    playClickSound();
    buildPaytable(); 
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
    updateButtonStates();
};
