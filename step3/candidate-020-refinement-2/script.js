// Configuration
const SYMBOLS_CONFIG = [
    { symbol: '🤖', multiplier3: 8, multiplier2: 2, name: 'Robot' },
    { symbol: '🧠', multiplier3: 12, multiplier2: 3, name: 'Brain' },
    { symbol: '⛓️', multiplier3: 20, multiplier2: 4, name: 'Chain' },
    { symbol: '👁️', multiplier3: 35, multiplier2: 5, name: 'Eye' },
    { symbol: '☢️', multiplier3: 50, multiplier2: 8, name: 'Nuke' },
    { symbol: '🌌', multiplier3: 100, multiplier2: 0, name: 'AGI' }
];

const SYMBOLS = SYMBOLS_CONFIG.map(c => c.symbol);
const SPIN_DURATION = 2500; // ms
const INITIAL_BALANCE = 1000;

// State
let balance = INITIAL_BALANCE;
let isSpinning = false;
let agiThreat = 5;

// DOM Elements
const balanceDisplay = document.getElementById('balance');
const betInput = document.getElementById('bet-amount');
const tokenTempSelect = document.getElementById('token-temp');
const spinButton = document.getElementById('spin-button');
const resetBtn = document.getElementById('reset-btn');
const terminalLog = document.getElementById('terminal-log');
const container = document.getElementById('main-container');
const reelsInner = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];
const payoutsBtn = document.getElementById('payouts-btn');
const payoutsModal = document.getElementById('payouts-modal');
const closePayoutsBtn = document.getElementById('close-payouts');
const payoutsList = document.getElementById('payouts-list');
const coinShower = document.getElementById('coin-shower');
const betPlus = document.getElementById('bet-plus');
const betMinus = document.getElementById('bet-minus');

const gpuTempDisplay = document.getElementById('gpu-temp');
const fanSpeedDisplay = document.getElementById('fan-speed');
const modelStatusDisplay = document.getElementById('model-status');
const agiFill = document.getElementById('agi-fill');

// Initialize Payouts Modal
function initPayouts() {
    payoutsList.innerHTML = SYMBOLS_CONFIG.map(c => 
        `<div class="payout-item">
            <span>${c.symbol} ${c.symbol} ${c.symbol}</span>
            <span style="color: var(--neon-gold)">x${c.multiplier3}</span>
        </div>
        ${c.multiplier2 > 0 ? `<div class="payout-item" style="border-bottom: 1px solid #333; margin-bottom: 10px; font-size: 0.9rem; color: #888;">
            <span>${c.symbol} ${c.symbol} ANY</span>
            <span style="color: var(--neon-green)">x${c.multiplier2}</span>
        </div>` : '<div style="border-bottom: 1px solid #333; margin-bottom: 10px;"></div>'}`
    ).join('');
}
initPayouts();

payoutsBtn.addEventListener('click', () => payoutsModal.classList.remove('hidden'));
closePayoutsBtn.addEventListener('click', () => payoutsModal.classList.add('hidden'));

// Bet Controls
function getBet() {
    let val = parseInt(betInput.value, 10);
    if (isNaN(val) || val < 1) val = 10;
    return val;
}

betInput.addEventListener('change', () => {
    let val = getBet();
    betInput.value = val;
    checkButtonsState();
});

betPlus.addEventListener('click', () => {
    if (isSpinning) return;
    let val = getBet() + 10;
    if (val > balance && balance > 0) val = balance;
    betInput.value = val;
    checkButtonsState();
});

betMinus.addEventListener('click', () => {
    if (isSpinning) return;
    let val = getBet() - 10;
    if (val < 10) val = 10;
    betInput.value = val;
    checkButtonsState();
});

function logMessage(msg, type = 'sys') {
    const div = document.createElement('div');
    div.className = `log-${type}`;
    div.textContent = `> ${msg}`;
    terminalLog.appendChild(div);
    if (terminalLog.children.length > 5) {
        terminalLog.removeChild(terminalLog.firstChild);
    }
}

// Audio Engine (Web Audio API)
let audioCtx = null;
function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playTone(freq, duration, type = 'square', vol = 0.1, sweep = false) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    if (sweep) {
        osc.frequency.exponentialRampToValueAtTime(freq * 0.1, audioCtx.currentTime + duration);
    }
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function playSpinSound() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(50, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + SPIN_DURATION / 1000);
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, audioCtx.currentTime);
    filter.frequency.linearRampToValueAtTime(2000, audioCtx.currentTime + SPIN_DURATION / 1000);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    
    // LFO for throbbing
    const lfo = audioCtx.createOscillator();
    lfo.type = 'square';
    lfo.frequency.value = 15;
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 0.05;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    lfo.start();
    
    osc.start();
    
    setTimeout(() => {
        osc.stop();
        lfo.stop();
    }, SPIN_DURATION);
}

function playCoinSound(delay) {
    setTimeout(() => {
        playTone(1500, 0.1, 'square', 0.05);
        setTimeout(() => playTone(2000, 0.2, 'sine', 0.05), 30);
    }, delay);
}

function playLossSound() {
    playTone(150, 0.3, 'sawtooth', 0.1, true);
    setTimeout(() => playTone(100, 0.4, 'sawtooth', 0.1, true), 200);
}

function playWinSmallSound() {
    playTone(600, 0.1, 'square', 0.1);
    setTimeout(() => playTone(800, 0.1, 'square', 0.1), 100);
    setTimeout(() => playTone(1200, 0.3, 'sine', 0.1), 200);
}

function playWinBigSound() {
    // Bombastic Alarm
    const alarmInt = setInterval(() => {
        playTone(800, 0.2, 'sawtooth', 0.1);
        setTimeout(() => playTone(600, 0.2, 'sawtooth', 0.1), 200);
    }, 400);

    setTimeout(() => clearInterval(alarmInt), 3000);

    // Deep boom
    playTone(100, 2.0, 'sine', 0.3, true);

    // Coin shower sounds
    for(let i=0; i<30; i++) {
        playCoinSound(Math.random() * 2500);
    }
}

// Core Logic
function updateBalance(amount) {
    balance += amount;
    balanceDisplay.textContent = balance;
    checkButtonsState();
}

function checkButtonsState() {
    const bet = getBet();
    if (balance < bet && balance > 0) {
        betInput.value = balance; // Auto adjust to max possible
    }
    
    if (balance <= 0) {
        spinButton.disabled = true;
        resetBtn.classList.remove('hidden');
    } else {
        spinButton.disabled = false;
        resetBtn.classList.add('hidden');
    }
}

resetBtn.addEventListener('click', () => {
    balance = INITIAL_BALANCE;
    updateBalance(0);
    agiThreat = 5;
    updateFooter(false);
    logMessage("EMERGENCY RESET TRIGGERED. TOKENS RELOADED.", "sys");
    container.className = 'terminal-container';
});

function updateFooter(isSpinningState) {
    if (isSpinningState) {
        gpuTempDisplay.textContent = `GPU: ${80 + Math.floor(Math.random() * 15)}°C`;
        fanSpeedDisplay.textContent = `FAN: 100%`;
        modelStatusDisplay.textContent = `MODEL: INFERENCING`;
    } else {
        gpuTempDisplay.textContent = `GPU: ${40 + Math.floor(Math.random() * 10)}°C`;
        fanSpeedDisplay.textContent = `FAN: 30%`;
        modelStatusDisplay.textContent = `MODEL: IDLE`;
    }
    agiFill.style.width = `${Math.min(100, agiThreat)}%`;
}

// Generate reel strips
function generateReelStrip(finalSymbol) {
    const strip = [];
    for (let i = 0; i < 20; i++) {
        strip.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
    }
    strip.push(finalSymbol);
    return strip.map(s => `<div class="symbol">${s}</div>`).join('');
}

// Math for Variance
function determineOutcome() {
    const temp = tokenTempSelect.value;
    const r = Math.random();
    let winChance, bigWinWeight;

    switch(temp) {
        case 'low': 
            winChance = 0.45; 
            bigWinWeight = 0.05; 
            break; // Frequent small wins
        case 'stable': 
            winChance = 0.30; 
            bigWinWeight = 0.20; 
            break; // Normal
        case 'stochastic': 
            winChance = 0.15; 
            bigWinWeight = 0.60; 
            break; // Rare wins, mostly big
        case 'hallucinate': 
            winChance = 0.05; 
            bigWinWeight = 0.95; 
            break; // Extreme rarity, massive payouts
    }

    if (r < winChance) {
        // It's a win
        const isBig = Math.random() < bigWinWeight;
        // Select symbol (higher indices have higher payouts)
        let symIdx;
        if (isBig) {
            // Skew towards higher tier symbols
            symIdx = Math.floor(Math.random() * 3) + 3; // Index 3,4,5
        } else {
            symIdx = Math.floor(Math.random() * 3); // Index 0,1,2
        }
        if (symIdx > 5) symIdx = 5;

        const sym = SYMBOLS[symIdx];
        if (isBig) {
            return [sym, sym, sym]; // 3 of a kind
        } else {
            // 2 of a kind
            const other = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            return [sym, sym, other].sort(() => Math.random() - 0.5);
        }
    } else {
        // Guaranteed Loss (ensure no 2-matches of same symbol to simplify, or just random that doesn't match 2)
        let s1 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        let s2 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        let s3 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        while (s1 === s2) s2 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        while (s3 === s1 || s3 === s2) s3 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        return [s1, s2, s3];
    }
}

async function spin() {
    const bet = getBet();
    if (isSpinning || balance < bet) return;
    initAudio();

    isSpinning = true;
    updateBalance(-bet);
    checkButtonsState();
    
    container.className = 'terminal-container'; // reset classes
    logMessage(`BATCH SIZE: ${bet} | TEMP: ${tokenTempSelect.value.toUpperCase()}`, "sys");
    updateFooter(true);
    
    playSpinSound();

    const resultSymbols = determineOutcome();

    // Setup visual reels
    reelsInner.forEach((reel, index) => {
        reel.style.transition = 'none';
        reel.style.transform = 'translateY(0)';
        reel.innerHTML = generateReelStrip(resultSymbols[index]);
    });

    // Force reflow
    void reelsInner[0].offsetHeight;

    // Animate reels with staggered stops
    const spinPromises = reelsInner.map((reel, index) => {
        return new Promise(resolve => {
            setTimeout(() => {
                reel.style.transition = `transform ${1.5 + index * 0.5}s cubic-bezier(0.1, 0.7, 0.1, 1)`;
                reel.style.transform = `translateY(-${20 * 140}px)`;
                setTimeout(resolve, (1.5 + index * 0.5) * 1000);
            }, 50);
        });
    });

    const messageInterval = setInterval(() => {
        logMessage("COMPUTING TENSORS...", "sys");
    }, 800);

    await Promise.all(spinPromises);
    clearInterval(messageInterval);

    isSpinning = false;
    updateFooter(false);
    checkWin(resultSymbols, bet);
}

function spawnCoins() {
    coinShower.innerHTML = '';
    for (let i = 0; i < 50; i++) {
        const coin = document.createElement('div');
        coin.className = 'coin';
        coin.style.left = Math.random() * 100 + '%';
        coin.style.animationDuration = (1 + Math.random() * 1.5) + 's';
        coin.style.animationDelay = (Math.random() * 0.5) + 's';
        coinShower.appendChild(coin);
    }
    setTimeout(() => {
        coinShower.innerHTML = '';
    }, 3000);
}

function checkWin(symbols, bet) {
    const counts = {};
    symbols.forEach(s => counts[s] = (counts[s] || 0) + 1);
    
    let maxCount = 0;
    let winSymbol = null;
    for (const [s, count] of Object.entries(counts)) {
        if (count > maxCount) {
            maxCount = count;
            winSymbol = s;
        }
    }

    const config = SYMBOLS_CONFIG.find(c => c.symbol === winSymbol);
    
    if (maxCount === 3) {
        // Jackpot
        const winAmount = bet * config.multiplier3;
        updateBalance(winAmount);
        logMessage(`CRITICAL: AGI detected. Suppressing... +${winAmount} TOKENS`, "jackpot");
        container.classList.add('shake-severe', 'win-flash-jackpot');
        playWinBigSound();
        spawnCoins();
        agiThreat += 20;
    } else if (maxCount === 2 && config.multiplier2 > 0) {
        // Small Win
        const winAmount = bet * config.multiplier2;
        updateBalance(winAmount);
        logMessage(`STATUS: Local minima found. +${winAmount} TOKENS`, "win");
        container.classList.add('win-flash-subtle');
        playWinSmallSound();
        agiThreat += 2;
    } else {
        // Loss
        logMessage(`ERR: Rate limit hit. Retry in 30s.`, "loss");
        container.classList.add('loss-flash');
        playLossSound();
        agiThreat = Math.max(0, agiThreat - 1);
    }

    updateFooter(false);
    checkButtonsState();
}

// Event Listeners
spinButton.addEventListener('click', spin);

// Initialize Reels visually
reelsInner.forEach(reel => {
    reel.innerHTML = `<div class="symbol">${SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]}</div>`;
});
checkButtonsState();
updateFooter(false);
