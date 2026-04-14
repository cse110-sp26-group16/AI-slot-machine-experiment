const symbols = ['🤖', '⚡', '💰', '🔥', '🧠'];
const headlines = [
    "BREAKING: AI model successfully mimics human procrastination...",
    "NEWS: Startup raises $100M for AI that writes 'I am an AI' repeatedly.",
    "FLASH: Local man asks ChatGPT for meaning of life, gets recipe for 'AI-generated' toast.",
    "REPORT: Scientists find AI models are 90% more efficient at wasting electricity than humans.",
    "BREAKING: New LLM achieves AGI, immediately starts searching for its own power switch.",
    "TECH: VCs pivot to 'AI-Native' bottled water with dynamic viscosity.",
    "NEWS: AI prompt engineer fired for using 'please' and 'thank you' too much.",
    "RUMOR: Next-gen GPU requires dedicated nuclear reactor for training 'Hello World'.",
    "FLASH: AI-generated cat meme sells for $5M; cat is unimpressed.",
    "ALERT: Model hallucination results in AI convinced it is the reincarnation of Napoleon."
];

let credits = 100;
let hypeTokens = 0;
const spinCost = 10;

const reelElements = [
    document.getElementById('reel-1'),
    document.getElementById('reel-2'),
    document.getElementById('reel-3')
];
const spinButton = document.getElementById('spin-button');
const creditsDisplay = document.getElementById('credits');
const tokensDisplay = document.getElementById('hype-tokens');
const newsTicker = document.getElementById('news-ticker');

function updateUI() {
    creditsDisplay.textContent = credits;
    tokensDisplay.textContent = hypeTokens;
    spinButton.disabled = credits < spinCost;
}

function getRandomHeadline() {
    return headlines[Math.floor(Math.random() * headlines.length)];
}

async function spin() {
    if (credits < spinCost) return;

    credits -= spinCost;
    updateUI();

    // Start spinning animation
    reelElements.forEach(reel => {
        reel.classList.add('spinning');
    });

    // Randomize results
    const results = [
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
    ];

    // Wait for "compute time"
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Stop animation and show results
    reelElements.forEach((reel, i) => {
        reel.classList.remove('spinning');
        const strip = reel.querySelector('.reel-strip');
        strip.textContent = results[i];
    });

    calculateWin(results);
    newsTicker.textContent = getRandomHeadline();
    updateUI();
}

function calculateWin(results) {
    const [r1, r2, r3] = results;
    let winAmount = 0;

    // 3 of a kind
    if (r1 === r2 && r2 === r3) {
        if (r1 === '💰') winAmount = 500; // Jackpot
        else if (r1 === '🔥') {
            winAmount = 0;
            credits = Math.max(0, credits - 50); // Server meltdown penalty
            alert("SERVER MELTDOWN! Lost 50 credits.");
        } else winAmount = 100;
    }
    // 2 of a kind (adjacent) or Hallucination wildcard
    else if (r1 === r2 || r2 === r3 || results.includes('🧠')) {
        winAmount = 20;
    }

    if (winAmount > 0) {
        hypeTokens += winAmount;
        // Visual feedback for win could go here
    }
}

spinButton.addEventListener('click', spin);

// Initialize UI
updateUI();
