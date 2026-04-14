const tokensDisplay = document.getElementById('token-balance');
const spinButton = document.getElementById('spin-button');
const messageArea = document.getElementById('message-area');
const reels = [
    document.getElementById('reel-1').querySelector('.symbol'),
    document.getElementById('reel-2').querySelector('.symbol'),
    document.getElementById('reel-3').querySelector('.symbol')
];
const reelContainers = [
    document.getElementById('reel-1'),
    document.getElementById('reel-2'),
    document.getElementById('reel-3')
];

let balance = 4096;
const spinCost = 128;

const symbols = ['💎', '🧠', '🤖', '💬', '🐛'];
// To make it slightly realistic, give probabilities or just random
// Uniform distribution for simplicity, though real slots use weighted.
// Let's use uniform for a fair (or very brutal) AI experience.

function updateBalance(newBalance) {
    balance = newBalance;
    tokensDisplay.textContent = balance;
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function showMessage(text, type = 'info') {
    messageArea.textContent = text;
    messageArea.className = 'message-area';
    if (type === 'win') messageArea.classList.add('win');
    if (type === 'error') messageArea.classList.add('loss');
}

function calculatePayout(results) {
    if (results[0] === results[1] && results[1] === results[2]) {
        const symbol = results[0];
        switch (symbol) {
            case '💎':
                return { payout: 10000, message: "AGI Achieved! JACKPOT!", type: 'win' };
            case '🧠':
                return { payout: 2048, message: "Deep Learning Success!", type: 'win' };
            case '🤖':
                return { payout: 1024, message: "Autonomous Agent Deployed!", type: 'win' };
            case '💬':
                return { payout: 512, message: "Excellent Prompt Engineering!", type: 'win' };
            case '🐛':
                return { payout: -512, message: "Severe Hallucination! Tokens lost.", type: 'error' };
        }
    }
    
    // Check if it's partly a bug
    const bugCount = results.filter(s => s === '🐛').length;
    if (bugCount === 1) return { payout: 0, message: "Syntax error detected in prompt.", type: 'error' };
    if (bugCount === 2) return { payout: 0, message: "Model is hallucinating.", type: 'error' };

    return { payout: 0, message: "Rate Limited / Context Exceeded. Try again.", type: 'info' };
}

spinButton.addEventListener('click', () => {
    if (balance < spinCost) {
        showMessage("Out of Tokens! Please purchase more compute.", "error");
        return;
    }

    // Deduct cost
    updateBalance(balance - spinCost);
    
    // Disable button and start animation
    spinButton.disabled = true;
    showMessage("Generating response...", "info");
    
    reelContainers.forEach(container => container.classList.add('spinning'));

    // Simulate network latency / spinning
    setTimeout(() => {
        // Stop spinning and set results
        const results = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
        
        reels.forEach((reel, index) => {
            reel.textContent = results[index];
        });
        
        reelContainers.forEach(container => container.classList.remove('spinning'));

        // Calculate and apply payout
        const outcome = calculatePayout(results);
        if (outcome.payout !== 0) {
            updateBalance(balance + outcome.payout);
        }
        showMessage(outcome.message, outcome.type);
        
        // Re-enable button if enough tokens remain
        if (balance >= spinCost) {
            spinButton.disabled = false;
        } else {
            showMessage("Out of Tokens! Please purchase more compute.", "error");
            spinButton.disabled = true;
        }
    }, 1500); // 1.5 seconds spin
});