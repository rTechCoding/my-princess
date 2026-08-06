/* ==========================================================================
   ROMANTIC PARTICLES & CANVAS ANIMATION ENGINE
   ========================================================================== */

(function() {
    'use strict';

    // ----------------------------------------------------------------------
    // 1. BACKGROUND CANVAS (Rose Petals, Ambient Stars, Fireworks, Confetti)
    // ----------------------------------------------------------------------
    const bgCanvas = document.getElementById('bg-canvas');
    const bgCtx = bgCanvas.getContext('2d');

    let width = bgCanvas.width = window.innerWidth;
    let height = bgCanvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = bgCanvas.width = window.innerWidth;
        height = bgCanvas.height = window.innerHeight;
        initHeartCanvas();
    });

    // Background Particle Types
    const petals = [];
    const stars = [];
    const fireworks = [];
    const confetti = [];

    const PETAL_COUNT = 35;
    const STAR_COUNT = 70;

    class Petal {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * -height;
            this.size = 8 + Math.random() * 12;
            this.speedY = 1 + Math.random() * 2;
            this.speedX = Math.sin(this.y * 0.01) * 1.5;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.03;
            this.opacity = 0.4 + Math.random() * 0.5;
            this.color = Math.random() > 0.3 ? '#ff4d6d' : '#ff758f';
        }
        update() {
            this.y += this.speedY;
            this.x += Math.sin(this.y * 0.015) * 0.8;
            this.rotation += this.rotSpeed;
            if (this.y > height + 20) {
                this.reset();
            }
        }
        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(this.size, -this.size / 2, this.size * 1.2, this.size / 2, 0, this.size);
            ctx.bezierCurveTo(-this.size * 1.2, this.size / 2, -this.size, -this.size / 2, 0, 0);
            ctx.fill();
            ctx.restore();
        }
    }

    class AmbientStar {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2.5;
            this.alpha = Math.random();
            this.speed = 0.005 + Math.random() * 0.015;
        }
        update() {
            this.alpha += this.speed;
            if (this.alpha > 1 || this.alpha < 0) {
                this.speed = -this.speed;
            }
        }
        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.alpha);
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#ff758f';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    class FireworkParticle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.gravity = 0.1;
            this.alpha = 1;
            this.decay = Math.random() * 0.02 + 0.015;
            this.color = color;
            this.size = Math.random() * 3 + 2;
        }
        update() {
            this.vx *= 0.96;
            this.vy *= 0.96;
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            this.alpha -= this.decay;
        }
        draw(ctx) {
            if (this.alpha <= 0) return;
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    class ConfettiPiece {
        constructor() {
            this.x = width / 2;
            this.y = height / 2;
            this.vx = (Math.random() - 0.5) * 16;
            this.vy = (Math.random() - 0.8) * 18;
            this.gravity = 0.3;
            this.size = Math.random() * 10 + 6;
            this.color = ['#ff4d6d', '#ffd166', '#7209b7', '#ff758f', '#ffffff'][Math.floor(Math.random() * 5)];
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.2;
            this.isHeart = Math.random() > 0.5;
        }
        update() {
            this.vy += this.gravity;
            this.vx *= 0.98;
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotSpeed;
        }
        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = this.color;
            if (this.isHeart) {
                ctx.beginPath();
                const s = this.size / 2;
                ctx.arc(-s / 2, 0, s / 2, Math.PI, 0, false);
                ctx.arc(s / 2, 0, s / 2, Math.PI, 0, false);
                ctx.lineTo(0, s);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size / 2);
            }
            ctx.restore();
        }
    }

    // Populate Initial Particles
    for (let i = 0; i < PETAL_COUNT; i++) petals.push(new Petal());
    for (let i = 0; i < STAR_COUNT; i++) stars.push(new AmbientStar());

    function animateBg() {
        bgCtx.clearRect(0, 0, width, height);

        // Draw Stars
        stars.forEach(star => {
            star.update();
            star.draw(bgCtx);
        });

        // Draw Petals
        petals.forEach(petal => {
            petal.update();
            petal.draw(bgCtx);
        });

        // Update Fireworks
        for (let i = fireworks.length - 1; i >= 0; i--) {
            fireworks[i].update();
            fireworks[i].draw(bgCtx);
            if (fireworks[i].alpha <= 0) fireworks.splice(i, 1);
        }

        // Update Confetti
        for (let i = confetti.length - 1; i >= 0; i--) {
            confetti[i].update();
            confetti[i].draw(bgCtx);
            if (confetti[i].y > height + 50) confetti.splice(i, 1);
        }

        requestAnimationFrame(animateBg);
    }
    animateBg();

    // Global Celebration Launchers
    window.launchFireworks = function() {
        const colors = ['#ff4d6d', '#ffd166', '#ff758f', '#ffffff', '#7209b7'];
        for (let burst = 0; burst < 5; burst++) {
            setTimeout(() => {
                const cx = Math.random() * (width * 0.8) + width * 0.1;
                const cy = Math.random() * (height * 0.5) + height * 0.1;
                const color = colors[Math.floor(Math.random() * colors.length)];
                for (let i = 0; i < 60; i++) {
                    fireworks.push(new FireworkParticle(cx, cy, color));
                }
            }, burst * 400);
        }
    };

    window.launchConfetti = function() {
        for (let i = 0; i < 120; i++) {
            confetti.push(new ConfettiPiece());
        }
    };


    // ----------------------------------------------------------------------
    // 2. HERO INTERACTIVE 3D HEART CANVAS ENGINE
    // ----------------------------------------------------------------------
    const heartCanvas = document.getElementById('heart-canvas');
    let heartCtx;
    let heartParticles = [];
    let mouse = { x: -1000, y: -1000, radius: 80 };

    if (heartCanvas) {
        heartCtx = heartCanvas.getContext('2d');
        
        heartCanvas.addEventListener('mousemove', (e) => {
            const rect = heartCanvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        heartCanvas.addEventListener('mouseleave', () => {
            mouse.x = -1000;
            mouse.y = -1000;
        });

        initHeartCanvas();
        animateHeart();
    }

    function initHeartCanvas() {
        if (!heartCanvas) return;
        const size = Math.min(window.innerWidth * 0.8, 360);
        heartCanvas.width = size;
        heartCanvas.height = size;

        heartParticles = [];
        const particleCount = 550;
        const cx = size / 2;
        const cy = size / 2 - 10;
        const scale = size / 32;

        for (let i = 0; i < particleCount; i++) {
            const t = (i / particleCount) * Math.PI * 2;
            
            // Parametric Heart Formula
            const xVal = 16 * Math.pow(Math.sin(t), 3);
            const yVal = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));

            const baseX = cx + xVal * scale + (Math.random() - 0.5) * 8;
            const baseY = cy + yVal * scale + (Math.random() - 0.5) * 8;

            heartParticles.push({
                x: baseX,
                y: baseY,
                baseX: baseX,
                baseY: baseY,
                vx: 0,
                vy: 0,
                size: Math.random() * 2.5 + 1.2,
                color: Math.random() > 0.4 ? '#ff4d6d' : '#ff758f',
                glow: Math.random() > 0.5
            });
        }
    }

    let heartTime = 0;
    function animateHeart() {
        if (!heartCtx) return;
        heartCtx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);
        heartTime += 0.03;

        // Heartbeat expansion factor
        const pulse = 1 + Math.sin(heartTime * 2.5) * 0.05;
        const cx = heartCanvas.width / 2;
        const cy = heartCanvas.height / 2;

        heartParticles.forEach(p => {
            // Apply Heartbeat scaling
            const dxFromCenter = p.baseX - cx;
            const dyFromCenter = p.baseY - cy;
            const targetX = cx + dxFromCenter * pulse;
            const targetY = cy + dyFromCenter * pulse;

            // Mouse Repulsion Physics
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < mouse.radius) {
                const force = (mouse.radius - dist) / mouse.radius;
                const angle = Math.atan2(dy, dx);
                p.vx -= Math.cos(angle) * force * 5;
                p.vy -= Math.sin(angle) * force * 5;
            }

            // Spring return to base target position
            p.vx += (targetX - p.x) * 0.08;
            p.vy += (targetY - p.y) * 0.08;

            p.vx *= 0.85;
            p.vy *= 0.85;

            p.x += p.vx;
            p.y += p.vy;

            // Draw Particle
            heartCtx.save();
            heartCtx.fillStyle = p.color;
            if (p.glow) {
                heartCtx.shadowBlur = 10;
                heartCtx.shadowColor = '#ff4d6d';
            }
            heartCtx.beginPath();
            heartCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            heartCtx.fill();
            heartCtx.restore();
        });

        requestAnimationFrame(animateHeart);
    }

})();
