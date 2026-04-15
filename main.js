// Navegación interna sin ensuciar la URL con "#..."
function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getHeaderOffset() {
    const header = document.getElementById('header');
    return (header ? header.offsetHeight : 0) + 12;
}

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
    if (e.defaultPrevented) return;
    if (e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    if (a.getAttribute('target') === '_blank') return;
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    const id = href.slice(1);
    if (!id) return;
    if (scrollToSectionById(id)) {
        e.preventDefault();
        clearHashFromUrl();
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const hash = location.hash;
    if (!hash || hash === '#') return;
    const id = hash.slice(1);
    if (!id) return;
    setTimeout(() => {
        if (scrollToSectionById(id)) clearHashFromUrl();
    }, 0);
});

// Scroll Reveal Observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.sr').forEach(el => observer.observe(el));

// Scroll Reveal — CSS Animation Classes
const srRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            srRevealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.05 });

document.querySelectorAll('.sr-wipe, .sr-tilt, .sr-tilt-neg, .sr-left, .sr-right').forEach(el => srRevealObserver.observe(el));

// Eclair Drift Animations
const eclair1 = document.getElementById('eclair1');
const eclair2 = document.getElementById('eclair2');
const eclair3 = document.getElementById('eclair3');

let rafId = null;
let lastFrameTime = 0;
const FRAME_INTERVAL = 1000 / 40; // cap a 40fps — invisible a ojo, ahorra GPU

function animateWorld(now) {
    if (document.hidden) { rafId = null; return; }
    if (now - lastFrameTime < FRAME_INTERVAL) { rafId = requestAnimationFrame(animateWorld); return; }
    lastFrameTime = now;

    const t = now / 1000;

    if (eclair1) eclair1.style.transform = `rotate(${-22 + Math.sin(t) * 2}deg) translate(${Math.sin(t * 1.2) * 6}px, ${Math.cos(t) * -10}px)`;
    if (eclair2) eclair2.style.transform = `rotate(${16 + Math.sin(t * 0.9) * 2}deg) translate(${Math.cos(t * 1.1) * -5}px, ${Math.sin(t * 0.8) * -8}px)`;
    if (eclair3) eclair3.style.transform = `rotate(${-8 + Math.cos(t * 1.1) * 2}deg) translate(${Math.sin(t * 0.7) * 4}px, ${Math.cos(t * 1.3) * -7}px)`;

    rafId = requestAnimationFrame(animateWorld);
}
rafId = requestAnimationFrame(animateWorld);

// Reanudar animación al volver a la pestaña
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !rafId) rafId = requestAnimationFrame(animateWorld);
});

// Vitrina Slider
const vitrinaProducts = [
    {
        num: '01', tag: 'Clásico goloso',
        name: 'Red Velvet<br>&amp; Cheese',
        img: 'img/paquito-frambuesa-lado.webp',
        alt: 'Paquito Red Velvet & Cheese',
        ingredients: 'Masa · Azúcar · Glaseado de queso · Frutos rojos',
        badge: '★ Bestseller',
        badgeColor: '#FF653A',
        nameColor: '#FF653A',
        bgColor: 'rgba(255,101,58,0.06)',
        dotColor: '#FF653A'
    },
    {
        num: '02', tag: 'El favorito de IG',
        name: 'Pistacho<br>Lover',
        img: 'img/paquito-pistacho-lado.webp',
        alt: 'Paquito Pistacho Lover',
        ingredients: 'Masa · Crema pistacho · Cobertura blanca · Pistacho',
        badge: '★ El más trendy',
        badgeColor: '#8C52FF',
        nameColor: '#8C52FF',
        bgColor: 'rgba(140,82,255,0.06)',
        dotColor: '#8C52FF'
    },
    {
        num: '03', tag: 'Para los más golosos',
        name: 'Cookies<br>&amp; Kinder',
        img: 'img/paquito-chocolate-lado.webp',
        alt: 'Paquito Cookies & Kinder',
        ingredients: 'Masa · Galleta Oreo · Kinder Bueno · Ganache',
        badge: '★ Para golosos',
        badgeColor: '#FF653A',
        nameColor: '#FF653A',
        bgColor: 'rgba(15,15,15,0.04)',
        dotColor: '#0f0f0f'
    }
];

let vitrinaCurrent = 0;

function goToVitrina(index) {
    const p = vitrinaProducts[index];
    const img = document.getElementById('vitrinaImg');
    const info = document.getElementById('vitrinaInfo');
    const badge = document.getElementById('vitrinaBadge');
    const bg = document.getElementById('vitrinaBg');
    const dots = document.querySelectorAll('.vitrina-dot');

    img.style.opacity = '0';
    img.style.transform = 'rotate(-4deg) translateX(16px)';
    info.style.opacity = '0';

    setTimeout(() => {
        img.src = p.img; img.alt = p.alt;
        document.getElementById('vitrinaName').innerHTML = p.name;
        document.getElementById('vitrinaName').style.color = p.nameColor;
        document.getElementById('vitrinaNum').textContent = p.num;
        document.getElementById('vitrinaTag').textContent = p.tag;
        document.getElementById('vitrinaIngredients').textContent = p.ingredients;
        document.getElementById('vitrinaCurrent').textContent = p.num;
        badge.textContent = p.badge;
        badge.style.background = p.badgeColor;
        bg.style.background = p.bgColor;
        dots.forEach((dot, i) => {
            dot.style.background = vitrinaProducts[i].dotColor;
            dot.style.opacity = i === index ? '1' : '0.2';
            dot.style.transform = i === index ? 'scale(1.3)' : 'scale(1)';
        });
        img.style.opacity = '1';
        img.style.transform = 'rotate(-4deg)';
        info.style.opacity = '1';
        vitrinaCurrent = index;
    }, 280);
}

let vitrinaTimer = null;
function startVitrinaAutoplay() {
    clearInterval(vitrinaTimer);
    vitrinaTimer = setInterval(() => goToVitrina((vitrinaCurrent + 1) % vitrinaProducts.length), 3500);
}
function pauseVitrinaAutoplay() {
    clearInterval(vitrinaTimer);
    setTimeout(startVitrinaAutoplay, 6000);
}
function prevVitrina() { pauseVitrinaAutoplay(); goToVitrina((vitrinaCurrent - 1 + vitrinaProducts.length) % vitrinaProducts.length); }
function nextVitrina() { pauseVitrinaAutoplay(); goToVitrina((vitrinaCurrent + 1) % vitrinaProducts.length); }

startVitrinaAutoplay();

(function () {
    let startX = 0;
    const el = document.getElementById('vitrinaImgWrap');
    if (!el) return;
    el.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', e => {
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) { pauseVitrinaAutoplay(); diff > 0 ? nextVitrina() : prevVitrina(); }
    }, { passive: true });
})();

// Toggle sabores secretos
let secretosOpen = false;
function toggleSecretos() {
    const panel = document.getElementById('secretosPanel');
    const icon = document.getElementById('iconSecretos');
    const btn = document.getElementById('btnSecretos');
    secretosOpen = !secretosOpen;
    if (secretosOpen) {
        panel.style.maxHeight = panel.scrollHeight + 'px';
        panel.style.opacity = '1';
        panel.style.marginTop = '0';
        icon.style.transform = 'rotate(180deg)';
        btn.querySelector('span').textContent = '🔓';
        btn.classList.add('active');
    } else {
        panel.style.maxHeight = '0';
        panel.style.opacity = '0';
        icon.style.transform = 'rotate(0deg)';
        btn.querySelector('span').textContent = '🔒';
        btn.classList.remove('active');
    }
}

// Ordenar puntos de venta por distancia al usuario
function sortByLocation(btn) {
    if (!navigator.geolocation) {
        btn.textContent = 'Tu navegador no permite geolocalización';
        return;
    }

    const grid = document.getElementById('puntosGrid');
    if (!grid) {
        btn.textContent = 'No se encontró la lista de tiendas';
        return;
    }

    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="2"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="10"/><path d="M12 12l4-4"/></svg> Detectando…';
    btn.disabled = true;

    navigator.geolocation.getCurrentPosition(
        pos => {
            const userLat = pos.coords.latitude;
            const userLng = pos.coords.longitude;
            const cards = Array.from(grid.querySelectorAll('.punto-card'));

            cards.forEach(card => {
                const lat = parseFloat(card.dataset.lat);
                const lng = parseFloat(card.dataset.lng);
                if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
                const dist = haversine(userLat, userLng, lat, lng);
                card.dataset.dist = String(dist);
                const badge = card.querySelector('.dist-badge');
                if (badge) {
                    badge.textContent = dist < 1 ? Math.round(dist * 1000) + ' m' : dist.toFixed(1) + ' km';
                    badge.style.display = 'block';
                }
            });

            cards.sort((a, b) => (parseFloat(a.dataset.dist) || Infinity) - (parseFloat(b.dataset.dist) || Infinity));
            cards.forEach(card => grid.appendChild(card));

            btn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg> Ordenado por cercanía';
            btn.disabled = false;
        },
        (err) => {
            const code = err?.code;
            const msg =
                code === 1 ? 'Permiso de ubicación denegado' :
                code === 2 ? 'No se pudo obtener tu ubicación' :
                code === 3 ? 'La ubicación tardó demasiado' :
                'No se pudo obtener tu ubicación';

            btn.innerHTML = originalHTML;
            btn.setAttribute('data-geo-error', msg);
            btn.disabled = false;
            setTimeout(() => btn.removeAttribute('data-geo-error'), 3500);
        },
        { enableHighAccuracy: false, timeout: 9000, maximumAge: 2 * 60 * 1000 }
    );
}

function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
