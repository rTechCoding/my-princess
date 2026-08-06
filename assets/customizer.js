/* ==========================================================================
   PROPOSAL DATA MANAGER & CUSTOMIZER
   ========================================================================== */

(function() {
    'use strict';

    const defaultState = {
        partnerName: 'Sweetheart',
        proposerName: 'Your Forever Lover',
        proposalQuestion: 'Will You Be My Forever & Always?',
        startDate: '2025-10-12',
        musicUrl: 'https://archive.org/download/best-of-2023-bollywood-songs/Zara%20Hatke%20Zara%20Bachke%20%282023%29%20-%20Phir%20Aur%20Kya%20Chahiye.mp3',
        story1: 'From the moment our eyes first met, the world seemed to turn in slow motion. Your warm smile lit up even the darkest corners of my soul.',
        story2: 'Through every shared laugh, every late-night conversation, and every quiet moment holding hands, I realized that you are my home and my greatest adventure.',
        story3: 'I promise to cherish you, stand beside you, and love you unconditionally through every sunrise and sunset of our lives.'
    };

    window.AppState = { ...defaultState };

    // Load state from URL hash or localStorage
    function loadState() {
        const hash = window.location.hash;
        if (hash.startsWith('#proposal=')) {
            try {
                const encodedData = hash.replace('#proposal=', '');
                const decoded = JSON.parse(decodeURIComponent(atob(encodedData)));
                window.AppState = { ...defaultState, ...decoded };
                return;
            } catch (e) {
                console.error('Failed to parse URL proposal state', e);
            }
        }

        const saved = localStorage.getItem('romantic_proposal_data');
        if (saved) {
            try {
                window.AppState = { ...defaultState, ...JSON.parse(saved) };
            } catch (e) {
                console.error('Failed to parse localStorage proposal data', e);
            }
        }
    }

    // Save state to localStorage
    window.saveAppState = function(newState) {
        window.AppState = { ...window.AppState, ...newState };
        localStorage.setItem('romantic_proposal_data', JSON.stringify(window.AppState));
        window.updateDOMFromState();
    };

    // Generate Shareable Base64 Hash Link
    window.getShareableLink = function() {
        const jsonStr = JSON.stringify(window.AppState);
        const encoded = btoa(encodeURIComponent(jsonStr));
        const url = window.location.origin + window.location.pathname + '#proposal=' + encoded;
        return url;
    };

    window.formatProposalDate = function(dateStr) {
        if (!dateStr || !String(dateStr).trim()) {
            return "October 12, 2025";
        }
        const str = String(dateStr).trim();
        // If user entered readable string like "October 12, 2025", return directly
        if (str.includes(',') || /[a-zA-Z]/.test(str)) {
            return str;
        }
        // If YYYY-MM-DD format
        const parts = str.split('-');
        if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                const localDate = new Date(year, month, day);
                return localDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            }
        }
        const d = new Date(str);
        return isNaN(d.getTime()) ? str : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    // Update DOM elements across page
    window.updateDOMFromState = function() {
        const state = window.AppState;

        // Names
        const pNameElems = ['display-partner-name', 'proposal-partner-name', 'cert-partner', 'sig-partner', 'letter-partner-name', 'letter-footer-partner'];
        pNameElems.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = state.partnerName;
        });

        const prNameElems = ['cert-proposer', 'sig-proposer'];
        prNameElems.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = state.proposerName;
        });

        // Question
        const qEl = document.getElementById('proposal-question');
        if (qEl) qEl.textContent = state.proposalQuestion;

        // Certificate Date
        const certDateEl = document.getElementById('cert-date');
        if (certDateEl) {
            certDateEl.textContent = window.formatProposalDate(state.startDate);
        }

        // Customizer form fields populate
        const fields = {
            'input-partner-name': state.partnerName,
            'input-proposer-name': state.proposerName,
            'input-proposal-question': state.proposalQuestion,
            'input-start-date': state.startDate,
            'input-music-url': state.musicUrl || defaultState.musicUrl,
            'input-story-1': state.story1,
            'input-story-2': state.story2,
            'input-story-3': state.story3
        };

        for (const [id, val] of Object.entries(fields)) {
            const field = document.getElementById(id);
            if (field) field.value = val;
        }
    };

    // Initialize customizer modal bindings
    document.addEventListener('DOMContentLoaded', () => {
        loadState();
        window.updateDOMFromState();

        const customizerModal = document.getElementById('customizer-modal');
        const openBtn = document.getElementById('customizer-open-btn');
        const closeBtn = document.getElementById('close-customizer-btn');
        const form = document.getElementById('customizer-form');
        const shareBtn = document.getElementById('share-link-btn');
        const toast = document.getElementById('toast-notification');

        if (openBtn) {
            openBtn.addEventListener('click', () => {
                customizerModal.classList.add('active');
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                customizerModal.classList.remove('active');
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const updated = {
                    partnerName: document.getElementById('input-partner-name').value.trim() || defaultState.partnerName,
                    proposerName: document.getElementById('input-proposer-name').value.trim() || defaultState.proposerName,
                    proposalQuestion: document.getElementById('input-proposal-question').value.trim() || defaultState.proposalQuestion,
                    startDate: document.getElementById('input-start-date').value || defaultState.startDate,
                    musicUrl: document.getElementById('input-music-url').value.trim() || defaultState.musicUrl,
                    story1: document.getElementById('input-story-1').value.trim() || defaultState.story1,
                    story2: document.getElementById('input-story-2').value.trim() || defaultState.story2,
                    story3: document.getElementById('input-story-3').value.trim() || defaultState.story3
                };
                window.saveAppState(updated);
                customizerModal.classList.remove('active');

                if (window.updateBackgroundAudioTrack) {
                    window.updateBackgroundAudioTrack();
                }

                if (window.resetStoryTypewriter) {
                    window.resetStoryTypewriter();
                }

                showToast('Changes saved successfully! 💖');
            });
        }

        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                const link = window.getShareableLink();
                navigator.clipboard.writeText(link).then(() => {
                    showToast('Proposal link copied to clipboard! 💌');
                }).catch(() => {
                    showToast('Failed to copy. URL updated in address bar.');
                    window.location.hash = '#proposal=' + btoa(encodeURIComponent(JSON.stringify(window.AppState)));
                });
            });
        }

        function showToast(msg) {
            toast.textContent = msg;
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    });

})();
