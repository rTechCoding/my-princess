/* ==========================================================================
   MAIN PROPOSAL CONTROLLER - STORY, COUNTER, RUNAWAY NO & CELEBRATION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ----------------------------------------------------------------------
    // 0. PASSWORD GATE PROTECTION ("rahat")
    // ----------------------------------------------------------------------
    const passwordGate = document.getElementById('password-gate');
    const passwordForm = document.getElementById('password-form');
    const passwordInput = document.getElementById('pass-input');
    const passwordErrorMsg = document.getElementById('pass-error-msg');
    const passCard = document.querySelector('.pass-card');

    const SECRET_PASSCODE = 'rahat';

    // Check if previously unlocked in this session
    if (sessionStorage.getItem('unlocked_rahat') === 'true') {
        if (passwordGate) passwordGate.classList.add('unlocked');
    } else {
        if (passwordInput) setTimeout(() => passwordInput.focus(), 300);
    }

    if (passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const val = passwordInput ? passwordInput.value.trim().toLowerCase() : '';

            if (val === SECRET_PASSCODE) {
                if (passwordErrorMsg) passwordErrorMsg.textContent = '';
                sessionStorage.setItem('unlocked_rahat', 'true');
                if (passwordGate) passwordGate.classList.add('unlocked');

                if (window.startRomanticMusic) window.startRomanticMusic();
                if (window.playChimeSound) window.playChimeSound();
                if (window.launchConfetti) window.launchConfetti();
            } else {
                if (passwordErrorMsg) passwordErrorMsg.textContent = 'Incorrect passcode 💔 Try again!';
                if (passCard) {
                    passCard.classList.remove('shake-error');
                    void passCard.offsetWidth; // Trigger reflow
                    passCard.classList.add('shake-error');
                }
                if (passwordInput) {
                    passwordInput.value = '';
                    passwordInput.focus();
                }
            }
        });
    }

    // ----------------------------------------------------------------------
    // 1. LOVE DURATION COUNTER
    // ----------------------------------------------------------------------
    const daysEl = document.getElementById('days-count');
    const hoursEl = document.getElementById('hours-count');
    const minutesEl = document.getElementById('minutes-count');
    const secondsEl = document.getElementById('seconds-count');

    function updateLoveCounter() {
        const startDateStr = (window.AppState && window.AppState.startDate) || '2024-02-14';
        const start = new Date(startDateStr).getTime();
        const now = new Date().getTime();
        const diff = Math.max(0, now - start);

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    setInterval(updateLoveCounter, 1000);
    updateLoveCounter();


    // ----------------------------------------------------------------------
    // 2. ROMANTIC STORY TYPEWRITER ENGINE
    // ----------------------------------------------------------------------
    const storyTextEl = document.getElementById('story-text');
    const prevStoryBtn = document.getElementById('prev-story-btn');
    const nextStoryBtn = document.getElementById('next-story-btn');
    const dots = document.querySelectorAll('.story-indicators .dot');

    let currentChapter = 0;
    let typeIndex = 0;
    let typeTimeout = null;

    function getStoryChapters() {
        if (!window.AppState) return [];
        return [window.AppState.story1, window.AppState.story2, window.AppState.story3];
    }

    function typeWriter(text) {
        if (!storyTextEl) return;
        if (typeTimeout) clearTimeout(typeTimeout);

        storyTextEl.textContent = '';
        typeIndex = 0;

        function step() {
            if (typeIndex < text.length) {
                storyTextEl.textContent += text.charAt(typeIndex);
                typeIndex++;
                if (window.playHeartbeatSound && typeIndex % 8 === 0) {
                    window.playHeartbeatSound();
                }
                typeTimeout = setTimeout(step, 35);
            }
        }
        step();
    }

    function loadStoryChapter(index) {
        const chapters = getStoryChapters();
        if (index < 0 || index >= chapters.length) return;

        currentChapter = index;
        typeWriter(chapters[currentChapter]);

        // Update Nav UI
        if (prevStoryBtn) prevStoryBtn.disabled = (currentChapter === 0);
        if (nextStoryBtn) {
            nextStoryBtn.disabled = (currentChapter === chapters.length - 1);
        }

        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentChapter);
        });

        if (window.playChimeSound) window.playChimeSound();
    }

    window.resetStoryTypewriter = function() {
        loadStoryChapter(0);
    };

    if (prevStoryBtn) {
        prevStoryBtn.addEventListener('click', () => {
            if (currentChapter > 0) loadStoryChapter(currentChapter - 1);
        });
    }

    if (nextStoryBtn) {
        nextStoryBtn.addEventListener('click', () => {
            const chapters = getStoryChapters();
            if (currentChapter < chapters.length - 1) loadStoryChapter(currentChapter + 1);
        });
    }

    // Initial Story Start
    setTimeout(() => {
        loadStoryChapter(0);
    }, 600);


    // ----------------------------------------------------------------------
    // 3. PLAYFUL EVASIVE "NO 😜" RUNAWAY BUTTON LOGIC
    // ----------------------------------------------------------------------
    const noBtn = document.getElementById('no-btn');
    const noBtnText = document.getElementById('no-btn-text');
    const proposalCard = document.querySelector('.proposal-card');

    const evasivePhrases = [
        "No 😜",
        "Are you sure? 🥺",
        "Wrong button! 💓",
        "Try the pink one! 🌸",
        "Can't catch me! 🚀",
        "You love me! 😉",
        "Nice try! 💕",
        "Oops, missed! 💖"
    ];
    let phraseIdx = 0;

    function moveNoButton(e) {
        if (!noBtn || !proposalCard) return;

        const cardRect = proposalCard.getBoundingClientRect();
        const btnRect = noBtn.getBoundingClientRect();

        // Calculate random coordinates inside the card container
        const maxLeft = cardRect.width - btnRect.width - 40;
        const maxTop = cardRect.height - btnRect.height - 40;

        const newLeft = Math.max(20, Math.floor(Math.random() * maxLeft));
        const newTop = Math.max(20, Math.floor(Math.random() * maxTop));

        noBtn.style.position = 'absolute';
        noBtn.style.left = `${newLeft}px`;
        noBtn.style.top = `${newTop}px`;

        // Cycle through funny romantic text
        phraseIdx = (phraseIdx + 1) % evasivePhrases.length;
        if (noBtnText) noBtnText.textContent = evasivePhrases[phraseIdx];

        if (window.playChimeSound) window.playChimeSound();
    }

    if (noBtn) {
        noBtn.addEventListener('mouseover', moveNoButton);
        noBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            moveNoButton(e);
        });
        noBtn.addEventListener('click', (e) => {
            e.preventDefault();
            moveNoButton(e);
        });
    }


    // ----------------------------------------------------------------------
    // 4. PROPOSAL ACCEPTANCE ("YES! 💖") & CELEBRATION
    // ----------------------------------------------------------------------
    const yesBtn = document.getElementById('yes-btn');
    const celebrationModal = document.getElementById('celebration-modal');
    const closeCelebrationBtn = document.getElementById('close-celebration-btn');
    const certDateEl = document.getElementById('cert-date');
    const downloadCertBtn = document.getElementById('download-cert-btn');

    if (yesBtn) {
        yesBtn.addEventListener('click', () => {
            // Launch Fireworks, Confetti & Audio
            if (window.launchFireworks) window.launchFireworks();
            if (window.launchConfetti) window.launchConfetti();
            if (window.playProposalYesFanfare) window.playProposalYesFanfare();

            // Set Certificate Date
            const certEl = document.getElementById('cert-date');
            const customDate = (window.AppState && window.AppState.startDate) ? window.AppState.startDate : null;
            if (certEl) {
                certEl.textContent = window.formatProposalDate ? window.formatProposalDate(customDate) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            }

            // Open Modal
            setTimeout(() => {
                celebrationModal.classList.add('active');
            }, 500);
        });
    }

    if (closeCelebrationBtn) {
        closeCelebrationBtn.addEventListener('click', () => {
            celebrationModal.classList.remove('active');
        });
    }

    if (downloadCertBtn) {
        downloadCertBtn.addEventListener('click', () => {
            window.print();
        });
    }

});

