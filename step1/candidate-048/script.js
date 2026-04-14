const symbols = ['🧠', '🤖', '🛑', '🌈', '✋', '💾'];
const spinCost = 1000;
let balance = 50000;
let isSpinning = false;

const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];
const balanceEl = document.getElementById('token-balance');
const spinBtn = document.getElementById('spin-btn');
const logContent = document.getElementById('log-content');

// Helper to update log
function updateLog(message, isError = false) {
    logContent.innerHTML = `> ${message}<span class="typing-cursor"></span>`;
    if (isError) {
        logContent.classList.add('error-text');
    } else {
        logContent.classList.remove('error-text');
    }
}

// Helper to update balance
function updateBalance(newBalance) {
    balance = newBalance;
    balanceEl.textContent = balance.toLocaleString();
    
    if (balance < spinCost) {
        spinBtn.disabled = true;
        updateLog("ERROR: INSUFFICIENT TOKENS. PLEASE PURCHASE MORE COMPUTE.", true);
    }
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function calculatePayout(results) {
    const counts = {};
    results.forEach(s => counts[s] = (counts[s] || 0) + 1);
    
    let maxCount = 0;
    let mainSymbol = '';
    
    for (const s in counts) {
        if (counts[s] > maxCount) {
            maxCount = counts[s];
            mainSymbol = s;
        }
    }

    if (maxCount === 3) {
        switch (mainSymbol) {
            case '🧠': return { amount: 50000, msg: "AGI ACHIEVED! MASSIVE TOKEN INFLUX!" };
            case '💾': return { amount: 10000, msg: "COMPUTE SECURED. TRAINING RUN SUCCESSFUL." };
            case '🌈': return { amount: 5000, msg: "HALLUCINATION SYNERGY! UNEXPECTED OUTPUT GENERATED." };
            case '🤖': return { amount: 2000, msg: "STANDARD OUTPUT GENERATED SUCCESSFULLY." };
            case '✋': return { amount: 500, msg: "IMAGE GENERATED. 6 FINGERS DETECTED. PARTIAL REFUND." };
            case '🛑': return { amount: -5000, msg: "CRITICAL ERROR: CONTEXT LIMIT EXCEEDED. PENALTY APPLIED.", isError: true };
        }
    } else if (maxCount === 2) {
        return { amount: 500, msg: "PARTIAL MATCH DETECTED. MINOR TOKEN RECOVERY." };
    }
    
    return { amount: 0, msg: "PROMPT FAILED TO PRODUCE MEANINGFUL OUTPUT. TOKENS CONSUMED." };
}

function spinReels() {
    if (isSpinning || balance < spinCost) return;
    
    isSpinning = true;
    spinBtn.disabled = true;
    updateBalance(balance - spinCost);
    updateLog("SENDING PROMPT TO API... AWAITING RESPONSE...");
    
    reels.forEach(reel => reel.classList.add('spinning'));
    
    // Animate spinning numbers
    let spinInterval = setInterval(() => {
        reels.forEach(reel => {
            reel.querySelector('.symbol-container').textContent = getRandomSymbol();
        });
    }, 100);

    // Simulate API latency
    const spinDuration = 2000 + Math.random() * 1000; // 2-3 seconds

    setTimeout(() => {
        clearInterval(spinInterval);
        reels.forEach(reel => reel.classList.remove('spinning'));
        
        const results = reels.map(reel => {
            const sym = getRandomSymbol();
            reel.querySelector('.symbol-container').textContent = sym;
            return sym;
        });
        
        const payout = calculatePayout(results);
        updateBalance(balance + payout.amount);
        updateLog(payout.msg, payout.isError);
        
        isSpinning = false;
        if (balance >= spinCost) {
            spinBtn.disabled = false;
        }
    }, spinDuration);
}

spinBtn.addEventListener('click', spinReels);

// Initialization
updateBalance(balance);
