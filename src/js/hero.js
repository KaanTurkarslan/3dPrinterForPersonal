/**
 * PrintForge AI — Hero Module
 * Three.js: Particle background + Mini 3D viewer
 */

import * as THREE from 'three';

export function initHero() {
  initParticleBackground();
}

// ══════════════════════════════════════════════════
// PARTICLE BACKGROUND
// ══════════════════════════════════════════════════
function initParticleBackground() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  camera.position.z = 28;

  // ── Particles ──
  const COUNT = window.innerWidth < 768 ? 1200 : 2800;
  const pos   = new Float32Array(COUNT * 3);
  const col   = new Float32Array(COUNT * 3);

  const cCyan   = new THREE.Color('#EDEDED');
  const cViolet = new THREE.Color('#A1A1AA');
  const cWhite  = new THREE.Color('#C8D8F0');

  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;
    pos[i3]     = (Math.random() - 0.5) * 110;
    pos[i3 + 1] = (Math.random() - 0.5) * 65;
    pos[i3 + 2] = (Math.random() - 0.5) * 50;

    const r = Math.random();
    const c = r < 0.4
      ? cCyan.clone().lerp(cWhite, Math.random() * 0.25)
      : r < 0.65
        ? cViolet.clone().lerp(cCyan, Math.random() * 0.4)
        : cWhite.clone();

    col[i3] = c.r; col[i3+1] = c.g; col[i3+2] = c.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.13,
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  // ── Grid lines ──
  const gridPositions = [];
  const gridColors    = [];
  const G = 7, S = 9;

  for (let x = -G; x <= G; x++) {
    for (let y = -3; y <= 3; y++) {
      // horizontal
      gridPositions.push(x*S, y*S*0.55, -18, (x+1)*S, y*S*0.55, -18);
      gridColors.push(0, 0.9, 1, 0, 0.9, 1);
      // vertical
      gridPositions.push(x*S, y*S*0.55, -18, x*S, (y+1)*S*0.55, -18);
      gridColors.push(0.48, 0.18, 1, 0.48, 0.18, 1);
    }
  }

  const gridGeo = new THREE.BufferGeometry();
  gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridPositions, 3));
  gridGeo.setAttribute('color',    new THREE.Float32BufferAttribute(gridColors, 3));

  const gridMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.055,
    blending: THREE.AdditiveBlending,
  });

  scene.add(new THREE.LineSegments(gridGeo, gridMat));

  // ── Mouse parallax ──
  let mx = 0, my = 0, tx = 0, ty = 0;
  window.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  // ── Render loop ──
  const clock = new THREE.Clock();
  let rafId;

  function animate() {
    rafId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    tx += (mx - tx) * 0.035;
    ty += (my - ty) * 0.035;

    particles.rotation.y = t * 0.025 + tx * 0.08;
    particles.rotation.x = ty * 0.04;
    mat.opacity = 0.48 + Math.sin(t * 0.45) * 0.07;

    renderer.render(scene, camera);
  }
  animate();

  // ── Resize ──
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Cleanup on page leave
  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(rafId);
    renderer.dispose();
  });
}

// Mini viewer 3D rendering has been replaced with a high-fidelity rendering image.
