/* =========================================================
   APPARITION AU SCROLL
========================================================= */
function observeReveals() {
    const revealEls = document.querySelectorAll('.reveal:not(.visible)');

    if (!('IntersectionObserver' in window)) {
        revealEls.forEach(el => el.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12 }
    );

    revealEls.forEach(el => observer.observe(el));
}


/* =========================================================
   BARRE DE PROGRESSION + NAVBAR
========================================================= */
function initScrollEffects() {
    const bar = document.querySelector('.scroll-progress');
    const navbar = document.querySelector('.navbar');
    let ticking = false;

    function update() {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;

        if (bar) {
            bar.style.transform = `scaleX(${ratio})`;
        }

        if (navbar) {
            navbar.classList.toggle('scrolled', window.scrollY > 20);
        }

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });

    update();
}


/* =========================================================
   TEXTE QUI S'ÉCRIT (hero)
========================================================= */
function initTyped() {
    const el = document.getElementById('typed');

    if (!el) {
        return;
    }

    const phrases = [
        'Data Engineering',
        'Big Data & systèmes distribués',
        'Machine Learning & NLP'
    ];

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        el.textContent = phrases[0];
        return;
    }

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
        const phrase = phrases[phraseIndex];

        charIndex += deleting ? -1 : 1;
        el.textContent = phrase.slice(0, charIndex);

        let delay = deleting ? 28 : 65;

        if (!deleting && charIndex === phrase.length) {
            deleting = true;
            delay = 1700;
        } else if (deleting && charIndex === 0) {
            deleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            delay = 350;
        }

        setTimeout(tick, delay);
    }

    tick();
}


/* =========================================================
   RÉSEAU DE DONNÉES ANIMÉ (canvas du hero)
========================================================= */
function initNetwork() {
    const canvas = document.getElementById('hero-canvas');

    if (!canvas) {
        return;
    }

    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const colors = ['255,114,182', '117,217,255'];
    const pointer = { x: -9999, y: -9999 };
    let width = 0;
    let height = 0;
    let nodes = [];
    let running = false;

    function resize() {
        const rect = canvas.getBoundingClientRect();
        const ratio = Math.min(window.devicePixelRatio || 1, 2);

        width = rect.width;
        height = rect.height;
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

        const count = Math.max(24, Math.min(70, Math.round(width * height / 22000)));

        nodes = Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            r: Math.random() * 1.6 + 0.9,
            c: colors[Math.random() > 0.5 ? 1 : 0]
        }));
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        const maxDist = 140;

        for (let i = 0; i < nodes.length; i++) {
            const a = nodes[i];

            if (!reduced) {
                a.x += a.vx;
                a.y += a.vy;

                if (a.x < 0 || a.x > width) a.vx *= -1;
                if (a.y < 0 || a.y > height) a.vy *= -1;

                const dx = a.x - pointer.x;
                const dy = a.y - pointer.y;
                const d2 = dx * dx + dy * dy;

                if (d2 < 14000) {
                    const d = Math.sqrt(d2) || 1;
                    a.x += (dx / d) * 0.9;
                    a.y += (dy / d) * 0.9;
                }
            }

            for (let j = i + 1; j < nodes.length; j++) {
                const b = nodes[j];
                const dist = Math.hypot(a.x - b.x, a.y - b.y);

                if (dist < maxDist) {
                    ctx.strokeStyle = `rgba(${a.c},${(1 - dist / maxDist) * 0.28})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }

            ctx.fillStyle = `rgba(${a.c},0.85)`;
            ctx.beginPath();
            ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function loop() {
        if (!running) {
            return;
        }

        draw();
        requestAnimationFrame(loop);
    }

    resize();
    draw();

    if (reduced) {
        window.addEventListener('resize', () => { resize(); draw(); });
        return;
    }

    window.addEventListener('resize', resize);

    window.addEventListener('pointermove', event => {
        const rect = canvas.getBoundingClientRect();
        pointer.x = event.clientX - rect.left;
        pointer.y = event.clientY - rect.top;
    }, { passive: true });

    // n'anime que lorsque le hero est visible (économie de batterie)
    new IntersectionObserver(entries => {
        const visible = entries[0].isIntersecting;

        if (visible && !running) {
            running = true;
            loop();
        } else if (!visible) {
            running = false;
        }
    }).observe(canvas);
}


document.addEventListener('DOMContentLoaded', () => {
    observeReveals();
    initScrollEffects();
    initTyped();
    initNetwork();
});
