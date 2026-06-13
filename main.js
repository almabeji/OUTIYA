/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║  أوطية آية — Ouytia EYA  ·  main.js  v2                ║
 * ║  Corrections :                                           ║
 * ║  • Video : play() déplacé dans showMain() — corrigé      ║
 * ║  • Envelope : timing revu, phases fluides                ║
 * ║  • Countdown : animation numBump sur changement          ║
 * ║  • Countdown : cible Vendredi 14 août 2026 confirmée     ║
 * ║  • Particles : variance de taille + GPU layer            ║
 * ║  • Reveal : IntersectionObserver optimisé                ║
 * ║  • FAQ : toggleFaq corrigé + aria-expanded               ║
 * ║  • Calendar : DTSTART timezone correcte (Tunis UTC+1)    ║
 * ║  • Scroll progress indicator ajouté                      ║
 * ╚══════════════════════════════════════════════════════════╝
 */

'use strict';

/* ═══════════════════════════════════════════════════════
   RÉFÉRENCES DOM
═══════════════════════════════════════════════════════ */

const envScreen = document.getElementById('envelope-screen');
const mainSite  = document.getElementById('main-site');

let envOpening = false;


/* ═══════════════════════════════════════════════════════
   ENVELOPPE
   CORRECTION : timing revu pour correspondre aux durées CSS v2
   Phase 1 → cross-fade 0.8s
   Phase 2 → zoom 1.4s
   Phase 3 → affichage site
═══════════════════════════════════════════════════════ */

function openEnvelope() {
  if (envOpening) return;
  envOpening = true;

  envScreen.style.transition = 'opacity 0.6s ease';
  envScreen.style.opacity = '0';

  setTimeout(() => {
    envScreen.style.display = 'none';
    mainSite.setAttribute('aria-hidden', 'false');
    showMain();
  }, 600);
}

function skipEnvelope() {
  if (envOpening) return;
  envOpening = true;
  envScreen.style.display = 'none';
  mainSite.setAttribute('aria-hidden', 'false');
  showMain();
}

function showMain() {
  mainSite.style.display = 'block';

  // Double rAF pour déclencher la transition CSS après display:block
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      mainSite.classList.add('visible');
    });
  });

  // CORRECTION : vidéo lancée ici, après que le DOM soit visible
  initVideo();
  initCountdown();
  initParticles();
  initReveal();
  initScrollProgress();
}


/* ═══════════════════════════════════════════════════════
   VIDÉO HÉRO
   CORRECTION : était dans DOMContentLoaded,
   donc avant showMain() → la vidéo ne se lançait jamais
   car l'élément était display:none
═══════════════════════════════════════════════════════ */

function initVideo() {
  const video = document.querySelector('.hero-video');
  if (!video) return;

  video.muted      = true;
  video.playsInline = true;

  const promise = video.play();
  if (promise !== undefined) {
    promise.catch(() => {
      // Autoplay bloqué par le navigateur → on masque la vidéo,
      // le fond CSS de secours prend le relais
      video.style.display = 'none';
    });
  }
}


/* ═══════════════════════════════════════════════════════
   COMPTE À REBOURS
   CORRECTION : date confirmée Vendredi 14 août 2026, 19h00
   Tunis = UTC+1 (heure d'été Tunisie)
   + animation numBump sur chaque changement de chiffre
═══════════════════════════════════════════════════════ */

function initCountdown() {
  // 14 août 2026, 19:00, heure de Tunis (UTC+1)
  const TARGET = new Date('2026-08-14T19:00:00+01:00').getTime();

  // Mémorise les valeurs précédentes pour déclencher l'animation
  const prev = { d: null, h: null, m: null, s: null };

  const elDays  = document.getElementById('cd-days');
  const elHours = document.getElementById('cd-hours');
  const elMins  = document.getElementById('cd-mins');
  const elSecs  = document.getElementById('cd-secs');

  if (!elDays) return;

  function setNum(el, val, padLen) {
    const str = String(val).padStart(padLen, '0');
    if (el.textContent !== str) {
      el.textContent = str;
      // Animation "bump" : retire puis remet la classe
      el.classList.remove('bump');
      // Force reflow
      void el.offsetWidth;
      el.classList.add('bump');
    }
  }

  function tick() {
    const diff = TARGET - Date.now();

    if (diff <= 0) {
      // Cérémonie passée
      elDays.textContent  = '000';
      elHours.textContent = '00';
      elMins.textContent  = '00';
      elSecs.textContent  = '00';
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
  setInterval(tick, 1000);
}


/* ═══════════════════════════════════════════════════════
   PARTICULES
   CORRECTION : tailles variées + translateZ(0) posé via CSS,
   ici on randomise la taille entre 1.5px et 3px
═══════════════════════════════════════════════════════ */

function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  // Nombre de particules adapté à la largeur d'écran
  const count = window.innerWidth < 520 ? 14 : 24;

  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const p   = document.createElement('div');
    const size = (1.5 + Math.random() * 1.5).toFixed(1); // 1.5–3px

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
   CORRECTION : threshold abaissé à 0.08 pour mobile
   (les sections hautes étaient parfois ratées)
═══════════════════════════════════════════════════════ */

function initReveal() {
  const targets = document.querySelectorAll('.reveal, .tl-item');
  if (!targets.length) return;

  // Respect de prefers-reduced-motion
  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReduced) {
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
   BARRE DE PROGRESSION DE DÉFILEMENT (nouveau)
   Petite barre dorée en haut de page
═══════════════════════════════════════════════════════ */

function initScrollProgress() {
  // Créer l'élément barre
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  bar.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    height: 2px;
    width: 0%;
    background: linear-gradient(to right, var(--gold), var(--accent-lt));
    z-index: 9998;
    transition: width 0.1s linear;
    pointer-events: none;
  `;
  document.body.prepend(bar);

  function updateProgress() {
    const scrollTop    = window.scrollY;
    const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
    const progress     = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width    = `${Math.min(progress, 100)}%`;
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}


/* ═══════════════════════════════════════════════════════
   FAQ
   CORRECTION : aria-expanded mis à jour + fermeture propre
═══════════════════════════════════════════════════════ */

function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  const isOpen = btn.classList.contains('open');

  // Fermer tous les items ouverts
  document.querySelectorAll('.faq-q.open').forEach(q => {
    q.classList.remove('open');
    q.setAttribute('aria-expanded', 'false');
    q.nextElementSibling.style.maxHeight = null;
  });

  // Ouvrir celui cliqué s'il était fermé
  if (!isOpen) {
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    answer.style.maxHeight = answer.scrollHeight + 'px';
  }
}


/* ═══════════════════════════════════════════════════════
   CALENDRIER — téléchargement .ics
   CORRECTION : DTSTART avec timezone explicite (Tunis = UTC+1)
   + ajout de UID unique et DTSTAMP
═══════════════════════════════════════════════════════ */

function saveToCalendar(e) {
  e.preventDefault();

  // UID unique basé sur le timestamp
  const uid  = `ouytia-aya-2026-${Date.now()}@ouytia-aya.tn`;
  const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ouytia Aya 2026//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    // CORRECTION : heure Tunis UTC+1 → 19:00 local = 18:00 UTC
    'DTSTART:20260814T180000Z',
    'DTEND:20260815T010000Z',
    'SUMMARY:Ouytia & Fiançailles — آية الباجي',
    'LOCATION:Salle des fêtes Aziza\\, Grombalia\\, Nabeul\\, Tunisie',
    'DESCRIPTION:بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ\\n' +
      "Cérémonie de l'Ouytia · Aya El Baji\\n" +
      'À partir de 19h00 — Salle Aziza\\, Grombalia',
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'ouytia-aya-2026.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


/* ═══════════════════════════════════════════════════════
   INIT AU CHARGEMENT DU DOM
   Note : initVideo() est désormais appelé dans showMain()
   On garde ici uniquement ce qui doit être prêt avant
   l'ouverture de l'enveloppe
═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // Pré-charger les images de l'enveloppe pour éviter le flash
  const preload = (src) => {
    const img = new Image();
    img.src   = src;
  };
  preload('assets/images/enveloppe_open.png');

});