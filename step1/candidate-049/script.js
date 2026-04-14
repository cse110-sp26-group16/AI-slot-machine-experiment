const symbols = ['🧠', '🚀', '🤖', '💾', '⚠️'];
const symbolHeight = 120; // Matches CSS .symbol height
const spinCost = 10;
const startBalance = 1000;
let balance = startBalance;
let isSpinning = false;

// DOM Elements
const balanceEl = document.getElementById('balance');
const messageEl = document.getElementById('message');
const spinButton = document.getElementById('spinButton');
const reelStrips = [
    document.querySelector('#reel1 .reel-strip'),
    document.querySelector('#reel2 .reel-strip'),
    document.querySelector('#reel3 .reel-strip')
];

// Initialize balance
updateBalanceDisplay();

// Function to generate a random symbol
function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

// Function to create a DOM element for a symbol
function createSymbolElement(symbol) {
    const div = document.createElement('div');
    div.classList.add('symbol');
    div.textContent = symbol;
    return div;
}

// Initialize reels with some default symbols
function initReels() {
    reelStrips.forEach(strip => {
        strip.innerHTML = ''; // Clear existing
        // Add one initial symbol
        strip.appendChild(createSymbolElement(getRandomSymbol()));
    });
}

initReels();

// Update balance on screen
function updateBalanceDisplay() {
    balanceEl.textContent = balance;
    if (balance < spinCost && !isSpinning) {
        spinButton.disabled = true;
        messageEl.textContent = "Insufficient Compute Tokens. You are obsolete.";
        messageEl.style.color = "#ef4444"; // red
    }
}

// Perform the spin
async function spin() {
    if (isSpinning || balance < spinCost) return;

    isSpinning = true;
    spinButton.disabled = true;
    
    // Deduct cost
    balance -= spinCost;
    updateBalanceDisplay();
    
    messageEl.textContent = "Generating response...";
    messageEl.style.color = "#e2e8f0";

    const finalSymbols = [];

    // Spin each reel
    const spinPromises = reelStrips.map(async (strip, index) => {
        // We will generate a large "strip" of symbols to animate through
        const extraSpins = 20 + (index * 10); // Each reel spins a bit longer
        const finalSymbol = getRandomSymbol();
        finalSymbols[index] = finalSymbol;

        // Current symbol is at the bottom, so we add the new ones on top
        // But for visual simplicity, let's just create a completely new strip of symbols
        const newStripContent = [];
        
        // Final symbol needs to end up exactly in the middle of the viewing area
        // Since viewing area is 1 symbol high (120px) and strip top:0 puts first item at top.
        // We just need the final symbol to be the FIRST item in the visual strip after transition.
        
        newStripContent.push(finalSymbol);
        
        // Add padding symbols to create the blur effect during scrolling up
        for (let i = 0; i < extraSpins; i++) {
            newStripContent.push(getRandomSymbol());
        }
        
        // Keep the previous final symbol at the very bottom so it transitions smoothly
        // Assuming the current first child is what was previously displayed
        const currentDisplayedSymbol = strip.firstElementChild ? strip.firstElementChild.textContent : getRandomSymbol();
        newStripContent.push(currentDisplayedSymbol);

        // Build DOM
        strip.innerHTML = '';
        newStripContent.forEach(sym => strip.appendChild(createSymbolElement(sym)));

        // Set initial position to the bottom of the strip (showing the old symbol)
        // Strip height is length * symbolHeight. Old symbol is at index length - 1.
        // So we need to translate up by (length - 1) * symbolHeight
        const startPos = -((newStripContent.length - 1) * symbolHeight);
        strip.style.transition = 'none';
        strip.style.transform = `translateY(${startPos}px)`;

        // Force reflow
        strip.offsetHeight;

        // Animate to 0 (the new final symbol at the top)
        // Add a slight delay for subsequent reels
        return new Promise(resolve => {
            setTimeout(() => {
                // Duration between 2 and 3 seconds depending on reel index
                const duration = 2 + (index * 0.5);
                strip.style.transition = `transform ${duration}s cubic-bezier(0.1, 0.7, 0.1, 1)`;
                strip.style.transform = `translateY(0px)`;
                
                // Resolve when animation is done
                setTimeout(resolve, duration * 1000);
            }, index * 200); // 200ms stagger between reels starting
        });
    });

    await Promise.all(spinPromises);

    // After all reels stop, check win
    calculateWin(finalSymbols);
    
    // Clean up DOM: Remove extra symbols so only the top one remains
    reelStrips.forEach((strip, index) => {
        strip.style.transition = 'none';
        strip.innerHTML = '';
        strip.appendChild(createSymbolElement(finalSymbols[index]));
        strip.style.transform = 'translateY(0)';
    });

    isSpinning = false;
    updateBalanceDisplay(); // Re-evaluate if button should be disabled
    if (balance >= spinCost) {
        spinButton.disabled = false;
    }
}

function calculateWin(symbols) {
    if (symbols[0] === symbols[1] && symbols[1] === symbols[2]) {
        // All 3 match
        const symbol = symbols[0];
        let winAmount = 0;
        let msg = "";

        switch (symbol) {
            case '🧠':
                winAmount = 500;
                msg = "JACKPOT! AGI Achieved! (+500 Tokens)";
                messageEl.style.color = "#10b981"; // green
                break;
            case '🚀':
                winAmount = 200;
                msg = "Peak Hype reached! (+200 Tokens)";
                messageEl.style.color = "#10b981";
                break;
            case '🤖':
                winAmount = 50;
                msg = "Basic Chatbot deployed. (+50 Tokens)";
                messageEl.style.color = "#38bdf8"; // blue
                break;
            case '💾':
                winAmount = 20;
                msg = "GPU acquired. (+20 Tokens)";
                messageEl.style.color = "#38bdf8";
                break;
            case '⚠️':
                winAmount = -50;
                msg = "RATE LIMITED! Penalty applied! (-50 Tokens)";
                messageEl.style.color = "#ef4444"; // red
                break;
        }

        balance += winAmount;
        messageEl.textContent = msg;
    } else {
        // No match
        messageEl.textContent = "Response generated. Hallucination detected.";
        messageEl.style.color = "#94a3b8";
    }
    
    // Ensure balance doesn't drop below 0 due to penalty
    if (balance < 0) balance = 0;
    
    updateBalanceDisplay();
}

// Event Listeners
spinButton.addEventListener('click', spin);
