document.addEventListener('DOMContentLoaded', () => {
    // State
    let balance = 1000;
    const spinCost = 10;
    const symbols = ['🤖', '🧠', '🖥️', '🗑️', '💸'];
    let isSpinning = false;

    // DOM Elements
    const balanceDisplay = document.getElementById('balance');
    const spinBtn = document.getElementById('spin-btn');
    const messageArea = document.getElementById('message');
    const reels = [
        document.getElementById('reel1'),
        document.getElementById('reel2'),
        document.getElementById('reel3')
    ];

    // Functions
    function updateBalance(amount) {
        balance += amount;
        balanceDisplay.textContent = balance;
        
        // Visual feedback
        if (amount > 0) {
            balanceDisplay.style.color = 'var(--accent-color)';
            balanceDisplay.style.textShadow = 'var(--accent-glow)';
        } else if (amount < 0) {
            balanceDisplay.style.color = 'var(--danger-color)';
            balanceDisplay.style.textShadow = 'var(--danger-glow)';
        }
        
        // Reset color after a moment
        setTimeout(() => {
            balanceDisplay.style.color = 'var(--accent-color)';
            balanceDisplay.style.textShadow = 'var(--accent-glow)';
        }, 500);

        if (balance < spinCost) {
            spinBtn.disabled = true;
            showMessage("Out of tokens! The VC funding dried up.", "error");
        }
    }

    function showMessage(msg, type = 'normal') {
        messageArea.textContent = msg;
        messageArea.className = 'message-area'; // reset
        if (type === 'success') {
            messageArea.classList.add('message-success');
        } else if (type === 'error') {
            messageArea.classList.add('message-error');
        }
    }

    function getRandomSymbol() {
        return symbols[Math.floor(Math.random() * symbols.length)];
    }

    function spin() {
        if (isSpinning || balance < spinCost) return;

        isSpinning = true;
        spinBtn.disabled = true;
        showMessage("Processing...", "normal");
        updateBalance(-spinCost);

        // Add spinning animation class to all reels
        reels.forEach(reel => reel.classList.add('spinning'));

        const results = [];
        let completedReels = 0;

        // Stop reels one by one with a stagger
        reels.forEach((reel, index) => {
            const stopTime = 1000 + (index * 500); // 1s, 1.5s, 2s
            
            setTimeout(() => {
                reel.classList.remove('spinning');
                const resultSymbol = getRandomSymbol();
                reel.querySelector('.symbol').textContent = resultSymbol;
                results[index] = resultSymbol;
                completedReels++;

                // If all reels are stopped, evaluate results
                if (completedReels === reels.length) {
                    evaluateResults(results);
                }
            }, stopTime);
        });
    }

    function evaluateResults(results) {
        isSpinning = false;
        
        if (balance >= spinCost) {
            spinBtn.disabled = false;
        }

        const [r1, r2, r3] = results;

        if (r1 === r2 && r2 === r3) {
            if (r1 === '🖥️') {
                updateBalance(500);
                showMessage("JACKPOT! 3 GPUs Secured! (+500 Tokens)", "success");
            } else if (r1 === '🗑️') {
                updateBalance(-50);
                showMessage("Model Degraded! Complete Hallucination. (-50 Tokens)", "error");
            } else {
                updateBalance(100);
                showMessage(`Big Win! Perfect ${r1} alignment! (+100 Tokens)`, "success");
            }
        } else if (r1 === r2 || r2 === r3 || r1 === r3) {
             updateBalance(20);
             showMessage("Small Win! Partial alignment. (+20 Tokens)", "success");
        } else {
            showMessage("No match. Back to training.", "normal");
        }
    }

    // Event Listeners
    spinBtn.addEventListener('click', spin);
});