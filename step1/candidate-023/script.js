const SYMBOLS = ['🖥️', '🌫️', '🐈', '🔥', '📈', '🤖', '💰'];
const WIN_COMBOS = {
    '🖥️🖥️🖥️': { reward: 500, message: "Model Converged! You've automated your own job. Enjoy the unemployment." },
    '💰💰💰': { reward: 1000, message: "Series A Secured! Pivot to a blockchain-AI-metaverse hybrid immediately." },
    '🤖🤖🤖': { reward: 250, message: "Artificial General Intelligence achieved! It just wants to look at memes." },
    '🔥🔥🔥': { reward: -50, message: "Server Rack Meltdown! The cloud is just someone else's burning computer." },
    '🐈🐈🐈': { reward: 100, message: "Triple Hallucination! The model is now convinced it is a 14th-century poet." },
    '📈📈📈': { reward: 150, message: "Overfitting success! It works perfectly on the 3 rows of data you have." }
};

const LOSE_MESSAGES = [
    "Gradient Exploded! Try adding more layers for no reason.",
    "Learning Rate too high. The model has become sentient and quit.",
    "Token limit reached. Please insert more venture capital.",
    "Bias detected! The model now only recommends pizza to cats.",
    "Stochastic Parrot error: Squawk! I don't know what I'm saying!",
    "Your dataset is just 10,000 pictures of hotdogs. Training failed.",
    "The GPU fan is making a screaming sound. That's normal."
];

let credits = 100;
let hallucinations = 0;
let trainingRuns = 0;

const trainBtn = document.getElementById('train-btn');
const creditsDisplay = document.getElementById('credits');
const hallucinationDisplay = document.getElementById('hallucinations');
const prowessDisplay = document.getElementById('prowess');
const feedbackDisplay = document.getElementById('feedback');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];

function updateDisplay() {
    creditsDisplay.textContent = credits;
    hallucinationDisplay.textContent = hallucinations;
    const prowess = trainingRuns === 0 ? 0 : (1 - (hallucinations / trainingRuns)) * 100;
    prowessDisplay.textContent = prowess.toFixed(2) + '%';
    
    if (credits < 10) {
        trainBtn.disabled = true;
        feedbackDisplay.textContent = "Out of Compute Credits. Time to beg for a Seed Round.";
    }
}

function getRandomSymbol() {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

async function spin() {
    if (credits < 10) return;

    credits -= 10;
    trainingRuns++;
    updateDisplay();
    
    trainBtn.disabled = true;
    feedbackDisplay.textContent = "Processing tensor cores... optimizing hyperparameters...";
    feedbackDisplay.classList.remove('glitch');

    // Start spinning animation
    reels.forEach(reel => reel.classList.add('spinning'));

    // Sequential stop
    const results = [];
    for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 500 + i * 300));
        const symbol = getRandomSymbol();
        results.push(symbol);
        reels[i].classList.remove('spinning');
        reels[i].textContent = symbol;
        
        // Random "Hallucination" effect
        if (Math.random() > 0.8) {
            reels[i].classList.add('glitch');
            setTimeout(() => reels[i].classList.remove('glitch'), 500);
        }
    }

    checkResult(results);
    trainBtn.disabled = credits < 10;
}

function checkResult(results) {
    const combo = results.join('');
    
    if (WIN_COMBOS[combo]) {
        const win = WIN_COMBOS[combo];
        credits += win.reward;
        feedbackDisplay.textContent = win.message;
        feedbackDisplay.style.color = 'var(--neon-green)';
    } else {
        hallucinations++;
        const msg = LOSE_MESSAGES[Math.floor(Math.random() * LOSE_MESSAGES.length)];
        feedbackDisplay.textContent = msg;
        feedbackDisplay.style.color = 'var(--neon-blue)';
        
        if (Math.random() > 0.7) {
            feedbackDisplay.classList.add('glitch');
        }
    }
    
    updateDisplay();
}

trainBtn.addEventListener('click', spin);

// Initial state
updateDisplay();
