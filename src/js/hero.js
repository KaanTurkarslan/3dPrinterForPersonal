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
  camera.position.set(0, 0, 5.2);

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
  scene.add(new THREE.AmbientLight(0x0a1128, 1.4));

  const cLight = new THREE.PointLight(0x00E5FF, 3.5, 20);
  cLight.position.set(3, 4, 3);
  scene.add(cLight);

  const vLight = new THREE.PointLight(0x7B2FFF, 2.8, 20);
  vLight.position.set(-3, -2, 2);
  scene.add(vLight);

  // ── Materials ──
  const bodyMat = new THREE.MeshPhongMaterial({
    color: 0x0E1424,
    emissive: 0x050812,
    specular: 0x7BAAF7,
    shininess: 120,
  });

  const accentMat = new THREE.MeshPhongMaterial({
    color: 0x00E5FF,
    emissive: 0x005566,
    specular: 0xffffff,
    shininess: 200,
    transparent: true,
    opacity: 0.85,
  });

  // ── Group ──
  const group = new THREE.Group();
  const props = [];

  // Center plate (chassis)
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.14, 8), bodyMat);
  group.add(plate);

  // Arm bars (X layout)
  [0, Math.PI/2].forEach(a => {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.08, 0.12), bodyMat);
    beam.rotation.y = a;
    group.add(beam);
  });

  // Motor Pods and Propellers
  const corners = [[0.9, 0.9], [-0.9, 0.9], [0.9, -0.9], [-0.9, -0.9]];
  corners.forEach(([x, z]) => {
    // Pod
    const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.22, 12), bodyMat);
    pod.position.set(x, 0.06, z);
    group.add(pod);

    // Propeller Group (so we can rotate it locally)
    const propGroup = new THREE.Group();
    propGroup.position.set(x, 0.18, z);

    // Torus blade outline (disc)
    const propDisc = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.015, 4, 24), accentMat);
    propDisc.rotation.x = Math.PI/2;
    propGroup.add(propDisc);

    // Blade lines
    const blade1 = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.01, 0.04), accentMat);
    const blade2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.01, 0.52), accentMat);
    propGroup.add(blade1);
    propGroup.add(blade2);

    group.add(propGroup);
    props.push(propGroup);
  });

  // Camera pod
  const cam = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.24, 0.22), bodyMat);
  cam.position.set(0, 0.05, -0.5);
  group.add(cam);

  // Camera lens (accent color)
  const lens = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), accentMat);
  lens.position.set(0, 0.05, -0.62);
  group.add(lens);

  group.scale.setScalar(0.9);
  scene.add(group);

  // Wireframe toggle
  let showWire = false;
  document.getElementById('viewer-wireframe')?.addEventListener('click', () => {
    showWire = !showWire;
    group.traverse(child => {
      if (child.isMesh && child.material) {
        child.material.wireframe = showWire;
      }
    });
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
      group.rotation.x = Math.sin(t * 0.38) * 0.12;
      group.position.y = Math.sin(t * 1.5) * 0.08; // Subtle hovering bobbing animation
    } else {
      group.rotation.y += velY;
      group.rotation.x += velX;
      group.position.y += (0 - group.position.y) * 0.1; // return to center
    }
    velX *= 0.88; velY *= 0.88;

    // Spin propellers
    props.forEach((prop, i) => {
      prop.rotation.y += (i % 2 === 0 ? 0.28 : -0.28);
    });

    cLight.intensity = 3.5 + Math.sin(t * 1.4) * 0.5;

    renderer.render(scene, camera);
  }
  animate();

  // Cleanup
  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(rafId);
    renderer.dispose();
  });
}
