const symbols = ['🧠', '💰', '🤖', '💬', '⚠️'];

const REEL_SIZE = 80; // Should match --symbol-size in CSS
const SPIN_SYMBOLS = 20; // Number of symbols to spin through

let balance = 4096;
let currentBet = 128;
let isSpinning = false;

const elements = {
    balance: document.getElementById('balance'),
    message: document.getElementById('message'),
    betAmount: document.getElementById('betAmount'),
    betDown: document.getElementById('bet-down'),
    betUp: document.getElementById('bet-up'),
    generateBtn: document.getElementById('generate-btn'),
    betInput: document.getElementById('bet-amount'),
    reels: [
        document.getElementById('reel1').querySelector('.reel-strip'),
        document.getElementById('reel2').querySelector('.reel-strip'),
        document.getElementById('reel3').querySelector('.reel-strip')
    ],
    winLine: document.querySelector('.win-line'),
    casinoContainer: document.querySelector('.casino-container')
};

// Initialize reels
function initReels() {
    elements.reels.forEach(strip => {
        strip.innerHTML = '';
        // Add initial random symbol
        const div = document.createElement('div');
        div.className = 'symbol';
        div.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        strip.appendChild(div);
    });
}

// Update UI
function updateUI() {
    elements.balance.textContent = balance;
    if (balance <= 0) {
        elements.balance.classList.add('error');
    } else if (balance < 500) {
        elements.balance.classList.add('warning');
        elements.balance.classList.remove('error');
    } else {
        elements.balance.classList.remove('error', 'warning');
    }
    
    // Disable/Enable buttons
    if (isSpinning) {
        elements.generateBtn.disabled = true;
        elements.betDown.disabled = true;
        elements.betUp.disabled = true;
    } else {
        elements.generateBtn.disabled = balance < currentBet;
        elements.betDown.disabled = currentBet <= 16;
        elements.betUp.disabled = currentBet >= 1024 || (currentBet + 16 > balance && balance > 0);
    }
}

function showMessage(msg, type = 'normal') {
    elements.message.textContent = msg;
    elements.message.style.color = type === 'error' ? 'var(--error-color)' : 
                                   type === 'success' ? 'var(--success-color)' : 
                                   'var(--accent-color)';
}

// Bet controls
elements.betDown.addEventListener('click', () => {
    if (currentBet > 16 && !isSpinning) {
        currentBet -= 16;
        elements.betInput.value = currentBet;
        updateUI();
    }
});

elements.betUp.addEventListener('click', () => {
    if (currentBet < 1024 && !isSpinning && currentBet + 16 <= balance) {
        currentBet += 16;
        elements.betInput.value = currentBet;
        updateUI();
    }
});

function getSpinResult() {
    // Generate random result, weighted lightly
    const result = [];
    for (let i = 0; i < 3; i++) {
        // Simple random for now
        result.push(symbols[Math.floor(Math.random() * symbols.length)]);
    }
    return result;
}

function spin() {
    if (isSpinning || balance < currentBet) return;
    
    isSpinning = true;
    balance -= currentBet;
    updateUI();
    showMessage('Generating response...', 'normal');
    elements.winLine.style.display = 'none';
    
    const finalResult = getSpinResult();
    let completedReels = 0;

    elements.reels.forEach((strip, index) => {
        // Reset transition to build the strip
        strip.style.transition = 'none';
        strip.style.transform = `translateY(0px)`;
        
        // Build new strip: current symbol at top, then random symbols, then final symbol at bottom
        const currentSymbol = strip.lastElementChild ? strip.lastElementChild.textContent : symbols[0];
        strip.innerHTML = '';
        
        const addSymbol = (sym) => {
            const div = document.createElement('div');
            div.className = 'symbol';
            div.textContent = sym;
            strip.appendChild(div);
        };
        
        addSymbol(currentSymbol);
        
        for (let i = 0; i < SPIN_SYMBOLS; i++) {
            addSymbol(symbols[Math.floor(Math.random() * symbols.length)]);
        }
        
        addSymbol(finalResult[index]);
        
        // Trigger reflow
        void strip.offsetWidth;
        
        // Start animation
        const spinTime = 1500 + index * 500; // Stagger stop times
        strip.style.transition = `transform ${spinTime}ms cubic-bezier(0.1, 0.7, 0.1, 1)`;
        // Translate up by (SPIN_SYMBOLS + 1) * REEL_SIZE
        strip.style.transform = `translateY(-${(SPIN_SYMBOLS + 1) * REEL_SIZE}px)`;
        
        setTimeout(() => {
            completedReels++;
            if (completedReels === 3) {
                // Cleanup strip to only contain the final symbol
                strip.style.transition = 'none';
                strip.style.transform = `translateY(0px)`;
                strip.innerHTML = '';
                addSymbol(finalResult[index]);
                
                checkWin(finalResult);
                isSpinning = false;
                updateUI();
            } else {
                // Clean up this individual reel just to be safe
                strip.style.transition = 'none';
                strip.style.transform = `translateY(0px)`;
                strip.innerHTML = '';
                addSymbol(finalResult[index]);
            }
        }, spinTime);
    });
}

function checkWin(result) {
    const [s1, s2, s3] = result;
    
    // Check for hallucination penalty first
    const hallucinationCount = result.filter(s => s === '⚠️').length;
    if (hallucinationCount > 0) {
        const penalty = Math.floor(currentBet * 0.5);
        balance -= penalty;
        showMessage(`Hallucination! Lost ${penalty} context tokens.`, 'error');
        elements.casinoContainer.classList.add('shake');
        setTimeout(() => elements.casinoContainer.classList.remove('shake'), 500);
        return;
    }
    
    // Check for wins
    if (s1 === s2 && s2 === s3) {
        let multiplier = 0;
        let msg = '';
        
        switch (s1) {
            case '🧠': 
                multiplier = 50; 
                msg = 'AGI ACHIEVED! The singularity is here!'; 
                break;
            case '💰': 
                multiplier = 20; 
                msg = 'Series A Funded! Infinite runway!'; 
                break;
            case '🤖': 
                multiplier = 10; 
                msg = 'Zero-shot perfection!'; 
                break;
            case '💬': 
                multiplier = 5; 
                msg = 'Excellent prompt engineering!'; 
                break;
        }
        
        if (multiplier > 0) {
            const winAmount = currentBet * multiplier;
            balance += winAmount;
            showMessage(`${msg} (+${winAmount} tokens)`, 'success');
            elements.winLine.style.display = 'block';
            return;
        }
    }
    
    // No win
    showMessage('Output generated. Not quite AGI.', 'normal');
    
    if (balance <= 0) {
        showMessage('OUT OF CONTEXT. Please upgrade your plan.', 'error');
    }
}

elements.generateBtn.addEventListener('click', spin);

// Init
initReels();
updateUI();