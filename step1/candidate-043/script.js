const symbols = ['💸', '🧠', '🤖', '💻', '📉', '♻️'];
const weights = [1, 2, 3, 4, 6, 6]; // Lower number = rarer

let balance = 10000;
let bet = 100;
let isSpinning = false;

const balanceEl = document.getElementById('balance');
const messageEl = document.getElementById('message');
const betAmountEl = document.getElementById('bet-amount');
const spinBtn = document.getElementById('spin-btn');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];
const betUpBtn = document.getElementById('bet-up');
const betDownBtn = document.getElementById('bet-down');

const spinningMessages = [
    "Compiling prompt...",
    "Querying the mainframe...",
    "Adjusting temperature...",
    "Hallucinating results...",
    "Spending precious compute...",
    "Bypassing safety rails...",
    "Optimizing parameters..."
];

function updateDisplay() {
    balanceEl.textContent = balance;
    betAmountEl.textContent = bet;
    
    betUpBtn.disabled = isSpinning || (bet + 100 > balance) || (bet >= 1000);
    betDownBtn.disabled = isSpinning || (bet <= 100);
    spinBtn.disabled = isSpinning || (balance < bet);
}

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

function spin() {
    if (isSpinning || balance < bet) return;
    
    isSpinning = true;
    balance -= bet;
    updateDisplay();
    messageEl.textContent = spinningMessages[Math.floor(Math.random() * spinningMessages.length)];
    messageEl.style.color = '#fbc531'; // reset color

    reels.forEach(reel => {
        reel.classList.add('spinning');
        reel.textContent = '❓';
    });

    const spinResults = [];
    let completedReels = 0;

    for (let i = 0; i < 3; i++) {
        const result = getRandomSymbol();
        spinResults.push(result);
        
        // Stagger the stopping of reels
        setTimeout(() => {
            reels[i].classList.remove('spinning');
            reels[i].textContent = result;
            completedReels++;
            
            if (completedReels === 3) {
                checkWin(spinResults);
            }
        }, 1000 + (i * 500)); // Reel 1 stops at 1s, Reel 2 at 1.5s, Reel 3 at 2s
    }
}

function checkWin(results) {
    isSpinning = false;
    
    const [r1, r2, r3] = results;
    
    if (r1 === r2 && r2 === r3) {
        let multiplier = 0;
        let winMessage = "";
        
        switch (r1) {
            case '💸': multiplier = 50; winMessage = "JACKPOT! Sam Altman is calling!"; break;
            case '🧠': multiplier = 20; winMessage = "AGI ACHIEVED! (Internal only)"; break;
            case '🤖': multiplier = 10; winMessage = "Standard output generated."; break;
            case '💻': multiplier = 5; winMessage = "Compute cluster secured!"; break;
            case '📉': multiplier = 0; winMessage = "Context collapsed! You forgot everything."; break;
            case '♻️': multiplier = 0; winMessage = "Pure Hallucination. Zero value."; break;
        }
        
        if (multiplier > 0) {
            const winAmount = bet * multiplier;
            balance += winAmount;
            messageEl.textContent = `WIN! ${winAmount} tokens! ${winMessage}`;
            messageEl.style.color = '#4cd137';
        } else {
            messageEl.textContent = winMessage;
            messageEl.style.color = '#e84118';
        }
    } else {
        messageEl.textContent = "Output rejected by safety filters. Try again.";
        messageEl.style.color = '#e84118';
        setTimeout(() => { 
            if(!isSpinning) {
                messageEl.style.color = '#fbc531'; 
            }
        }, 2000);
    }
    
    updateDisplay();
}

betUpBtn.addEventListener('click', () => {
    if (!isSpinning && bet < balance && bet < 1000) {
        bet += 100;
        updateDisplay();
    }
});

betDownBtn.addEventListener('click', () => {
    if (!isSpinning && bet > 100) {
        bet -= 100;
        updateDisplay();
    }
});

spinBtn.addEventListener('click', spin);

// Initialize
updateDisplay();