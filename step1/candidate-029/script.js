document.addEventListener("DOMContentLoaded", () => {
    // State
    let tokenBalance = 1000;
    const costPerSpin = 10;
    let isSpinning = false;

    // DOM Elements
    const balanceDisplay = document.getElementById("token-balance");
    const spinButton = document.getElementById("spin-button");
    const messageDisplay = document.getElementById("message");
    const reels = [
        document.getElementById("reel-1").querySelector(".symbol"),
        document.getElementById("reel-2").querySelector(".symbol"),
        document.getElementById("reel-3").querySelector(".symbol")
    ];
    const reelContainers = [
        document.getElementById("reel-1"),
        document.getElementById("reel-2"),
        document.getElementById("reel-3")
    ];

    // Symbols Array (weighted probability)
    // 💻 GPU (Rare, High Value)
    // 🔑 API Key (Medium Rare, Medium Value)
    // 🧠 Context Window (Common, Low Value)
    // 🤖 Standard Output (Very Common, No Value)
    // 🤪 Hallucination (Common, Penalty)
    
    const symbols = [
        '💻', // 1
        '🔑', '🔑', // 2
        '🧠', '🧠', '🧠', // 3
        '🤖', '🤖', '🤖', '🤖', '🤖', // 5
        '🤪', '🤪', '🤪', '🤪' // 4
    ];

    // Paytable mapping
    const paytable = {
        '💻💻💻': 500,
        '🔑🔑🔑': 200,
        '🧠🧠🧠': 50,
        // Any 🤪 = -50 Penalty (handled in logic)
    };

    function updateBalance(amount) {
        tokenBalance += amount;
        balanceDisplay.textContent = tokenBalance;
        
        // Add animation class based on win/loss
        balanceDisplay.style.color = amount > 0 ? '#10b981' : (amount < 0 ? '#ef4444' : '#38bdf8');
        setTimeout(() => {
            balanceDisplay.style.color = '#38bdf8'; // reset to accent color
        }, 500);
    }

    function showMessage(text, type = "info") {
        messageDisplay.textContent = text;
        if (type === "win") messageDisplay.style.color = "#10b981"; // success
        else if (type === "loss") messageDisplay.style.color = "#ef4444"; // danger
        else messageDisplay.style.color = "#f8fafc"; // main text
    }

    function getRandomSymbol() {
        const randomIndex = Math.floor(Math.random() * symbols.length);
        return symbols[randomIndex];
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function spin() {
        if (isSpinning) return;
        
        if (tokenBalance < costPerSpin) {
            showMessage("Insufficient tokens! API Limit Reached.", "loss");
            return;
        }

        isSpinning = true;
        spinButton.disabled = true;
        updateBalance(-costPerSpin);
        showMessage("Generating output...", "info");

        // Add spinning animation class
        reelContainers.forEach(container => container.classList.add('spinning'));

        // Generate final symbols
        const finalSymbols = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
        
        // Simulate spin delay with stagger
        for (let i = 0; i < reels.length; i++) {
            await sleep(500 + (i * 300)); // 500ms, 800ms, 1100ms
            
            // Stop spinning animation for this reel
            reelContainers[i].classList.remove('spinning');
            
            // Set final symbol
            reels[i].textContent = finalSymbols[i];
            
            // Add a little pop animation
            reels[i].style.transform = "scale(1.2)";
            setTimeout(() => {
                reels[i].style.transform = "scale(1)";
            }, 100);
        }

        evaluateResult(finalSymbols);
        
        isSpinning = false;
        spinButton.disabled = false;
        
        if (tokenBalance <= 0) {
            showMessage("GAME OVER. AI took your job and your tokens.", "loss");
            spinButton.disabled = true;
            spinButton.textContent = "Rate Limited";
        }
    }

    function evaluateResult(result) {
        const resultString = result.join('');
        
        // Check for hallucinations first
        const hallucinationCount = result.filter(s => s === '🤪').length;
        if (hallucinationCount > 0) {
            const penalty = hallucinationCount * 50;
            updateBalance(-penalty);
            showMessage(`Hallucination detected! Penalty: -${penalty} tokens.`, "loss");
            return;
        }

        // Check for wins
        if (result[0] === result[1] && result[1] === result[2]) {
            const winAmount = paytable[resultString] || 0;
            if (winAmount > 0) {
                updateBalance(winAmount);
                showMessage(`Jackpot! Generated matching context: +${winAmount} tokens!`, "win");
                return;
            } else if (result[0] === '🤖') {
                 // 3 robots - minor win or just return cost
                 updateBalance(20);
                 showMessage("Standard output generated. +20 tokens.", "win");
                 return;
            }
        }
        
        // Nothing
        showMessage("Prompt generated no useful output.", "info");
    }

    // Event Listeners
    spinButton.addEventListener("click", spin);
});