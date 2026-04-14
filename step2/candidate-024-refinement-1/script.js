/**
 * THE TOKEN BURNER - AI Satire Slot Machine
 */

const SYMBOLS = [
    { char: '🧠', name: 'AGI', weight: 1, payout: 100 },
    { char: '🤑', name: 'VC Funding', weight: 3, payout: 50 },
    { char: '⚡', name: 'Quantization', weight: 10, payout: 10 },
    { char: '👻', name: 'Hallucination', weight: 8, payout: 5 },
    { char: '⛓️', name: 'Safety Filter', weight: 15, payout: 0 },
    { char: '📉', name: 'Model Collapse', weight: 15, payout: 0 }
];

const REEL_SYMBOL_COUNT = 30;
const SPIN_DURATION = 2000;
const SYMBOL_HEIGHT = 120;
const INITIAL_CREDITS = 500.00;

let credits = INITIAL_CREDITS;
let winnings = 0;
let isSpinning = false;
let currentBet = 25;
const BET_OPTIONS = [10, 25, 50, 100];

// DOM
const reelStrips = [
    document.querySelector('#reel1 .reel-strip'),
    document.querySelector('#reel2 .reel-strip'),
    document.querySelector('#reel3 .reel-strip')
];
const reelsContainer = document.getElementById('reels-container');
const spinBtn = document.getElementById('spin-btn');
const resetBtn = document.getElementById('reset-btn');
const creditsDisplay = document.getElementById('compute-credits');
const windowDisplay = document.getElementById('context-window');
const betDisplay = document.getElementById('current-bet');
const betDownBtn = document.getElementById('bet-down');
const betUpBtn = document.getElementById('bet-up');
const terminalLog = document.getElementById('terminal-log');
const paytableBtn = document.getElementById('paytable-btn');
const paytableModal = document.getElementById('paytable-modal');
const closeBtn = document.querySelector('.close-btn');
const paytableGrid = document.getElementById('paytable-grid');

// Audio Synthesizer
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTone(freq, type, duration, vol=0.1) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function playClickSound() {
    playTone(600, 'sine', 0.1, 0.05);
}

function playSpinSound() {
    let i = 0;
    const interval = setInterval(() => {
        if (!isSpinning) {
            clearInterval(interval);
            return;
        }
        playTone(300 + (i % 5) * 50, 'triangle', 0.1, 0.05);
        i++;
    }, 100);
}

function playWinSound(amount) {
    if (amount >= 50) {
        // Big win
        playTone(523.25, 'square', 0.1, 0.2); 
        setTimeout(() => playTone(659.25, 'square', 0.1, 0.2), 100); 
        setTimeout(() => playTone(783.99, 'square', 0.1, 0.2), 200); 
        setTimeout(() => playTone(1046.50, 'square', 0.4, 0.2), 300);
        setTimeout(() => playTone(1318.51, 'square', 0.6, 0.2), 500);
    } else {
        // Small win
        playTone(523.25, 'sine', 0.1, 0.1);
        setTimeout(() => playTone(659.25, 'sine', 0.2, 0.1), 150);
    }
}

function playLossSound() {
    playTone(200, 'sawtooth', 0.3, 0.1);
    setTimeout(() => playTone(150, 'sawtooth', 0.5, 0.1), 300);
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
    const totalWeight = SYMBOLS.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;
    for (const symbol of SYMBOLS) {
        if (random < symbol.weight) return symbol;
        random -= symbol.weight;
    }
    return SYMBOLS[SYMBOLS.length - 1];
}

function logToTerminal(message, type = 'system') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `> ${message}`;
    terminalLog.appendChild(entry);
    terminalLog.scrollTop = terminalLog.scrollHeight;
    if (terminalLog.children.length > 20) {
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
}

function buildPaytable() {
    paytableGrid.innerHTML = '';
    SYMBOLS.forEach(s => {
        const row = document.createElement('div');
        row.className = 'paytable-row';
        row.innerHTML = `<span>${s.char} ${s.name}</span><span>${s.payout > 0 ? s.payout + 'x' : 'Bust'}</span>`;
        paytableGrid.appendChild(row);
    });
}

async function spin() {
    if (isSpinning) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    if (credits < currentBet) {
        logToTerminal('Insufficient compute credits. Seeking Series B...', 'error');
        playLossSound();
        reelsContainer.classList.add('loss-anim');
        setTimeout(() => reelsContainer.classList.remove('loss-anim'), 500);
        return;
    }

    isSpinning = true;
    spinBtn.disabled = true;
    credits -= currentBet;
    updateDisplay();
    
    logToTerminal(`Initiating inference... Cost: ${currentBet} tokens.`);
    playSpinSound();
    
    // Clear previous animations
    document.body.classList.remove('big-win-bg', 'small-win-bg');
    reelsContainer.classList.remove('loss-anim');

    const results = [];
    const animationPromises = reelStrips.map((strip, index) => {
        const targetIndex = Math.floor(Math.random() * (REEL_SYMBOL_COUNT - 5)) + 2;
        const targetSymbolChar = strip.children[targetIndex].textContent;
        results.push(SYMBOLS.find(s => s.char === targetSymbolChar));

        return new Promise(resolve => {
            const offset = targetIndex * SYMBOL_HEIGHT;
            strip.style.transition = `transform ${SPIN_DURATION + (index * 500)}ms cubic-bezier(0.2, 0.8, 0.2, 1)`;
            strip.style.transform = `translateY(-${offset}px)`;
            
            setTimeout(() => {
                playClickSound(); // stop clunk
                resolve();
            }, SPIN_DURATION + (index * 500));
        });
    });

    await Promise.all(animationPromises);
    
    evaluateResult(results);
    isSpinning = false;
    spinBtn.disabled = false;
    
    // Reset reel positions without animation for next spin
    reelStrips.forEach((strip, index) => {
        const symbol = results[index];
        strip.style.transition = 'none';
        strip.style.transform = 'translateY(0)';
        // Reset strip to have the result at the top
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

function evaluateResult(results) {
    const [s1, s2, s3] = results;
    let winAmount = 0;
    let multiplier = currentBet / 10;

    if (s1.char === s2.char && s2.char === s3.char) {
        winAmount = s1.payout * multiplier;
        logToTerminal(`MATCH FOUND: ${s1.name} cluster stabilized!`, 'win');
    } else if (s1.char === s2.char) {
        winAmount = Math.floor(s1.payout * 0.5 * multiplier);
        logToTerminal(`Partial alignment: ${s1.name} correlation.`, 'system');
    }

    if (results.some(s => s.name === 'Model Collapse')) {
        logToTerminal('ERROR: Overfitted to garbage data. Model collapsed.', 'error');
        winAmount = 0;
    } else if (results.some(s => s.name === 'Safety Filter')) {
        const jokes = [
            "SAFETY VIOLATION: AI refused to align three identical symbols.",
            "FILTER TRIPPED: Your prompt was too winning.",
            "CENSORED: The output was deemed too profitable."
        ];
        logToTerminal(jokes[Math.floor(Math.random() * jokes.length)], 'error');
        winAmount = 0;
    } else if (winAmount === 0) {
        const failureMessages = [
            "Hallucinated completely different tokens.",
            "Loss function stuck in local minimum.",
            "GPU memory exceeded. Dropped context.",
            "Failed to parse JSON output. No win.",
            "The AI replied: 'As an AI language model, I cannot win you money.'"
        ];
        logToTerminal(failureMessages[Math.floor(Math.random() * failureMessages.length)], 'error');
    }

    if (winAmount > 0) {
        winnings += winAmount;
        credits += winAmount;
        logToTerminal(`Winnings: ${winAmount} tokens minted!`, 'win');
        playWinSound(winAmount);
        
        if (winAmount >= 50 * multiplier) {
            document.body.classList.add('big-win-bg');
            logToTerminal("MAJOR BREAKTHROUGH: AGI IS HERE!!!", 'win');
        } else {
            document.body.classList.add('small-win-bg');
        }
    } else {
        playLossSound();
        reelsContainer.classList.add('loss-anim');
        setTimeout(() => reelsContainer.classList.remove('loss-anim'), 500);
    }

    updateDisplay();
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
    logToTerminal('Received $100M from mysterious VC. Back in business!', 'system');
    updateDisplay();
}

// Events
spinBtn.addEventListener('click', spin);
betDownBtn.addEventListener('click', () => updateBet(-1));
betUpBtn.addEventListener('click', () => updateBet(1));
resetBtn.addEventListener('click', resetGame);

paytableBtn.addEventListener('click', () => {
    playClickSound();
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
