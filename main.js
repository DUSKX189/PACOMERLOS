document.documentElement.classList.add('js-ready');

// ─── Reduced motion ───────────────────────────────────────
function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ─── Header offset ────────────────────────────────────────
function getHeaderOffset() {
    const h = document.getElementById('header');
    return (h ? h.offsetHeight : 0) + 12;
}

// ─── Smooth scroll a sección ──────────────────────────────
function scrollToSectionById(id) {
    const target = document.getElementById(id);
    if (!target) return false;
    const top = window.scrollY + target.getBoundingClientRect().top - getHeaderOffset();
    window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    return true;
}

function clearHashFromUrl() {
    if (!location.hash) return;
    history.replaceState(null, '', location.pathname + location.search);
}

document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('target') === '_blank') return;
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    const id = href.slice(1);
    if (id && scrollToSectionById(id)) { e.preventDefault(); clearHashFromUrl(); }
});

window.addEventListener('DOMContentLoaded', () => {
    const hash = location.hash;
    if (!hash || hash === '#') return;
    const id = hash.slice(1);
    if (id) setTimeout(() => { if (scrollToSectionById(id)) clearHashFromUrl(); }, 0);
});

// ─── Header hide/show on scroll ───────────────────────────
(function () {
    const header = document.getElementById('header');
    if (!header) return;
    let lastY = 0;
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const y = window.scrollY;
            if (y < 80) {
                header.classList.remove('hide');
            } else if (y > lastY + 4) {
                header.classList.add('hide');
            } else if (y < lastY - 4) {
                header.classList.remove('hide');
            }
            lastY = y;
            ticking = false;
        });
    }, { passive: true });
})();

// ─── Scroll Reveal ────────────────────────────────────────
const srObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            srObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.08 });

document.querySelectorAll('.sr, .sr-wipe, .sr-tilt, .sr-tilt-neg, .sr-left, .sr-right')
    .forEach(el => srObserver.observe(el));


// ─── Hero: ciclo de fondos con crossfade ─────────────────
(function () {
    const slides = Array.from(document.querySelectorAll('.hero-bg-slide'));
    if (!slides.length || prefersReducedMotion()) return;
    let current = 0;
    setInterval(() => {
        slides[current].classList.remove('active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('active');
    }, 5000);
})();

// ─── Anatomía: líneas SVG hacia capas del paquito ────────
(function () {
    const diagram = document.querySelector('.anatomia-diagram');
    const img     = document.getElementById('anatomy-img');
    if (!diagram || !img) return;

    const ns  = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible;z-index:5';
    diagram.appendChild(svg);

    function draw() {
        svg.innerHTML = '';
        const dRect = diagram.getBoundingClientRect();
        const iRect = img.getBoundingClientRect();

        document.querySelectorAll('.anatomia-label[data-target-y]').forEach(label => {
            const targetY = parseFloat(label.dataset.targetY) / 100;
            const color   = label.dataset.color || '#0f0f0f';
            const side    = label.dataset.side;
            const dot     = label.querySelector('.anatomia-label-dot');
            if (!dot) return;

            const dotRect = dot.getBoundingClientRect();
            const x1 = dotRect.left + dotRect.width  / 2 - dRect.left;
            const y1 = dotRect.top  + dotRect.height / 2 - dRect.top;
            const x2 = (side === 'left' ? iRect.left : iRect.right) - dRect.left;
            const y2 = iRect.top - dRect.top + iRect.height * targetY;

            // Línea punteada
            const line = document.createElementNS(ns, 'line');
            line.setAttribute('x1', x1); line.setAttribute('y1', y1);
            line.setAttribute('x2', x2); line.setAttribute('y2', y2);
            line.setAttribute('stroke', color);
            line.setAttribute('stroke-width', '1.5');
            line.setAttribute('stroke-dasharray', '5 4');
            line.setAttribute('opacity', '0.55');
            svg.appendChild(line);

            // Círculo en el punto de la imagen
            const circle = document.createElementNS(ns, 'circle');
            circle.setAttribute('cx', x2); circle.setAttribute('cy', y2);
            circle.setAttribute('r', '5');
            circle.setAttribute('fill', color);
            circle.setAttribute('opacity', '0.85');
            svg.appendChild(circle);
        });
    }

    img.complete ? draw() : img.addEventListener('load', draw);
    window.addEventListener('resize', draw);
})();

// ─── Sabores: depth carousel ─────────────────────────────
(function () {
    const slides = Array.from(document.querySelectorAll('.sabor-slide'));
    const nameEl = document.querySelector('.sabor-stage-name');
    if (!slides.length) return;

    const n = slides.length;
    let current = 0;
    let paused  = false;

    function teleport(slide, state) {
        slide.style.transition = 'none';
        slide.dataset.state = state;
    }

    function init() {
        slides.forEach(s => s.style.transition = 'none');
        slides.forEach((s, i) => {
            if (i === 0)        s.dataset.state = 'active';
            else if (i === 1)   s.dataset.state = 'next';
            else if (i === n-1) s.dataset.state = 'prev';
            else                s.dataset.state = 'hidden';
        });
        if (nameEl) {
            nameEl.textContent = slides[0].dataset.name;
            nameEl.style.color = slides[0].dataset.color || 'var(--dark)';
        }
        requestAnimationFrame(() => requestAnimationFrame(() => {
            slides.forEach(s => s.style.transition = '');
        }));
    }

    function advance() {
        if (paused) return;
        const outgoing = (current - 1 + n) % n; // old prev → hidden
        const nextCur  = (current + 1) % n;      // old next → active
        const newNext  = (current + 2) % n;      // hidden → far-next → next

        // Step 1: instant – hide outgoing + place newNext off-screen right
        teleport(slides[outgoing], 'hidden');
        teleport(slides[newNext],  'far-next');
        void slides[outgoing].offsetWidth; // force reflow
        slides[outgoing].style.transition = '';
        slides[newNext].style.transition  = '';

        // Step 2: animate – active→prev, next→active, far-next→next
        slides[current].dataset.state = 'prev';
        slides[nextCur].dataset.state  = 'active';
        slides[newNext].dataset.state  = 'next';
        current = nextCur;

        // Fade name label
        if (nameEl) {
            nameEl.style.opacity = '0';
            setTimeout(() => {
                nameEl.textContent = slides[current].dataset.name;
                nameEl.style.color = slides[current].dataset.color || 'var(--dark)';
                nameEl.style.opacity = '1';
            }, 350);
        }
    }

    function retreat() {
        if (paused) return;
        const outgoing = (current + 1) % n;
        const prevCur  = (current - 1 + n) % n;
        const newPrev  = (current - 2 + n) % n;

        teleport(slides[outgoing], 'hidden');
        teleport(slides[newPrev],  'far-prev');
        void slides[outgoing].offsetWidth;
        slides[outgoing].style.transition = '';
        slides[newPrev].style.transition  = '';

        slides[current].dataset.state = 'next';
        slides[prevCur].dataset.state = 'active';
        slides[newPrev].dataset.state = 'prev';
        current = prevCur;

        if (nameEl) {
            nameEl.style.opacity = '0';
            setTimeout(() => {
                nameEl.textContent = slides[current].dataset.name;
                nameEl.style.color = slides[current].dataset.color || 'var(--dark)';
                nameEl.style.opacity = '1';
            }, 350);
        }
    }

    if (prefersReducedMotion()) {
        slides[0].dataset.state = 'active';
        if (nameEl) {
            nameEl.textContent = slides[0].dataset.name;
            nameEl.style.color = slides[0].dataset.color || 'var(--dark)';
        }
        return;
    }

    init();
    setInterval(advance, 3500);

    const stage = document.querySelector('.sabores-stage');
    if (stage) {
        stage.addEventListener('mouseenter', () => { paused = true; });
        stage.addEventListener('mouseleave', () => { paused = false; });
    }

    const btnNext = document.getElementById('sabores-next');
    const btnPrev = document.getElementById('sabores-prev');
    if (btnNext) btnNext.addEventListener('click', () => { paused = false; advance(); paused = false; });
    if (btnPrev) btnPrev.addEventListener('click', () => { paused = false; retreat(); paused = false; });
})();


// ─── Sabores accordion ────────────────────────────────────
(function () {
    const cards = document.querySelectorAll('.sabor-card');
    if (!cards.length) return;

    cards.forEach(card => {
        const btn = card.querySelector('.sabor-card-summary');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const isOpen = card.classList.contains('expanded');
            cards.forEach(c => {
                c.classList.remove('expanded');
                const b = c.querySelector('.sabor-card-summary');
                if (b) b.setAttribute('aria-expanded', 'false');
            });
            if (!isOpen) {
                card.classList.add('expanded');
                btn.setAttribute('aria-expanded', 'true');
                setTimeout(() => {
                    const top = card.getBoundingClientRect().top + window.scrollY - getHeaderOffset() - 12;
                    window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
                }, 80);
            }
        });
        btn.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
        });
    });
})();

// ─── Sabores carousel dots ────────────────────────────────
(function () {
    const grid = document.querySelector('.sabores-grid');
    const dotsWrap = document.querySelector('.sabores-dots');
    if (!grid || !dotsWrap) return;

    const cards = grid.querySelectorAll('.sabor-card');
    if (!cards.length) return;

    // Build dots
    dotsWrap.innerHTML = '';
    cards.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'sabores-dot' + (i === 0 ? ' sabores-dot--active' : '');
        dot.setAttribute('aria-label', `Sabor ${i + 1}`);
        dot.addEventListener('click', () => {
            cards[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        });
        dotsWrap.appendChild(dot);
    });

    const dots = dotsWrap.querySelectorAll('.sabores-dot');

    function updateDots() {
        const scrollLeft = grid.scrollLeft;
        const cardWidth = cards[0].offsetWidth + parseFloat(getComputedStyle(grid).gap || '20');
        const idx = Math.round(scrollLeft / cardWidth);
        dots.forEach((d, i) => d.classList.toggle('sabores-dot--active', i === idx));
    }

    grid.addEventListener('scroll', updateDots, { passive: true });
    updateDots();

    // Drag support
    let isDragging = false, startX = 0, scrollStart = 0;
    grid.addEventListener('mousedown', e => {
        isDragging = true; startX = e.pageX; scrollStart = grid.scrollLeft;
        grid.style.userSelect = 'none';
    });
    window.addEventListener('mousemove', e => {
        if (!isDragging) return;
        grid.scrollLeft = scrollStart - (e.pageX - startX);
    });
    window.addEventListener('mouseup', () => {
        isDragging = false; grid.style.userSelect = '';
    });
})();

// ─── Social carousel drag support ─────────────────────────
(function () {
    const carousel = document.querySelector('.social-carousel');
    if (!carousel) return;
    let isDragging = false, startX = 0, scrollStart = 0;
    carousel.addEventListener('mousedown', e => {
        isDragging = true; startX = e.pageX; scrollStart = carousel.scrollLeft;
        carousel.style.userSelect = 'none';
    });
    window.addEventListener('mousemove', e => {
        if (!isDragging) return;
        carousel.scrollLeft = scrollStart - (e.pageX - startX);
    });
    window.addEventListener('mouseup', () => {
        isDragging = false; carousel.style.userSelect = '';
    });
})();

// ─── Cookie banner ────────────────────────────────────────
(function () {
    const banner = document.querySelector('.cookie-banner');
    const btn = document.querySelector('.cookie-btn');
    if (!banner || !btn) return;

    if (localStorage.getItem('cookies_ok')) {
        banner.classList.add('hidden');
        return;
    }

    // Mostrar tras 1.2s
    setTimeout(() => banner.classList.remove('hidden'), 1200);

    btn.addEventListener('click', () => {
        localStorage.setItem('cookies_ok', '1');
        banner.classList.add('hidden');
    });
})();
