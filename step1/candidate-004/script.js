const symbols = ['🤖', '🧠', '💸', '🛑', '🐛'];
const costPerSpin = 10;
let balance = 1000;
let isSpinning = false;

const reelElements = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];
const balanceElement = document.getElementById('balance');
const messageElement = document.getElementById('message');
const spinButton = document.getElementById('spinButton');

function updateBalance(amount) {
    balance += amount;
    balanceElement.innerText = balance;
}

function spin() {
    if (isSpinning) return;
    if (balance < costPerSpin) {
        messageElement.innerText = "Out of context window (tokens)! API rate limit exceeded.";
        return;
    }

    isSpinning = true;
    updateBalance(-costPerSpin);
    messageElement.innerText = "Generating response... (Burning Tokens)";
    messageElement.style.color = "#ffff00";
    spinButton.disabled = true;

    // Start spinning animation
    reelElements.forEach(reel => reel.classList.add('spinning'));

    let spinTime = 0;
    const maxSpinTime = 1500 + Math.random() * 1000; // 1.5s to 2.5s
    const intervalTime = 100;

    const spinInterval = setInterval(() => {
        reelElements.forEach(reel => {
            reel.innerText = symbols[Math.floor(Math.random() * symbols.length)];
        });
        spinTime += intervalTime;

        if (spinTime >= maxSpinTime) {
            clearInterval(spinInterval);
            stopSpinning();
        }
    }, intervalTime);
}

function stopSpinning() {
    reelElements.forEach(reel => reel.classList.remove('spinning'));
    
    // Determine final result randomly
    const results = [
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
    ];

    reelElements[0].innerText = results[0];
    reelElements[1].innerText = results[1];
    reelElements[2].innerText = results[2];

    calculateWin(results);
    isSpinning = false;
    spinButton.disabled = false;
}

function calculateWin(results) {
    const [r1, r2, r3] = results;

    if (r1 === r2 && r2 === r3) {
        // All three match
        switch (r1) {
            case '🧠':
                updateBalance(500);
                messageElement.innerText = "AGI Achieved! You won 500 tokens!";
                messageElement.style.color = "#00ff00";
                break;
            case '💸':
                updateBalance(200);
                messageElement.innerText = "Funding Secured! You won 200 tokens!";
                messageElement.style.color = "#00ff00";
                break;
            case '🤖':
                updateBalance(50);
                messageElement.innerText = "Basic Output! You won 50 tokens!";
                messageElement.style.color = "#00ff00";
                break;
            case '🛑':
                updateBalance(-50);
                messageElement.innerText = "Major Hallucination! You lost an extra 50 tokens!";
                messageElement.style.color = "#ff0000";
                break;
            case '🐛':
                updateBalance(10);
                messageElement.innerText = "Syntax Error! You won 10 tokens!";
                messageElement.style.color = "#00ffcc";
                break;
        }
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
        // Two match
        const matchedSymbol = r1 === r2 ? r1 : (r2 === r3 ? r2 : r1);
        if (matchedSymbol === '🛑') {
            updateBalance(-10);
            messageElement.innerText = "Minor Hallucination... Lost 10 tokens.";
            messageElement.style.color = "#ffaa00";
        } else {
            updateBalance(5);
            messageElement.innerText = "Partial Match! Recovered 5 tokens.";
            messageElement.style.color = "#aaaaaa";
        }
    } else {
        messageElement.innerText = "Response generated. No actionable insight found.";
        messageElement.style.color = "#ffffff";
    }

    if (balance <= 0) {
        messageElement.innerText = "Account terminated due to insufficient funds.";
        messageElement.style.color = "#ff0000";
        spinButton.disabled = true;
    }
}

spinButton.addEventListener('click', spin);