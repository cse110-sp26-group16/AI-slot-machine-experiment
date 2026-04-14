const symbols = ['🤖', '🧠', '🚀', '💸', '📉', '💩'];
const SPIN_COST = 100;
let balance = 10000;
let isSpinning = false;

const balanceDisplay = document.getElementById('balance');
const messageDisplay = document.getElementById('message');
const spinButton = document.getElementById('spinButton');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];

// Sound effects (using simple AudioContext for beep/boop vibes)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration, vol=0.1) {
    if(audioCtx.state === 'suspended') audioCtx.resume();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}

function playSpinSound() {
    playTone(400, 'square', 0.1, 0.05);
}

function playWinSound() {
    setTimeout(() => playTone(440, 'sine', 0.2), 0);
    setTimeout(() => playTone(554, 'sine', 0.2), 200);
    setTimeout(() => playTone(659, 'sine', 0.4), 400);
    setTimeout(() => playTone(880, 'sine', 0.6), 600);
}

function playLoseSound() {
    playTone(150, 'sawtooth', 0.5, 0.2);
    setTimeout(() => playTone(100, 'sawtooth', 0.8, 0.2), 400);
}

function updateBalance(amount) {
    balance += amount;
    balanceDisplay.textContent = balance;
    
    if (balance < SPIN_COST) {
        spinButton.disabled = true;
        messageDisplay.textContent = "Rate Limit Exceeded. Buy more tokens!";
        messageDisplay.style.color = "var(--danger-color)";
    }
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function calculatePayout(results) {
    const [r1, r2, r3] = results;
    
    if (r1 === r2 && r2 === r3) {
        // 3 of a kind
        switch(r1) {
            case '🤖': return { payout: 1000, msg: "AGI ACHIEVED! The singularity pays out!" };
            case '🧠': return { payout: 500, msg: "Emergent behavior detected! Big win!" };
            case '🚀': return { payout: 250, msg: "To the moon! VC funding secured." };
            case '💸': return { payout: 100, msg: "Cash burn optimized. Moderate win." };
            case '📉': return { payout: 50, msg: "Loss curve flattened. Barely positive." };
            case '💩': return { payout: -500, msg: "SEVERE HALLUCINATION! Regulatory fine applied!" };
        }
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
        // 2 of a kind
        return { payout: 50, msg: "Partial pattern match. Minor token refund." };
    }
    
    return { payout: 0, msg: "Output blocked by safety filter. Tokens lost." };
}

function spin() {
    if (isSpinning || balance < SPIN_COST) return;
    
    isSpinning = true;
    spinButton.disabled = true;
    updateBalance(-SPIN_COST);
    messageDisplay.textContent = "Generating response... Please wait...";
    messageDisplay.style.color = "#34d399";
    
    const finalResults = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
    
    let spinCounts = [0, 0, 0];
    const maxSpins = [20, 30, 40]; // Make reels stop one by one
    
    const spinInterval = setInterval(() => {
        playSpinSound();
        let allStopped = true;
        
        reels.forEach((reel, index) => {
            if (spinCounts[index] < maxSpins[index]) {
                reel.textContent = getRandomSymbol();
                reel.classList.add('spinning');
                spinCounts[index]++;
                allStopped = false;
            } else {
                reel.textContent = finalResults[index];
                reel.classList.remove('spinning');
            }
        });
        
        if (allStopped) {
            clearInterval(spinInterval);
            isSpinning = false;
            spinButton.disabled = false;
            
            const result = calculatePayout(finalResults);
            
            if (result.payout > 0) {
                playWinSound();
                messageDisplay.style.color = "#fbbf24";
            } else if (result.payout < 0) {
                playLoseSound();
                messageDisplay.style.color = "var(--danger-color)";
            } else {
                messageDisplay.style.color = "#94a3b8";
            }
            
            messageDisplay.textContent = result.msg;
            updateBalance(result.payout);
        }
    }, 50);
}

spinButton.addEventListener('click', spin);

// Init reels
reels.forEach(reel => reel.textContent = getRandomSymbol());