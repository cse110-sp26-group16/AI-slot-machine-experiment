const symbols = [
    { char: '🤖', name: 'AI Overlord', weight: 30 },
    { char: '💸', name: 'Burn Rate', weight: 40 },
    { char: '🤡', name: 'Tech Bro', weight: 35 },
    { char: '📉', name: 'GPU Crash', weight: 40 },
    { char: '🔮', name: 'AGI Promise', weight: 20 },
    { char: '🧠', name: 'Neural Net', weight: 15 },
    { char: '🚀', name: 'Moonshot', weight: 5 } // Jackpot
];

let balance = 1000;
const costPerSpin = 10;
let isSpinning = false;

const reelElements = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];
const balanceElement = document.getElementById('balance');
const spinBtn = document.getElementById('spin-btn');
const messageArea = document.getElementById('message-area');
const logList = document.getElementById('log-list');

// Initialize
updateBalance();
logEvent("System initialized. Awaiting user input to hallucinate.");

spinBtn.addEventListener('click', spin);

function updateBalance() {
    balanceElement.textContent = balance;
    if (balance < costPerSpin) {
        spinBtn.disabled = true;
        spinBtn.textContent = "OUT OF COMPUTE";
        showMessage("You are out of tokens! The AI refuses to work.", "loss");
        logEvent("ERROR: Insufficient funds for API call.");
    }
}

function showMessage(msg, type) {
    messageArea.textContent = msg;
    messageArea.className = `message ${type}`;
}

function hideMessage() {
    messageArea.className = 'message hidden';
}

function logEvent(msg) {
    const li = document.createElement('li');
    li.textContent = msg;
    logList.insertBefore(li, logList.firstChild);
    
    // Keep log reasonable
    if (logList.children.length > 20) {
        logList.removeChild(logList.lastChild);
    }
}

function getRandomSymbol() {
    // Weighted random selection
    const totalWeight = symbols.reduce((sum, s) => sum + s.weight, 0);
    let randomNum = Math.random() * totalWeight;
    
    for (let i = 0; i < symbols.length; i++) {
        if (randomNum < symbols[i].weight) {
            return symbols[i];
        }
        randomNum -= symbols[i].weight;
    }
    return symbols[0]; // Fallback
}

async function spin() {
    if (isSpinning || balance < costPerSpin) return;

    isSpinning = true;
    balance -= costPerSpin;
    updateBalance();
    hideMessage();
    spinBtn.disabled = true;
    spinBtn.textContent = "GENERATING...";
    logEvent(`Deducted ${costPerSpin} tokens. Sending prompt...`);

    // Start visual spinning effect
    reelElements.forEach(reel => reel.classList.add('spinning'));

    const spinDurations = [1000, 1500, 2000]; // Staggered stop times
    const finalSymbols = [];

    // Simulate the spinning changing symbols rapidly
    const spinInterval = setInterval(() => {
        reelElements.forEach(reel => {
            reel.textContent = symbols[Math.floor(Math.random() * symbols.length)].char;
        });
    }, 100);

    // Stop reels one by one
    for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, spinDurations[i] - (i > 0 ? spinDurations[i-1] : 0)));
        const finalSymbol = getRandomSymbol();
        finalSymbols.push(finalSymbol);
        reelElements[i].classList.remove('spinning');
        reelElements[i].textContent = finalSymbol.char;
    }

    clearInterval(spinInterval);
    evaluateResult(finalSymbols);
    
    isSpinning = false;
    if (balance >= costPerSpin) {
        spinBtn.disabled = false;
        spinBtn.textContent = "GENERATE OUTPUT (SPIN)";
    }
}

function evaluateResult(results) {
    const chars = results.map(s => s.char);
    
    // Check for jackpot
    if (chars[0] === '🚀' && chars[1] === '🚀' && chars[2] === '🚀') {
        const winAmount = 1000;
        balance += winAmount;
        showMessage(`JACKPOT! AGI ACHIEVED! You won ${winAmount} tokens!`, "win");
        logEvent(`SUCCESS: Found AGI. VC funding secured: +${winAmount}`);
        updateBalance();
        return;
    }

    // Check for 3 of a kind
    if (chars[0] === chars[1] && chars[1] === chars[2]) {
        let winAmount = 50;
        let msg = `Model Converged! ${results[0].name} singularity! +${winAmount} tokens.`;
        
        if (chars[0] === '💸') { winAmount = 10; msg = "You successfully burned money together! +10 tokens rebate."; }
        if (chars[0] === '🤡') { winAmount = 25; msg = "Maximum hype achieved! Seed round raised! +25 tokens."; }
        
        balance += winAmount;
        showMessage(msg, "win");
        logEvent(`INFO: Pattern matched (${chars[0]}). Reward: +${winAmount}`);
        updateBalance();
        return;
    }

    // Check for 2 of a kind
    if (chars[0] === chars[1] || chars[1] === chars[2] || chars[0] === chars[2]) {
        const winAmount = 5;
        balance += winAmount;
        showMessage(`Partial hallucination... ${winAmount} tokens refunded.`, "win");
        logEvent(`WARN: High temperature detected. Refunded ${winAmount} tokens.`);
        updateBalance();
        return;
    }

    // Loss
    const lossMessages = [
        "Model hallucinated wildly. Try a better prompt.",
        "Output filtered by safety guidelines. Tokens lost.",
        "GPU cluster crashed. Please try again.",
        "Model output is garbage. Loss.",
        "The AI says: 'As a language model, I cannot give you winning lines.'"
    ];
    const randomLossMsg = lossMessages[Math.floor(Math.random() * lossMessages.length)];
    
    showMessage(randomLossMsg, "loss");
    logEvent(`ERROR: ${randomLossMsg}`);
}