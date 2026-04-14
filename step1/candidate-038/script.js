const symbols = ['🤖', '🧠', '🔥', '💸', '🗑️'];

// Weights for symbols to make it feel like a real slot machine
// Higher weight = more common
const symbolWeights = {
    '🗑️': 40,  // Very common hallucination
    '💸': 30,  // Common
    '🔥': 15, // Uncommon
    '🧠': 10,  // Rare
    '🤖': 5    // Very rare
};

// Create a weighted array for random selection
let weightedSymbols = [];
for (const [symbol, weight] of Object.entries(symbolWeights)) {
    for (let i = 0; i < weight; i++) {
        weightedSymbols.push(symbol);
    }
}

const spinCost = 256;
let balance = 8192;
let isSpinning = false;

const balanceDisplay = document.getElementById('balance');
const costDisplay = document.getElementById('cost');
const messageDisplay = document.getElementById('message');
const spinButton = document.getElementById('spin-button');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];

function updateBalance() {
    balanceDisplay.textContent = balance;
    if (balance < spinCost) {
        spinButton.disabled = true;
        messageDisplay.textContent = "Out of Context Window! You need more tokens.";
        messageDisplay.style.color = "#f85149";
    }
}

function getRandomSymbol() {
    const randomIndex = Math.floor(Math.random() * weightedSymbols.length);
    return weightedSymbols[randomIndex];
}

function calculateWin(results) {
    const [s1, s2, s3] = results;
    
    // 3 of a kind
    if (s1 === s2 && s2 === s3) {
        switch (s1) {
            case '🤖': return { amount: 5000, msg: "AGI Achieved! (+5000)" };
            case '🧠': return { amount: 2000, msg: "Galaxy Brain Output! (+2000)" };
            case '🔥': return { amount: 1000, msg: "Compute Secured! (+1000)" };
            case '💸': return { amount: 500, msg: "Funding Secured! (+500)" };
            case '🗑️': return { amount: -500, msg: "Total Hallucination! (-500 penalty)" };
        }
    }
    
    // 2 of a kind
    if (s1 === s2 || s2 === s3 || s1 === s3) {
        return { amount: 100, msg: "Partial Match. (+100)" };
    }
    
    // No match
    return { amount: 0, msg: "Output is useless. Try regenerating." };
}

function spinReel(reel, duration, finalSymbol) {
    return new Promise(resolve => {
        let startTime = null;
        reel.classList.add('spinning');
        
        function animate(currentTime) {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;
            
            // Change symbol every 50ms to simulate spinning
            if (Math.floor(elapsed / 50) % 2 === 0) {
                reel.textContent = getRandomSymbol();
            }
            
            if (elapsed < duration) {
                requestAnimationFrame(animate);
            } else {
                reel.classList.remove('spinning');
                reel.textContent = finalSymbol;
                resolve();
            }
        }
        
        requestAnimationFrame(animate);
    });
}

async function spin() {
    if (isSpinning || balance < spinCost) return;
    
    isSpinning = true;
    spinButton.disabled = true;
    balance -= spinCost;
    updateBalance();
    
    messageDisplay.style.color = "var(--text-color)";
    messageDisplay.textContent = "Generating output...";
    
    // Determine final symbols
    const finalSymbols = [
        getRandomSymbol(),
        getRandomSymbol(),
        getRandomSymbol()
    ];
    
    // Spin reels with different durations for effect
    const spinPromises = [
        spinReel(reels[0], 1000, finalSymbols[0]),
        spinReel(reels[1], 1500, finalSymbols[1]),
        spinReel(reels[2], 2000, finalSymbols[2])
    ];
    
    await Promise.all(spinPromises);
    
    // Calculate outcome
    const winResult = calculateWin(finalSymbols);
    balance += winResult.amount;
    
    if (winResult.amount > 0) {
        messageDisplay.style.color = "#3fb950"; // Green for win
    } else if (winResult.amount < 0) {
        messageDisplay.style.color = "#f85149"; // Red for penalty
    } else {
        messageDisplay.style.color = "var(--text-color)"; // Default
    }
    
    messageDisplay.textContent = winResult.msg;
    updateBalance();
    
    isSpinning = false;
    if (balance >= spinCost) {
        spinButton.disabled = false;
    }
}

spinButton.addEventListener('click', spin);

// Initialize
updateBalance();