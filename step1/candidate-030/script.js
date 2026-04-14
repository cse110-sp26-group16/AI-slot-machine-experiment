const symbols = ['🤖', '🧠', '⚡', '💸', '📉', '🚀'];
const paytable = {
    '🤖,🤖,🤖': 500,
    '🧠,🧠,🧠': 200,
    '🚀,🚀,🚀': 150,
    '⚡,⚡,⚡': 100,
    '💸,💸,💸': 50,
    '📉,📉,📉': -100
};

let balance = 1000;
const costPerSpin = 50;
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

function spinReel(reelElement, time, finalSymbol) {
    return new Promise(resolve => {
        let interval = setInterval(() => {
            reelElement.textContent = getRandomSymbol();
        }, 50);

        setTimeout(() => {
            clearInterval(interval);
            reelElement.textContent = finalSymbol;
            resolve();
        }, time);
    });
}

async function spin() {
    if (isSpinning) return;
    if (balance < costPerSpin) {
        messageDisplay.textContent = "Rate Limit Exceeded! Out of Tokens.";
        return;
    }

    isSpinning = true;
    spinButton.disabled = true;
    messageDisplay.textContent = "Generating output... computing probabilities...";
    updateBalance(-costPerSpin);

    const result = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
    const spinTimes = [1000, 1500, 2000];
    
    await Promise.all([
        spinReel(reels[0], spinTimes[0], result[0]),
        spinReel(reels[1], spinTimes[1], result[1]),
        spinReel(reels[2], spinTimes[2], result[2])
    ]);

    calculateWin(result);
    isSpinning = false;
    spinButton.disabled = false;
}

function calculateWin(result) {
    const resultString = result.join(',');
    let won = 0;
    let message = "";

    if (paytable[resultString] !== undefined) {
        won = paytable[resultString];
        if (won > 0) {
            message = `Jackpot! You gained ${won} tokens!`;
            if(result[0] === '🤖') message = "AGI ACHIEVED! +" + won + " Tokens!";
            if(result[0] === '🚀') message = "HYPE TRAIN! +" + won + " Tokens!";
        } else {
            message = `Model Collapse! Hallucination cost you ${Math.abs(won)} extra tokens!`;
        }
    } else {
        const counts = {};
        for (const sym of result) {
            counts[sym] = (counts[sym] || 0) + 1;
        }
        const maxMatch = Math.max(...Object.values(counts));
        if (maxMatch === 2) {
            won = 10;
            message = "Context Partially Cached. +10 Tokens returned.";
        } else {
            message = "Inference failed to produce value. Try another prompt (spin).";
        }
    }

    if (won !== 0) updateBalance(won);
    messageDisplay.textContent = message;
}

spinButton.addEventListener('click', spin);