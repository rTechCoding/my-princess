/* ==========================================================================
   ROMANTIC WEB AUDIO SYNTH & MUSIC ENGINE
   ========================================================================== */

(function() {
    'use strict';

    let audioCtx = null;
    let isMuted = true;
    let isPlayingPad = false;
    let autoPlayTriggered = false;

    const DEFAULT_MUSIC_URL = 'https://archive.org/download/best-of-2023-bollywood-songs/Zara%20Hatke%20Zara%20Bachke%20%282023%29%20-%20Phir%20Aur%20Kya%20Chahiye.mp3';
    const FALLBACK_ONLINE_URL = 'https://archive.org/download/best-of-2023-bollywood-songs/Zara%20Hatke%20Zara%20Bachke%20%282023%29%20-%20Phir%20Aur%20Kya%20Chahiye.mp3';

    // Background Audio Track Element
    const bgAudio = new Audio();
    bgAudio.loop = true;
    bgAudio.volume = 0.5;

    // Error handling: if local audio/khub.mp3 fails to load, switch to online fallback & synth
    bgAudio.onerror = function(e) {
        console.warn('Primary audio failed to load. Switching to online fallback...', e);
        if (bgAudio.src !== FALLBACK_ONLINE_URL) {
            bgAudio.src = FALLBACK_ONLINE_URL;
            if (!isMuted) {
                bgAudio.play().catch(err => {
                    console.warn('Online audio fallback error, activating procedural Web Audio synth:', err);
                    startRomanticAmbientPad();
                });
            }
        } else {
            startRomanticAmbientPad();
        }
    };

    const audioToggleBtn = document.getElementById('audio-toggle-btn');
    const audioIcon = document.getElementById('audio-icon');
    const audioLabel = document.getElementById('audio-label');

    function initAudioContext() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function getMusicUrl() {
        return (window.AppState && window.AppState.musicUrl) ? window.AppState.musicUrl : DEFAULT_MUSIC_URL;
    }

    window.updateBackgroundAudioTrack = function() {
        const url = getMusicUrl();
        bgAudio.src = url;
        bgAudio.load();
        if (!isMuted) {
            bgAudio.play().catch(err => {
                console.warn('Audio play error, using synth:', err);
                startRomanticAmbientPad();
            });
        }
    };

    window.startRomanticMusic = function() {
        initAudioContext();
        isMuted = false;

        if (audioIcon) audioIcon.textContent = '🎶';
        if (audioLabel) audioLabel.textContent = 'Music On';
        if (audioToggleBtn) audioToggleBtn.classList.add('active');

        const targetUrl = getMusicUrl();
        
        // Force set src if not already playing or src changed
        if (!bgAudio.src || !bgAudio.src.endsWith(targetUrl)) {
            bgAudio.src = targetUrl;
            bgAudio.load();
        }

        // Always start ambient synth pad as warm background layer
        startRomanticAmbientPad();

        bgAudio.play().then(() => {
            console.log('Local romantic track audio/khub.mp3 playing successfully!');
        }).catch(err => {
            console.warn('Local MP3 playback prevented or file missing, attempting online fallback...', err);
            if (!bgAudio.src.includes('archive.org')) {
                bgAudio.src = FALLBACK_ONLINE_URL;
                bgAudio.load();
                bgAudio.play().catch(() => startRomanticAmbientPad());
            }
        });
    };

    window.stopRomanticMusic = function() {
        isMuted = true;
        if (audioIcon) audioIcon.textContent = '🎵';
        if (audioLabel) audioLabel.textContent = 'Music Off';
        if (audioToggleBtn) audioToggleBtn.classList.remove('active');

        bgAudio.pause();
        stopRomanticAmbientPad();
    };

    // Toggle Audio On / Off
    function toggleAudio() {
        if (isMuted) {
            window.startRomanticMusic();
            if (window.playChimeSound) window.playChimeSound();
        } else {
            window.stopRomanticMusic();
        }
    }

    if (audioToggleBtn) {
        audioToggleBtn.addEventListener('click', toggleAudio);
    }

    // First User Interaction Auto Music Trigger
    function triggerAutoPlayOnInteraction() {
        if (autoPlayTriggered) return;
        autoPlayTriggered = true;
        window.startRomanticMusic();

        document.removeEventListener('click', triggerAutoPlayOnInteraction);
        document.removeEventListener('touchstart', triggerAutoPlayOnInteraction);
        document.removeEventListener('keydown', triggerAutoPlayOnInteraction);
    }

    document.addEventListener('click', triggerAutoPlayOnInteraction);
    document.addEventListener('touchstart', triggerAutoPlayOnInteraction);
    document.addEventListener('keydown', triggerAutoPlayOnInteraction);

    // Romantic Ambient Chord Pad Synthesizer (F#m -> Dmaj7 -> A -> E)
    function startRomanticAmbientPad() {
        if (!audioCtx || isPlayingPad) return;
        isPlayingPad = true;

        const chordFrequencies = [
            [185.00, 220.00, 277.18], // F#m
            [146.83, 220.00, 277.18], // Dmaj7
            [220.00, 277.18, 329.63], // A
            [164.81, 246.94, 329.63]  // E
        ];

        let chordIndex = 0;

        function playChordStep() {
            if (!isPlayingPad || isMuted) return;

            const freqs = chordFrequencies[chordIndex];
            chordIndex = (chordIndex + 1) % chordFrequencies.length;

            freqs.forEach((freq) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                const filter = audioCtx.createBiquadFilter();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(600, audioCtx.currentTime);

                const now = audioCtx.currentTime;
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.06, now + 2);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 7);

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(audioCtx.destination);

                osc.start(now);
                osc.stop(now + 7.5);
            });

            setTimeout(playChordStep, 6500);
        }

        playChordStep();
    }

    function stopRomanticAmbientPad() {
        isPlayingPad = false;
    }

    // Heartbeat Sound Synthesizer
    window.playHeartbeatSound = function() {
        if (isMuted || !audioCtx) return;
        
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(60, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.15);

        // Second beat pulse (lub-dub)
        setTimeout(() => {
            if (isMuted || !audioCtx) return;
            const now2 = audioCtx.currentTime;
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();

            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(70, now2);
            osc2.frequency.exponentialRampToValueAtTime(35, now2 + 0.2);

            gain2.gain.setValueAtTime(0.4, now2);
            gain2.gain.exponentialRampToValueAtTime(0.01, now2 + 0.2);

            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);

            osc2.start(now2);
            osc2.stop(now2 + 0.2);
        }, 180);
    };

    // Magic Chime Bell Sound
    window.playChimeSound = function() {
        if (isMuted || !audioCtx) return;
        const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        freqs.forEach((freq, idx) => {
            const now = audioCtx.currentTime + idx * 0.08;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(now);
            osc.stop(now + 0.8);
        });
    };

    // Celebration Proposal Yes Fanfare
    window.playProposalYesFanfare = function() {
        initAudioContext();
        const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
        notes.forEach((freq, idx) => {
            const now = audioCtx.currentTime + idx * 0.12;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(now);
            osc.stop(now + 1.5);
        });
    };

})();
