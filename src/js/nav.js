/**
 * PrintForge AI — Navigation Module
 * Handles: navbar scroll state, progress bar, mobile menu,
 *          active link highlighting, smooth scroll
 */

export function initNav() {
  const navbar       = document.getElementById('navbar');
  const progress     = document.getElementById('nav-progress');
  const hamburger    = document.getElementById('hamburger-btn');
  const mobileMenu   = document.getElementById('mobile-menu');
  const mobileOverlay = document.getElementById('mobile-overlay');
  const mobileClose  = document.getElementById('mobile-close-btn');
  const mobileLinks  = document.querySelectorAll('[data-mobile-link]');
  const navLinks     = document.querySelectorAll('.nav-link');

  // ── Scroll Progress & Navbar state ──────────────────
  function onScroll() {
    const scrollY    = window.scrollY;
    const maxScroll  = document.body.scrollHeight - window.innerHeight;
    const pct        = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;

    // Progress bar
    if (progress) progress.style.width = pct + '%';

    // Navbar glass effect
    if (scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active link detection
    highlightActiveLink();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // initial call

  // ── Active Link Highlighting ─────────────────────────
  function highlightActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    let currentId = '';

    sections.forEach(section => {
      const top = section.getBoundingClientRect().top;
      if (top <= 100) currentId = section.id;
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href')?.replace('#', '');
      link.classList.toggle('active', href === currentId);
    });
  }

  // ── Mobile Menu Toggle ───────────────────────────────
  function openMenu() {
    mobileMenu.classList.add('active');
    mobileOverlay.classList.add('active');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Stagger in menu items
    staggerMenuItems(true);
  }

  function closeMenu() {
    mobileMenu.classList.remove('active');
    mobileOverlay.classList.remove('active');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function staggerMenuItems(isOpen) {
    const items = document.querySelectorAll('.mobile-nav-item');
    items.forEach((item, i) => {
      item.style.transitionDelay = isOpen ? `${i * 50 + 80}ms` : '0ms';
      item.style.opacity = isOpen ? '1' : '0';
      item.style.transform = isOpen ? 'translateX(0)' : 'translateX(20px)';
    });
  }

  // Init hidden state for stagger
  document.querySelectorAll('.mobile-nav-item').forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(20px)';
    item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  });

  hamburger?.addEventListener('click', () => {
    mobileMenu.classList.contains('active') ? closeMenu() : openMenu();
  });

  mobileClose?.addEventListener('click', closeMenu);
  mobileOverlay?.addEventListener('click', closeMenu);

  // Close on link click
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
      closeMenu();
      hamburger.focus();
    }
  });

  // ── Smooth Scroll (all #href links) ─────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navH = navbar?.offsetHeight ?? 72;
      const targetPos = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top: targetPos, behavior: 'smooth' });
    });
  });

  // ── CTA Buttons → Toast ──────────────────────────────
  const ctaBtns = document.querySelectorAll('#nav-cta, #mobile-cta, #btn-explore');
  ctaBtns.forEach(btn => {
    btn.addEventListener('click', () => showToast('🚀 Yakında açılıyor — şu an geliştirme aşamasında!'));
  });

  const aiBtns = document.querySelectorAll('#btn-ai');
  aiBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('#ai')?.scrollIntoView({ behavior: 'smooth' });
      showToast('🤖 AI Asistan yakında aktif olacak!');
    });
  });
}

// ── Toast Notification ──────────────────────────────────
export function showToast(msg, duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('out');
    setTimeout(() => toast.remove(), 350);
  }, duration);
}
