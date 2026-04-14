const SYMBOLS = ['🤖', '🧠', '💸', '🤡', '📉', '🔮'];
const SPIN_COST = 500;
let balance = 10000;
let isSpinning = false;

const balanceDisplay = document.getElementById('balance');
const spinBtn = document.getElementById('spin-btn');
const messageDisplay = document.getElementById('message');
const reels = [
    document.getElementById('reel1').querySelector('.symbol'),
    document.getElementById('reel2').querySelector('.symbol'),
    document.getElementById('reel3').querySelector('.symbol')
];

const WIN_MESSAGES = {
    '🤖': "AGI Achieved! (+5000 Tokens)",
    '🧠': "New Foundation Model Trained! (+3000 Tokens)",
    '💸': "Series A Funding Secured! (+10000 Tokens)",
    '🤡': "Peak AI Hype Reached! (+2000 Tokens)",
    '📉': "Shorting Nvidia Paid Off! (+4000 Tokens)",
    '🔮': "Perfect Next Token Prediction! (+2500 Tokens)"
};

const PAYOUTS = {
    '🤖': 5000,
    '🧠': 3000,
    '💸': 10000,
    '🤡': 2000,
    '📉': 4000,
    '🔮': 2500
};

const LOSS_MESSAGES = [
    "Hallucination detected. Context window cleared.",
    "GPU Out of Memory (OOM).",
    "Rate Limit Exceeded. Please upgrade your tier.",
    "Model collapsed due to training on AI generated data.",
    "Prompt injected. System compromised.",
    "Tokens wasted on redundant boilerplate.",
    "API Key revoked.",
    "Investors realized it's just an API wrapper."
];

function updateBalance(amount) {
    balance += amount;
    balanceDisplay.textContent = balance;
}

function showMessage(text, type = 'info') {
    messageDisplay.textContent = text;
    messageDisplay.className = type;
}

function getRandomSymbol() {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function getRandomLossMessage() {
    return LOSS_MESSAGES[Math.floor(Math.random() * LOSS_MESSAGES.length)];
}

function spinReels() {
    if (balance < SPIN_COST) {
        showMessage("Cloud Bill Too High - Server Shut Down (Not enough tokens!)", 'error');
        spinBtn.disabled = true;
        return;
    }

    if (isSpinning) return;

    isSpinning = true;
    spinBtn.disabled = true;
    updateBalance(-SPIN_COST);
    showMessage("Generating Next Tokens...", 'info');

    // Add spinning class to start animation
    document.querySelectorAll('.reel').forEach(r => r.classList.add('spinning'));

    // Simulated API delay
    const spinDuration = 2000; 

    setTimeout(() => {
        // Stop animation
        document.querySelectorAll('.reel').forEach(r => r.classList.remove('spinning'));

        // Determine final symbols
        const finalSymbols = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];

        // Update DOM
        reels.forEach((reel, index) => {
            reel.textContent = finalSymbols[index];
        });

        evaluateResult(finalSymbols);

        isSpinning = false;
        
        if (balance >= SPIN_COST) {
            spinBtn.disabled = false;
        }

    }, spinDuration);
}

function evaluateResult(finalSymbols) {
    if (finalSymbols[0] === finalSymbols[1] && finalSymbols[1] === finalSymbols[2]) {
        // Win!
        const winningSymbol = finalSymbols[0];
        const payout = PAYOUTS[winningSymbol];
        updateBalance(payout);
        showMessage(WIN_MESSAGES[winningSymbol], 'win');
    } else {
        // Loss
        showMessage(`Error: ${getRandomLossMessage()}`, 'error');
        if (balance < SPIN_COST) {
             showMessage("Bankruptcy. You've been replaced by an AI.", 'error');
        }
    }
}

spinBtn.addEventListener('click', spinReels);
