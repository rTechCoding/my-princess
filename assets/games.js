/* ==========================================================================
   ROMANTIC MINI-GAMES CONTROLLER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ----------------------------------------------------------------------
    // 0. GAME TAB NAVIGATION CONTROLLER
    // ----------------------------------------------------------------------
    const tabBtns = document.querySelectorAll('.game-tab-btn');
    const gamePanels = document.querySelectorAll('.game-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetGame = btn.getAttribute('data-game');
            tabBtns.forEach(b => b.classList.remove('active'));
            gamePanels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPanel = document.getElementById(`game-${targetGame}`);
            if (targetPanel) targetPanel.classList.add('active');

            if (window.playChimeSound) window.playChimeSound();
        });
    });


    // ----------------------------------------------------------------------
    // 1. GAME 1: LOVE MATCH MEMORY CARDS
    // ----------------------------------------------------------------------
    const memoryGrid = document.getElementById('memory-grid');
    const memoryWinMsg = document.getElementById('memory-win-msg');

    const cardSymbols = ['💖', '🌹', '💍', '💌', '💖', '🌹', '💍', '💌'];
    let flippedCards = [];
    let matchedPairs = 0;

    function initMemoryGame() {
        if (!memoryGrid) return;
        memoryGrid.innerHTML = '';
        flippedCards = [];
        matchedPairs = 0;
        if (memoryWinMsg) memoryWinMsg.classList.add('hidden');

        // Shuffle cards
        const shuffled = [...cardSymbols].sort(() => Math.random() - 0.5);

        shuffled.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            card.setAttribute('data-symbol', symbol);
            card.setAttribute('data-index', index);

            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">❓</div>
                    <div class="card-back">${symbol}</div>
                </div>
            `;

            card.addEventListener('click', () => handleCardClick(card));
            memoryGrid.appendChild(card);
        });
    }

    function handleCardClick(card) {
        if (card.classList.contains('flipped') || card.classList.contains('matched') || flippedCards.length >= 2) {
            return;
        }

        card.classList.add('flipped');
        flippedCards.push(card);
        if (window.playChimeSound) window.playChimeSound();

        if (flippedCards.length === 2) {
            const [card1, card2] = flippedCards;
            const sym1 = card1.getAttribute('data-symbol');
            const sym2 = card2.getAttribute('data-symbol');

            if (sym1 === sym2) {
                card1.classList.add('matched');
                card2.classList.add('matched');
                matchedPairs++;
                flippedCards = [];

                if (matchedPairs === 4) {
                    if (memoryWinMsg) memoryWinMsg.classList.remove('hidden');
                    if (window.launchConfetti) window.launchConfetti();
                    if (window.playProposalYesFanfare) window.playProposalYesFanfare();
                }
            } else {
                setTimeout(() => {
                    card1.classList.remove('flipped');
                    card2.classList.remove('flipped');
                    flippedCards = [];
                }, 900);
            }
        }
    }

    initMemoryGame();


    // ----------------------------------------------------------------------
    // 2. GAME 2: CATCH FALLING HEARTS ARCADE
    // ----------------------------------------------------------------------
    const catcherCanvas = document.getElementById('catcher-canvas');
    const startCatcherBtn = document.getElementById('start-catcher-btn');
    const scoreEl = document.getElementById('catcher-score');
    const timerEl = document.getElementById('catcher-timer');

    let catcherCtx = null;
    let catcherAnimId = null;
    let catcherTimerId = null;
    let isCatcherRunning = false;
    let score = 0;
    let timeLeft = 20;

    let basket = { x: 270, width: 80, height: 20 };
    let fallingHearts = [];

    if (catcherCanvas) {
        catcherCtx = catcherCanvas.getContext('2d');

        catcherCanvas.addEventListener('mousemove', (e) => {
            const rect = catcherCanvas.getBoundingClientRect();
            basket.x = e.clientX - rect.left - basket.width / 2;
            basket.x = Math.max(0, Math.min(catcherCanvas.width - basket.width, basket.x));
        });

        catcherCanvas.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                const rect = catcherCanvas.getBoundingClientRect();
                basket.x = e.touches[0].clientX - rect.left - basket.width / 2;
                basket.x = Math.max(0, Math.min(catcherCanvas.width - basket.width, basket.x));
            }
        });
    }

    function startCatcherGame() {
        if (!catcherCanvas || !catcherCtx) return;
        score = 0;
        timeLeft = 20;
        fallingHearts = [];
        isCatcherRunning = true;

        if (scoreEl) scoreEl.textContent = score;
        if (timerEl) timerEl.textContent = timeLeft;
        if (startCatcherBtn) startCatcherBtn.style.display = 'none';

        if (catcherTimerId) clearInterval(catcherTimerId);
        catcherTimerId = setInterval(() => {
            timeLeft--;
            if (timerEl) timerEl.textContent = timeLeft;
            if (timeLeft <= 0) {
                endCatcherGame();
            }
        }, 1000);

        animateCatcher();
    }

    function spawnHeart() {
        if (Math.random() < 0.05) {
            fallingHearts.push({
                x: Math.random() * (catcherCanvas.width - 30) + 15,
                y: -20,
                speed: Math.random() * 2.5 + 2,
                size: Math.random() * 8 + 14,
                symbol: Math.random() > 0.3 ? '💖' : '🌟'
            });
        }
    }

    function animateCatcher() {
        if (!isCatcherRunning) return;
        catcherCtx.clearRect(0, 0, catcherCanvas.width, catcherCanvas.height);

        // Draw Basket
        catcherCtx.fillStyle = '#ff4d6d';
        catcherCtx.shadowBlur = 15;
        catcherCtx.shadowColor = '#ff4d6d';
        catcherCtx.beginPath();
        catcherCtx.roundRect(basket.x, catcherCanvas.height - 30, basket.width, basket.height, 10);
        catcherCtx.fill();

        // Spawn & Update Hearts
        spawnHeart();
        for (let i = fallingHearts.length - 1; i >= 0; i--) {
            const h = fallingHearts[i];
            h.y += h.speed;

            // Draw Heart
            catcherCtx.font = `${h.size}px sans-serif`;
            catcherCtx.fillText(h.symbol, h.x, h.y);

            // Collision Check
            if (h.y >= catcherCanvas.height - 40 && h.y <= catcherCanvas.height - 10) {
                if (h.x >= basket.x - 10 && h.x <= basket.x + basket.width + 10) {
                    score++;
                    if (scoreEl) scoreEl.textContent = score;
                    if (window.playHeartbeatSound) window.playHeartbeatSound();
                    fallingHearts.splice(i, 1);
                    continue;
                }
            }

            if (h.y > catcherCanvas.height + 20) {
                fallingHearts.splice(i, 1);
            }
        }

        catcherAnimId = requestAnimationFrame(animateCatcher);
    }

    function endCatcherGame() {
        isCatcherRunning = false;
        if (catcherTimerId) clearInterval(catcherTimerId);
        if (catcherAnimId) cancelAnimationFrame(catcherAnimId);

        if (startCatcherBtn) {
            startCatcherBtn.style.display = 'inline-block';
            startCatcherBtn.textContent = 'Play Again! 💖';
        }

        if (score >= 10) {
            if (window.launchConfetti) window.launchConfetti();
            if (window.playProposalYesFanfare) window.playProposalYesFanfare();
        }
    }

    if (startCatcherBtn) {
        startCatcherBtn.addEventListener('click', startCatcherGame);
    }


    // ----------------------------------------------------------------------
    // 3. GAME 3: OUR LOVE CONNECTION QUIZ
    // ----------------------------------------------------------------------
    const quizQuestionEl = document.getElementById('quiz-question');
    const quizOptionsEl = document.getElementById('quiz-options');
    const quizResultEl = document.getElementById('quiz-result');
    const quizBoxEl = document.getElementById('quiz-box');

    const quizQuestions = [
        {
            question: "Question 1: What is the absolute best part of every day?",
            options: [
                { text: "Every moment spent talking and smiling with you 💖", correct: true },
                { text: "Checking phone emails 📱", correct: false },
                { text: "Staring at the ceiling alone 🛋️", correct: false }
            ]
        },
        {
            question: "Question 2: What is our secret love superpower?",
            options: [
                { text: "Eating pizza without sharing 🍕", correct: false },
                { text: "Making each other laugh even on tough days 🌟", correct: true },
                { text: "Forgetting where keys are 🔑", correct: false }
            ]
        },
        {
            question: "Question 3: How long will my heart belong to you?",
            options: [
                { text: "Until next Tuesday 📅", correct: false },
                { text: "Maybe a few years ⏳", correct: false },
                { text: "Forever, across all infinities and beyond! 💍✨", correct: true }
            ]
        }
    ];

    let currentQ = 0;

    function renderQuiz() {
        if (!quizQuestionEl || !quizOptionsEl) return;
        const q = quizQuestions[currentQ];
        quizQuestionEl.textContent = q.question;
        quizOptionsEl.innerHTML = '';

        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.classList.add('quiz-opt-btn');
            btn.textContent = opt.text;

            btn.addEventListener('click', () => {
                if (opt.correct) {
                    btn.classList.add('correct');
                    if (window.playChimeSound) window.playChimeSound();
                    setTimeout(() => {
                        currentQ++;
                        if (currentQ < quizQuestions.length) {
                            renderQuiz();
                        } else {
                            if (quizBoxEl) quizBoxEl.classList.add('hidden');
                            if (quizResultEl) quizResultEl.classList.remove('hidden');
                            if (window.launchConfetti) window.launchConfetti();
                            if (window.playProposalYesFanfare) window.playProposalYesFanfare();
                        }
                    }, 500);
                } else {
                    btn.classList.add('wrong');
                    setTimeout(() => {
                        btn.classList.remove('wrong');
                    }, 600);
                }
            });

            quizOptionsEl.appendChild(btn);
        });
    }

    renderQuiz();

})();
