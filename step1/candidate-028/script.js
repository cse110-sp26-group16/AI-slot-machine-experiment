const symbols = ['🤖', '🧠', '💸', '📉', '🗑️', '🌶️'];
const spinCost = 10;
let tokens = 1000;
let isSpinning = false;

const slotElements = [
    document.getElementById('slot1'),
    document.getElementById('slot2'),
    document.getElementById('slot3')
];
const spinBtn = document.getElementById('spin-btn');
const tokenBalanceDisplay = document.getElementById('token-balance');
const messageDisplay = document.getElementById('message');

function updateDisplay() {
    tokenBalanceDisplay.textContent = tokens;
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function checkWin(results) {
    const counts = {};
    results.forEach(symbol => {
        counts[symbol] = (counts[symbol] || 0) + 1;
    });

    let payout = 0;
    let message = "Hallucination generated! (No win)";

    if (counts['🤖'] === 3) {
        payout = 500;
        message = "AGI Achieved! JACKPOT! +500 Tokens";
    } else if (counts['🧠'] === 3) {
        payout = 200;
        message = "Galaxy Brain! +200 Tokens";
    } else if (counts['💸'] === 3) {
        payout = 100;
        message = "Funding Secured! +100 Tokens";
    } else if (counts['📉'] === 3) {
        payout = -50;
        message = "AI Winter! Investors pulled out. -50 Tokens";
    } else if (counts['🗑️'] === 3) {
        payout = -100;
        message = "Garbage In, Garbage Out! Model collapsed. -100 Tokens";
    } else {
        // Check for 2 of a kind (positive ones only)
        for (const symbol of ['🤖', '🧠', '💸']) {
            if (counts[symbol] === 2) {
                payout = 20;
                message = `Partial pattern match on ${symbol}. +20 Tokens`;
                break;
            }
        }
    }

    tokens += payout;
    
    if (tokens <= 0) {
        tokens = 0;
        message = "Out of tokens! Your cloud provider shut off your instances.";
        spinBtn.disabled = true;
    }

    messageDisplay.textContent = message;
    updateDisplay();
}

function spin() {
    if (isSpinning || tokens < spinCost) return;

    tokens -= spinCost;
    updateDisplay();
    messageDisplay.textContent = "Generating output... please wait.";
    
    isSpinning = true;
    spinBtn.disabled = true;

    // Start spinning animation
    slotElements.forEach(slot => slot.classList.add('spinning'));

    let spinDurations = [1000, 1500, 2000]; // Staggered stop times
    let results = [];

    const spinIntervals = slotElements.map((slot, index) => {
        return setInterval(() => {
            slot.textContent = getRandomSymbol();
        }, 100);
    });

    spinDurations.forEach((duration, index) => {
        setTimeout(() => {
            clearInterval(spinIntervals[index]);
            slotElements[index].classList.remove('spinning');
            
            // Set final symbol
            const finalSymbol = getRandomSymbol();
            slotElements[index].textContent = finalSymbol;
            results[index] = finalSymbol;

            if (index === 2) {
                isSpinning = false;
                spinBtn.disabled = (tokens < spinCost);
                checkWin(results);
            }
        }, duration);
    });
}

spinBtn.addEventListener('click', spin);
updateDisplay();
