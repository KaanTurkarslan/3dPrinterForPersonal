/**
 * PrintForge AI — Main Entry Point
 * Imports all modules and initializes the app
 */

import './css/main.css';
import { initHero }      from './js/hero.js';
import { initNav }       from './js/nav.js';
import { initAnimations } from './js/animations.js';

// Boot sequence
document.addEventListener('DOMContentLoaded', () => {
  initHero();
  initNav();
  initAnimations();
});
