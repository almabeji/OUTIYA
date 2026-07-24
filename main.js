/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║  أوطية آية — Ouytia EYA  ·  main.js  v5 (corrigé)         ║
 * ║                                                             ║
 * ║  Corrections vs v4 :                                        ║
 * ║  • Suppression des DEUX définitions dupliquées de            ║
 * ║    openEnvelope() / skipEnvelope() qui référençaient des     ║
 * ║    variables jamais déclarées (envScreen, envOpening,        ║
 * ║    envelope, envelopeSection) → ReferenceError au clic.      ║
 * ║  • openEnvelope / skipEnvelope exposées sur window, car       ║
 * ║    appelées depuis des attributs onclick="" dans le HTML.    ║
 * ║  • initImageFade() est maintenant appelée dès le chargement  ║
 * ║    (pas seulement après ouverture) → corrige l'image de       ║
 * ║    l'enveloppe invisible (opacity:0 tant que .img-loaded       ║
 * ║    n'est pas ajoutée).                                        ║
 * ║  • showMain() n'appelle plus openEnvelope()/skipEnvelope() :  ║
 * ║    c'était une boucle logique qui cassait tout le reste de    ║
 * ║    l'initialisation (countdown, particules, reveals...).      ║
 * ╚══════════════════════════════════════════════════════════╝
 */

'use strict';

const WeddingSite = (() => {

  const mainSite    = document.getElementById('main-site');
  const envScreen    = document.getElementById('envelope-screen');
  const envImgClosed = document.getElementById('env-img-closed');

  let envelopeOpened = false;

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ═══════════════════════════════════════════════════════
     OUVERTURE DE L'ENVELOPPE
  ═══════════════════════════════════════════════════════ */

  function openEnvelope() {
    if (envelopeOpened || !envScreen) return;
    envelopeOpened = true;

    if (prefersReducedMotion()) {
      envScreen.style.display = 'none';
      showMain();
      return;
    }

    envScreen.style.transition = 'opacity 0.6s ease';
    envScreen.style.opacity = '0';

    window.setTimeout(() => {
      envScreen.style.display = 'none';
      showMain();
    }, 600);
  }

  function skipEnvelope() {
    if (envelopeOpened || !envScreen) return;
    envelopeOpened = true;
    envScreen.style.display = 'none';
    showMain();
  }

  function showMain() {
    if (!mainSite) return;

    mainSite.style.display = 'block';
    mainSite.setAttribute('aria-hidden', 'false');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        mainSite.classList.add('visible');
      });
    });

    initVideo();
    initCountdown();
    initParticles();
    initReveal();
    initScrollProgress();
    initSmoothScroll();
  }


  /* ═══════════════════════════════════════════════════════
     VIDÉO HÉRO
  ═══════════════════════════════════════════════════════ */

  function initVideo() {
    const video = document.querySelector('.hero-video');
    if (!video) return;

    video.muted = true;
    video.playsInline = true;

    const promise = video.play();
    if (promise !== undefined) {
      promise.catch(() => {
        video.style.display = 'none';
      });
    }
  }


  /* ═══════════════════════════════════════════════════════
     COMPTE À REBOURS
  ═══════════════════════════════════════════════════════ */

  function initCountdown() {
    // Vendredi 14 août 2026, 21h00, heure de Tunis (UTC+1)
    const TARGET = new Date('2026-08-14T21:00:00+01:00').getTime();

    const elDays  = document.getElementById('cd-days');
    const elHours = document.getElementById('cd-hours');
    const elMins  = document.getElementById('cd-mins');
    const elSecs  = document.getElementById('cd-secs');

    if (!elDays) return;

    function setNum(el, val, padLen) {
      const str = String(val).padStart(padLen, '0');
      if (el.textContent !== str) {
        el.textContent = str;
        el.classList.remove('bump');
        void el.offsetWidth;
        el.classList.add('bump');
      }
    }

    let intervalId;

    function tick() {
      const diff = TARGET - Date.now();

      if (diff <= 0) {
        elDays.textContent  = '000';
        elHours.textContent = '00';
        elMins.textContent  = '00';
        elSecs.textContent  = '00';
        clearInterval(intervalId);
        return;
      }

      const d = Math.floor(diff / 86_400_000);
      const h = Math.floor((diff % 86_400_000) / 3_600_000);
      const m = Math.floor((diff % 3_600_000)  / 60_000);
      const s = Math.floor((diff % 60_000)     / 1_000);

      setNum(elDays,  d, 3);
      setNum(elHours, h, 2);
      setNum(elMins,  m, 2);
      setNum(elSecs,  s, 2);
    }

    tick();
    intervalId = setInterval(tick, 1000);
  }


  /* ═══════════════════════════════════════════════════════
     PARTICULES
  ═══════════════════════════════════════════════════════ */

  function initParticles() {
    const container = document.getElementById('particles');
    if (!container || prefersReducedMotion()) return;

    const count = window.innerWidth < 520 ? 14 : 24;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const p    = document.createElement('div');
      const size = (1.5 + Math.random() * 1.5).toFixed(1);

      p.className = 'particle';
      p.style.cssText = `
        left:    ${Math.random() * 100}%;
        top:     ${30 + Math.random() * 65}%;
        width:   ${size}px;
        height:  ${size}px;
        --dur:   ${6 + Math.random() * 9}s;
        --delay: ${Math.random() * 8}s;
        opacity: ${0.12 + Math.random() * 0.38};
      `;
      fragment.appendChild(p);
    }

    container.appendChild(fragment);
  }


  /* ═══════════════════════════════════════════════════════
     SCROLL REVEAL
  ═══════════════════════════════════════════════════════ */

  function initReveal() {
    const targets = document.querySelectorAll('.reveal, .tl-item');
    if (!targets.length) return;

    if (prefersReducedMotion()) {
      targets.forEach(el => el.classList.add('in'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach(el => observer.observe(el));
  }


  /* ═══════════════════════════════════════════════════════
     FONDU DES IMAGES (corrige l'image d'enveloppe invisible)
     Appelée dès DOMContentLoaded pour TOUTES les images visibles,
     pas seulement après l'ouverture — sinon l'enveloppe reste à
     opacity:0 et personne ne peut jamais cliquer dessus.
  ═══════════════════════════════════════════════════════ */

  function initImageFade() {
    document.querySelectorAll('img').forEach(img => {
      if (img.complete) {
        img.classList.add('img-loaded');
      } else {
        img.addEventListener('load', () => img.classList.add('img-loaded'), { once: true });
      }
    });
  }


  /* ═══════════════════════════════════════════════════════
     LISSAGE DU DÉFILEMENT (Lenis) + GSAP ScrollTrigger
  ═══════════════════════════════════════════════════════ */

  function initSmoothScroll() {
    if (prefersReducedMotion()) return;
    if (typeof Lenis === 'undefined') return;

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    document.documentElement.classList.add('lenis', 'lenis-smooth');

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);

      const heroVideo = document.querySelector('.hero-video');
      if (heroVideo) {
        gsap.to(heroVideo, {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: {
            trigger: '#hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
    }
  }


  /* ═══════════════════════════════════════════════════════
     BARRE DE PROGRESSION DE DÉFILEMENT
  ═══════════════════════════════════════════════════════ */

  function initScrollProgress() {
    if (document.getElementById('scroll-progress')) return;

    const bar = document.createElement('div');
    bar.id = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.prepend(bar);

    function updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
      const progress   = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width  = `${Math.min(progress, 100)}%`;
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }


  /* ═══════════════════════════════════════════════════════
     FAQ
  ═══════════════════════════════════════════════════════ */

  function toggleFaq(btn) {
    const answer = btn.nextElementSibling;
    const isOpen = btn.getAttribute('aria-expanded') === 'true';

    document.querySelectorAll('.faq-q[aria-expanded="true"]').forEach(q => {
      q.setAttribute('aria-expanded', 'false');
      q.nextElementSibling.style.maxHeight = null;
    });

    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  }


  /* ═══════════════════════════════════════════════════════
     CALENDRIER — téléchargement .ics
  ═══════════════════════════════════════════════════════ */

  function saveToCalendar() {
    const uid   = `outia-youssef-eya-2026-${Date.now()}@outia-eya.tn`;
    const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Outia Youssef & Eya 2026//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${stamp}`,
      'DTSTART:20260814T200000Z',
      'DTEND:20260814T230000Z',
      'SUMMARY:Outia & Aqd Qirane — يوسف و آية',
      'LOCATION:Salle des fêtes Aziza\\, Grombalia\\, Nabeul\\, Tunisie',
      'DESCRIPTION:بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ\\n' +
        "Cérémonie de l'Outia et d'Aqd Qirane · Youssef & Eya\\n" +
        'À partir de 21h00 — Salle Aziza\\, Grombalia',
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'outia-youssef-eya-2026.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }


  /* ═══════════════════════════════════════════════════════
     DÉLÉGATION D'ÉVÉNEMENTS — data-action
  ═══════════════════════════════════════════════════════ */

  function bindActions() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;

      switch (target.dataset.action) {
        case 'save-calendar':
          e.preventDefault();
          saveToCalendar();
          break;
        case 'toggle-faq':
          toggleFaq(target);
          break;
      }
    });
  }


  /* ═══════════════════════════════════════════════════════
     INIT
  ═══════════════════════════════════════════════════════ */

  function init() {
    bindActions();

    // Rend visibles toutes les images déjà présentes à l'écran
    // (dont l'enveloppe fermée), sans attendre le clic.
    initImageFade();

    if (mainSite) {
      mainSite.style.display = 'none';
    }

    // Préchargement discret d'assets non critiques
    const preload = (src) => { const img = new Image(); img.src = src; };
    preload('assets/images/AZiza.png');
  }

  return { init, openEnvelope, skipEnvelope };

})();

document.addEventListener('DOMContentLoaded', WeddingSite.init);

// Le HTML appelle openEnvelope()/skipEnvelope() via des attributs
// onclick="" inline, donc elles doivent exister dans le scope global.
window.openEnvelope = WeddingSite.openEnvelope;
window.skipEnvelope = WeddingSite.skipEnvelope;