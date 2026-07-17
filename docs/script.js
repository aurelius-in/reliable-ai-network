// RAIN Monetize landing page interactions

// App URL: all CTAs point at the deployed app. Update APP_URL after Vercel deploy
// or set data-app-url on <body> to override.
const APP_URL = document.body.dataset.appUrl || 'https://rain-monetize.vercel.app';

document.querySelectorAll('[data-app-link]').forEach((el) => {
  el.setAttribute('href', APP_URL + el.dataset.appLink);
});

// Sticky nav background on scroll
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile menu
const burger = document.getElementById('navBurger');
const mobileMenu = document.getElementById('navMobile');
burger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
mobileMenu.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => mobileMenu.classList.remove('open'))
);

// Scroll-reveal animations
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// Animated stat counters
const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 1200;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countObserver.unobserve(el);
    });
  },
  { threshold: 0.6 }
);
document.querySelectorAll('[data-count]').forEach((el) => countObserver.observe(el));

// Animate dashboard preview bars when visible
const previewWindow = document.querySelector('.preview-window');
if (previewWindow) {
  const previewObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          previewWindow.classList.add('in-view');
          previewObserver.unobserve(previewWindow);
        }
      });
    },
    { threshold: 0.3 }
  );
  previewObserver.observe(previewWindow);
}

// Project Gallery link points at the current live gallery. When Pages is
// switched to serve /docs, copy the gallery pages into /docs and update this.
const galleryLink = document.getElementById('galleryLink');
if (galleryLink) {
  galleryLink.href = 'https://reliableainetwork.com/project-gallery.html';
}
