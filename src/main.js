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

// Boot sequence
document.addEventListener('DOMContentLoaded', () => {
  initHero();
  initNav();
  initAnimations();
  initShop();
  initViewer();
  initAI();
});
