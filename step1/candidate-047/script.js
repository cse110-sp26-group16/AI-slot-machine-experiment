const symbols = [
    { emoji: '🧠', value: 100, weight: 1, name: 'AGI' },           // Jackpot, very rare
    { emoji: '💻', value: 20, weight: 10, name: 'H100 GPU' },      // High value
    { emoji: '🪙', value: 5, weight: 30, name: 'Token' },         // Medium value
    { emoji: '🗑️', value: 2, weight: 40, name: 'Training Data' }, // Low value
    { emoji: '😵‍💫', value: 0, weight: 30, name: 'Hallucination' }  // Dud
];

// Generate weighted pool
let symbolPool = [];
symbols.forEach(symbol => {
    for (let i = 0; i < symbol.weight; i++) {
        symbolPool.push(symbol);
    }
});

let balance = 10000;
let isSpinning = false;

// DOM Elements
const balanceDisplay = document.getElementById('balance');
const betInput = document.getElementById('bet-amount');
const spinButton = document.getElementById('spin-button');
const resetButton = document.getElementById('reset-button');
const consoleLog = document.getElementById('console-log');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];

function logMessage(message, type = 'info') {
    const p = document.createElement('p');
    p.className = type;
    p.textContent = `> ${message}`;
    consoleLog.appendChild(p);
    consoleLog.scrollTop = consoleLog.scrollHeight;
}

function getRandomSymbol() {
    const randomIndex = Math.floor(Math.random() * symbolPool.length);
    return symbolPool[randomIndex];
}

function updateBalance(amount) {
    balance += amount;
    balanceDisplay.textContent = balance;
    
    if (balance <= 0) {
        spinButton.disabled = true;
        spinButton.classList.add('hidden');
        resetButton.classList.remove('hidden');
        logMessage('Error 402: Payment Required. API Quota exhausted.', 'error');
    }
}

async function spin() {
    if (isSpinning) return;
    
    const bet = parseInt(betInput.value);
    
    if (isNaN(bet) || bet <= 0) {
        logMessage('Invalid temperature setting.', 'warning');
        return;
    }
    
    if (bet > balance) {
        logMessage('Error 429: Bet exceeds current API Quota.', 'warning');
        return;
    }

    isSpinning = true;
    spinButton.disabled = true;
    updateBalance(-bet);
    logMessage(`Prompt submitted. Temperature set to ${bet}. Generating...`, 'info');

    // Start spin animation
    reels.forEach(reel => reel.classList.add('spinning'));

    const results = [];
    
    // Stop reels sequentially
    for (let i = 0; i < reels.length; i++) {
        // Wait longer for each subsequent reel
        await new Promise(resolve => setTimeout(resolve, 800 + (i * 600)));
        
        reels[i].classList.remove('spinning');
        const finalSymbol = getRandomSymbol();
        results.push(finalSymbol);
        
        const contentDiv = reels[i].querySelector('.reel-content');
        contentDiv.textContent = finalSymbol.emoji;
    }

    evaluateResults(results, bet);
    
    isSpinning = false;
    if (balance > 0) {
        spinButton.disabled = false;
    }
}

function evaluateResults(results, bet) {
    // Check for 3 of a kind
    if (results[0].emoji === results[1].emoji && results[1].emoji === results[2].emoji) {
        const symbol = results[0];
        
        if (symbol.name === 'Hallucination') {
             logMessage('System critically hallucinated. Total nonsense generated. 0 tokens won.', 'error');
             return;
        }

        const winAmount = bet * symbol.value;
        updateBalance(winAmount);
        
        if (symbol.name === 'AGI') {
            logMessage(`CRITICAL ALERT: AGI ACHIEVED! Payout: +${winAmount} Tokens!`, 'success');
        } else {
            logMessage(`Match found: 3x ${symbol.name}. Payout: +${winAmount} Tokens.`, 'success');
        }
        return;
    }
    
    // Check for 2 of a kind (first two or last two)
    if ((results[0].emoji === results[1].emoji) || (results[1].emoji === results[2].emoji)) {
        const matchingSymbol = results[0].emoji === results[1].emoji ? results[0] : results[1];
        
        if (matchingSymbol.name === 'Hallucination') {
             logMessage('Partial hallucination detected. Output incoherent.', 'warning');
             return;
        }

        const winAmount = Math.floor(bet * (matchingSymbol.value / 2));
        
        // Ensure at least a small win if it's not a dud
        if (winAmount > 0) {
             updateBalance(winAmount);
             logMessage(`Partial match: 2x ${matchingSymbol.name}. Recovered +${winAmount} Tokens.`, 'info');
             return;
        }
    }

    // No win
    logMessage('Output generated successfully, but was not useful. 0 tokens recovered.', 'warning');
}

function resetGame() {
    balance = 10000;
    balanceDisplay.textContent = balance;
    spinButton.disabled = false;
    spinButton.classList.remove('hidden');
    resetButton.classList.add('hidden');
    logMessage('System upgraded to Pro. API Quota refilled to 10000 Tokens.', 'success');
}

// Event Listeners
spinButton.addEventListener('click', spin);
resetButton.addEventListener('click', resetGame);