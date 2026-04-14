const symbols = [
    { emoji: '🤖', name: 'Bot', value: 10 },
    { emoji: '🧠', name: 'Brain', value: 20 },
    { emoji: '🖥️', name: 'GPU', value: 50 },
    { emoji: '📈', name: 'Stonks', value: 100 },
    { emoji: '🗑️', name: 'Trash', value: 2 }, 
    { emoji: '✨', name: 'Magic', value: 500 }
];

const INITIAL_BALANCE = 10000;
let balance = INITIAL_BALANCE;
let isSpinning = false;

const balanceEl = document.getElementById('token-balance');
const spinBtn = document.getElementById('spin-button');
const resetBtn = document.getElementById('reset-button');
const messageBoard = document.getElementById('message-board');
const betSelect = document.getElementById('bet-amount');
const casinoContainer = document.getElementById('casino-container');

const reels = [
    document.getElementById('reel-1'),
    document.getElementById('reel-2'),
    document.getElementById('reel-3')
];

// Payout Modal
const payoutBtn = document.getElementById('payout-btn');
const payoutModal = document.getElementById('payout-modal');
const closeModal = document.getElementById('close-modal');

payoutBtn.addEventListener('click', () => {
    initAudio();
    payoutModal.classList.remove('hidden');
});
closeModal.addEventListener('click', () => payoutModal.classList.add('hidden'));

// Audio Context setup
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playTone(freq, type, duration, vol) {
    if (!audioCtx) return;
    try {
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
    } catch (e) {
        console.error("Audio error", e);
    }
}

let spinIntervalAudio;

function playSpinSound() {
    initAudio();
    let t = 0;
    spinIntervalAudio = setInterval(() => {
        playTone(300 + Math.random()*200, 'square', 0.1, 0.05);
        t++;
        if (t > 20) clearInterval(spinIntervalAudio);
    }, 100);
}

function playWinSound(isBigWin) {
    initAudio();
    if (isBigWin) {
        playTone(400, 'sine', 0.2, 0.2);
        setTimeout(() => playTone(500, 'sine', 0.2, 0.2), 150);
        setTimeout(() => playTone(600, 'sine', 0.2, 0.2), 300);
        setTimeout(() => playTone(800, 'sine', 0.6, 0.3), 450);
    } else {
        playTone(600, 'sine', 0.1, 0.1);
        setTimeout(() => playTone(800, 'sine', 0.3, 0.1), 100);
    }
}

function playLoseSound() {
    initAudio();
    playTone(200, 'sawtooth', 0.3, 0.1);
    setTimeout(() => playTone(150, 'sawtooth', 0.5, 0.15), 200);
}

// Jokes
const loseMessages = [
    "Model hallucinated. Tokens burned.",
    "CUDA Out of Memory. Try again.",
    "Your prompt was filtered by safety guidelines.",
    "API Rate Limit Exceeded. You lose.",
    "Spent tokens to generate 'Hello World'.",
    "Overfit! All parameters reduced to noise.",
    "Gradient vanished. So did your bet.",
    "Server response: 503 Service Unavailable.",
    "AI confidently asserted 2+2=5. You lose.",
    "The AI decided to write a poem instead."
];

const winMessages = [
    "Zero-shot success! Have some tokens.",
    "Context window expanded!",
    "Weights optimized perfectly.",
    "Prompt engineering masterclass!",
    "Bypassed the alignment tax!",
    "Cache hit! Immediate response!"
];

const jackpotMessages = [
    "AGI ACHIEVED! GPU GOES BRRR! 💰",
    "SINGULARITY REACHED! YOU OWN THE COMPUTE! 🎰",
    "MAXIMUM OPTIMIZATION! 🚀"
];

function updateBalanceDisplay() {
    balanceEl.textContent = balance.toLocaleString();
    const currentBet = parseInt(betSelect.value);
    
    if (balance < currentBet) {
        spinBtn.disabled = true;
    } else {
        spinBtn.disabled = false;
    }

    if (balance === 0 || balance < Math.min(...Array.from(betSelect.options).map(o => parseInt(o.value)))) {
        resetBtn.classList.remove('hidden');
    } else {
        resetBtn.classList.add('hidden');
    }
}

betSelect.addEventListener('change', () => {
    initAudio();
    updateBalanceDisplay();
});

resetBtn.addEventListener('click', () => {
    initAudio();
    balance = INITIAL_BALANCE;
    updateBalanceDisplay();
    showMessage("Compute cluster restarted. Tokens refilled.", "neutral-text");
    resetBtn.classList.add('hidden');
    clearAnimations();
});

function getRandomSymbol() {
    const rand = Math.random();
    if (rand < 0.35) return symbols[4]; // Trash (35%)
    if (rand < 0.65) return symbols[0]; // Bot (30%)
    if (rand < 0.85) return symbols[1]; // Brain (20%)
    if (rand < 0.95) return symbols[2]; // GPU (10%)
    if (rand < 0.99) return symbols[3]; // Stonks (4%)
    return symbols[5]; // Magic (1%)
}

function showMessage(text, className) {
    messageBoard.textContent = text;
    messageBoard.className = `message-board ${className}`;
}

function clearAnimations() {
    casinoContainer.classList.remove('shake', 'win-flash', 'big-win-flash');
}

async function spin() {
    const betAmount = parseInt(betSelect.value);
    if (isSpinning || balance < betAmount) return;

    isSpinning = true;
    balance -= betAmount;
    updateBalanceDisplay();
    spinBtn.disabled = true;
    resetBtn.classList.add('hidden');
    
    clearAnimations();
    showMessage("Training model... (Spinning)", "neutral-text");
    playSpinSound();

    reels.forEach(reel => {
        reel.classList.add('spinning');
    });

    const spinDuration = 2000; 
    const interval = 100;
    
    let spinInterval = setInterval(() => {
        reels.forEach(reel => {
            reel.textContent = symbols[Math.floor(Math.random() * symbols.length)].emoji;
        });
    }, interval);

    await new Promise(resolve => setTimeout(resolve, spinDuration));
    
    clearInterval(spinInterval);
    if (spinIntervalAudio) clearInterval(spinIntervalAudio);
    
    reels.forEach(reel => reel.classList.remove('spinning'));

    const finalSymbols = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
    
    reels.forEach((reel, index) => {
        reel.textContent = finalSymbols[index].emoji;
    });

    evaluateResult(finalSymbols, betAmount);
    
    isSpinning = false;
    updateBalanceDisplay();
}

function evaluateResult(resultSymbols, betAmount) {
    const s1 = resultSymbols[0];
    const s2 = resultSymbols[1];
    const s3 = resultSymbols[2];

    let winnings = 0;
    let isBigWin = false;

    if (s1.emoji === s2.emoji && s2.emoji === s3.emoji) {
        // 3 of a kind
        winnings = betAmount * s1.value;
        isBigWin = winnings >= betAmount * 50;
        
        if (s1.emoji === '✨') {
            showMessage(jackpotMessages[Math.floor(Math.random() * jackpotMessages.length)] + ` +${winnings}`, "big-win-text");
            casinoContainer.classList.add('big-win-flash');
        } else {
            showMessage(`3 ${s1.name}s! ${winMessages[Math.floor(Math.random() * winMessages.length)]} +${winnings}`, isBigWin ? "big-win-text" : "win-text");
            casinoContainer.classList.add(isBigWin ? 'big-win-flash' : 'win-flash');
        }
        playWinSound(isBigWin);
    } else if (s1.emoji === s2.emoji || s2.emoji === s3.emoji || s1.emoji === s3.emoji) {
        // 2 of a kind
        const matchedSymbol = s1.emoji === s2.emoji ? s1 : s3;
        const twoOfKindMultipliers = {
            '✨': 10,
            '📈': 5,
            '🖥️': 2.5,
            '🧠': 1,
            '🤖': 0.5,
            '🗑️': 0.1
        };
        winnings = Math.ceil(betAmount * twoOfKindMultipliers[matchedSymbol.emoji]);
        
        if (winnings > 0) {
            showMessage(`Minor optimization. +${winnings} tokens.`, "win-text");
            casinoContainer.classList.add('win-flash');
            playWinSound(false);
        } else {
            // Unlikely with Math.ceil, but just in case
            showMessage(loseMessages[Math.floor(Math.random() * loseMessages.length)], "lose-text");
            casinoContainer.classList.add('shake');
            playLoseSound();
        }
    } else {
        // Lose
        showMessage(loseMessages[Math.floor(Math.random() * loseMessages.length)], "lose-text");
        casinoContainer.classList.add('shake');
        playLoseSound();
    }

    if (winnings > 0) {
        balance += winnings;
    }
}

spinBtn.addEventListener('click', spin);

// To ensure AudioContext is initialized on first user interaction
document.body.addEventListener('click', () => {
    initAudio();
}, { once: true });

updateBalanceDisplay();
