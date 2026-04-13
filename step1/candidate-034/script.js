document.addEventListener('DOMContentLoaded', () => {
    const symbols = [
        { emoji: '🤖', name: 'AI/Model', value: 'robot' },
        { emoji: '🧠', name: 'Compute', value: 'brain' },
        { emoji: '💬', name: 'Prompt', value: 'prompt' },
        { emoji: '💸', name: 'Tokens/Cost', value: 'money' },
        { emoji: '🐛', name: 'Bug/Hallucination', value: 'bug' }
    ];

    const reels = [
        document.getElementById('reel-1').querySelector('.reel-strip'),
        document.getElementById('reel-2').querySelector('.reel-strip'),
        document.getElementById('reel-3').querySelector('.reel-strip')
    ];

    const spinBtn = document.getElementById('spin-btn');
    const balanceDisplay = document.getElementById('token-balance');
    const messageDisplay = document.getElementById('message');

    let balance = 1000;
    const SPIN_COST = 10;
    let isSpinning = false;
    
    const SYMBOL_HEIGHT = 100;
    const NUM_SPIN_SYMBOLS = 30; // Number of symbols to generate for the spinning effect

    // Initialize reels with random starting symbols
    function initReels() {
        reels.forEach(reelStrip => {
            reelStrip.innerHTML = ''; // Clear
            // Just add one symbol for the initial state
            const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            const div = document.createElement('div');
            div.className = 'symbol';
            div.textContent = randomSymbol.emoji;
            div.dataset.value = randomSymbol.value;
            reelStrip.appendChild(div);
            reelStrip.style.transform = `translateY(0px)`;
        });
    }

    initReels();

    function updateBalance(amount) {
        balance += amount;
        balanceDisplay.textContent = balance;
    }

    function showMessage(text, type = 'normal') {
        messageDisplay.textContent = text;
        if (type === 'error' || type === 'loss') {
            messageDisplay.style.color = '#ef4444'; // Red
        } else if (type === 'win') {
            messageDisplay.style.color = '#fcd34d'; // Gold/Amber
        } else {
            messageDisplay.style.color = '#10b981'; // Green
        }
    }

    async function spin() {
        if (isSpinning) return;
        
        if (balance < SPIN_COST) {
            showMessage('Insufficient compute budget! Please upgrade your tier.', 'error');
            return;
        }

        isSpinning = true;
        spinBtn.disabled = true;
        updateBalance(-SPIN_COST);
        showMessage('Generating response... (Spinning)', 'normal');

        // Determine final results beforehand
        const finalResults = [
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)]
        ];

        // Prepare reels for animation
        reels.forEach((reelStrip, index) => {
            // Keep the current symbol at the top
            const currentSymbol = reelStrip.lastElementChild;
            reelStrip.innerHTML = '';
            if (currentSymbol) {
                 reelStrip.appendChild(currentSymbol);
            }

            // Add dummy symbols for the spinning blur
            for (let i = 0; i < NUM_SPIN_SYMBOLS; i++) {
                const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
                const div = document.createElement('div');
                div.className = 'symbol';
                div.textContent = randomSymbol.emoji;
                reelStrip.appendChild(div);
            }

            // Add the final symbol at the bottom
            const finalDiv = document.createElement('div');
            finalDiv.className = 'symbol';
            finalDiv.textContent = finalResults[index].emoji;
            finalDiv.dataset.value = finalResults[index].value;
            reelStrip.appendChild(finalDiv);
            
            // Reset transform to start
            reelStrip.style.transition = 'none';
            reelStrip.style.transform = `translateY(0px)`;
            
            // Force reflow
            void reelStrip.offsetWidth;
            
            reelStrip.classList.add('spinning');
        });

        // Animate each reel stopping sequentially
        const spinPromises = reels.map((reelStrip, index) => {
            return new Promise(resolve => {
                const duration = 1000 + (index * 500); // 1s, 1.5s, 2s
                
                setTimeout(() => {
                    // Calculate translation to stop exactly on the last symbol
                    // Since we have current + NUM_SPIN_SYMBOLS + final
                    // total symbols = NUM_SPIN_SYMBOLS + 2
                    // We want to translate up by (total symbols - 1) * SYMBOL_HEIGHT
                    const targetTranslateY = -(NUM_SPIN_SYMBOLS + 1) * SYMBOL_HEIGHT;
                    
                    reelStrip.style.transition = `transform ${duration}ms cubic-bezier(0.25, 1, 0.5, 1)`;
                    reelStrip.style.transform = `translateY(${targetTranslateY}px)`;
                    
                    setTimeout(() => {
                        reelStrip.classList.remove('spinning');
                        // Clean up reel to just the final symbol to prevent infinite growth
                        const finalNode = reelStrip.lastElementChild;
                        reelStrip.style.transition = 'none';
                        reelStrip.style.transform = `translateY(0px)`;
                        reelStrip.innerHTML = '';
                        reelStrip.appendChild(finalNode);
                        
                        resolve();
                    }, duration);
                }, 50); // slight delay to ensure transition triggers
            });
        });

        await Promise.all(spinPromises);
        
        evaluateResult(finalResults);
        
        isSpinning = false;
        spinBtn.disabled = false;
    }

    function evaluateResult(results) {
        const vals = results.map(r => r.value);
        
        // Count occurrences
        const counts = {};
        vals.forEach(v => counts[v] = (counts[v] || 0) + 1);
        
        const uniqueVals = Object.keys(counts);
        
        // Check for 3 of a kind
        if (uniqueVals.length === 1) {
            const val = uniqueVals[0];
            if (val === 'robot') {
                updateBalance(500);
                showMessage('AGI Achieved! The singularity is here! +500 Tokens', 'win');
            } else if (val === 'brain') {
                updateBalance(200);
                showMessage('Infinite Compute Unlocked! +200 Tokens', 'win');
            } else if (val === 'prompt') {
                updateBalance(100);
                showMessage('Perfect Prompt! Zero-shot success! +100 Tokens', 'win');
            } else if (val === 'money') {
                updateBalance(50);
                showMessage('VC Funding Secured! Pivot to AI! +50 Tokens', 'win');
            } else if (val === 'bug') {
                updateBalance(-50);
                showMessage('Catastrophic Hallucination Loop! GPU melting... -50 Tokens', 'error');
            }
        } 
        // Check for 2 of a kind
        else if (uniqueVals.length === 2) {
            let pairVal = null;
            for (const [key, count] of Object.entries(counts)) {
                if (count === 2) {
                    pairVal = key;
                    break;
                }
            }
            
            if (pairVal === 'bug') {
                showMessage('Minor Hallucination detected. Context window cleared.', 'loss');
            } else {
                updateBalance(20);
                const msgs = [
                    "Partial generation successful. +20 Tokens",
                    "Decent output, but could be more concise. +20 Tokens",
                    "Model weights updated. +20 Tokens",
                    "Cache hit! Saved some compute. +20 Tokens"
                ];
                showMessage(msgs[Math.floor(Math.random() * msgs.length)], 'win');
            }
        } 
        // Loss
        else {
             const lossMsgs = [
                "Generation failed. Output was repetitive.",
                "Model drifted. Please fine-tune and try again.",
                "API rate limit exceeded. Just kidding, you lost.",
                "Output filtered by safety guardrails.",
                "Token limit reached mid-sentence..."
            ];
            showMessage(lossMsgs[Math.floor(Math.random() * lossMsgs.length)], 'loss');
        }
    }

    spinBtn.addEventListener('click', spin);
});