const symbols = ['🤖', '🧠', '💸', '💾', '🔋', '🗑️'];
const weights = [1, 2, 3, 4, 4, 5]; // Lower number = rarer

// Weighted random selection
function getRandomSymbol() {
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let randomNum = Math.random() * totalWeight;
    for (let i = 0; i < symbols.length; i++) {
        if (randomNum < weights[i]) {
            return symbols[i];
        }
        randomNum -= weights[i];
    }
    return symbols[symbols.length - 1];
}

let tokens = 1000;
const spinCost = 100;
let isSpinning = false;

const tokenElement = document.getElementById('token-count');
const spinButton = document.getElementById('spin-button');
const messageElement = document.getElementById('message');
const reels = [
    document.getElementById('reel-1'),
    document.getElementById('reel-2'),
    document.getElementById('reel-3')
];

const funnyMessages = [
    "Hallucinating...",
    "Optimizing loss function...",
    "Downloading more RAM...",
    "Parsing training data...",
    "Checking for bias...",
    "Generating boilerplate...",
    "Updating weights...",
    "Synthesizing response..."
];

function updateTokens(amount) {
    tokens += amount;
    tokenElement.innerText = tokens;
    
    // Visual feedback for token changes
    if (amount > 0) {
        tokenElement.style.color = "#4ade80"; // Green for win
        setTimeout(() => tokenElement.style.color = "", 1000);
    } else if (amount < 0) {
        tokenElement.style.color = "#ff4d4d"; // Red for loss
        setTimeout(() => tokenElement.style.color = "", 1000);
    }

    if (tokens < spinCost) {
        spinButton.disabled = true;
        messageElement.innerText = "Out of tokens! Restart server to get more funding.";
        messageElement.style.color = "#ff4d4d";
    }
}

function spin() {
    if (tokens < spinCost || isSpinning) return;

    isSpinning = true;
    spinButton.disabled = true;
    updateTokens(-spinCost);
    messageElement.innerText = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
    messageElement.style.color = "#fca311";

    reels.forEach(reel => {
        reel.classList.add('spinning');
        reel.innerText = '❓'; // Reset symbol visually during spin
    });

    // Simulate spin delay
    setTimeout(() => {
        const results = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
        
        reels.forEach((reel, index) => {
            reel.classList.remove('spinning');
            reel.innerText = results[index];
        });

        calculateWinnings(results);
        isSpinning = false;
        if (tokens >= spinCost) {
            spinButton.disabled = false;
        }
    }, 1500);
}

function calculateWinnings(results) {
    const [r1, r2, r3] = results;
    let won = 0;
    let msg = "";

    // Check for trash
    if (results.includes('🗑️')) {
        let trashCount = results.filter(s => s === '🗑️').length;
        won = -50 * trashCount;
        msg = `Garbage In, Garbage Out! Lost ${Math.abs(won)} extra tokens.`;
    } else if (r1 === r2 && r2 === r3) {
        // 3 of a kind
        if (r1 === '🤖') {
            won = 1000;
            msg = "AGI ACHIEVED! +1000 Tokens!";
        } else if (r1 === '🧠') {
            won = 500;
            msg = "Galaxy Brain! +500 Tokens!";
        } else if (r1 === '💸') {
            won = 250;
            msg = "VC Funding Secured! +250 Tokens!";
        } else {
            won = 100;
            msg = "Context window expanded! +100 Tokens!";
        }
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
        // 2 of a kind
        won = 50;
        msg = "Partial match. Found somewhat relevant context. +50 Tokens.";
    } else {
        msg = "Response generation failed. Output truncated. Try again.";
    }

    if (won > 0) {
        updateTokens(won);
        messageElement.style.color = "#4ade80";
    } else if (won < 0) {
        updateTokens(won);
        messageElement.style.color = "#ff4d4d";
    }
    
    if (msg) {
        messageElement.innerText = msg;
    }
}

spinButton.addEventListener('click', spin);
