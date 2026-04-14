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
    const resetBtn = document.getElementById('reset-btn');
    const infoBtn = document.getElementById('info-btn');
    const decreaseBetBtn = document.getElementById('decrease-bet');
    const increaseBetBtn = document.getElementById('increase-bet');
    
    const balanceDisplay = document.getElementById('token-balance');
    const messageDisplay = document.getElementById('message');
    const betAmountDisplay = document.getElementById('bet-amount');
    const gameContainer = document.getElementById('game-container');
    const payoutModal = document.getElementById('payout-modal');
    const closeBtn = document.querySelector('.close-btn');

    let balance = 1000;
    let betAmount = 10;
    const INITIAL_BALANCE = 1000;
    let isSpinning = false;
    
    const SYMBOL_HEIGHT = 100;
    const NUM_SPIN_SYMBOLS = 30;

    // Web Audio API context
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx;

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new AudioContext();
        }
    }

    function playTone(frequency, type, duration, vol = 0.1) {
        if (!audioCtx) return;
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration);
    }

    function playSpinSound() {
        if (!audioCtx) return;
        let time = 0;
        for (let i = 0; i < 15; i++) {
            setTimeout(() => playTone(300 + Math.random() * 200, 'triangle', 0.1, 0.05), time);
            time += 100;
        }
    }

    function playWinSound(isLarge) {
        if (!audioCtx) return;
        if (isLarge) {
            playTone(400, 'sine', 0.2, 0.2);
            setTimeout(() => playTone(500, 'sine', 0.2, 0.2), 200);
            setTimeout(() => playTone(600, 'sine', 0.4, 0.2), 400);
            setTimeout(() => playTone(800, 'sine', 0.6, 0.2), 600);
        } else {
            playTone(440, 'sine', 0.1, 0.1);
            setTimeout(() => playTone(554, 'sine', 0.2, 0.1), 150);
        }
    }

    function playLossSound() {
        if (!audioCtx) return;
        playTone(300, 'sawtooth', 0.3, 0.1);
        setTimeout(() => playTone(250, 'sawtooth', 0.4, 0.1), 300);
    }

    function initReels() {
        reels.forEach(reelStrip => {
            reelStrip.innerHTML = ''; 
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
        checkResetCondition();
    }

    function updateBetAmount(amount) {
        betAmount += amount;
        if (betAmount < 10) betAmount = 10;
        if (betAmount > 100) betAmount = 100; // max bet
        betAmountDisplay.textContent = betAmount;
    }

    function checkResetCondition() {
        if (balance < 10) { // Not enough for min bet
            resetBtn.classList.remove('hidden');
        } else {
            resetBtn.classList.add('hidden');
        }
    }

    function showMessage(text, type = 'normal') {
        messageDisplay.textContent = text;
        if (type === 'error' || type === 'loss') {
            messageDisplay.style.color = '#ef4444'; // Red
            messageDisplay.style.textShadow = '0 0 5px #ef4444';
        } else if (type === 'win') {
            messageDisplay.style.color = '#fcd34d'; // Gold/Amber
            messageDisplay.style.textShadow = '0 0 5px #fcd34d';
        } else {
            messageDisplay.style.color = '#10b981'; // Green
            messageDisplay.style.textShadow = '0 0 5px #10b981';
        }
    }

    function triggerAnimation(type) {
        gameContainer.classList.remove('anim-loss', 'anim-win-small', 'anim-win-large');
        // Force reflow
        void gameContainer.offsetWidth;
        
        if (type === 'loss') {
            gameContainer.classList.add('anim-loss');
        } else if (type === 'win-small') {
            gameContainer.classList.add('anim-win-small');
        } else if (type === 'win-large') {
            gameContainer.classList.add('anim-win-large');
        }
    }

    async function spin() {
        initAudio(); // Initialize audio context on first interaction
        if (isSpinning) return;
        
        if (balance < betAmount) {
            showMessage('Insufficient compute budget! Lower bet or reset.', 'error');
            triggerAnimation('loss');
            playLossSound();
            return;
        }

        isSpinning = true;
        spinBtn.disabled = true;
        decreaseBetBtn.disabled = true;
        increaseBetBtn.disabled = true;
        
        updateBalance(-betAmount);
        showMessage('Generating response... (Spinning)', 'normal');
        playSpinSound();

        // Determine final results beforehand
        const finalResults = [
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)]
        ];

        // Prepare reels for animation
        reels.forEach((reelStrip, index) => {
            const currentSymbol = reelStrip.lastElementChild;
            reelStrip.innerHTML = '';
            if (currentSymbol) {
                 reelStrip.appendChild(currentSymbol);
            }

            // Add dummy symbols
            for (let i = 0; i < NUM_SPIN_SYMBOLS; i++) {
                const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
                const div = document.createElement('div');
                div.className = 'symbol';
                div.textContent = randomSymbol.emoji;
                reelStrip.appendChild(div);
            }

            // Add final symbol
            const finalDiv = document.createElement('div');
            finalDiv.className = 'symbol';
            finalDiv.textContent = finalResults[index].emoji;
            finalDiv.dataset.value = finalResults[index].value;
            reelStrip.appendChild(finalDiv);
            
            reelStrip.style.transition = 'none';
            reelStrip.style.transform = `translateY(0px)`;
            void reelStrip.offsetWidth;
            reelStrip.classList.add('spinning');
        });

        const spinPromises = reels.map((reelStrip, index) => {
            return new Promise(resolve => {
                const duration = 1000 + (index * 500); 
                
                setTimeout(() => {
                    const targetTranslateY = -(NUM_SPIN_SYMBOLS + 1) * SYMBOL_HEIGHT;
                    reelStrip.style.transition = `transform ${duration}ms cubic-bezier(0.25, 1, 0.5, 1)`;
                    reelStrip.style.transform = `translateY(${targetTranslateY}px)`;
                    
                    if(audioCtx) {
                         setTimeout(() => playTone(150, 'square', 0.1, 0.1), duration); // reel stop sound
                    }

                    setTimeout(() => {
                        reelStrip.classList.remove('spinning');
                        const finalNode = reelStrip.lastElementChild;
                        reelStrip.style.transition = 'none';
                        reelStrip.style.transform = `translateY(0px)`;
                        reelStrip.innerHTML = '';
                        reelStrip.appendChild(finalNode);
                        resolve();
                    }, duration);
                }, 50);
            });
        });

        await Promise.all(spinPromises);
        evaluateResult(finalResults);
        
        isSpinning = false;
        spinBtn.disabled = false;
        decreaseBetBtn.disabled = false;
        increaseBetBtn.disabled = false;
    }

    function evaluateResult(results) {
        const vals = results.map(r => r.value);
        const counts = {};
        vals.forEach(v => counts[v] = (counts[v] || 0) + 1);
        const uniqueVals = Object.keys(counts);
        
        let winAmount = 0;
        let isLargeWin = false;

        if (uniqueVals.length === 1) {
            const val = uniqueVals[0];
            if (val === 'robot') {
                winAmount = betAmount * 50;
                isLargeWin = true;
                showMessage(`AGI Achieved! The singularity is here! +${winAmount}`, 'win');
            } else if (val === 'brain') {
                winAmount = betAmount * 20;
                isLargeWin = true;
                showMessage(`Infinite Compute Unlocked! +${winAmount}`, 'win');
            } else if (val === 'prompt') {
                winAmount = betAmount * 10;
                isLargeWin = true;
                showMessage(`Perfect Prompt! Zero-shot success! +${winAmount}`, 'win');
            } else if (val === 'money') {
                winAmount = betAmount * 5;
                showMessage(`VC Funding Secured! Pivot to AI! +${winAmount}`, 'win');
            } else if (val === 'bug') {
                const penalty = betAmount * 5;
                updateBalance(-penalty);
                showMessage(`Catastrophic Hallucination Loop! GPU melting... -${penalty}`, 'error');
                triggerAnimation('loss');
                playLossSound();
                return;
            }
            updateBalance(winAmount);
            triggerAnimation(isLargeWin ? 'win-large' : 'win-small');
            playWinSound(isLargeWin);
            
        } else if (uniqueVals.length === 2) {
            let pairVal = null;
            for (const [key, count] of Object.entries(counts)) {
                if (count === 2) { pairVal = key; break; }
            }
            
            if (pairVal === 'bug') {
                showMessage('Minor Hallucination detected. Context window cleared.', 'loss');
                triggerAnimation('loss');
                playLossSound();
            } else {
                winAmount = betAmount * 2;
                updateBalance(winAmount);
                const msgs = [
                    `Partial generation successful. +${winAmount}`,
                    `Decent output, but could be more concise. +${winAmount}`,
                    `Model weights updated. +${winAmount}`,
                    `Cache hit! Saved some compute. +${winAmount}`
                ];
                showMessage(msgs[Math.floor(Math.random() * msgs.length)], 'win');
                triggerAnimation('win-small');
                playWinSound(false);
            }
        } else {
            const lossMsgs = [
                "Generation failed. Output was repetitive.",
                "Model drifted. Please fine-tune and try again.",
                "API rate limit exceeded. Just kidding, you lost.",
                "Output filtered by safety guardrails.",
                "Token limit reached mid-sentence...",
                "The AI apologized but didn't write code.",
                "\"As an AI language model, I cannot win you tokens.\"",
                "Hallucinated a dependency. Spin again."
            ];
            showMessage(lossMsgs[Math.floor(Math.random() * lossMsgs.length)], 'loss');
            triggerAnimation('loss');
            playLossSound();
        }
    }

    // Event Listeners
    spinBtn.addEventListener('click', spin);
    
    decreaseBetBtn.addEventListener('click', () => updateBetAmount(-10));
    increaseBetBtn.addEventListener('click', () => updateBetAmount(10));
    
    resetBtn.addEventListener('click', () => {
        balance = INITIAL_BALANCE;
        updateBalance(0);
        showMessage('Compute budget reset to 1000 Tokens.', 'normal');
        triggerAnimation('win-small');
        playWinSound(false);
    });

    infoBtn.addEventListener('click', () => {
        payoutModal.classList.remove('hidden');
    });

    closeBtn.addEventListener('click', () => {
        payoutModal.classList.add('hidden');
    });

    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === payoutModal) {
            payoutModal.classList.add('hidden');
        }
    });
});