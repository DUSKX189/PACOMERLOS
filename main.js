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

// ─── Prow repeat reveal (re-animates every scroll pass) ───
const prowObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        } else if (entry.boundingClientRect.top > 0) {
            // element went back below viewport → reset so it animates again
            entry.target.classList.remove('revealed');
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.prow-sr').forEach(el => prowObserver.observe(el));


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


// ─── Anatomía: texto e imagen suben desde debajo del fondo ─
(function () {
    const bands = document.querySelectorAll('.anat-band');
    if (!bands.length || prefersReducedMotion()) return;

    function ease(t) { return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2; }

    function tick() {
        const viewH = window.innerHeight;
        bands.forEach(band => {
            const rect = band.getBoundingClientRect();
            // 0 = banda justo entrando por abajo, 1 = banda centrada en pantalla
            const raw  = (viewH - rect.top) / (viewH * 0.7);
            const prog = ease(Math.max(0, Math.min(1, raw)));

            const text = band.querySelector('.anat-text');
            const img  = band.querySelector('.anat-photo img');
            if (text) text.style.transform = `translateY(${(1 - prog) * 110}%)`;
            if (img)  img.style.transform  = `translateY(${(1 - prog) * 100}%)`;
        });
    }

    window.addEventListener('scroll', tick, { passive: true });
    tick();
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

// ─── Locator "Donde encontrarlos" ─────────────────────────
(function () {
    const geoBtn    = document.getElementById('encGeoBtn');
    const searchBtn = document.getElementById('encSearchBtn');
    const searchInp = document.getElementById('encSearch');
    const listEl    = document.getElementById('encList');
    const mapEl     = document.getElementById('encMap');
    if (!geoBtn || !mapEl || typeof L === 'undefined') return;

    const OVERPASS = 'https://overpass-api.de/api/interpreter';
    const RADIUS_M = 30000; // 30 km

    const map = L.map(mapEl, {
        zoomControl: true,
        scrollWheelZoom: true,
        gestureHandling: true
    }).setView([40.4168, -3.7038], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        maxZoom: 19
    }).addTo(map);

    const iconNormal = L.divIcon({
        className: '',
        html: '<div style="width:20px;height:20px;border-radius:50%;background:#FF653A;border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,0.45)"></div>',
        iconSize: [20, 20], iconAnchor: [10, 10]
    });
    const iconActive = L.divIcon({
        className: '',
        html: '<div style="width:26px;height:26px;border-radius:50%;background:#fff;border:4px solid #FF653A;box-shadow:0 3px 12px rgba(0,0,0,0.5)"></div>',
        iconSize: [26, 26], iconAnchor: [13, 13]
    });

    let storeMarkers = {};
    let activeId     = null;
    let userMarker   = null;

    function distKm(lat1, lng1, lat2, lng2) {
        const R = 6371, dLat = (lat2-lat1)*Math.PI/180, dLng = (lng2-lng1)*Math.PI/180;
        const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }

    function clearMarkers() {
        Object.values(storeMarkers).forEach(m => m.remove());
        storeMarkers = {};
        activeId = null;
    }

    function setActive(store) {
        if (activeId !== null && storeMarkers[activeId]) storeMarkers[activeId].setIcon(iconNormal);
        activeId = store.id;
        if (storeMarkers[store.id]) {
            storeMarkers[store.id].setIcon(iconActive);
            storeMarkers[store.id].openPopup();
        }
        map.panTo([store.lat, store.lng], { animate: true });
        listEl.querySelectorAll('.enc-item').forEach(el => {
            el.classList.toggle('active', el.dataset.id === String(store.id));
        });
        const activeEl = listEl.querySelector('.enc-item.active');
        if (activeEl) activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    async function fetchStores(lat, lng) {
        const query = `[out:json][timeout:25];(node["brand"="Mercadona"](around:${RADIUS_M},${lat},${lng});way["brand"="Mercadona"](around:${RADIUS_M},${lat},${lng}););out center;`;
        const res  = await fetch(OVERPASS, { method: 'POST', body: 'data=' + encodeURIComponent(query) });
        const data = await res.json();
        return data.elements.map(el => {
            const elLat  = el.type === 'way' ? el.center.lat : el.lat;
            const elLng  = el.type === 'way' ? el.center.lon : el.lon;
            const tags   = el.tags || {};
            const street = tags['addr:street'] ? tags['addr:street'] + (tags['addr:housenumber'] ? ' ' + tags['addr:housenumber'] : '') : '';
            const city   = tags['addr:city'] || '';
            const addr   = [street, city].filter(Boolean).join(', ') || 'España';
            return { id: el.id, name: tags.name || 'Mercadona', addr, lat: elLat, lng: elLng };
        });
    }

    function renderList(userLat, userLng, stores) {
        clearMarkers();
        const sorted = stores
            .map(s => ({ ...s, dist: distKm(userLat, userLng, s.lat, s.lng) }))
            .sort((a, b) => a.dist - b.dist);

        listEl.innerHTML = '';
        if (!sorted.length) {
            listEl.innerHTML = '<p class="enc-list-placeholder">No encontramos tiendas en este radio.</p>';
            return;
        }

        sorted.forEach((s, i) => {
            const distTxt = s.dist < 1 ? Math.round(s.dist * 1000) + ' m' : s.dist.toFixed(1) + ' km';
            const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`;
            const m = L.marker([s.lat, s.lng], { icon: iconNormal }).addTo(map);
            m.bindPopup(`
                <div style="font-family:sans-serif;min-width:160px">
                    <strong style="font-size:0.85rem">${s.name}</strong>
                    <div style="font-size:0.75rem;color:#666;margin:3px 0 8px">${s.addr}</div>
                    <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer"
                       style="display:block;text-align:center;background:#FF653A;color:#fff;font-weight:700;font-size:0.75rem;padding:6px 10px;border-radius:6px;text-decoration:none">
                        Cómo llegar →
                    </a>
                </div>`);
            m.on('click', () => setActive(s));
            storeMarkers[s.id] = m;

            const item = document.createElement('div');
            item.className = 'enc-item';
            item.dataset.id = s.id;
            item.innerHTML = `
                <div class="enc-item-icon">${String(i+1).padStart(2,'0')}</div>
                <div class="enc-item-body">
                    <div class="enc-item-name">${s.name}</div>
                    <div class="enc-item-addr">${s.addr}</div>
                    <div class="enc-item-footer">
                        <span class="enc-item-dist">${distTxt}</span>
                        <a class="enc-item-gmaps" href="${mapsUrl}" target="_blank" rel="noopener noreferrer">Cómo llegar →</a>
                    </div>
                </div>`;
            item.addEventListener('click', () => setActive(s));
            listEl.appendChild(item);
        });

        if (userMarker) userMarker.remove();
        const userIcon = L.divIcon({
            className: '',
            html: `<div class="enc-user-pin"><div class="enc-user-pulse"></div><div class="enc-user-dot"></div></div>`,
            iconSize: [40, 40], iconAnchor: [20, 20]
        });
        userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(map).bindPopup('Tu ubicación');

        const bounds = L.latLngBounds([[userLat, userLng], ...sorted.slice(0, 15).map(s => [s.lat, s.lng])]);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
        setActive(sorted[0]);
    }

    function setLoading(msg) {
        listEl.innerHTML = `<p class="enc-list-placeholder">${msg}</p>`;
    }

    async function locateAndRender(lat, lng) {
        setLoading('Buscando Mercadonas cercanas…');
        try {
            const stores = await fetchStores(lat, lng);
            renderList(lat, lng, stores);
        } catch {
            listEl.innerHTML = '<p class="enc-list-placeholder">Error al cargar tiendas. Inténtalo de nuevo.</p>';
        }
    }

    const GEO_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="8" stroke-opacity=".3"/></svg>`;

    geoBtn.addEventListener('click', () => {
        if (!navigator.geolocation) return alert('Tu navegador no soporta geolocalización.');
        geoBtn.innerHTML = `${GEO_SVG} Buscando…`;
        geoBtn.disabled = true;
        navigator.geolocation.getCurrentPosition(
            pos => {
                geoBtn.innerHTML = `${GEO_SVG} Mi ubicación`;
                geoBtn.disabled = false;
                locateAndRender(pos.coords.latitude, pos.coords.longitude);
            },
            () => {
                geoBtn.innerHTML = `${GEO_SVG} Usar mi ubicación`;
                geoBtn.disabled = false;
                alert('No se pudo obtener la ubicación. Prueba a buscar por dirección.');
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
    });

    async function searchAddress(query) {
        setLoading('Buscando dirección…');
        try {
            const res  = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=es`, { headers: { 'Accept-Language': 'es' } });
            const data = await res.json();
            if (!data.length) { listEl.innerHTML = '<p class="enc-list-placeholder">No encontramos esa dirección.</p>'; return; }
            await locateAndRender(+data[0].lat, +data[0].lon);
        } catch {
            listEl.innerHTML = '<p class="enc-list-placeholder">Error al buscar. Inténtalo de nuevo.</p>';
        }
    }

    searchBtn.addEventListener('click', () => { const q = searchInp.value.trim(); if (q) searchAddress(q); });
    searchInp.addEventListener('keydown', e => { if (e.key === 'Enter') { const q = searchInp.value.trim(); if (q) searchAddress(q); } });

    setTimeout(() => map.invalidateSize(), 300);
    new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) setTimeout(() => map.invalidateSize(), 100);
    }, { threshold: 0.1 }).observe(mapEl);
})();

// ─── Pacommunity board drag ────────────────────────────────
(function () {
    const board = document.getElementById('pcomBoard');
    if (!board) return;

    let dragging = false;
    let startX   = 0;
    let offsetX  = 0;

    function clamp(val) {
        const max = 0;
        const min = -(board.scrollWidth - board.parentElement.clientWidth);
        return Math.max(min, Math.min(max, val));
    }

    function onDown(clientX) {
        dragging = true;
        startX   = clientX - offsetX;
        board.classList.add('is-dragging');
    }

    function onMove(clientX) {
        if (!dragging) return;
        offsetX = clamp(clientX - startX);
        board.style.transform = `translateX(${offsetX}px)`;
    }

    function onUp() {
        dragging = false;
        board.classList.remove('is-dragging');
    }

    board.addEventListener('mousedown',  e => onDown(e.clientX));
    document.addEventListener('mousemove', e => onMove(e.clientX));
    document.addEventListener('mouseup',   onUp);

    board.addEventListener('touchstart', e => onDown(e.touches[0].clientX), { passive: true });
    board.addEventListener('touchmove',  e => onMove(e.touches[0].clientX), { passive: true });
    board.addEventListener('touchend',   onUp);
})();
