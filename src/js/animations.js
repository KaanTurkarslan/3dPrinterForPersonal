/**
 * PrintForge AI — Animations Module
 * GSAP ScrollTrigger + Intersection Observer reveals
 * Cursor glow + card tilt + AI bubble rotation
 */

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initAnimations() {
  heroEntrance();
  heroParallax();
  featureCardAnimations();
  scrollReveal();
  cursorGlow();
  aiBubbleMessages();
}

// ══════════════════════════════════════════════════
// HERO ENTRANCE
// ══════════════════════════════════════════════════
function heroEntrance() {
  const tl = gsap.timeline({ delay: 0.15 });

  gsap.set('#hero-badge',    { opacity: 0, y: 22 });
  gsap.set('#hero-title',    { opacity: 0, y: 35 });
  gsap.set('#hero-subtitle', { opacity: 0, y: 28 });
  gsap.set('#hero-stats',    { opacity: 0, y: 20 });
  gsap.set('#hero-cta',      { opacity: 0, y: 20 });
  gsap.set('#hero-trust',    { opacity: 0, y: 16 });
  gsap.set('#hero-right',    { opacity: 0, x: 44 });
  gsap.set('#scroll-indicator', { opacity: 0 });

  tl
    .to('#hero-badge',    { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0)
    .to('#hero-title',    { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0.18)
    .to('#hero-subtitle', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.36)
    .to('#hero-stats',    { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.50)
    .to('#hero-cta',      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.60)
    .to('#hero-trust',    { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.70)
    .to('#hero-right',    { opacity: 1, x: 0,  duration: 1.0, ease: 'power3.out' }, 0.35)
    .to('#scroll-indicator', { opacity: 1, duration: 0.7 }, 1.1);
}

// ══════════════════════════════════════════════════
// HERO PARALLAX
// ══════════════════════════════════════════════════
function heroParallax() {
  gsap.to('#hero-left', {
    y: -55,
    opacity: 0.25,
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.4,
    },
  });

  gsap.to('#hero-right', {
    y: -35,
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 2,
    },
  });

  gsap.to('#hero-canvas', {
    y: 80,
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 0.9,
    },
  });
}

// ══════════════════════════════════════════════════
// FEATURE CARDS — Staggered reveal + 3D tilt
// ══════════════════════════════════════════════════
function featureCardAnimations() {
  // Scroll reveal (already handled by IntersectionObserver but add GSAP for stagger)
  ScrollTrigger.create({
    trigger: '.features-grid',
    start: 'top 80%',
    once: true,
    onEnter: () => {
      gsap.fromTo('.feature-card',
        { opacity: 0, y: 48, scale: 0.94 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.75,
          ease: 'power3.out',
          stagger: { each: 0.10, from: 'start' },
        }
      );
    },
  });

  ScrollTrigger.create({
    trigger: '.process-grid',
    start: 'top 80%',
    once: true,
    onEnter: () => {
      gsap.fromTo('.process-step',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.15 }
      );
    },
  });

  // 3D Tilt on feature cards
  document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const rx = ((e.clientY - rect.top)  / rect.height - 0.5) * -12;
      const ry = ((e.clientX - rect.left) / rect.width  - 0.5) * 12;
      gsap.to(card, { rotateX: rx, rotateY: ry, transformPerspective: 700, duration: 0.25, ease: 'power2.out' });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.5, ease: 'power3.out' });
    });
  });

  // Button micro-interactions
  document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
    btn.addEventListener('mouseenter', () => gsap.to(btn, { scale: 1.04, duration: 0.18, ease: 'power2.out' }));
    btn.addEventListener('mouseleave', () => gsap.to(btn, { scale: 1.00, duration: 0.22, ease: 'power2.out' }));
    btn.addEventListener('mousedown',  () => gsap.to(btn, { scale: 0.96, duration: 0.10 }));
    btn.addEventListener('mouseup',    () => gsap.to(btn, { scale: 1.04, duration: 0.12 }));
  });
}

// ══════════════════════════════════════════════════
// SCROLL REVEAL — Intersection Observer
// ══════════════════════════════════════════════════
function scrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ══════════════════════════════════════════════════
// CURSOR GLOW (desktop only)
// ══════════════════════════════════════════════════
function cursorGlow() {
  if (window.innerWidth <= 768) return;

  const glow = document.createElement('div');
  glow.id = 'cursor-glow';
  document.body.appendChild(glow);

  let mouseX = 0, mouseY = 0;
  let glowX  = 0, glowY  = 0;

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  // Smooth glow follow via rAF
  function followCursor() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    glow.style.left = glowX + 'px';
    glow.style.top  = glowY + 'px';
    requestAnimationFrame(followCursor);
  }
  followCursor();

  document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { glow.style.opacity = '1'; });
}

// ══════════════════════════════════════════════════
// AI BUBBLE ROTATING MESSAGES
// ══════════════════════════════════════════════════
function aiBubbleMessages() {
  const msgEl = document.getElementById('ai-bubble-msg');
  if (!msgEl) return;

  const messages = [
    'PLA+ ile optimal sonuç alırsınız. <em style="color:#00E5FF;font-style:normal;">%20 infill</em> dayanım için yeterli. 🎯',
    'Bu model için <em style="color:#00E5FF;font-style:normal;">PETG</em> öneririm. Isı direnci mükemmel! 🔥',
    '<em style="color:#00E5FF;font-style:normal;">Layer height</em> 0.2mm bu geometri için ideal seçim. ✅',
    'Destek yapısı kaldırıldığında <em style="color:#00E5FF;font-style:normal;">~%28</em> ağırlık azalır. 💡',
    '<em style="color:#00E5FF;font-style:normal;">Gyroid infill</em> ile hem hafiflik hem sağlamlık! ⚡',
  ];

  let idx = 0;

  setInterval(() => {
    idx = (idx + 1) % messages.length;
    gsap.to(msgEl, {
      opacity: 0,
      y: -6,
      duration: 0.28,
      ease: 'power2.in',
      onComplete: () => {
        msgEl.innerHTML = messages[idx];
        gsap.to(msgEl, { opacity: 1, y: 0, duration: 0.32, ease: 'power2.out' });
      },
    });
  }, 4200);
}
