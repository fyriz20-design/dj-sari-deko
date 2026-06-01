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
  hamburger.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      hamburger.classList.remove('open');
      document.body.style.overflow = '';
    });
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
