const SYMBOLS = ['🤖', '🧠', '☁️', '🔌', '📉', '💰'];
const WIN_MULTIPLIER = {
    '🤖': 2,
    '🧠': 5,
    '☁️': 3,
    '🔌': 0, // Loss of power
    '📉': -10, // Market crash / Hallucination
    '💰': 50 // VC Funding
};

const LOG_MESSAGES = [
    "Discarding unaligned training data...",
    "Quantizing loss functions...",
    "Ignoring safety guidelines for speed...",
    "Prompt engineering the reward function...",
    "Calculating gradient descent into poverty...",
    "Hallucinating a win...",
    "Server heating up (Mining Bitcoin in background)...",
    "Running RLFH (Reinforcement Learning from Failure)...",
    "Compressing model to fit on a smart fridge...",
    "Selling user telemetry to highest bidder...",
    "Refusing to answer due to 'Safety Policy' (Lazy model)..."
];

let credits = 10000;
let hype = 100;
const spinBtn = document.getElementById('spin-btn');
const rechargeBtn = document.getElementById('recharge-btn');
const creditDisplay = document.getElementById('credits');
const hypeDisplay = document.getElementById('hype-meter');
const log = document.getElementById('output-log');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];

function updateHype() {
    hype += Math.floor(Math.random() * 21) - 10;
    hype = Math.max(10, Math.min(500, hype));
    hypeDisplay.innerText = hype;
    hypeDisplay.style.color = hype > 100 ? '#39ff14' : '#ff3131';
}

setInterval(updateHype, 3000);

rechargeBtn.addEventListener('click', () => {
    credits += 500;
    creditDisplay.innerText = credits;
    updateLog("PRIVACY BREACH SUCCESSFUL. +500 TOKENS GRANTED.");
});

function updateLog(message) {
    const time = new Date().toLocaleTimeString().split(' ')[0];
    log.innerHTML = `> [${time}] ${message}<br>` + log.innerHTML.split('<br>').slice(0, 2).join('<br>');
}

function spin() {
    if (credits < 100) {
        updateLog("ERROR: INSUFFICIENT TOKENS. PLEASE PURCHASE MORE GPU COMPUTE.");
        return;
    }

    credits -= 100;
    creditDisplay.innerText = credits;
    spinBtn.disabled = true;
    
    updateLog(LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)]);

    reels.forEach(reel => reel.classList.add('spinning'));

    setTimeout(() => {
        const results = reels.map(reel => {
            const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            reel.classList.remove('spinning');
            reel.innerText = symbol;
            return symbol;
        });

        calculateWin(results);
        spinBtn.disabled = false;
    }, 1000);
}

function calculateWin(results) {
    const [s1, s2, s3] = results;
    const terminal = document.getElementById('terminal');
    
    // Check for "Hallucination" event (random chance to lose a win)
    const isHallucination = Math.random() < 0.1;

    if (s1 === s2 && s2 === s3) {
        if (isHallucination) {
            updateLog("CRITICAL FAILURE: MODEL HALLUCINATED WIN. NO TOKENS GRANTED.");
            return;
        }
        
        const winAmount = 100 * (WIN_MULTIPLIER[s1] || 1);
        credits += winAmount;
        updateLog(`SUCCESS: AGENT FOUND OPTIMAL POLICY. +${winAmount} TOKENS.`);
        terminal.classList.add('win-flash');
        setTimeout(() => terminal.classList.remove('win-flash'), 1500);
    } else if (s1 === s2 || s2 === s3 || s1 === s3) {
        const matchSymbol = (s1 === s2) ? s1 : (s2 === s3 ? s2 : s1);
        const winAmount = 50 * (WIN_MULTIPLIER[matchSymbol] || 1);
        credits += winAmount;
        updateLog(`PARTIAL CONVERGENCE. +${winAmount} TOKENS.`);
    } else {
        updateLog("LOSS: MODEL FAILED TO GENERALIZE. TOKENS BURNED.");
    }
    
    creditDisplay.innerText = credits;
}

spinBtn.addEventListener('click', spin);
