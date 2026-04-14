document.addEventListener('DOMContentLoaded', () => {
    // Game State
    let balance = 1000;
    const SPIN_COST = 50;
    const isSpinning = false;

    // Symbols
    const symbols = ['🤖', '🧠', '📉', '💸', '✨', '🚀'];
    
    // DOM Elements
    const balanceEl = document.getElementById('balance');
    const spinButton = document.getElementById('spinButton');
    const statusMessage = document.getElementById('statusMessage');
    const reels = [
        document.getElementById('reel1'),
        document.getElementById('reel2'),
        document.getElementById('reel3')
    ];

    // Audio Context (Initialize on first interaction)
    let audioCtx;
    
    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    function playBeep(frequency, duration, type = 'square') {
        if (!audioCtx) return;
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
        
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration);
    }

    function updateBalanceDisplay() {
        balanceEl.textContent = balance;
    }

    function setStatus(msg, className = '') {
        statusMessage.textContent = msg;
        statusMessage.className = className;
    }

    function getRandomSymbol() {
        return symbols[Math.floor(Math.random() * symbols.length)];
    }

    // Spin Animation Logic
    function spinReel(reelEl, duration) {
        return new Promise(resolve => {
            const container = reelEl.parentElement;
            container.classList.add('spinning');
            
            // Rapidly change symbols while spinning
            const spinInterval = setInterval(() => {
                reelEl.innerHTML = `<div class="symbol">${getRandomSymbol()}</div>`;
            }, 100);

            setTimeout(() => {
                clearInterval(spinInterval);
                container.classList.remove('spinning');
                const finalSymbol = getRandomSymbol();
                reelEl.innerHTML = `<div class="symbol">${finalSymbol}</div>`;
                resolve(finalSymbol);
            }, duration);
        });
    }

    async function handleSpin() {
        initAudio();

        if (balance < SPIN_COST) {
            setStatus("Out of Context Tokens! Please buy more API credits.", "lose-text");
            playBeep(150, 0.5, 'sawtooth');
            return;
        }

        // Deduct cost
        balance -= SPIN_COST;
        updateBalanceDisplay();
        
        spinButton.disabled = true;
        setStatus("Generating Response...", "");
        
        // Play spin sounds
        let spinSoundInterval = setInterval(() => {
            playBeep(400 + Math.random() * 200, 0.1);
        }, 150);

        // Spin reels with staggered durations
        const results = await Promise.all([
            spinReel(reels[0], 1000),
            spinReel(reels[1], 1500),
            spinReel(reels[2], 2000)
        ]);

        clearInterval(spinSoundInterval);
        
        evaluateResults(results);
        spinButton.disabled = false;
    }

    function evaluateResults(results) {
        const [s1, s2, s3] = results;
        
        // Count occurrences
        const counts = {};
        results.forEach(s => counts[s] = (counts[s] || 0) + 1);
        
        let winAmount = 0;
        let message = "";
        let className = "";

        // Check for 3 of a kind
        if (counts[s1] === 3) {
            switch(s1) {
                case '🚀':
                    winAmount = 1000;
                    message = "JACKPOT! AGI Achieved! (+1000 Tokens)";
                    className = "jackpot-text";
                    playBeep(800, 0.2); setTimeout(() => playBeep(1000, 0.4), 200);
                    break;
                case '✨':
                    winAmount = 500;
                    message = "High Quality Generation! (+500 Tokens)";
                    className = "win-text";
                    playBeep(600, 0.3);
                    break;
                case '🧠':
                    winAmount = 200;
                    message = "Good Context Match! (+200 Tokens)";
                    className = "win-text";
                    playBeep(500, 0.3);
                    break;
                case '🤖':
                    winAmount = 100;
                    message = "Basic Bot Output. (+100 Tokens)";
                    className = "win-text";
                    playBeep(400, 0.2);
                    break;
                case '📉':
                case '💸':
                    balance = 0; // Lose all
                    message = "SYSTEM CRASH! GPU Shortage / API Debt! (Balance Reset)";
                    className = "lose-text";
                    playBeep(100, 1.0, 'sawtooth');
                    break;
            }
        } 
        // Check for 2 of a kind
        else if (Object.values(counts).includes(2)) {
            winAmount = 50;
            message = "Partial Match. Prompt Cost Refunded. (+50 Tokens)";
            playBeep(300, 0.2);
        } 
        // No match
        else {
            message = "Hallucination... Try prompting again.";
            playBeep(200, 0.3, 'triangle');
        }

        if (winAmount > 0) {
            balance += winAmount;
        }

        updateBalanceDisplay();
        setStatus(message, className);

        if (balance === 0 && !message.includes("SYSTEM CRASH")) {
            setTimeout(() => {
                setStatus("Out of Context Tokens! Reload to reset.", "lose-text");
            }, 1500);
        }
    }

    // Event Listeners
    spinButton.addEventListener('click', handleSpin);

    // Initial setup
    updateBalanceDisplay();
});
