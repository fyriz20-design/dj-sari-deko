// ================================================
//  SARI DEKO – Haupt-JavaScript
// ================================================

// ---- PRELOADER ----
window.addEventListener('load', function () {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => preloader.classList.add('hide'), 900);
    setTimeout(() => preloader.remove(), 1500);
  }
});

// ---- GALERIE: Bilder laden (Priorität: deployed > localStorage) ----
(function ladeGalerie() {
  const grid = document.getElementById('galerie-grid');
  if (!grid) return;

  const fallbackIds = ['fallback-1','fallback-2','fallback-3','fallback-4','fallback-5'];

  function zeigeGalerie(bilder) {
    if (!bilder || bilder.length === 0) return;
    fallbackIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    bilder.forEach((bild, idx) => {
      const div = document.createElement('div');
      div.className = 'galerie-item' + (idx === 0 ? ' galerie-big' : '');
      if (bild.label) div.dataset.kategorie = bild.label;
      // encodeURI kodiert Leerzeichen & Sonderzeichen in Dateinamen korrekt
      const bildSrc = bild.data || encodeURI(bild.src);
      div.innerHTML = `
        <img src="${bildSrc}" alt="${bild.label || bild.name || 'Dekoration'}" loading="lazy" />
        <div class="galerie-overlay"><span>${bild.label || 'Dekoration'}</span></div>
      `;
      grid.appendChild(div);
    });
  }

  // Priorität 1: Bilder aus gallery-config.js (deployed → alle Geräte)
  if (typeof GALLERY_IMAGES !== 'undefined' && GALLERY_IMAGES.length > 0) {
    zeigeGalerie(GALLERY_IMAGES);
    return;
  }

  // Priorität 2: Admin-Upload via localStorage (nur lokaler Browser)
  const adminBilder = JSON.parse(localStorage.getItem('sari_images') || '[]');
  zeigeGalerie(adminBilder);
})();

// ---- TEXTE aus Admin laden ----
(function ladeAdminTexte() {
  const t = JSON.parse(localStorage.getItem('sari_texte') || '{}');
  if (t.firmenname) {
    document.querySelectorAll('.logo-text').forEach(el => el.textContent = t.firmenname);
  }
  if (t.heroTagline) {
    const el = document.querySelector('.hero-tagline');
    if (el) el.textContent = t.heroTagline;
  }
})();

// ---- NAVIGATION: Scroll-Effekt ----
const header = document.getElementById('site-header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

// ---- HAMBURGER MENÜ ----
const hamburger = document.getElementById('hamburger');
const mainNav   = document.querySelector('.main-nav');

if (hamburger && mainNav) {
  let savedScrollY = 0;

  function lockScroll() {
    savedScrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  }

  function unlockScroll() {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    window.scrollTo(0, savedScrollY);
  }

  function setMenu(open) {
    mainNav.classList.toggle('open', open);
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    hamburger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    if (open) lockScroll(); else unlockScroll();
  }

  hamburger.setAttribute('aria-expanded', 'false');

  hamburger.addEventListener('click', () => {
    setMenu(!mainNav.classList.contains('open'));
  });

  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMenu(false));
  });

  // Escape schließt das Menü
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mainNav.classList.contains('open')) setMenu(false);
  });

  // Beim Drehen/Vergrößern auf Desktop-Breite: Menü schließen & Scroll freigeben,
  // sonst bleibt die Seite gesperrt (body position:fixed)
  window.matchMedia('(min-width: 769px)').addEventListener('change', e => {
    if (e.matches && mainNav.classList.contains('open')) setMenu(false);
  });
}

// ---- BACK TO TOP ----
const backBtn = document.getElementById('back-to-top');
if (backBtn) {
  window.addEventListener('scroll', () => {
    backBtn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  backBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ---- WHATSAPP BUTTON ----
const waBtn = document.getElementById('whatsapp-btn');
if (waBtn) {
  window.addEventListener('scroll', () => {
    waBtn.classList.toggle('visible', window.scrollY > 200);
  }, { passive: true });
}

// ---- COOKIE BANNER ----
function akzeptiereCookies() {
  localStorage.setItem('cookies_accepted', '1');
  const banner = document.getElementById('cookie-banner');
  if (banner) {
    banner.style.transform = 'translateY(100%)';
    setTimeout(() => banner.remove(), 400);
  }
}

if (!localStorage.getItem('cookies_accepted')) {
  setTimeout(() => {
    const banner = document.getElementById('cookie-banner');
    if (banner) banner.classList.add('show');
  }, 1800);
}

// ---- LIGHTBOX ----
(function initLightbox() {
  const lb       = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lb-img');
  const lbCap    = document.getElementById('lb-caption');
  const lbClose  = document.getElementById('lb-close');
  const lbPrev   = document.getElementById('lb-prev');
  const lbNext   = document.getElementById('lb-next');
  if (!lb) return;

  let items = [];
  let idx   = 0;

  function getVisibleImgs() {
    return Array.from(
      document.querySelectorAll('#galerie-grid .galerie-item:not([style*="display: none"]) img')
    );
  }

  function show(i) {
    const img = items[i];
    if (!img) return;
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    const span = img.closest('.galerie-item')?.querySelector('.galerie-overlay span');
    lbCap.textContent = span ? span.textContent : '';
    lbPrev.style.opacity = i === 0 ? '0.3' : '1';
    lbNext.style.opacity = i === items.length - 1 ? '0.3' : '1';
    idx = i;
  }

  function open(img) {
    items = getVisibleImgs();
    show(items.indexOf(img));
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.getElementById('galerie-grid')?.addEventListener('click', e => {
    const item = e.target.closest('.galerie-item');
    if (item) {
      const img = item.querySelector('img');
      if (img) open(img);
    }
  });

  lbClose.addEventListener('click', close);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  lbPrev.addEventListener('click', () => { if (idx > 0) show(idx - 1); });
  lbNext.addEventListener('click', () => { if (idx < items.length - 1) show(idx + 1); });

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft')   { if (idx > 0) show(idx - 1); }
    if (e.key === 'ArrowRight')  { if (idx < items.length - 1) show(idx + 1); }
  });
})();

// ---- GALERIE FILTER ----
(function initGalerieFilter() {
  const btns = document.querySelectorAll('.filter-btn');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      document.querySelectorAll('#galerie-grid .galerie-item').forEach(item => {
        const kat = item.dataset.kategorie;
        const sichtbar = filter === 'alle' || kat === filter;
        item.style.display = sichtbar ? '' : 'none';
        // Scroll-Animation-Styles zurücksetzen, damit eingeblendete Bilder sichtbar bleiben
        if (sichtbar) {
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        }
      });
    });
  });
})();

// ---- SCROLL-ANIMATIONEN ----
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.leistung-card, .galerie-item, .testimonial-card, .intro-item, .stat-card').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = `opacity 0.55s ease ${i * 0.07}s, transform 0.55s ease ${i * 0.07}s`;
    observer.observe(el);
  });
}
