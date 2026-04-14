const symbols = [
    { icon: '🤖', name: 'Agent', value: 50 },
    { icon: '🧠', name: 'Neural Net', value: 40 },
    { icon: '💸', name: 'Money', value: 30 },
    { icon: '⚡', name: 'Compute', value: 20 },
    { icon: '🗑️', name: 'Garbage Data', value: 5 },
    { icon: '📉', name: 'Loss Spike', value: 0 }
];

let tokens = 1000;
const spinCost = 10;
let isSpinning = false;

const tokenCountEl = document.getElementById('token-count');
const spinBtn = document.getElementById('spin-btn');
const messageEl = document.getElementById('message');
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

const lossMessages = [
    "Context window exceeded. Tokens lost.",
    "The AI hallucinated your winnings away.",
    "Rate limited! Pay the toll.",
    "GPU out of memory (OOM). Spin again.",
    "Prompt injected! You lost your tokens.",
    "Model weights collapsed. Tragic loss.",
    "Failed to parse JSON output. -10 tokens.",
    "API Key revoked. Just kidding, you lost."
];

function updateDisplay() {
    tokenCountEl.textContent = tokens;
    if (tokens < spinCost) {
        spinBtn.disabled = true;
        messageEl.textContent = "Insufficient tokens. Please insert more VC funding.";
        messageEl.className = 'lose-text';
    }
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function spin() {
    if (isSpinning || tokens < spinCost) return;

    isSpinning = true;
    tokens -= spinCost;
    updateDisplay();
    spinBtn.disabled = true;
    messageEl.textContent = "Generating response... (Spinning GPUs)";
    messageEl.className = '';

    // Add spinning visual effect class
    reelContainers.forEach(container => container.classList.add('spinning'));

    const spinDurations = [1000, 1500, 2000]; // Staggered stops
    const results = [];

    reels.forEach((reel, index) => {
        // Visual fast switching
        let visualInterval = setInterval(() => {
             reel.textContent = getRandomSymbol().icon;
        }, 80);

        setTimeout(() => {
            clearInterval(visualInterval);
            const finalSymbol = getRandomSymbol();
            results[index] = finalSymbol;
            reel.textContent = finalSymbol.icon;
            reelContainers[index].classList.remove('spinning');

            if (index === 2) {
                checkWin(results);
            }
        }, spinDurations[index]);
    });
}

function checkWin(results) {
    isSpinning = false;
    spinBtn.disabled = false;

    const s1 = results[0];
    const s2 = results[1];
    const s3 = results[2];

    if (s1.icon === s2.icon && s2.icon === s3.icon) {
        // Jackpot (3 of a kind)
        let winAmount = s1.value * 10;
        if (s1.value === 0) winAmount = 10; // Pity win for 3 loss spikes
        
        tokens += winAmount;
        messageEl.innerHTML = `AGI ACHIEVED! (3x ${s1.icon})<br>You generated ${winAmount} tokens!`;
        messageEl.className = 'win-text';
    } else if (s1.icon === s2.icon || s2.icon === s3.icon || s1.icon === s3.icon) {
        // Small win (2 of a kind)
        const winningSymbol = s1.icon === s2.icon ? s1 : (s2.icon === s3.icon ? s2 : s1);
        const winAmount = winningSymbol.value;
        tokens += winAmount;
        
        if (winAmount > 0) {
            messageEl.textContent = `Model converged slightly (2x ${winningSymbol.icon}). Recovered ${winAmount} tokens.`;
            messageEl.className = 'win-text';
        } else {
             messageEl.textContent = `Matched garbage (2x ${winningSymbol.icon}). Output filtered.`;
             messageEl.className = 'lose-text';
        }
    } else {
        // Loss (no matches)
        const randomLossMsg = lossMessages[Math.floor(Math.random() * lossMessages.length)];
        messageEl.textContent = randomLossMsg;
        messageEl.className = 'lose-text';
    }
    updateDisplay();
}

spinBtn.addEventListener('click', spin);

// Init
updateDisplay();