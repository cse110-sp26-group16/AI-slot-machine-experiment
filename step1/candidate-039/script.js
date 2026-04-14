const symbols = [
    '🤖', // AI Bot
    '🧠', // Neural Network
    '💾', // Training Data
    '📉', // Loss Function (Bad)
    '💸', // Cloud Bill (Bad)
    '🚀', // To the moon (Good)
    '🔥'  // GPU on fire
];

const COST_PER_SPIN = 10;
let balance = 1000;
let isSpinning = false;

const balanceDisplay = document.getElementById('balance');
const messageDisplay = document.getElementById('message');
const spinButton = document.getElementById('spin-button');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];

function updateBalance(amount) {
    balance += amount;
    balanceDisplay.textContent = balance;
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function evaluateSpin(results) {
    // Check for wins
    const uniqueSymbols = new Set(results);
    
    if (uniqueSymbols.size === 1) {
        // Jackpot - 3 of a kind
        const symbol = results[0];
        let payout = 100; // Default jackpot
        
        if (symbol === '🚀') payout = 500;
        if (symbol === '🧠') payout = 300;
        if (symbol === '💸' || symbol === '📉') {
            // Bad jackpot
            messageDisplay.innerHTML = `<span class="error-text">Catastrophic Forgetting! You lost 50 tokens!</span>`;
            updateBalance(-50);
            return;
        }

        messageDisplay.innerHTML = `<span class="win-text">AGI Achieved! You won ${payout} tokens!</span>`;
        updateBalance(payout);
    } else if (uniqueSymbols.size === 2) {
        // Small win - 2 of a kind
        let payout = 20;
        messageDisplay.innerHTML = `<span class="win-text">Good optimization! You won ${payout} tokens!</span>`;
        updateBalance(payout);
    } else {
        // Loss
        messageDisplay.textContent = "Hallucination generated. Try again.";
    }

    if (balance <= 0) {
        messageDisplay.innerHTML = `<span class="error-text">Out of Context Window (Rate Limited). Please insert more funding.</span>`;
        spinButton.disabled = true;
    }
}

function spin() {
    if (isSpinning || balance < COST_PER_SPIN) return;

    isSpinning = true;
    spinButton.disabled = true;
    updateBalance(-COST_PER_SPIN);
    messageDisplay.textContent = "Generating tokens...";

    // Visual spinning effect
    const spinIntervals = [];
    reels.forEach((reel, index) => {
        reel.classList.add('spinning');
        spinIntervals.push(setInterval(() => {
            reel.textContent = getRandomSymbol();
        }, 100)); // Change symbol every 100ms
    });

    const results = [];
    
    // Stop reels one by one
    reels.forEach((reel, index) => {
        setTimeout(() => {
            clearInterval(spinIntervals[index]);
            reel.classList.remove('spinning');
            const finalSymbol = getRandomSymbol();
            reel.textContent = finalSymbol;
            results.push(finalSymbol);

            // If it's the last reel, evaluate the result
            if (index === reels.length - 1) {
                setTimeout(() => {
                    evaluateSpin(results);
                    isSpinning = false;
                    if (balance >= COST_PER_SPIN) {
                        spinButton.disabled = false;
                    }
                }, 200); // Small delay before showing result
            }
        }, 1000 + (index * 500)); // Reel 1 stops at 1s, Reel 2 at 1.5s, Reel 3 at 2s
    });
}

spinButton.addEventListener('click', spin);