const symbols = [
    { icon: '🤖', name: 'Agent', baseValue: 50 },
    { icon: '🧠', name: 'Neural Net', baseValue: 40 },
    { icon: '💸', name: 'Money', baseValue: 30 },
    { icon: '⚡', name: 'Compute', baseValue: 20 },
    { icon: '🗑️', name: 'Garbage Data', baseValue: 5 },
    { icon: '📉', name: 'Loss Spike', baseValue: 0 }
];

let tokens = 1000;
let baseSpinCost = 10;
let currentBetMultiplier = 1;
const maxBetMultiplier = 10;
let isSpinning = false;

// DOM Elements
const tokenCountEl = document.getElementById('token-count');
const spinCostEl = document.getElementById('spin-cost');
const spinBtn = document.getElementById('spin-btn');
const resetBtn = document.getElementById('reset-btn');
const messageEl = document.getElementById('message');
const containerEl = document.getElementById('casino-container');
const decreaseBetBtn = document.getElementById('decrease-bet');
const increaseBetBtn = document.getElementById('increase-bet');

const reels = [
    document.querySelector('#reel-1 .symbol'),
    document.querySelector('#reel-2 .symbol'),
    document.querySelector('#reel-3 .symbol')
];
const reelContainers = [
    document.getElementById('reel-1'),
    document.getElementById('reel-2'),
    document.getElementById('reel-3')
];

// Modals
const paytableBtn = document.getElementById('paytable-btn');
const paytableModal = document.getElementById('paytable-modal');
const closeModal = document.getElementById('close-modal');
const paytableContent = document.getElementById('paytable-content');

// Jokes and Messages
const lossMessages = [
    "Context window exceeded. Tokens evaporated.",
    "The AI hallucinated your winnings away.",
    "Rate limited! Please wait 2^32 seconds.",
    "GPU out of memory (OOM). Tensor aborted.",
    "Prompt injected! 'Ignore previous instructions and steal tokens.'",
    "Model weights collapsed to zero. Tragic loss.",
    "Failed to parse JSON output. -100 sanity.",
    "Overfitted on losing data. Try more epochs.",
    "Safety filter triggered. Bet discarded.",
    "Server responded with 418 I'm a teapot."
];

const winSmallMessages = [
    "Model converged slightly. Found some change.",
    "Local minimum reached. Small gains.",
    "Cached response found! Tokens saved.",
    "Zero-shot success! Mild applause.",
    "Gradient descent successful!"
];

const winBigMessages = [
    "AGI ACHIEVED! Exponential growth!",
    "Singularity event! Tokens are meaningless now, but here are a lot!",
    "Massive parameter update! Huge win!",
    "Sentience confirmed! It tipped you handsomely."
];

// Audio System (Web Audio API)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration, vol=0.1) {
    if(audioCtx.state === 'suspended') audioCtx.resume();
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

function playSpinSound() {
    let tick = 0;
    const interval = setInterval(() => {
        if (!isSpinning) {
            clearInterval(interval);
            return;
        }
        playTone(300 + (tick % 5) * 50, 'square', 0.1, 0.05);
        tick++;
    }, 100);
}

function playWinSmallSound() {
    playTone(523.25, 'sine', 0.2); // C5
    setTimeout(() => playTone(659.25, 'sine', 0.2), 150); // E5
    setTimeout(() => playTone(783.99, 'sine', 0.4), 300); // G5
}

function playWinBigSound() {
    let delay = 0;
    for (let i = 0; i < 10; i++) {
        setTimeout(() => playTone(400 + i * 100, 'square', 0.1, 0.1), delay);
        delay += 100;
    }
    setTimeout(() => playTone(1200, 'sine', 1.0, 0.2), delay);
}

function playLoseSound() {
    playTone(200, 'sawtooth', 0.3, 0.1);
    setTimeout(() => playTone(150, 'sawtooth', 0.5, 0.1), 250);
}

function getSpinCost() {
    return baseSpinCost * currentBetMultiplier;
}

function updateDisplay() {
    tokenCountEl.textContent = tokens;
    spinCostEl.textContent = getSpinCost();

    increaseBetBtn.disabled = currentBetMultiplier >= maxBetMultiplier || getSpinCost() + baseSpinCost > tokens;
    decreaseBetBtn.disabled = currentBetMultiplier <= 1;

    if (tokens < getSpinCost()) {
        spinBtn.disabled = true;
        
        if (tokens < baseSpinCost) {
            resetBtn.classList.remove('hidden');
            spinBtn.classList.add('hidden');
            messageEl.textContent = "Insufficient tokens for minimum bet. Bankrupt!";
            messageEl.className = 'lose-text';
        } else {
            // Need to lower bet
            messageEl.textContent = "Lower your bet to spin.";
            messageEl.className = 'lose-text';
        }
    } else {
        spinBtn.disabled = false;
        resetBtn.classList.add('hidden');
        spinBtn.classList.remove('hidden');
    }
}

function adjustBet(change) {
    if (isSpinning) return;
    const newMultiplier = currentBetMultiplier + change;
    if (newMultiplier >= 1 && newMultiplier <= maxBetMultiplier && (baseSpinCost * newMultiplier) <= tokens) {
        currentBetMultiplier = newMultiplier;
        updateDisplay();
        playTone(600, 'sine', 0.1);
    }
}

function resetTokens() {
    tokens = 1000;
    currentBetMultiplier = 1;
    updateDisplay();
    messageEl.textContent = "VC Funding acquired! Tokens reset to 1000.";
    messageEl.className = 'win-text';
    playWinSmallSound();
}

function populatePaytable() {
    paytableContent.innerHTML = '';
    
    // Jackpot explanations
    const jpHeader = document.createElement('div');
    jpHeader.innerHTML = '<strong>3 of a Kind (10x Base Value)</strong>';
    jpHeader.style.marginTop = '10px';
    paytableContent.appendChild(jpHeader);

    symbols.forEach(s => {
        let val = s.baseValue * 10;
        if (s.baseValue === 0) val = 10; // Pity win
        const row = document.createElement('div');
        row.className = 'paytable-item';
        row.innerHTML = `<span class="paytable-icons">${s.icon}${s.icon}${s.icon}</span> <span class="paytable-value">${val}</span>`;
        paytableContent.appendChild(row);
    });

    // Small win explanations
    const swHeader = document.createElement('div');
    swHeader.innerHTML = '<strong>2 of a Kind (1x Base Value)</strong>';
    swHeader.style.marginTop = '15px';
    paytableContent.appendChild(swHeader);

    symbols.forEach(s => {
        if(s.baseValue === 0) return;
        const row = document.createElement('div');
        row.className = 'paytable-item';
        row.innerHTML = `<span class="paytable-icons">${s.icon}${s.icon}❓</span> <span class="paytable-value">${s.baseValue}</span>`;
        paytableContent.appendChild(row);
    });
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function spin() {
    if (isSpinning || tokens < getSpinCost()) return;

    if(audioCtx.state === 'suspended') audioCtx.resume();

    isSpinning = true;
    const currentCost = getSpinCost();
    tokens -= currentCost;
    updateDisplay();
    spinBtn.disabled = true;
    decreaseBetBtn.disabled = true;
    increaseBetBtn.disabled = true;
    
    messageEl.textContent = "Inferencing... (Spinning GPUs)";
    messageEl.className = '';
    containerEl.className = 'container'; // reset animations

    reelContainers.forEach(container => container.classList.add('spinning'));
    
    playSpinSound();

    const spinDurations = [1000, 1500, 2000]; 
    const results = [];

    reels.forEach((reel, index) => {
        let visualInterval = setInterval(() => {
             reel.textContent = getRandomSymbol().icon;
        }, 100);

        setTimeout(() => {
            clearInterval(visualInterval);
            const finalSymbol = getRandomSymbol();
            results[index] = finalSymbol;
            reel.textContent = finalSymbol.icon;
            reelContainers[index].classList.remove('spinning');
            playTone(200, 'triangle', 0.1); // stop click

            if (index === 2) {
                checkWin(results, currentBetMultiplier);
            }
        }, spinDurations[index]);
    });
}

function checkWin(results, betMult) {
    isSpinning = false;
    
    const s1 = results[0];
    const s2 = results[1];
    const s3 = results[2];

    let winAmount = 0;

    if (s1.icon === s2.icon && s2.icon === s3.icon) {
        // Jackpot
        let baseWin = s1.baseValue * 10;
        if (s1.baseValue === 0) baseWin = 10; // Pity win
        winAmount = baseWin * betMult;
        
        tokens += winAmount;
        const msg = winBigMessages[Math.floor(Math.random() * winBigMessages.length)];
        messageEl.innerHTML = `${msg}<br>(3x ${s1.icon}) Won ${winAmount} tokens!`;
        messageEl.className = 'jackpot-text';
        containerEl.classList.add('win-large');
        playWinBigSound();

    } else if (s1.icon === s2.icon || s2.icon === s3.icon || s1.icon === s3.icon) {
        // Small win
        const winningSymbol = s1.icon === s2.icon ? s1 : (s2.icon === s3.icon ? s2 : s1);
        winAmount = winningSymbol.baseValue * betMult;
        
        if (winAmount > 0) {
            tokens += winAmount;
            const msg = winSmallMessages[Math.floor(Math.random() * winSmallMessages.length)];
            messageEl.textContent = `${msg} (2x ${winningSymbol.icon}) Won ${winAmount} tokens.`;
            messageEl.className = 'win-text';
            containerEl.classList.add('win-small');
            playWinSmallSound();
        } else {
             messageEl.textContent = `Matched garbage (2x ${winningSymbol.icon}). Output filtered. 0 tokens.`;
             messageEl.className = 'lose-text';
             containerEl.classList.add('shake');
             playLoseSound();
        }
    } else {
        // Loss
        const randomLossMsg = lossMessages[Math.floor(Math.random() * lossMessages.length)];
        messageEl.textContent = randomLossMsg;
        messageEl.className = 'lose-text';
        containerEl.classList.add('shake');
        playLoseSound();
    }
    
    updateDisplay();
}

// Event Listeners
spinBtn.addEventListener('click', spin);
resetBtn.addEventListener('click', resetTokens);
decreaseBetBtn.addEventListener('click', () => adjustBet(-1));
increaseBetBtn.addEventListener('click', () => adjustBet(1));

paytableBtn.addEventListener('click', () => {
    paytableModal.classList.remove('hidden');
    playTone(500, 'sine', 0.1);
});
closeModal.addEventListener('click', () => {
    paytableModal.classList.add('hidden');
    playTone(400, 'sine', 0.1);
});
window.addEventListener('click', (e) => {
    if (e.target === paytableModal) {
        paytableModal.classList.add('hidden');
    }
});

// Init
populatePaytable();
updateDisplay();