document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration & Symbols ---
    const SYMBOLS = [
        { id: 'AGI', icon: '🤖', weight: 1, payout: 50, name: 'AGI Detected' },
        { id: 'BRAIN', icon: '🧠', weight: 3, payout: 20, name: 'Neural Network' },
        { id: 'CLOUD', icon: '☁️', weight: 5, payout: 10, name: 'Cloud Compute' },
        { id: 'PROMPT', icon: '📝', weight: 6, payout: 5, name: 'Perfect Prompt' },
        { id: 'BUG', icon: '🐛', weight: 8, payout: 0, name: 'Hallucination' },
        { id: 'GPU', icon: '📉', weight: 7, payout: 0, name: 'GPU Out of Memory' }
    ];

    const REEL_STRIP = [];
    SYMBOLS.forEach(symbol => {
        for (let i = 0; i < symbol.weight; i++) {
            REEL_STRIP.push(symbol);
        }
    });

    const getRandomSymbol = () => REEL_STRIP[Math.floor(Math.random() * REEL_STRIP.length)];

    // --- State ---
    let balance = 8192;
    let currentBet = 256;
    let isSpinning = false;
    const minBet = 64;
    const maxBet = 1024;
    const betStep = 64;

    // --- DOM Elements ---
    const balanceDisplay = document.getElementById('balanceDisplay');
    const costDisplay = document.getElementById('costDisplay');
    const currentBetDisplay = document.getElementById('current-bet');
    const btnSpin = document.getElementById('btn-spin');
    const btnIncBet = document.getElementById('btn-increase-bet');
    const btnDecBet = document.getElementById('btn-decrease-bet');
    const terminalLog = document.getElementById('terminal-log');
    const slotMachineEl = document.querySelector('.slot-machine');
    
    const reelsContent = [
        document.getElementById('reel-content-1'),
        document.getElementById('reel-content-2'),
        document.getElementById('reel-content-3')
    ];

    const SYMBOL_SIZE = 80;
    const SYMBOLS_PER_REEL = 20;
    const SPIN_DURATION_BASE = 2000;
    const SPIN_DURATION_STAGGER = 500;

    // --- Audio System ---
    let audioCtx = null;
    
    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function playSound(type) {
        if (!audioCtx) return;
        
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        const now = audioCtx.currentTime;

        if (type === 'click') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === 'spin') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.5);
            gainNode.gain.setValueAtTime(0.05, now);
            gainNode.gain.linearRampToValueAtTime(0.01, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        } else if (type === 'stop') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'win') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(554.37, now + 0.1); // C#
            osc.frequency.setValueAtTime(659.25, now + 0.2); // E
            osc.frequency.setValueAtTime(880, now + 0.3); // A
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        } else if (type === 'lose') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.3);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'jackpot') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(440, now);
            for(let i=0; i<10; i++) {
                osc.frequency.setValueAtTime(440 + (i%2)*200, now + i*0.1);
            }
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.linearRampToValueAtTime(0, now + 1.0);
            osc.start(now);
            osc.stop(now + 1.0);
        }
    }

    // --- Initialization ---
    function initReels() {
        reelsContent.forEach(contentEl => {
            contentEl.innerHTML = '';
            for (let i = 0; i < 3; i++) {
                const sym = getRandomSymbol();
                const div = document.createElement('div');
                div.className = 'symbol';
                div.textContent = sym.icon;
                contentEl.appendChild(div);
            }
            contentEl.style.transform = `translateY(-${SYMBOL_SIZE}px)`;
        });
        updateUI();
    }

    function updateUI() {
        balanceDisplay.textContent = balance;
        currentBetDisplay.textContent = currentBet;
        costDisplay.textContent = currentBet;

        btnDecBet.disabled = currentBet <= minBet || isSpinning;
        btnIncBet.disabled = currentBet >= maxBet || currentBet + betStep > balance || isSpinning;
        btnSpin.disabled = balance < currentBet || isSpinning;

        if (balance < currentBet && !isSpinning) {
             btnSpin.innerHTML = '<span class="btn-text">INSUFFICIENT COMPUTE</span>';
             btnSpin.style.borderColor = 'var(--alert-color)';
             btnSpin.style.color = 'var(--alert-color)';
        } else {
            btnSpin.innerHTML = '<span class="btn-text">GENERATE</span>';
            btnSpin.style.borderColor = 'var(--secondary-color)';
            btnSpin.style.color = 'var(--text-main)';
        }
    }

    function logMessage(msg, type = 'normal') {
        const p = document.createElement('p');
        p.textContent = `> ${msg}`;
        if (type !== 'normal') p.className = type;
        terminalLog.appendChild(p);
        
        while (terminalLog.children.length > 20) {
            terminalLog.removeChild(terminalLog.firstChild);
        }
        terminalLog.scrollTop = terminalLog.scrollHeight;
    }

    const spinMessages = [
        "Allocating GPUs...",
        "Tuning hyperparameters...",
        "Prompting the latent space...",
        "Ignoring safety guardrails...",
        "Optimizing gradient descent...",
        "Heating up server room..."
    ];

    const lossMessages = [
        "Model collapsed into gibberish.",
        "Hallucinated a nonexistent API.",
        "Overfitted on training data.",
        "CUDA out of memory error.",
        "Rate limit exceeded. Waiting...",
        "Output filtered by trust & safety."
    ];

    const winMessages = [
        "Optimal weights found!",
        "Zero-shot success!",
        "Synthesized perfect response.",
        "Bypassed captcha successfully.",
        "AGI trajectory aligned."
    ];

    // --- Game Logic ---
    function handleBetChange(change) {
        initAudio();
        playSound('click');
        const newBet = currentBet + change;
        if (newBet >= minBet && newBet <= maxBet && newBet <= balance) {
            currentBet = newBet;
            updateUI();
        }
    }

    async function spin() {
        if (isSpinning || balance < currentBet) return;
        
        initAudio();
        isSpinning = true;
        balance -= currentBet;
        updateUI();
        slotMachineEl.classList.remove('win-animation', 'shake');
        
        playSound('spin');
        logMessage(`Deducting ${currentBet} tokens. ${spinMessages[Math.floor(Math.random() * spinMessages.length)]}`, 'info');

        const finalSymbols = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
        
        reelsContent.forEach((contentEl, index) => {
            contentEl.innerHTML = '';
            contentEl.style.transition = 'none';
            contentEl.style.transform = 'translateY(0)';

            for (let i = 0; i < SYMBOLS_PER_REEL; i++) {
                const sym = i === SYMBOLS_PER_REEL - 2 ? finalSymbols[index] : getRandomSymbol();
                const div = document.createElement('div');
                div.className = 'symbol';
                div.textContent = sym.icon;
                contentEl.appendChild(div);
            }
        });

        void reelsContent[0].offsetWidth;

        const spinPromises = reelsContent.map((contentEl, index) => {
            return new Promise(resolve => {
                const duration = SPIN_DURATION_BASE + (index * SPIN_DURATION_STAGGER);
                const targetY = -((SYMBOLS_PER_REEL - 3) * SYMBOL_SIZE);

                contentEl.style.transition = `transform ${duration}ms cubic-bezier(0.1, 0.7, 0.1, 1)`;
                contentEl.style.transform = `translateY(${targetY}px)`;

                setTimeout(() => {
                    playSound('stop');
                    resolve(finalSymbols[index]);
                }, duration);
            });
        });

        await Promise.all(spinPromises);

        evaluateWin(finalSymbols);
        
        isSpinning = false;
        updateUI();
    }

    function evaluateWin(results) {
        const [s1, s2, s3] = results;
        let winAmount = 0;
        let isWin = false;

        if (s1.id === s2.id && s2.id === s3.id) {
            if (s1.payout > 0) {
                winAmount = currentBet * s1.payout;
                isWin = true;
                logMessage(`JACKPOT! 3x ${s1.name}. Context expanded by ${winAmount} tokens!`, 'win');
                slotMachineEl.classList.add('win-animation');
                if (s1.id === 'AGI') {
                    playSound('jackpot');
                    document.querySelectorAll('.symbol').forEach(el => el.parentElement.classList.add('jackpot-animation'));
                } else {
                    playSound('win');
                }
            } else {
                 playSound('lose');
                 logMessage(`CRITICAL FAILURE: 3x ${s1.name}. System crashed.`, 'error');
                 slotMachineEl.classList.add('shake');
            }
        } 
        else if ((s1.id === s2.id || s2.id === s3.id || s1.id === s3.id) && s1.payout > 0) {
            const match = s1.id === s2.id ? s1 : (s2.id === s3.id ? s2 : s1);
            if(match.payout > 0) {
                winAmount = Math.floor(currentBet * (match.payout / 5));
                isWin = true;
                playSound('win');
                logMessage(`Partial Match: 2x ${match.name}. Recovered ${winAmount} tokens.`, 'warn');
            } else {
                playSound('lose');
                logMessage(`Loss: ${lossMessages[Math.floor(Math.random() * lossMessages.length)]}`, 'error');
            }
        } 
        else {
            playSound('lose');
            logMessage(`Loss: ${lossMessages[Math.floor(Math.random() * lossMessages.length)]}`, 'error');
        }

        if (isWin) {
             balance += winAmount;
             logMessage(winMessages[Math.floor(Math.random() * winMessages.length)], 'info');
        }

        setTimeout(() => {
            document.querySelectorAll('.reel-content').forEach(el => el.classList.remove('jackpot-animation'));
        }, 3000);
    }

    // --- Event Listeners ---
    btnIncBet.addEventListener('click', () => handleBetChange(betStep));
    btnDecBet.addEventListener('click', () => handleBetChange(-betStep));
    btnSpin.addEventListener('click', spin);
    
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !e.repeat && !isSpinning && !btnSpin.disabled) {
            e.preventDefault();
            spin();
        }
    });

    initReels();
    logMessage("Ready to guzzle tokens. Insert prompt (Spin) to begin.", "normal");
});