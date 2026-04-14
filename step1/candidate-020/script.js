// Configuration
const SYMBOLS = ['🤖', '🧠', '⛓️', '🎨', '🍄', '🚀'];
const SPIN_DURATION = 2000; // ms
const COST_PER_SPIN = 50;
const WIN_MULTIPLIER = 10;

const SATIRICAL_MESSAGES = [
    "Hallucinating a jackpot...",
    "Optimizing weights for maximum loss...",
    "AGI achieved in 3... 2... nevermind.",
    "Prompt engineering your bank account...",
    "Training on your tears...",
    "Generating context-aware failures...",
    "Stochastic parrot says: 'SQUAWK!'",
    "Attention is all you need. And money.",
    "Your compute is our profit.",
    "Zero-shot luck detected...",
    "Fine-tuning your disappointment...",
    "RAG-ing for better odds...",
    "Alignment failed: greedy mode activated.",
    "Tokens in, nothing out. Perfection."
];

// State
let balance = 1000;
let isSpinning = false;

// DOM Elements
const balanceDisplay = document.getElementById('balance');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];
const spinButton = document.getElementById('spin-button');
const statusMessage = document.getElementById('status-message');
const container = document.querySelector('.terminal-container');

// Audio Context (Simple beep sounds)
let audioCtx = null;
function playSound(freq, duration, type = 'square') {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function updateBalance(amount) {
    balance += amount;
    balanceDisplay.textContent = balance;
}

function getRandomSymbol() {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function getRandomMessage() {
    return SATIRICAL_MESSAGES[Math.floor(Math.random() * SATIRICAL_MESSAGES.length)];
}

async function spin() {
    if (isSpinning || balance < COST_PER_SPIN) return;

    isSpinning = true;
    spinButton.disabled = true;
    statusMessage.textContent = "INITIALIZING INFERENCE...";
    updateBalance(-COST_PER_SPIN);
    playSound(200, 0.1);

    // Add spinning animation class
    reels.forEach(reel => reel.classList.add('spinning'));

    // Update status message periodically while spinning
    const messageInterval = setInterval(() => {
        statusMessage.textContent = getRandomMessage();
        playSound(400 + Math.random() * 400, 0.05, 'sawtooth');
    }, 400);

    // Wait for spin duration
    await new Promise(resolve => setTimeout(resolve, SPIN_DURATION));

    clearInterval(messageInterval);

    // Stop reels and set final symbols
    const finalSymbols = reels.map(reel => {
        const symbol = getRandomSymbol();
        reel.textContent = symbol;
        reel.classList.remove('spinning');
        return symbol;
    });

    isSpinning = false;
    spinButton.disabled = balance < COST_PER_SPIN;

    checkWin(finalSymbols);
}

function checkWin(symbols) {
    const allSame = symbols.every(s => s === symbols[0]);
    
    if (allSame) {
        const winAmount = COST_PER_SPIN * WIN_MULTIPLIER;
        updateBalance(winAmount);
        statusMessage.textContent = `SUCCESS: CONVERGENCE REACHED! +${winAmount} TOKENS`;
        statusMessage.style.color = 'var(--neon-green)';
        container.classList.add('win-flash');
        playSound(880, 0.5, 'sine');
        setTimeout(() => {
            playSound(1320, 0.5, 'sine');
            container.classList.remove('win-flash');
        }, 500);
    } else {
        statusMessage.textContent = `FAILURE: STOCHASTIC DEGRADATION.`;
        statusMessage.style.color = 'var(--neon-pink)';
        container.classList.add('shake');
        playSound(100, 0.3, 'sawtooth');
        setTimeout(() => container.classList.remove('shake'), 500);
    }

    // Reset status color after a delay
    setTimeout(() => {
        statusMessage.style.color = 'var(--neon-blue)';
    }, 3000);
}

// Event Listeners
spinButton.addEventListener('click', spin);

// Initial State
spinButton.disabled = balance < COST_PER_SPIN;
