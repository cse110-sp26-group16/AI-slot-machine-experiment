// Configuration
const SYMBOLS_CONFIG = [
    { symbol: '🤖', multiplier3: 10, multiplier2: 2, name: 'Robot' },
    { symbol: '🧠', multiplier3: 15, multiplier2: 3, name: 'Brain' },
    { symbol: '⛓️', multiplier3: 20, multiplier2: 4, name: 'Chain' },
    { symbol: '🎨', multiplier3: 25, multiplier2: 5, name: 'Art' },
    { symbol: '🍄', multiplier3: 30, multiplier2: 6, name: 'Shroom' },
    { symbol: '🚀', multiplier3: 50, multiplier2: 10, name: 'Rocket' }
];

const SYMBOLS = SYMBOLS_CONFIG.map(c => c.symbol);
const SPIN_DURATION = 2500; // ms
const INITIAL_BALANCE = 1000;

// Jokes
const LOSS_MESSAGES = [
    "Hallucinating a jackpot...",
    "Optimizing weights for maximum loss...",
    "AGI achieved in 3... 2... nevermind.",
    "Prompt engineering your bank account to zero...",
    "Training on your tears...",
    "Generating context-aware failures...",
    "Stochastic parrot says: 'SQUAWK! YOU LOSE!'",
    "Compute wasted. GPU crying.",
    "Model collapsed. Just like your balance.",
    "Gradient descent straight to the bottom.",
    "Error 404: Luck not found."
];

const WIN_SMALL_MESSAGES = [
    "Partial convergence! Not bad for a biological neural net.",
    "Tokens out! You successfully tricked the AI.",
    "Locally optimized! Have some compute back.",
    "Small hallucination in your favor.",
    "Alignment slightly successful."
];

const WIN_BIG_MESSAGES = [
    "GLOBAL MINIMUM REACHED! JACKPOT!",
    "ZERO-SHOT SUCCESS! AGI IS HERE AND IT PAYS!",
    "SUPERINTELLIGENCE UNLOCKED! MASSIVE PAYOUT!",
    "ATTENTION IS ALL YOU NEED! (AND THIS MONEY)",
    "RLHF WORKED! THE AI LOVES YOU!"
];

// State
let balance = INITIAL_BALANCE;
let currentBet = 50;
let isSpinning = false;

// DOM Elements
const balanceDisplay = document.getElementById('balance');
const betDisplay = document.getElementById('bet-amount');
const spinButton = document.getElementById('spin-button');
const resetButton = document.getElementById('reset-button');
const statusMessage = document.getElementById('status-message');
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

// Initialize Payouts Modal
function initPayouts() {
    payoutsList.innerHTML = SYMBOLS_CONFIG.map(c => 
        `<div class="payout-item">
            <span>${c.symbol} ${c.symbol} ${c.symbol}</span>
            <span style="color: var(--neon-gold)">x${c.multiplier3}</span>
        </div>
        <div class="payout-item" style="border-bottom: 2px solid #333; margin-bottom: 15px;">
            <span>${c.symbol} ${c.symbol} ANY</span>
            <span style="color: var(--neon-green)">x${c.multiplier2}</span>
        </div>`
    ).join('');
}
initPayouts();

payoutsBtn.addEventListener('click', () => payoutsModal.classList.remove('hidden'));
closePayoutsBtn.addEventListener('click', () => payoutsModal.classList.add('hidden'));

// Bet Controls
betPlus.addEventListener('click', () => {
    if (isSpinning) return;
    if (currentBet < 500) {
        currentBet += 10;
        updateBetDisplay();
    }
});
betMinus.addEventListener('click', () => {
    if (isSpinning) return;
    if (currentBet > 10) {
        currentBet -= 10;
        updateBetDisplay();
    }
});

function updateBetDisplay() {
    betDisplay.textContent = currentBet;
    checkButtonsState();
}

// Audio Engine (Web Audio API)
let audioCtx = null;
function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playTone(freq, duration, type = 'square', vol = 0.1) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
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
    osc.frequency.setValueAtTime(100, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(300, audioCtx.currentTime + 0.1);
    osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    
    // Create an LFO for the "rolling" effect
    const lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 10;
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
        playTone(1200, 0.1, 'sine', 0.1);
        setTimeout(() => playTone(1600, 0.2, 'sine', 0.1), 50);
    }, delay);
}

function playLossSound() {
    playTone(300, 0.2, 'sawtooth', 0.2);
    setTimeout(() => playTone(250, 0.2, 'sawtooth', 0.2), 200);
    setTimeout(() => playTone(200, 0.4, 'sawtooth', 0.2), 400);
}

function playWinSmallSound() {
    playTone(440, 0.1, 'square');
    setTimeout(() => playTone(554, 0.1, 'square'), 100);
    setTimeout(() => playTone(659, 0.3, 'square'), 200);
}

function playWinBigSound() {
    playTone(523.25, 0.1, 'sine'); // C5
    setTimeout(() => playTone(659.25, 0.1, 'sine'), 100); // E5
    setTimeout(() => playTone(783.99, 0.1, 'sine'), 200); // G5
    setTimeout(() => playTone(1046.50, 0.4, 'sine'), 300); // C6
    
    // Coin shower sounds
    for(let i=0; i<15; i++) {
        playCoinSound(300 + Math.random() * 1500);
    }
}

// Core Logic
function updateBalance(amount) {
    balance += amount;
    balanceDisplay.textContent = balance;
    checkButtonsState();
}

function checkButtonsState() {
    if (balance < currentBet) {
        spinButton.disabled = true;
        if (balance < 10) { // If they can't even make the minimum bet
            resetButton.classList.remove('hidden');
            spinButton.classList.add('hidden');
        }
    } else {
        spinButton.disabled = false;
        resetButton.classList.add('hidden');
        spinButton.classList.remove('hidden');
    }
}

resetButton.addEventListener('click', () => {
    balance = INITIAL_BALANCE;
    updateBalance(0);
    statusMessage.textContent = "MEMORY WIPED. TOKENS RELOADED.";
    statusMessage.style.color = 'var(--neon-green)';
});

function getRandomMessage(type) {
    let arr = LOSS_MESSAGES;
    if (type === 'win_small') arr = WIN_SMALL_MESSAGES;
    if (type === 'win_big') arr = WIN_BIG_MESSAGES;
    return arr[Math.floor(Math.random() * arr.length)];
}

// Generate reel strips
function generateReelStrip(finalSymbol) {
    const strip = [];
    // Add 20 random symbols for the spin
    for (let i = 0; i < 20; i++) {
        strip.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
    }
    // The final symbol
    strip.push(finalSymbol);
    return strip.map(s => `<div class="symbol">${s}</div>`).join('');
}

async function spin() {
    if (isSpinning || balance < currentBet) return;
    initAudio();

    isSpinning = true;
    checkButtonsState();
    statusMessage.textContent = "COMPUTING TENSORS...";
    statusMessage.style.color = 'var(--neon-blue)';
    container.classList.remove('win-big', 'win-small', 'shake', 'flash-red');
    updateBalance(-currentBet);
    
    playSpinSound();

    // Determine result beforehand to generate strips
    const resultSymbols = [
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
    ];

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
                // 140px per symbol, 20 symbols before the final one
                reel.style.transform = `translateY(-${20 * 140}px)`;
                setTimeout(resolve, (1.5 + index * 0.5) * 1000);
            }, 50); // slight delay to ensure transition applies
        });
    });

    const messageInterval = setInterval(() => {
        statusMessage.textContent = getRandomMessage('loss'); // Random babble during spin
    }, 600);

    await Promise.all(spinPromises);
    clearInterval(messageInterval);

    isSpinning = false;
    checkWin(resultSymbols);
}

function spawnCoins() {
    coinShower.innerHTML = '';
    for (let i = 0; i < 40; i++) {
        const coin = document.createElement('div');
        coin.className = 'coin';
        coin.style.left = Math.random() * 100 + '%';
        coin.style.animationDuration = (1 + Math.random() * 2) + 's';
        coin.style.animationDelay = (Math.random() * 0.5) + 's';
        coinShower.appendChild(coin);
    }
    setTimeout(() => {
        coinShower.innerHTML = '';
    }, 3500);
}

function checkWin(symbols) {
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
        // Big Win
        const winAmount = currentBet * config.multiplier3;
        updateBalance(winAmount);
        statusMessage.textContent = `${getRandomMessage('win_big')} +${winAmount} TOKENS`;
        statusMessage.style.color = 'var(--neon-gold)';
        container.classList.add('win-big');
        playWinBigSound();
        spawnCoins();
    } else if (maxCount === 2) {
        // Small Win
        const winAmount = currentBet * config.multiplier2;
        updateBalance(winAmount);
        statusMessage.textContent = `${getRandomMessage('win_small')} +${winAmount} TOKENS`;
        statusMessage.style.color = 'var(--neon-green)';
        container.classList.add('win-small');
        playWinSmallSound();
    } else {
        // Loss
        statusMessage.textContent = `FAILURE: ${getRandomMessage('loss')}`;
        statusMessage.style.color = 'var(--neon-red)';
        container.classList.add('shake', 'flash-red');
        playLossSound();
    }

    checkButtonsState();
}

// Event Listeners
spinButton.addEventListener('click', spin);

// Initialize Reels visually
reelsInner.forEach(reel => {
    reel.innerHTML = `<div class="symbol">${SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]}</div>`;
});
checkButtonsState();