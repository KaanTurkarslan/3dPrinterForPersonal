/**
 * CustomShape3D — Main Entry Point
 * Imports all modules and initializes the app
 */

import './css/main.css';
import { initHero }       from './js/hero.js';
import { initNav }        from './js/nav.js';
import { initAnimations } from './js/animations.js';
import { initShop }       from './js/shop.js';
import { initAI }         from './js/ai.js';
import { initViewer }     from './js/viewer.js';
import { initAuth }       from './js/auth.js';
import { initCart }       from './js/cart.js';

// Force scroll to top on page load/refresh
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

window.addEventListener('load', () => {
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 30);
});

// Boot sequence
document.addEventListener('DOMContentLoaded', () => {
  initHero();
  initNav();
  initAnimations();
  initShop();
  initViewer();
  initAI();
  initAuth();
  initCart();
});
