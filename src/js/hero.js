/**
 * PrintForge AI — Hero Module
 * Three.js: Particle background + Mini 3D viewer
 */

import * as THREE from 'three';

export function initHero() {
  initParticleBackground();
  initMiniViewer();
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

// ══════════════════════════════════════════════════
// MINI 3D VIEWER
// ══════════════════════════════════════════════════
function initMiniViewer() {
  const canvas = document.getElementById('mini-viewer');
  if (!canvas) return;

  const scene    = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 5);

  function resize() {
    const p = canvas.parentElement;
    if (!p) return;
    renderer.setSize(p.offsetWidth, p.offsetHeight);
    camera.aspect = p.offsetWidth / p.offsetHeight;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // ── Lighting ──
  scene.add(new THREE.AmbientLight(0x001a33, 0.6));

  const cLight = new THREE.PointLight(0xEDEDED, 2.5, 18);
  cLight.position.set(3, 3, 3);
  scene.add(cLight);

  const vLight = new THREE.PointLight(0x7B2FFF, 1.8, 18);
  vLight.position.set(-3, -2, 2);
  scene.add(vLight);

  // ── Group ──
  const group = new THREE.Group();

  // Core body
  const bodyGeo = new THREE.OctahedronGeometry(1.1, 2);
  const bodyMat = new THREE.MeshPhongMaterial({
    color: 0x0a1628,
    emissive: 0x001833,
    specular: 0xEDEDED,
    shininess: 120,
    transparent: true,
    opacity: 0.92,
  });
  group.add(new THREE.Mesh(bodyGeo, bodyMat));

  // Wireframe shell
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xEDEDED,
    wireframe: true,
    transparent: true,
    opacity: 0.0,
  });
  const wireMesh = new THREE.Mesh(bodyGeo.clone(), wireMat);
  wireMesh.scale.setScalar(1.025);
  group.add(wireMesh);

  // Inner glow core
  const coreMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xEDEDED, transparent: true, opacity: 0.07 })
  );
  group.add(coreMesh);

  // Orbiting rings (3)
  const ringData = [
    { r: 1.55, rot: [Math.PI/3, 0, 0],          color: 0xEDEDED, opacity: 0.45 },
    { r: 1.75, rot: [Math.PI/5, Math.PI/4, 0],   color: 0x7B2FFF, opacity: 0.30 },
    { r: 1.95, rot: [Math.PI/2.5, -Math.PI/3, 0],color: 0x004466, opacity: 0.20 },
  ];
  const rings = [];
  ringData.forEach(d => {
    const mesh = new THREE.Mesh(
      new THREE.TorusGeometry(d.r, 0.013, 8, 80),
      new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: d.opacity, blending: THREE.AdditiveBlending })
    );
    mesh.rotation.set(...d.rot);
    group.add(mesh);
    rings.push(mesh);
  });

  // Orbiting dots (10)
  const dots = [];
  for (let i = 0; i < 10; i++) {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xEDEDED : 0xA1A1AA,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      })
    );
    const angle = (i / 10) * Math.PI * 2;
    dot.userData = { angle, speed: 0.25 + Math.random() * 0.35, radius: 1.65 + Math.random() * 0.3 };
    group.add(dot);
    dots.push(dot);
  }

  scene.add(group);

  let showWire = false;
  document.getElementById('viewer-wireframe')?.addEventListener('click', () => {
    showWire = !showWire;
    wireMesh.material.opacity = showWire ? 0.35 : 0.0;
    bodyMat.wireframe = showWire;
  });

  // ── Drag rotation ──
  let isDragging = false, prevX = 0, prevY = 0;
  let velX = 0, velY = 0;

  canvas.addEventListener('mousedown', e => {
    isDragging = true; prevX = e.clientX; prevY = e.clientY;
  });
  window.addEventListener('mouseup',   () => { isDragging = false; });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    velY = (e.clientX - prevX) * 0.006;
    velX = (e.clientY - prevY) * 0.006;
    prevX = e.clientX; prevY = e.clientY;
  });

  // Touch support
  canvas.addEventListener('touchstart', e => {
    isDragging = true;
    prevX = e.touches[0].clientX; prevY = e.touches[0].clientY;
  }, { passive: true });
  canvas.addEventListener('touchmove', e => {
    if (!isDragging) return;
    velY = (e.touches[0].clientX - prevX) * 0.006;
    velX = (e.touches[0].clientY - prevY) * 0.006;
    prevX = e.touches[0].clientX; prevY = e.touches[0].clientY;
  }, { passive: true });
  canvas.addEventListener('touchend', () => { isDragging = false; });

  // ── Render loop ──
  const clock = new THREE.Clock();
  let rafId;

  function animate() {
    rafId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    if (!isDragging) {
      group.rotation.y += 0.007;
      group.rotation.x = Math.sin(t * 0.38) * 0.18;
    } else {
      group.rotation.y += velY;
      group.rotation.x += velX;
    }
    velX *= 0.88; velY *= 0.88;

    // Animate dots
    dots.forEach(d => {
      d.userData.angle += d.userData.speed * 0.012;
      const a = d.userData.angle;
      d.position.set(
        Math.cos(a) * d.userData.radius,
        Math.sin(a * 0.7) * 0.55,
        Math.sin(a) * d.userData.radius
      );
    });

    // Pulse rings
    rings.forEach((r, i) => {
      r.material.opacity = ringData[i].opacity * (0.85 + Math.sin(t * 1.2 + i) * 0.15);
    });

    // Pulse core glow
    coreMesh.material.opacity = 0.05 + Math.sin(t * 2.2) * 0.04;
    cLight.intensity = 2.2 + Math.sin(t * 1.4) * 0.6;

    renderer.render(scene, camera);
  }
  animate();

  // Cleanup
  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(rafId);
    renderer.dispose();
  });
}
