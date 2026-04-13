const symbols = ['🤖', '🧠', '⚡', '📄', '🗑️'];
const COST_PER_SPIN = 10;
let tokenBalance = 1000;

const balanceEl = document.getElementById('token-balance');
const spinBtn = document.getElementById('spin-btn');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];
const statusMsg = document.getElementById('status-message');

function updateBalanceDisplay() {
    balanceEl.textContent = tokenBalance;
}

function setStatus(message, type = '') {
    statusMsg.textContent = message;
    statusMsg.className = type ? `${type}-text` : '';
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function spinReels() {
    if (tokenBalance < COST_PER_SPIN) {
        setStatus("Rate Limit Exceeded. Buy more tokens (Refresh).", "error");
        spinBtn.disabled = true;
        return;
    }

    tokenBalance -= COST_PER_SPIN;
    updateBalanceDisplay();
    spinBtn.disabled = true;
    setStatus("Generating response... (Simulating API latency)", "processing");

    // Add spinning animation class
    reels.forEach(reel => reel.classList.add('spinning'));

    // Start updating symbols rapidly to simulate spinning
    const spinInterval = setInterval(() => {
        reels.forEach(reel => {
            reel.querySelector('.symbol').textContent = getRandomSymbol();
        });
    }, 50);

    // Stop after "API response time"
    setTimeout(() => {
        clearInterval(spinInterval);
        reels.forEach(reel => reel.classList.remove('spinning'));
        
        // Determine final symbols
        const finalSymbols = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
        
        reels.forEach((reel, index) => {
            reel.querySelector('.symbol').textContent = finalSymbols[index];
        });

        evaluateOutcome(finalSymbols);
        spinBtn.disabled = false;
        
        if(tokenBalance < COST_PER_SPIN) {
             spinBtn.disabled = true;
             setStatus("Rate Limit Exceeded. You are out of tokens.", "error");
        }

    }, 1500 + Math.random() * 1000); // 1.5s to 2.5s delay
}

function evaluateOutcome(results) {
    const counts = {};
    results.forEach(s => counts[s] = (counts[s] || 0) + 1);

    const uniqueSymbols = Object.keys(counts);

    if (uniqueSymbols.length === 1) {
        // Three of a kind
        const symbol = uniqueSymbols[0];
        let reward = 0;
        let message = "";

        if (symbol === '🤖') {
            reward = 500;
            message = "AGI Achieved! The singularity is here. (+500 Tokens)";
        } else if (symbol === '🧠') {
            reward = 200;
            message = "Zero-Shot Success! Perfect reasoning. (+200 Tokens)";
        } else if (symbol === '⚡') {
            reward = 100;
            message = "Optimal Compute! Highly efficient output. (+100 Tokens)";
        } else if (symbol === '📄') {
             reward = 50;
             message = "Perfect Prompt Engineering! (+50 Tokens)";
        } else if (symbol === '🗑️') {
            reward = 0;
            message = "Complete Hallucination. Garbage Output. (-0 Tokens, total loss of spin cost)";
        }

        if (reward > 0) {
            tokenBalance += reward;
            setStatus(message, "success");
        } else {
             setStatus(message, "error");
        }
        
    } else if (uniqueSymbols.length === 2) {
        // Two of a kind
        let hasGarbage = results.includes('🗑️');
        if(hasGarbage) {
            setStatus("Partial Hallucination detected. Output corrupted.", "error");
        } else {
            tokenBalance += 20;
            setStatus("Partial Comprehension. Acceptable output. (+20 Tokens)", "success");
        }
    } else {
        // No matches
        setStatus("Context Window Exceeded. Output makes no sense.", "error");
    }

    updateBalanceDisplay();
}

spinBtn.addEventListener('click', spinReels);

// Initial setup
updateBalanceDisplay();
