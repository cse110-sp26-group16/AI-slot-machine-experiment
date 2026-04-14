const symbols = ['🤖', '🧠', '⚡', '💬', '🗑️', '💸'];
let balance = 1000;
const spinCost = 10;
let isSpinning = false;

const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];
const balanceDisplay = document.getElementById('balance');
const messageArea = document.getElementById('message-area');
const spinButton = document.getElementById('spinButton');

// Helper function to get a random symbol
function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

// Function to handle the spin logic
function spin() {
    if (isSpinning) return;
    
    if (balance < spinCost) {
        messageArea.textContent = "Rate Limit Exceeded! Out of compute tokens. Please upgrade your plan.";
        messageArea.style.color = "#f85149";
        return;
    }

    isSpinning = true;
    balance -= spinCost;
    updateBalance();
    spinButton.disabled = true;
    messageArea.textContent = "Generating tokens... thinking...";
    messageArea.style.color = "#c9d1d9";

    // Add spinning class for animation
    reels.forEach(reel => reel.classList.add('spinning'));

    // Simulate network latency / thinking time
    let spinDuration = 1000 + Math.random() * 1000;
    
    let spinIntervals = reels.map(reel => {
        return setInterval(() => {
            reel.textContent = getRandomSymbol();
        }, 100);
    });

    setTimeout(() => {
        // Stop spinning and calculate results
        spinIntervals.forEach(interval => clearInterval(interval));
        reels.forEach(reel => reel.classList.remove('spinning'));

        const finalSymbols = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
        reels[0].textContent = finalSymbols[0];
        reels[1].textContent = finalSymbols[1];
        reels[2].textContent = finalSymbols[2];

        checkWin(finalSymbols);
        
        isSpinning = false;
        spinButton.disabled = false;
    }, spinDuration);
}

// Function to calculate and handle win conditions
function checkWin(results) {
    const s1 = results[0];
    const s2 = results[1];
    const s3 = results[2];

    // Check for hallucinations first
    if (results.includes('🗑️')) {
        const hallucinationCount = results.filter(s => s === '🗑️').length;
        const penalty = 10 * hallucinationCount;
        balance -= penalty;
        messageArea.textContent = `Warning: Hallucination detected! Lost ${penalty} tokens. "As an AI model, I cannot provide accurate symbols."`;
        messageArea.style.color = "#f85149";
    } 
    // Check for jackpot
    else if (s1 === '🤖' && s2 === '🤖' && s3 === '🤖') {
        balance += 500;
        messageArea.textContent = "AGI Achieved! The singularity is here! +500 Tokens!";
        messageArea.style.color = "#e3b341";
    } 
    // Other matches
    else if (s1 === '🧠' && s2 === '🧠' && s3 === '🧠') {
        balance += 100;
        messageArea.textContent = "Coherent Output! The model actually made sense. +100 Tokens!";
        messageArea.style.color = "#3fb950";
    }
    else if (s1 === '⚡' && s2 === '⚡' && s3 === '⚡') {
        balance += 50;
        messageArea.textContent = "Burst Limit Increased! Fast generation. +50 Tokens.";
        messageArea.style.color = "#58a6ff";
    }
    else if (s1 === '💬' && s2 === '💬' && s3 === '💬') {
        balance += 20;
        messageArea.textContent = "Helpful Assistant mode activated. +20 Tokens.";
        messageArea.style.color = "#a371f7";
    }
    else if (s1 === '💸' && s2 === '💸' && s3 === '💸') {
         balance -= 100; // Twist: Getting money means spending it on API costs
         messageArea.textContent = "API Billing Cycle! You owe OpenAI. -100 Tokens.";
         messageArea.style.color = "#f85149";
    }
    // Partial matches
    else if (s1 === s2 || s2 === s3 || s1 === s3) {
        // Ensure no hallucination or money penalty for minor wins
        if (!results.includes('💸')) {
            balance += 5;
            messageArea.textContent = "Partial match. The context window captured something useful. +5 Tokens.";
            messageArea.style.color = "#8b949e";
        } else {
             messageArea.textContent = "Output truncated. Try a longer max_tokens parameter.";
             messageArea.style.color = "#c9d1d9";
        }
    } 
    // Loss
    else {
        messageArea.textContent = "Context window missed. Token generation failed to match user intent.";
        messageArea.style.color = "#c9d1d9";
    }

    updateBalance();
}

function updateBalance() {
    balanceDisplay.textContent = balance;
}

// Initial state
updateBalance();