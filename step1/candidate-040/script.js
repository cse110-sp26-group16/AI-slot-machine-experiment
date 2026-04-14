const symbols = [
    '🤖', // AI Model
    '🧠', // Neural Net / Alignment
    '💸', // Compute cost / Nvidia
    '📉', // GPU shortage / Loss curve
    '🚀', // AGI Hype
    '🐛'  // Hallucination / Bug
];

// Probabilities (not truly random to ensure the house/OpenAI always wins eventually)
// Higher index = less likely to appear naturally, or just pure random. Let's stick to simple random for now but weighted slightly.
const getSymbol = () => {
    const rand = Math.random();
    if (rand < 0.1) return '🚀'; // 10%
    if (rand < 0.2) return '🧠'; // 10%
    if (rand < 0.4) return '📉'; // 20%
    if (rand < 0.6) return '💸'; // 20%
    if (rand < 0.8) return '🤖'; // 20%
    return '🐛'; // 20%
};

let tokens = 1000;
const spinCost = 10;
let isSpinning = false;

const tokenBalanceEl = document.getElementById('token-balance');
const messageEl = document.getElementById('message');
const reels = [
    document.getElementById('reel-1'),
    document.getElementById('reel-2'),
    document.getElementById('reel-3')
];
const spinBtn = document.getElementById('spin-btn');
const buyBtn = document.getElementById('buy-btn');
const containerEl = document.querySelector('.container');

function updateDisplay() {
    tokenBalanceEl.textContent = tokens;
    if (tokens < spinCost) {
        spinBtn.disabled = true;
        messageEl.textContent = "Context window exhausted. Need more tokens!";
        messageEl.style.color = 'var(--danger-color)';
    } else {
        spinBtn.disabled = false;
    }
}

function showMessage(msg, type = 'normal') {
    messageEl.textContent = msg;
    if (type === 'win') messageEl.style.color = 'var(--secondary-color)';
    else if (type === 'lose') messageEl.style.color = 'var(--danger-color)';
    else messageEl.style.color = '#fcd34d';
}

function calculatePayout(results) {
    const [r1, r2, r3] = results;
    
    // Check 3 of a kind
    if (r1 === r2 && r2 === r3) {
        if (r1 === '🚀') return { payout: 1000, msg: "AGI Achieved! Singularity is here!" };
        if (r1 === '🧠') return { payout: 500, msg: "Perfect Alignment! Humanity is saved." };
        if (r1 === '💸') return { payout: 250, msg: "Nvidia Earnings Call went well!" };
        if (r1 === '📉') return { payout: -50, msg: "Global GPU Shortage! Supply chain disrupted." }; // A bad 3-of-a-kind
        if (r1 === '🐛') return { payout: 0, msg: "Massive Hallucination. The output is useless." };
        return { payout: 100, msg: "Standard Model Upgrade deployed." };
    }

    // Check 2 of a kind
    if (r1 === r2 || r2 === r3 || r1 === r3) {
        // Special penalty if it's two bugs
        if ((r1 === '🐛' && r2 === '🐛') || (r2 === '🐛' && r3 === '🐛') || (r1 === '🐛' && r3 === '🐛')) {
             return { payout: 0, msg: "Minor hallucination detected. Retrying..." };
        }
        return { payout: 20, msg: "Partial pattern recognition successful." };
    }

    // Loss
    return { payout: 0, msg: "Output generated: \"As an AI language model...\" (Loss)" };
}

async function spin() {
    if (isSpinning || tokens < spinCost) return;
    
    isSpinning = true;
    tokens -= spinCost;
    updateDisplay();
    showMessage("Generating tokens...", "normal");
    spinBtn.disabled = true;
    buyBtn.disabled = true;

    containerEl.classList.remove('win-state', 'lose-state');

    // Start spinning animation
    reels.forEach(reel => reel.classList.add('spinning'));

    const spinDurations = [1000, 1500, 2000]; // Stop reels one by one
    const finalResults = [];

    for (let i = 0; i < reels.length; i++) {
        await new Promise(resolve => setTimeout(resolve, spinDurations[i] - (i > 0 ? spinDurations[i-1] : 0)));
        reels[i].classList.remove('spinning');
        const symbol = getSymbol();
        reels[i].textContent = symbol;
        finalResults.push(symbol);
    }

    // Calculate result
    const { payout, msg } = calculatePayout(finalResults);
    
    tokens += payout;
    
    if (payout > 0) {
        showMessage(msg + ` (+${payout} Tokens)`, 'win');
        containerEl.classList.add('win-state');
    } else if (payout < 0) {
        showMessage(msg + ` (${payout} Tokens)`, 'lose');
        containerEl.classList.add('lose-state');
    } else {
        showMessage(msg, 'lose');
    }

    updateDisplay();
    isSpinning = false;
    buyBtn.disabled = false;
    
    // Remove states after a bit
    setTimeout(() => {
        containerEl.classList.remove('win-state', 'lose-state');
    }, 2000);
}

spinBtn.addEventListener('click', spin);

buyBtn.addEventListener('click', () => {
    tokens += 500;
    updateDisplay();
    showMessage("VC funding secured! Burn rate increased.", "win");
});

// Initialize
updateDisplay();
