document.addEventListener('DOMContentLoaded', () => {
    let balance = 1000;
    const SPIN_COST = 10;
    const SYMBOLS = ['🧠', '🤖', '🖥️', '🪙', '🐛'];
    const balanceDisplay = document.getElementById('balance');
    const messageArea = document.getElementById('message-area');
    const spinButton = document.getElementById('spin-button');
    const reelsContainer = document.querySelectorAll('.symbols');

    function updateBalance(amount) {
        balance += amount;
        balanceDisplay.textContent = balance;
    }

    // Initialize reels with just one random symbol
    reelsContainer.forEach(reel => {
        const initialSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        reel.innerHTML = `<div class="symbol">${initialSymbol}</div>`;
    });

    spinButton.addEventListener('click', async () => {
        if (balance < SPIN_COST) {
            messageArea.textContent = "Context Window Exceeded - Please Refresh";
            messageArea.style.color = "#dc3545";
            spinButton.disabled = true;
            return;
        }

        // Deduct cost
        updateBalance(-SPIN_COST);
        messageArea.textContent = "Generating...";
        messageArea.style.color = "#666";
        messageArea.classList.remove('rate-limited-text');

        // Rate Limit Check (10% chance)
        if (Math.random() < 0.1) {
            handleRateLimit();
            return;
        }

        spinButton.disabled = true;

        const results = [];
        
        // Setup spin animation for each reel
        const spinPromises = Array.from(reelsContainer).map((reel, index) => {
            return new Promise(resolve => {
                const finalSymbolIndex = Math.floor(Math.random() * SYMBOLS.length);
                const finalSymbol = SYMBOLS[finalSymbolIndex];
                results.push(finalSymbol);
                
                // Add lots of symbols to create the scrolling effect
                const numberOfSpins = 20 + (index * 10); // Each reel spins a bit longer
                let newHtml = '';
                for (let i = 0; i < numberOfSpins; i++) {
                    const randomSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                    newHtml += `<div class="symbol">${randomSymbol}</div>`;
                }
                newHtml += `<div class="symbol">${finalSymbol}</div>`;
                
                // Reset to top instantly without transition
                reel.style.transition = 'none';
                reel.style.transform = 'translateY(0)';
                reel.innerHTML = newHtml;
                
                // Force reflow
                reel.offsetHeight;
                
                // Animate down to the bottom
                const duration = 2 + (index * 0.5); // Stagger duration
                reel.style.transition = `transform ${duration}s cubic-bezier(0.25, 1, 0.5, 1)`;
                const targetY = -(numberOfSpins * 60);
                reel.style.transform = `translateY(${targetY}px)`;
                
                setTimeout(() => resolve(), duration * 1000);
            });
        });

        await Promise.all(spinPromises);
        
        checkWin(results);
        spinButton.disabled = false;
    });

    function handleRateLimit() {
        spinButton.disabled = true;
        spinButton.textContent = "Rate Limited (429)";
        messageArea.textContent = "Error 429: Too Many Requests.";
        messageArea.classList.add('rate-limited-text');
        
        let timeLeft = 5;
        const interval = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(interval);
                spinButton.disabled = false;
                spinButton.textContent = "Generate (Cost: 10 Tokens)";
                messageArea.textContent = "Rate limit reset. Ready to generate.";
                messageArea.classList.remove('rate-limited-text');
            } else {
                spinButton.textContent = `Wait ${timeLeft}s...`;
            }
        }, 1000);
    }

    function checkWin(results) {
        const [s1, s2, s3] = results;
        
        if (s1 === s2 && s2 === s3) {
            if (s1 === '🐛') {
                messageArea.textContent = "Critical Bug! You lost 50 tokens!";
                messageArea.style.color = "#dc3545";
                updateBalance(-50);
            } else {
                messageArea.textContent = `Jackpot! Output generated efficiently! +100 Tokens`;
                messageArea.style.color = "#28a745";
                updateBalance(100);
            }
        } else if (s1 === s2 || s2 === s3 || s1 === s3) {
            if (s1 === '🐛' && s2 === '🐛' || s2 === '🐛' && s3 === '🐛' || s1 === '🐛' && s3 === '🐛') {
                 messageArea.textContent = "Bugs detected. Minor loss.";
            } else {
                messageArea.textContent = "Partial Match! +20 Tokens";
                messageArea.style.color = "#007bff";
                updateBalance(20);
            }
        } else {
            messageArea.textContent = "Hallucination... no tokens won.";
            messageArea.style.color = "#666";
        }
    }
});