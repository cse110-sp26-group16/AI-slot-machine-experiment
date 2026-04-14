const symbols = ['🤖', '🧠', '💸', '🔋', '🗑️', '🐛'];
const spinCost = 10;
let balance = 1000;

const balanceEl = document.getElementById('balance');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];
const spinBtn = document.getElementById('spin-btn');
const messageEl = document.getElementById('message');

const messages = {
    win: [
        "AGI achieved! (+50 tokens)",
        "Hallucination jackpot! (+100 tokens)",
        "Model successfully overfit! (+200 tokens)",
        "GPU goes brrrrr... (+50 tokens)"
    ],
    lose: [
        "Context window exceeded. Try again.",
        "Rate limited. Please wait... just kidding, spin again.",
        "GPU out of memory. Tokens lost.",
        "Prompt rejected by alignment filter.",
        "AI generated an apology instead of code.",
        "Just a normal tensor error."
    ]
};

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function getRandomMessage(type) {
    const list = messages[type];
    return list[Math.floor(Math.random() * list.length)];
}

function spin() {
    if (balance < spinCost) {
        messageEl.style.color = '#ff5555';
        messageEl.textContent = "Insufficient tokens. Please insert more VC funding.";
        return;
    }

    balance -= spinCost;
    updateBalance();
    
    spinBtn.disabled = true;
    messageEl.style.color = '#00ff00';
    messageEl.textContent = "Processing prompt...";
    
    // Add spinning animation class
    reels.forEach(reel => {
        reel.classList.add('spinning');
        reel.textContent = '❓';
    });

    let spinTime = 0;
    const spinInterval = setInterval(() => {
        reels.forEach(reel => {
            reel.textContent = getRandomSymbol();
        });
        spinTime += 100;

        if (spinTime >= 2000) {
            clearInterval(spinInterval);
            reels.forEach(reel => reel.classList.remove('spinning'));
            checkWin();
        }
    }, 100);
}

function checkWin() {
    const r1 = reels[0].textContent;
    const r2 = reels[1].textContent;
    const r3 = reels[2].textContent;

    if (r1 === r2 && r2 === r3) {
        // Jackpot
        let winAmount = 200;
        if (r1 === '🤖') winAmount = 500; // Robot jackpot
        
        balance += winAmount;
        messageEl.style.color = '#00ff00';
        messageEl.textContent = getRandomMessage('win').replace(/\(\+\d+ tokens\)/, `(+${winAmount} tokens)`);
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
        // Small win
        let winAmount = 20;
        balance += winAmount;
        messageEl.style.color = '#aaffaa';
        messageEl.textContent = `Partial pattern match. (+${winAmount} tokens)`;
    } else {
        // Lose
        messageEl.style.color = '#ff5555';
        messageEl.textContent = getRandomMessage('lose');
    }

    updateBalance();
    spinBtn.disabled = false;
}

function updateBalance() {
    balanceEl.textContent = balance;
}

spinBtn.addEventListener('click', spin);