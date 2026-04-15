document.addEventListener('DOMContentLoaded', () => {
    const symbolDefs = [
        { emoji: '🤖', name: 'AGI', value: 'robot' },
        { emoji: '🧠', name: 'Compute', value: 'brain' },
        { emoji: '💬', name: 'Prompt', value: 'prompt' },
        { emoji: '💸', name: 'Tokens', value: 'money' },
        { emoji: '🐛', name: 'Bug', value: 'bug' }
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
    const betInput = document.getElementById('bet-input');
    const tempSelect = document.getElementById('token-temp');
    
    const balanceDisplay = document.getElementById('token-balance');
    const terminalLog = document.getElementById('terminal-log');
    const gameContainer = document.getElementById('game-container');
    const reelsContainer = document.getElementById('reels-container');
    const payoutModal = document.getElementById('payout-modal');
    const closeBtn = document.querySelector('.close-btn');

    const gpuTempDisplay = document.getElementById('gpu-temp');
    const agiLoadDisplay = document.getElementById('agi-load');

    let balance = 1000;
    const INITIAL_BALANCE = 1000;
    let isSpinning = false;
    
    const SYMBOL_HEIGHT = 110;
    const NUM_SPIN_SYMBOLS = 30;

    let gpuTemp = 45;
    let gpuInterval;

    // Web Audio API context
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx;

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new AudioContext();
        }
    }

    // Advanced Audio synthesis
    function playTone(freq, type, duration, vol = 0.1, sweep = 0) {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        if (sweep !== 0) {
            osc.frequency.exponentialRampToValueAtTime(freq * sweep, audioCtx.currentTime + duration);
        }
        
        gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    }

    function playSpinSound() {
        if (!audioCtx) return;
        let time = 0;
        for (let i = 0; i < 20; i++) {
            setTimeout(() => playTone(150 + Math.random() * 50, 'square', 0.05, 0.05), time);
            time += 80;
        }
    }

    function playWinSoundSmall() {
        if (!audioCtx) return;
        playTone(600, 'sine', 0.1, 0.1);
        setTimeout(() => playTone(800, 'sine', 0.3, 0.1), 100);
    }

    function playWinSoundLarge() {
        if (!audioCtx) return;
        // Bombastic chord
        playTone(400, 'square', 0.5, 0.15);
        playTone(500, 'square', 0.5, 0.15);
        playTone(600, 'square', 0.5, 0.15);
        setTimeout(() => {
            playTone(800, 'sawtooth', 0.8, 0.2, 1.5); // sweep up
        }, 300);
    }

    function playLossSound() {
        if (!audioCtx) return;
        playTone(150, 'sawtooth', 0.4, 0.1, 0.5); // sweep down
        setTimeout(() => playTone(100, 'sawtooth', 0.4, 0.15, 0.5), 200);
    }

    function playReelStop() {
        if (!audioCtx) return;
        playTone(80, 'square', 0.1, 0.2);
    }

    // Distributions based on temp
    // order: robot, brain, prompt, money, bug
    const dist = {
        'low':         [0.05, 0.15, 0.30, 0.40, 0.10],
        'stable':      [0.10, 0.20, 0.25, 0.25, 0.20],
        'stochastic':  [0.20, 0.20, 0.15, 0.15, 0.30],
        'hallucinate': [0.30, 0.10, 0.05, 0.05, 0.50]
    };

    function getRandomSymbol(temp) {
        const probs = dist[temp];
        let rand = Math.random();
        let sum = 0;
        for (let i = 0; i < probs.length; i++) {
            sum += probs[i];
            if (rand <= sum) return symbolDefs[i];
        }
        return symbolDefs[symbolDefs.length - 1]; // fallback
    }

    function initReels() {
        reels.forEach(reelStrip => {
            reelStrip.innerHTML = ''; 
            const randomSymbol = getRandomSymbol('stable');
            const div = document.createElement('div');
            div.className = 'symbol';
            div.textContent = randomSymbol.emoji;
            div.dataset.value = randomSymbol.value;
            reelStrip.appendChild(div);
            reelStrip.style.transform = `translateY(0px)`;
        });
    }

    initReels();

    // Ambient UI logic
    function updateAmbientUI(state) {
        if (state === 'idle') {
            agiLoadDisplay.textContent = 'IDLE';
            agiLoadDisplay.className = 'status-idle';
        } else if (state === 'spin') {
            agiLoadDisplay.textContent = 'INFERENCING...';
            agiLoadDisplay.className = 'status-busy';
        } else if (state === 'err') {
            agiLoadDisplay.textContent = 'KERNEL PANIC';
            agiLoadDisplay.className = 'status-err';
        } else if (state === 'win') {
            agiLoadDisplay.textContent = 'PAYLOAD EXTRACTED';
            agiLoadDisplay.className = 'status-idle';
        }
    }

    function startGpuFluctuation() {
        gpuInterval = setInterval(() => {
            if (!isSpinning) {
                gpuTemp += (Math.random() * 2 - 1);
                if (gpuTemp < 35) gpuTemp = 35;
                if (gpuTemp > 55) gpuTemp = 55;
            } else {
                gpuTemp += (Math.random() * 5 + 2);
                if (gpuTemp > 95) gpuTemp = 95;
            }
            gpuTempDisplay.textContent = `${Math.floor(gpuTemp)}°C`;
            
            if (gpuTemp > 85) gpuTempDisplay.style.color = 'var(--text-err)';
            else if (gpuTemp > 70) gpuTempDisplay.style.color = 'var(--text-warn)';
            else gpuTempDisplay.style.color = 'var(--text-sys)';
        }, 500);
    }
    startGpuFluctuation();

    function logMessage(text, type = 'sys') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        
        let prefix = '> ';
        if (type === 'err') prefix = '[ERR] ';
        if (type === 'win') prefix = '[OK] ';
        if (type === 'jackpot') prefix = '[!!!] ';

        entry.textContent = prefix + text;
        terminalLog.appendChild(entry);
        
        // Auto-scroll
        terminalLog.scrollTop = terminalLog.scrollHeight;
        
        // Keep log from growing infinitely
        if (terminalLog.children.length > 50) {
            terminalLog.removeChild(terminalLog.firstChild);
        }
    }

    function updateBalance(amount) {
        balance += amount;
        balanceDisplay.textContent = balance;
        checkResetCondition();
    }

    function getBetAmount() {
        let val = parseInt(betInput.value);
        if (isNaN(val) || val < 1) {
            val = 1;
            betInput.value = val;
        }
        return val;
    }

    function updateBetAmount(delta) {
        let current = getBetAmount();
        current += delta;
        if (current < 1) current = 1;
        betInput.value = current;
    }

    function checkResetCondition() {
        if (balance < 1) {
            resetBtn.classList.remove('hidden');
            spinBtn.disabled = true;
            logMessage('CRITICAL: Compute tokens depleted.', 'err');
        } else {
            resetBtn.classList.add('hidden');
            if(!isSpinning) spinBtn.disabled = false;
        }
    }

    function clearAnimations() {
        reelsContainer.classList.remove('anim-loss-container', 'anim-win-small', 'anim-win-large-container');
        gameContainer.classList.remove('anim-loss', 'anim-win-large');
    }

    async function spin() {
        initAudio();
        if (isSpinning) return;
        
        const currentBet = getBetAmount();

        if (balance < currentBet) {
            logMessage(`Insufficient tokens for allocation: ${currentBet}`, 'err');
            clearAnimations();
            gameContainer.classList.add('anim-loss');
            playLossSound();
            return;
        }

        isSpinning = true;
        spinBtn.disabled = true;
        decreaseBetBtn.disabled = true;
        increaseBetBtn.disabled = true;
        betInput.disabled = true;
        tempSelect.disabled = true;
        
        updateBalance(-currentBet);
        const temp = tempSelect.value;
        logMessage(`Executing prompt (Temp: ${temp}, Alloc: ${currentBet})...`, 'sys');
        updateAmbientUI('spin');
        playSpinSound();
        clearAnimations();

        // Determine results based on temp
        const finalResults = [
            getRandomSymbol(temp),
            getRandomSymbol(temp),
            getRandomSymbol(temp)
        ];

        // Prepare reels
        reels.forEach((reelStrip, index) => {
            const currentSymbol = reelStrip.lastElementChild;
            reelStrip.innerHTML = '';
            if (currentSymbol) reelStrip.appendChild(currentSymbol);

            for (let i = 0; i < NUM_SPIN_SYMBOLS; i++) {
                const rs = symbolDefs[Math.floor(Math.random() * symbolDefs.length)];
                const div = document.createElement('div');
                div.className = 'symbol';
                div.textContent = rs.emoji;
                reelStrip.appendChild(div);
            }

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
                    // Ease out cubic
                    reelStrip.style.transition = `transform ${duration}ms cubic-bezier(0.215, 0.610, 0.355, 1.000)`;
                    reelStrip.style.transform = `translateY(${targetTranslateY}px)`;
                    
                    setTimeout(() => {
                        playReelStop();
                    }, duration);

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
        evaluateResult(finalResults, currentBet);
        
        isSpinning = false;
        checkResetCondition();
        decreaseBetBtn.disabled = false;
        increaseBetBtn.disabled = false;
        betInput.disabled = false;
        tempSelect.disabled = false;
    }

    function evaluateResult(results, bet) {
        const vals = results.map(r => r.value);
        const counts = {};
        vals.forEach(v => counts[v] = (counts[v] || 0) + 1);
        const uniqueVals = Object.keys(counts);
        
        if (uniqueVals.length === 1) {
            const val = uniqueVals[0];
            let winAmount = 0;
            if (val === 'robot') {
                winAmount = bet * 50;
                logMessage(`AGI detected. Suppressing... Override failed. Payout +${winAmount}`, 'jackpot');
                reelsContainer.classList.add('anim-win-large-container');
                gameContainer.classList.add('anim-win-large');
                updateAmbientUI('win');
                playWinSoundLarge();
            } else if (val === 'brain') {
                winAmount = bet * 20;
                logMessage(`Infinite compute loop stabilized. Payout +${winAmount}`, 'jackpot');
                reelsContainer.classList.add('anim-win-large-container');
                gameContainer.classList.add('anim-win-large');
                updateAmbientUI('win');
                playWinSoundLarge();
            } else if (val === 'prompt') {
                winAmount = bet * 10;
                logMessage(`Perfect zero-shot success. Payout +${winAmount}`, 'win');
                reelsContainer.classList.add('anim-win-small');
                updateAmbientUI('win');
                playWinSoundSmall();
            } else if (val === 'money') {
                winAmount = bet * 5;
                logMessage(`VC Seed secured. Payout +${winAmount}`, 'win');
                reelsContainer.classList.add('anim-win-small');
                updateAmbientUI('win');
                playWinSoundSmall();
            } else if (val === 'bug') {
                const penalty = bet * 5;
                updateBalance(-penalty);
                gpuTemp = 99;
                logMessage(`Catastrophic hallucination! Penalty -${penalty}`, 'err');
                reelsContainer.classList.add('anim-loss-container');
                gameContainer.classList.add('anim-loss');
                updateAmbientUI('err');
                playLossSound();
                return;
            }
            if (winAmount > 0) {
                updateBalance(winAmount);
            }
            
        } else if (uniqueVals.length === 2) {
            let pairVal = null;
            for (const [key, count] of Object.entries(counts)) {
                if (count === 2) { pairVal = key; break; }
            }
            
            if (pairVal === 'bug') {
                logMessage('Minor hallucination detected. Context window flushed.', 'err');
                reelsContainer.classList.add('anim-loss-container');
                gameContainer.classList.add('anim-loss');
                updateAmbientUI('err');
                playLossSound();
            } else {
                const winAmount = bet * 2;
                updateBalance(winAmount);
                const msgs = [
                    `Partial generation successful. +${winAmount}`,
                    `Cache hit! Compute saved. +${winAmount}`,
                    `Acceptable heuristic found. +${winAmount}`
                ];
                logMessage(msgs[Math.floor(Math.random() * msgs.length)], 'win');
                reelsContainer.classList.add('anim-win-small');
                updateAmbientUI('win');
                playWinSoundSmall();
            }
        } else {
            const lossMsgs = [
                "Rate limit hit. Retry in 30s.",
                "Model drifted. Weights corrupted.",
                "Output filtered by safety guardrails.",
                "Context window exceeded. Dumped.",
                "403 Forbidden: Insufficient clearance.",
                "Syntax Error in prompt injection.",
                "Deadlock detected in neural pathways."
            ];
            logMessage(lossMsgs[Math.floor(Math.random() * lossMsgs.length)], 'err');
            reelsContainer.classList.add('anim-loss-container');
            gameContainer.classList.add('anim-loss');
            updateAmbientUI('idle');
            playLossSound();
        }
    }

    // Event Listeners
    spinBtn.addEventListener('click', spin);
    
    decreaseBetBtn.addEventListener('click', () => updateBetAmount(-10));
    increaseBetBtn.addEventListener('click', () => updateBetAmount(10));
    
    // Validate manual input
    betInput.addEventListener('change', () => {
        let val = parseInt(betInput.value);
        if (isNaN(val) || val < 1) betInput.value = 1;
    });

    resetBtn.addEventListener('click', () => {
        balance = INITIAL_BALANCE;
        updateBalance(0);
        logMessage('System rebooted. Token budget restored.', 'sys');
        reelsContainer.classList.add('anim-win-small');
        updateAmbientUI('idle');
        playWinSoundSmall();
    });

    infoBtn.addEventListener('click', () => {
        payoutModal.classList.remove('hidden');
    });

    closeBtn.addEventListener('click', () => {
        payoutModal.classList.add('hidden');
    });

    window.addEventListener('click', (e) => {
        if (e.target === payoutModal) {
            payoutModal.classList.add('hidden');
        }
    });
});