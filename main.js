let mx = 0, my = 0;

// Mobile Menu
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const icon = document.getElementById('menuIcon');
    const isOpen = menu.style.display === 'flex';
    if (isOpen) {
        menu.style.display = 'none';
        icon.setAttribute('icon', 'solar:hamburger-menu-linear');
        document.body.style.overflow = '';
    } else {
        menu.style.display = 'flex';
        menu.style.flexDirection = 'column';
        icon.setAttribute('icon', 'solar:close-circle-linear');
        document.body.style.overflow = 'hidden';
    }
}

function closeMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const icon = document.getElementById('menuIcon');
    menu.style.display = 'none';
    icon.setAttribute('icon', 'solar:hamburger-menu-linear');
    document.body.style.overflow = '';
}

// Scroll Reveal Observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.remove('opacity-0', 'translate-y-7');
            entry.target.classList.add('opacity-100', 'translate-y-0');
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
const badge = document.getElementById('spinningBadge');
const pins = document.querySelectorAll('.map-pin');

function animateWorld() {
    if (document.hidden) return;

    const t = Date.now() / 1000;

    if (eclair1) eclair1.style.transform = `rotate(${-22 + Math.sin(t) * 2}deg) translate(${Math.sin(t * 1.2) * 6}px, ${Math.cos(t) * -10}px)`;
    if (eclair2) eclair2.style.transform = `rotate(${16 + Math.sin(t * 0.9) * 2}deg) translate(${Math.cos(t * 1.1) * -5}px, ${Math.sin(t * 0.8) * -8}px)`;
    if (eclair3) eclair3.style.transform = `rotate(${-8 + Math.cos(t * 1.1) * 2}deg) translate(${Math.sin(t * 0.7) * 4}px, ${Math.cos(t * 1.3) * -7}px)`;


    pins.forEach((pin, i) => {
        if (pin.style.display !== 'none') {
            const offset = Math.sin(t * 2 + i) * 4 - 4;
            pin.style.transform = `translateY(${offset}px)`;
        }
    });

    requestAnimationFrame(animateWorld);
}
requestAnimationFrame(animateWorld);

// Reanudar animación al volver a la pestaña
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) requestAnimationFrame(animateWorld);
});

// Vitrina Slider
const vitrinaProducts = [
    {
        num: '01', tag: 'Clasico goloso',
        name: 'Red Velvet<br>&amp; Cheese',
        img: 'img/paquito-frambuesa-lado.webp',
        alt: 'Paquito Red Velvet & Cheese',
        ingredients: 'Masa · Azucar · Glaseado de queso · Frutos rojos',
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
        badge: '★ El mas trendy',
        badgeColor: '#8C52FF',
        nameColor: '#8C52FF',
        bgColor: 'rgba(140,82,255,0.06)',
        dotColor: '#8C52FF'
    },
    {
        num: '03', tag: 'Para los mas golosos',
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
    const name = document.getElementById('vitrinaName');
    const info = document.getElementById('vitrinaInfo');
    const badge = document.getElementById('vitrinaBadge');
    const bg = document.getElementById('vitrinaBg');
    const dots = document.querySelectorAll('.vitrina-dot');

    // Fade out
    img.style.opacity = '0';
    img.style.transform = 'rotate(-4deg) translateX(16px)';
    info.style.opacity = '0';

    setTimeout(() => {
        img.src = p.img;
        img.alt = p.alt;
        name.innerHTML = p.name;
        name.style.color = p.nameColor;
        document.getElementById('vitrinaNum').textContent = p.num;
        document.getElementById('vitrinaTag').textContent = p.tag;
        document.getElementById('vitrinaIngredients').textContent = p.ingredients;
        document.getElementById('vitrinaCurrent').textContent = p.num;
        badge.textContent = p.badge;
        badge.style.background = p.badgeColor;
        bg.style.background = p.bgColor;

        // Actualizar dots
        dots.forEach((dot, i) => {
            dot.style.background = vitrinaProducts[i].dotColor;
            dot.style.opacity = i === index ? '1' : '0.2';
            dot.style.transform = i === index ? 'scale(1.3)' : 'scale(1)';
        });

        // Fade in
        img.style.opacity = '1';
        img.style.transform = 'rotate(-4deg)';
        info.style.opacity = '1';

        vitrinaCurrent = index;
    }, 280);
}

let vitrinaTimer = null;

function startVitrinaAutoplay() {
    clearInterval(vitrinaTimer);
    vitrinaTimer = setInterval(() => {
        goToVitrina((vitrinaCurrent + 1) % vitrinaProducts.length);
    }, 3500);
}

function pauseVitrinaAutoplay() {
    clearInterval(vitrinaTimer);
    setTimeout(startVitrinaAutoplay, 6000);
}

function prevVitrina() {
    pauseVitrinaAutoplay();
    goToVitrina((vitrinaCurrent - 1 + vitrinaProducts.length) % vitrinaProducts.length);
}

function nextVitrina() {
    pauseVitrinaAutoplay();
    goToVitrina((vitrinaCurrent + 1) % vitrinaProducts.length);
}

startVitrinaAutoplay();

// Swipe en móvil
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
        btn.classList.add('text-[#8C52FF]', 'border-[#8C52FF]/40', 'bg-[#8C52FF]/5');
    } else {
        panel.style.maxHeight = '0';
        panel.style.opacity = '0';
        icon.style.transform = 'rotate(0deg)';
        btn.querySelector('span').textContent = '🔒';
        btn.classList.remove('text-[#8C52FF]', 'border-[#8C52FF]/40', 'bg-[#8C52FF]/5');
    }
}

// Ordenar puntos de venta por distancia al usuario
function sortByLocation(btn) {
    if (!navigator.geolocation) {
        btn.textContent = 'Tu navegador no permite geolocalización';
        return;
    }
    btn.innerHTML = '<iconify-icon icon="solar:radar-linear" stroke-width="1.5" class="text-sm"></iconify-icon> Detectando…';
    btn.disabled = true;

    navigator.geolocation.getCurrentPosition(
        pos => {
            const userLat = pos.coords.latitude;
            const userLng = pos.coords.longitude;

            const grid = document.getElementById('puntosGrid');
            const cards = Array.from(grid.querySelectorAll('.punto-card'));

            cards.forEach(card => {
                const lat = parseFloat(card.dataset.lat);
                const lng = parseFloat(card.dataset.lng);
                const dist = haversine(userLat, userLng, lat, lng);
                card.dataset.dist = dist;
                const badge = card.querySelector('.dist-badge');
                badge.textContent = dist < 1 ? Math.round(dist * 1000) + ' m' : dist.toFixed(1) + ' km';
                badge.classList.remove('hidden');
            });

            cards.sort((a, b) => a.dataset.dist - b.dataset.dist);
            cards.forEach(card => grid.appendChild(card));

            btn.innerHTML = '<iconify-icon icon="solar:check-circle-linear" stroke-width="1.5" class="text-sm"></iconify-icon> Ordenado por cercanía';
            btn.disabled = false;
        },
        () => {
            btn.innerHTML = '<iconify-icon icon="solar:map-point-linear" stroke-width="1.5" class="text-sm"></iconify-icon> Ordenar por cercanía';
            btn.disabled = false;
        }
    );
}

function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
