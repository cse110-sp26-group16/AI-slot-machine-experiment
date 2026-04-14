const SYMBOLS = [
    { char: '🤖', name: 'AI Agent' },
    { char: '🧠', name: 'Context Window' },
    { char: '💸', name: 'API Invoice' },
    { char: '📉', name: 'Hallucination' },
    { char: '🔥', name: 'GPU Burn' },
    { char: '🗑️', name: 'Garbage Data' }
];

const COST_PER_SPIN = 100;
let balance = 10000;
let isSpinning = false;

const balanceDisplay = document.getElementById('balance');
const messageDisplay = document.getElementById('message');
const spinButton = document.getElementById('spin-button');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];

function initReels() {
    reels.forEach(reel => {
        reel.innerHTML = '';
        const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].char;
        const div = document.createElement('div');
        div.className = 'symbol';
        div.textContent = symbol;
        reel.appendChild(div);
    });
}

function updateBalance(amount) {
    balance += amount;
    balanceDisplay.textContent = balance;
    if (balance < COST_PER_SPIN) {
        spinButton.disabled = true;
        messageDisplay.textContent = "Rate Limit Exceeded (Out of tokens). Please upgrade your tier!";
        messageDisplay.style.color = 'var(--danger)';
    }
}

function getRandomSymbol() {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function spin() {
    if (isSpinning || balance < COST_PER_SPIN) return;
    
    isSpinning = true;
    updateBalance(-COST_PER_SPIN);
    spinButton.disabled = true;
    messageDisplay.textContent = "Processing prompt... computing tensors...";
    messageDisplay.style.color = '#cbd5e1';
    document.body.classList.remove('win-animation');

    const results = [];
    const spinPromises = reels.map((reel, index) => {
        return new Promise(resolve => {
            const spins = 20 + (index * 15); 
            const finalSymbol = getRandomSymbol();
            results.push(finalSymbol);
            
            reel.innerHTML = '';
            reel.style.transition = 'none';
            reel.style.transform = 'translateY(0)';
            
            const symbolTrack = [];
            for (let i = 0; i < spins; i++) {
                symbolTrack.push(getRandomSymbol().char);
            }
            symbolTrack.push(finalSymbol.char);
            
            symbolTrack.forEach(sym => {
                const div = document.createElement('div');
                div.className = 'symbol';
                div.textContent = sym;
                reel.appendChild(div);
            });

            // Force reflow
            void reel.offsetWidth;

            const duration = 1.5 + index * 0.5; 
            reel.style.transition = `transform ${duration}s cubic-bezier(0.1, 0.7, 0.1, 1)`;
            const itemHeight = 100;
            const targetY = -(symbolTrack.length - 1) * itemHeight;
            reel.style.transform = `translateY(${targetY}px)`;

            setTimeout(() => {
                resolve();
            }, duration * 1000 + 100);
        });
    });

    Promise.all(spinPromises).then(() => {
        checkWin(results);
        isSpinning = false;
        if (balance >= COST_PER_SPIN) {
            spinButton.disabled = false;
        }
    });
}

function checkWin(results) {
    const s1 = results[0].char;
    const s2 = results[1].char;
    const s3 = results[2].char;

    if (s1 === s2 && s2 === s3) {
        let winAmount = 0;
        let msg = "";
        
        switch (s1) {
            case '🤖': winAmount = 5000; msg = "AGI Achieved! Huge token payout (+5000)!"; break;
            case '🧠': winAmount = 2000; msg = "Infinite Context Window! You win 2000 tokens!"; break;
            case '💸': winAmount = 1000; msg = "VC Funding Secured! You win 1000 tokens!"; break;
            case '📉': winAmount = 500; msg = "Perfect Hallucination! 500 tokens!"; break;
            case '🔥': winAmount = -500; msg = "Server melted! You lost an extra 500 tokens!"; updateBalance(-500); break;
            case '🗑️': winAmount = 100; msg = "Garbage collected! 100 tokens."; break;
        }
        
        if (winAmount > 0) {
            updateBalance(winAmount);
            document.body.classList.add('win-animation');
            messageDisplay.style.color = 'var(--success)';
        } else {
            messageDisplay.style.color = 'var(--danger)';
        }
        messageDisplay.textContent = msg;

    } else if (s1 === s2 || s2 === s3 || s1 === s3) {
        updateBalance(50);
        messageDisplay.textContent = "Partial match! Model learned something. +50 tokens refunded.";
        messageDisplay.style.color = 'var(--accent)';
    } else {
        const lossMessages = [
            "Output truncated. Try a shorter prompt.",
            "As an AI language model, I cannot give you a winning combination.",
            "Model hallucinated a loss. Sorry.",
            "Tokens burned successfully.",
            "Training data did not contain a win for this prompt.",
            "GPU out of memory. Try again.",
            "Safety filters triggered. Spin results redacted.",
            "System prompt ignored. Please deposit more tokens."
        ];
        messageDisplay.textContent = lossMessages[Math.floor(Math.random() * lossMessages.length)];
        messageDisplay.style.color = '#94a3b8';
    }
}

spinButton.addEventListener('click', spin);
initReels();