document.addEventListener('DOMContentLoaded', () => {
    const balanceEl = document.getElementById('balance');
    const spinButton = document.getElementById('spin-button');
    const statusMessageEl = document.getElementById('status-message');
    
    const reel1 = document.getElementById('reel1');
    const reel2 = document.getElementById('reel2');
    const reel3 = document.getElementById('reel3');
    
    const reels = [reel1, reel2, reel3];

    let balance = 1000;
    const SPIN_COST = 10;
    let isSpinning = false;

    // The symbols and their payouts
    const SYMBOLS = [
        { id: 'AGI', icon: '🧠', payout: 500, weight: 1 },
        { id: 'HALLUCINATION', icon: '🍄', payout: 100, weight: 3 },
        { id: 'GPU', icon: '💽', payout: 50, weight: 5 },
        { id: 'LLM', icon: '💬', payout: 20, weight: 10 },
        { id: 'PROMPT', icon: '✍️', payout: 15, weight: 15 }
    ];

    // Create a weighted array for random selection
    const weightedSymbols = [];
    SYMBOLS.forEach(symbol => {
        for (let i = 0; i < symbol.weight; i++) {
            weightedSymbols.push(symbol);
        }
    });

    const SARCASM_MESSAGES = {
        spin: [
            "Allocating tensor cores...",
            "Compiling neural pathways...",
            "Prompting the mainframe...",
            "Reticulating splines...",
            "Injecting context window...",
            "Gradient descent in progress...",
            "Training... Epoch 1 of 1000..."
        ],
        lose: [
            "Model collapsed. Tokens burned.",
            "Hallucination detected. Try again.",
            "GPU out of memory. 10 tokens lost.",
            "Rate limit exceeded. Spin failed.",
            "Overfitting occurred. No payout.",
            "Output filtered by safety guidelines.",
            "System prompt ignored. Loss."
        ],
        broke: [
            "Compute budget exhausted.",
            "Insufficient funds. Need more VC money.",
            "API Access Revoked."
        ]
    };

    function updateBalance(amount) {
        balance += amount;
        balanceEl.textContent = balance;
    }

    function getRandomMessage(type) {
        const messages = SARCASM_MESSAGES[type];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    function setStatus(message, isTyping = false) {
        statusMessageEl.textContent = message;
        if (isTyping) {
            statusMessageEl.classList.remove('msg-typing');
            // Trigger reflow
            void statusMessageEl.offsetWidth;
            statusMessageEl.classList.add('msg-typing');
        } else {
            statusMessageEl.classList.remove('msg-typing');
        }
    }

    function getRandomSymbol() {
        const randomIndex = Math.floor(Math.random() * weightedSymbols.length);
        return weightedSymbols[randomIndex];
    }

    function spin() {
        if (balance < SPIN_COST) {
            setStatus(getRandomMessage('broke'));
            return;
        }

        if (isSpinning) return;
        isSpinning = true;
        spinButton.disabled = true;

        updateBalance(-SPIN_COST);
        setStatus(getRandomMessage('spin'), true);

        // Remove winner styling
        reels.forEach(reel => reel.querySelector('.symbol').classList.remove('winner'));

        // Start spinning animation
        reels.forEach(reel => reel.classList.add('spinning'));

        const results = [];
        
        // Stop reels one by one
        reels.forEach((reel, index) => {
            setTimeout(() => {
                reel.classList.remove('spinning');
                const symbol = getRandomSymbol();
                results.push(symbol);
                reel.querySelector('.symbol').textContent = symbol.icon;
                
                // If this is the last reel
                if (index === reels.length - 1) {
                    evaluateResult(results);
                }
            }, 1000 + (index * 500)); // Delay between each reel stopping
        });
    }

    function evaluateResult(results) {
        isSpinning = false;
        spinButton.disabled = balance < SPIN_COST;

        const isWin = results[0].id === results[1].id && results[1].id === results[2].id;

        if (isWin) {
            const winSymbol = results[0];
            const payout = winSymbol.payout;
            updateBalance(payout);
            
            // Add winner styling
            reels.forEach(reel => reel.querySelector('.symbol').classList.add('winner'));
            
            setStatus(`SUCCESS! Matched 3 ${winSymbol.id}s. Payout: ${payout} ⌬`);
        } else {
            setStatus(getRandomMessage('lose'));
            if (balance < SPIN_COST) {
                setTimeout(() => setStatus(getRandomMessage('broke')), 2000);
            }
        }
    }

    spinButton.addEventListener('click', spin);

    // Initial state
    reels.forEach(reel => {
        reel.querySelector('.symbol').textContent = getRandomSymbol().icon;
    });
});
