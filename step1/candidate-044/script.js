const symbols = ['🧠', '🤖', '💻', '🔋', '🗑️', '💸'];
const costPerSpin = 100;
let balance = 10000;
let isSpinning = false;

const balanceEl = document.getElementById('balance');
const messageEl = document.getElementById('message');
const spinBtn = document.getElementById('spin-btn');
const reels = [
    document.querySelector('#reel1 .symbol'),
    document.querySelector('#reel2 .symbol'),
    document.querySelector('#reel3 .symbol')
];
const machineEl = document.querySelector('.machine');

// Payout mapping
const payouts = {
    '🧠': 5000,
    '🤖': 2000,
    '💻': 1000,
    '🔋': 500,
    '🗑️': 10,
    '💸': 0 // Absolute loss
};

function updateBalance(amount) {
    balance += amount;
    balanceEl.textContent = balance;
    
    if (balance < costPerSpin) {
        spinBtn.disabled = true;
        showMessage("Out of context window! (Bankrupt)", 'lose-text');
    }
}

function showMessage(text, className = '') {
    messageEl.textContent = text;
    messageEl.className = 'message ' + className;
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function calculateWin(results) {
    // Check for 3 of a kind
    if (results[0] === results[1] && results[1] === results[2]) {
        return { amount: payouts[results[0]], type: 'jackpot' };
    }
    
    // Check for 2 of a kind
    if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
        return { amount: 50, type: 'partial' };
    }
    
    return { amount: 0, type: 'loss' };
}

async function spinReel(reelEl, duration) {
    return new Promise(resolve => {
        let startTime = null;
        const speed = 50; // ms per symbol change
        let lastChange = 0;
        
        function animate(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            
            if (timestamp - lastChange > speed) {
                reelEl.textContent = getRandomSymbol();
                lastChange = timestamp;
            }
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                const finalSymbol = getRandomSymbol();
                reelEl.textContent = finalSymbol;
                resolve(finalSymbol);
            }
        }
        
        requestAnimationFrame(animate);
    });
}

spinBtn.addEventListener('click', async () => {
    if (isSpinning || balance < costPerSpin) return;
    
    isSpinning = true;
    spinBtn.disabled = true;
    updateBalance(-costPerSpin);
    showMessage("Generating response...", '');
    machineEl.classList.add('spinning');
    
    try {
        // Spin reels with slightly different durations for effect
        const results = await Promise.all([
            spinReel(reels[0], 1000),
            spinReel(reels[1], 1500),
            spinReel(reels[2], 2000)
        ]);
        
        machineEl.classList.remove('spinning');
        
        const winResult = calculateWin(results);
        
        if (winResult.amount > 0) {
            updateBalance(winResult.amount);
            if (winResult.type === 'jackpot') {
                showMessage(`Major Hallucination! Won ${winResult.amount} Tokens!`, 'win-text');
            } else {
                showMessage(`Partial match! Recovered ${winResult.amount} Tokens.`, 'win-text');
            }
        } else {
            showMessage("Rate limited! 0 Tokens.", 'lose-text');
        }
    } catch (error) {
        console.error("Spin error:", error);
        showMessage("500 Internal Server Error", 'lose-text');
        machineEl.classList.remove('spinning');
    } finally {
        isSpinning = false;
        if (balance >= costPerSpin) {
            spinBtn.disabled = false;
        }
    }
});
