/**
 * CustomShape3D — Shop Module v3
 * 12 Products · Live Color Picker · Material & Quality Selectors · Detailed 3D Models
 */

import * as THREE from 'three';

// ══════════════════════════════════════════════════════
// MATERIALS DATABASE
// ══════════════════════════════════════════════════════
export const MATERIALS_DB = {
  pla:   { name: 'PLA+',   mult: 1.00, temp: '200°C', icon: '🌿', desc: 'Kolay baskı · Biyobozunur · İdeal başlangıç',       shine: 120 },
  petg:  { name: 'PETG',   mult: 1.30, temp: '235°C', icon: '💧', desc: 'Su geçirmez · Gıda güvenli · Yüksek dayanım',       shine: 160 },
  abs:   { name: 'ABS',    mult: 1.20, temp: '240°C', icon: '🔥', desc: 'Isı dayanımlı · Sağlam · Otomotiv uyumlu',          shine: 110 },
  tpu:   { name: 'TPU',    mult: 1.50, temp: '220°C', icon: '🤸', desc: 'Esnek lastik · Çarpmaya dayanıklı · Anti-slip',     shine:  70 },
  asa:   { name: 'ASA',    mult: 1.60, temp: '245°C', icon: '☀️', desc: 'UV dayanımlı · Dış mekan · Renk kalıcılığı',        shine: 130 },
  cf:    { name: 'CF-PLA', mult: 2.40, temp: '215°C', icon: '⚡', desc: 'Karbon fiber · Ultra hafif · Endüstriyel güç',      shine: 200 },
  resin: { name: 'Resin',  mult: 2.80, temp: 'UV',    icon: '💎', desc: 'Ultra yüksek detay · Pürüzsüz yüzey · Sanatsal',   shine: 280 },
};

const QUALITIES_DB = [
  { id: 'draft',    name: 'Taslak',   layer: '0.30mm', mult: 0.75, icon: '⚡' },
  { id: 'standard', name: 'Standart', layer: '0.20mm', mult: 1.00, icon: '✅' },
  { id: 'fine',     name: 'İnce',     layer: '0.10mm', mult: 1.55, icon: '🔬' },
  { id: 'ultra',    name: 'Ultra',    layer: '0.05mm', mult: 2.20, icon: '💎' },
];

// ══════════════════════════════════════════════════════
// PRODUCTS
// ══════════════════════════════════════════════════════
const PRODUCTS = [
  {
    id: 'drone-frame', name: 'Drone Gövdesi', subtitle: 'FPV Racing Frame v2.1',
    price: 280, category: 'mekanik', rating: 4.9, reviews: 128, dims: '124 × 90 × 45 mm',
    accentColor: '#00E5FF', badge: 'Çok Satan', badgeColor: '#00E5FF',
    availableMaterials: ['pla','petg','abs','cf'], defaultMaterial: 'cf', defaultQuality: 'fine',
    colors: [
      { name: 'Siyan', hex: '#00E5FF' }, { name: 'Kırmızı', hex: '#EF4444' },
      { name: 'Sarı',  hex: '#EAB308' }, { name: 'Gümüş',   hex: '#9CA3AF' },
      { name: 'Siyah', hex: '#1a1a2e' }, { name: 'Mor',     hex: '#7B2FFF' },
    ],
    buildFn: buildDroneFrame,
  },
  {
    id: 'wave-vase', name: 'Dalga Vazo', subtitle: 'Parametrik Wavy Design',
    price: 95, category: 'dekor', rating: 4.7, reviews: 64, dims: '80 × 80 × 180 mm',
    accentColor: '#34D399', badge: 'Yeni', badgeColor: '#34D399',
    availableMaterials: ['pla','petg','resin'], defaultMaterial: 'petg', defaultQuality: 'standard',
    colors: [
      { name: 'Zümrüt',  hex: '#34D399' }, { name: 'Safir',  hex: '#0EA5E9' },
      { name: 'Lavanta', hex: '#A78BFA' }, { name: 'Mercan', hex: '#F97316' },
      { name: 'Gül',     hex: '#F43F5E' }, { name: 'Krem',   hex: '#FEF3C7' },
    ],
    buildFn: buildWaveVase,
  },
  {
    id: 'gear-set', name: 'Dişli Mekanizma', subtitle: '3-Kademeli Güç Aktarımı',
    price: 165, category: 'mekanik', rating: 4.8, reviews: 93, dims: '120 × 100 × 28 mm',
    accentColor: '#FBBF24', badge: 'Pro', badgeColor: '#FBBF24',
    availableMaterials: ['pla','petg','abs','cf'], defaultMaterial: 'petg', defaultQuality: 'fine',
    colors: [
      { name: 'Altın',   hex: '#FBBF24' }, { name: 'Bakır',  hex: '#B45309' },
      { name: 'Gümüş',  hex: '#9CA3AF' }, { name: 'Siyah',  hex: '#1a1a1a' },
      { name: 'Kırmızı',hex: '#DC2626' }, { name: 'Zeytin', hex: '#65A30D' },
    ],
    buildFn: buildGearSet,
  },
  {
    id: 'phone-stand', name: 'Telefon / Tablet Standı', subtitle: 'Çok Açılı Ergonomik',
    price: 75, category: 'aksesuar', rating: 4.6, reviews: 210, dims: '90 × 70 × 110 mm',
    accentColor: '#7B2FFF', badge: 'Popüler', badgeColor: '#7B2FFF',
    availableMaterials: ['pla','petg','tpu','abs'], defaultMaterial: 'pla', defaultQuality: 'standard',
    colors: [
      { name: 'Mor',    hex: '#7B2FFF' }, { name: 'Siyah', hex: '#111827' },
      { name: 'Beyaz',  hex: '#F9FAFB' }, { name: 'Mavi',  hex: '#3B82F6' },
      { name: 'Pembe',  hex: '#EC4899' }, { name: 'Yeşil', hex: '#22C55E' },
    ],
    buildFn: buildPhoneStand,
  },
  {
    id: 'cable-organizer', name: 'Kablo Yönetim Rayı', subtitle: '8-Kanal Masaüstü Sistemi',
    price: 45, category: 'aksesuar', rating: 4.5, reviews: 183, dims: '200 × 30 × 22 mm',
    accentColor: '#F472B6', badge: 'Ekonomik', badgeColor: '#EC4899',
    availableMaterials: ['pla','petg','tpu'], defaultMaterial: 'tpu', defaultQuality: 'standard',
    colors: [
      { name: 'Pembe',   hex: '#F472B6' }, { name: 'Siyah',   hex: '#1F2937' },
      { name: 'Beyaz',   hex: '#F9FAFB' }, { name: 'Gri',     hex: '#6B7280' },
      { name: 'Turuncu', hex: '#F97316' }, { name: 'Mavi',    hex: '#3B82F6' },
    ],
    buildFn: buildCableOrganizer,
  },
  {
    id: 'mini-house', name: 'Mimari Maket Ev', subtitle: 'Detaylı Çok Katmanlı',
    price: 320, category: 'dekor', rating: 4.9, reviews: 47, dims: '100 × 90 × 120 mm',
    accentColor: '#FB923C', badge: 'Özel', badgeColor: '#F97316',
    availableMaterials: ['pla','resin'], defaultMaterial: 'resin', defaultQuality: 'ultra',
    colors: [
      { name: 'Turuncu',  hex: '#FB923C' }, { name: 'Bej',   hex: '#D4B896' },
      { name: 'Beyaz',   hex: '#F9FAFB' }, { name: 'Gri',   hex: '#6B7280' },
      { name: 'Terracota',hex: '#B45309' }, { name: 'Gece', hex: '#1e293b' },
    ],
    buildFn: buildMiniHouse,
  },
  {
    id: 'robot-joint', name: 'Robot Eklem Parçası', subtitle: 'Servo Uyumlu Döner Mafsal',
    price: 195, category: 'mekanik', rating: 4.8, reviews: 56, dims: '55 × 55 × 80 mm',
    accentColor: '#10B981', badge: 'Teknik', badgeColor: '#10B981',
    availableMaterials: ['petg','abs','cf'], defaultMaterial: 'abs', defaultQuality: 'fine',
    colors: [
      { name: 'Yeşil', hex: '#10B981' }, { name: 'Siyah', hex: '#111827' },
      { name: 'Gri',   hex: '#6B7280' }, { name: 'Mavi',  hex: '#3B82F6' },
      { name: 'Sarı',  hex: '#EAB308' }, { name: 'Mor',   hex: '#8B5CF6' },
    ],
    buildFn: buildRobotJoint,
  },
  {
    id: 'headphone-stand', name: 'Kulaklık Standı', subtitle: 'Minimalist Arc Tasarımı',
    price: 120, category: 'aksesuar', rating: 4.7, reviews: 88, dims: '120 × 80 × 200 mm',
    accentColor: '#8B5CF6', badge: 'Şık', badgeColor: '#8B5CF6',
    availableMaterials: ['pla','petg','abs'], defaultMaterial: 'pla', defaultQuality: 'standard',
    colors: [
      { name: 'Mor',    hex: '#8B5CF6' }, { name: 'Siyah', hex: '#111827' },
      { name: 'Beyaz',  hex: '#F9FAFB' }, { name: 'Gri',   hex: '#4B5563' },
      { name: 'Altın',  hex: '#D97706' }, { name: 'Gök',   hex: '#0EA5E9' },
    ],
    buildFn: buildHeadphoneStand,
  },
  {
    id: 'planter', name: 'Geometrik Saksı', subtitle: 'Altıgen Bitki Evi',
    price: 85, category: 'dekor', rating: 4.6, reviews: 72, dims: '100 × 100 × 120 mm',
    accentColor: '#22C55E', badge: 'Doğal', badgeColor: '#16A34A',
    availableMaterials: ['pla','petg','resin'], defaultMaterial: 'petg', defaultQuality: 'standard',
    colors: [
      { name: 'Yeşil',  hex: '#22C55E' }, { name: 'Toprak', hex: '#92400E' },
      { name: 'Krem',   hex: '#FEF3C7' }, { name: 'Gri',    hex: '#6B7280' },
      { name: 'Beyaz',  hex: '#F9FAFB' }, { name: 'Lacivert',hex: '#1E3A8A' },
    ],
    buildFn: buildPlanter,
  },
  {
    id: 'fidget-spinner', name: 'Fidget Spinner Pro', subtitle: 'Precision Bearing Destekli',
    price: 55, category: 'aksesuar', rating: 4.4, reviews: 231, dims: '75 × 75 × 15 mm',
    accentColor: '#06B6D4', badge: 'Eğlenceli', badgeColor: '#0891B2',
    availableMaterials: ['pla','petg','abs'], defaultMaterial: 'pla', defaultQuality: 'fine',
    colors: [
      { name: 'Cyan',    hex: '#06B6D4' }, { name: 'Kırmızı', hex: '#EF4444' },
      { name: 'Mor',     hex: '#8B5CF6' }, { name: 'Siyah',   hex: '#111827' },
      { name: 'Turuncu', hex: '#F59E0B' }, { name: 'Yeşil',   hex: '#22C55E' },
    ],
    buildFn: buildFidgetSpinner,
  },
  {
    id: 'gopro-mount', name: 'Aksiyon Kamera Montaj', subtitle: 'GoPro & DJI Uyumlu',
    price: 140, category: 'aksesuar', rating: 4.7, reviews: 103, dims: '80 × 60 × 90 mm',
    accentColor: '#3B82F6', badge: 'Uyumlu', badgeColor: '#2563EB',
    availableMaterials: ['pla','petg','abs','cf'], defaultMaterial: 'abs', defaultQuality: 'fine',
    colors: [
      { name: 'Mavi',    hex: '#3B82F6' }, { name: 'Siyah',   hex: '#111827' },
      { name: 'Turuncu', hex: '#F97316' }, { name: 'Beyaz',   hex: '#F9FAFB' },
      { name: 'Karbon',  hex: '#374151' }, { name: 'Yeşil',   hex: '#16A34A' },
    ],
    buildFn: buildGoProMount,
  },
  {
    id: 'hex-storage', name: 'Altıgen Saklama Kutusu', subtitle: 'Modüler Depolama Sistemi',
    price: 70, category: 'aksesuar', rating: 4.5, reviews: 149, dims: '80 × 92 × 60 mm',
    accentColor: '#A78BFA', badge: 'Modüler', badgeColor: '#7C3AED',
    availableMaterials: ['pla','petg','abs'], defaultMaterial: 'pla', defaultQuality: 'standard',
    colors: [
      { name: 'Lavanta', hex: '#A78BFA' }, { name: 'Gece Mavisi', hex: '#1E3A8A' },
      { name: 'Siyah',   hex: '#111827' }, { name: 'Kırmızı',    hex: '#EF4444' },
      { name: 'Sarı',    hex: '#FCD34D' }, { name: 'Şeffaf',     hex: '#DBEAFE' },
    ],
    buildFn: buildHexStorage,
  },
];

// Per-card state (color, material, quality, refs)
const cardStates = new Map();

// ══════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════
export function initShop() {
  renderShopSection();
  initFilters();
  initCartBadge();
  initColorPickers();
  initMaterialQualitySelectors();
}

// ══════════════════════════════════════════════════════
// RENDER
// ══════════════════════════════════════════════════════
function renderShopSection() {
  const section = document.getElementById('shop');
  if (!section) return;

  section.innerHTML = `
    <div class="container">
      <div class="section-header reveal">
        <div class="section-pill" style="color:#00E5FF;border-color:rgba(0,229,255,0.2);background:rgba(0,229,255,0.05)">
          ${PRODUCTS.length}+ Hazır Model
        </div>
        <h2 class="section-title">3D Baskı <span class="gradient-text">Mağazası</span></h2>
        <p class="section-desc">Her model interaktif 3D önizleme, renk seçici ve canlı fiyat hesaplayıcı ile gelir.</p>
      </div>

      <div class="shop-filters" id="shop-filters">
        <button class="shop-filter-btn active" data-filter="all">Tümü <span class="filter-count">${PRODUCTS.length}</span></button>
        <button class="shop-filter-btn" data-filter="mekanik">⚙️ Mekanik <span class="filter-count">${PRODUCTS.filter(p=>p.category==='mekanik').length}</span></button>
        <button class="shop-filter-btn" data-filter="dekor">🏠 Dekor <span class="filter-count">${PRODUCTS.filter(p=>p.category==='dekor').length}</span></button>
        <button class="shop-filter-btn" data-filter="aksesuar">🎒 Aksesuar <span class="filter-count">${PRODUCTS.filter(p=>p.category==='aksesuar').length}</span></button>
        <div class="shop-filter-spacer"></div>
        <select class="shop-sort-select" id="shop-sort">
          <option value="default">Sırala</option>
          <option value="price-asc">Fiyat ↑</option>
          <option value="price-desc">Fiyat ↓</option>
          <option value="rating">En Yüksek Puan</option>
        </select>
      </div>

      <div class="shop-grid" id="shop-grid">
        ${PRODUCTS.map(p => renderProductCard(p)).join('')}
      </div>
    </div>
  `;

  PRODUCTS.forEach(p => {
    const canvas = document.getElementById(`canvas-${p.id}`);
    if (canvas) init3DCard(canvas, p);
  });

  document.querySelectorAll('.shop-add-btn').forEach(btn => {
    btn.addEventListener('click', e => { addToCart(btn.dataset.id, btn); e.stopPropagation(); });
  });
  document.querySelectorAll('.shop-wish-btn').forEach(btn => {
    btn.addEventListener('click', e => { btn.classList.toggle('active'); e.stopPropagation(); });
  });
  document.getElementById('shop-sort')?.addEventListener('change', e => sortProducts(e.target.value));
}

// ── Card HTML ─────────────────────────────────────────
function renderProductCard(p) {
  const stars = '★'.repeat(Math.floor(p.rating)) + (p.rating % 1 >= 0.5 ? '½' : '');
  const defMat = MATERIALS_DB[p.defaultMaterial];
  const defQ   = QUALITIES_DB.find(q => q.id === p.defaultQuality);
  const defPrice = Math.round(p.price * defMat.mult * defQ.mult);

  const matChips = p.availableMaterials.map(mid => {
    const m = MATERIALS_DB[mid];
    return `<button class="mat-chip ${mid===p.defaultMaterial?'active':''}" data-product="${p.id}" data-mat="${mid}" title="${m.desc}">
      <span class="mat-chip-icon">${m.icon}</span>${m.name}
    </button>`;
  }).join('');

  const qualChips = QUALITIES_DB.map(q => `
    <button class="qual-chip ${q.id===p.defaultQuality?'active':''}" data-product="${p.id}" data-qual="${q.id}" title="${q.id}">
      <span>${q.icon}</span><span>${q.name}</span><small>${q.layer}</small>
    </button>`).join('');

  const colorSwatches = p.colors.map((c, i) => `
    <button class="color-swatch ${i===0?'active':''}" data-product="${p.id}" data-hex="${c.hex}" data-name="${c.name}"
      style="background:${c.hex}" title="${c.name}" aria-label="${c.name}"></button>`).join('');

  return `
    <div class="shop-card reveal" data-category="${p.category}" data-id="${p.id}" id="card-${p.id}">
      <!-- 3D Viewer -->
      <div class="shop-card-viewer">
        <canvas id="canvas-${p.id}" class="shop-canvas"></canvas>
        <div class="shop-card-badge" style="background:${p.badgeColor}22;color:${p.badgeColor};border-color:${p.badgeColor}44">${p.badge}</div>
        <button class="shop-wish-btn" data-id="${p.id}" aria-label="Favorilere ekle">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
        </button>
        <div class="shop-drag-hint">↺ Döndür</div>
      </div>

      <!-- Color Picker -->
      <div class="shop-color-bar">
        <span class="shop-color-label" id="color-label-${p.id}">${p.colors[0].name}</span>
        <div class="shop-color-swatches">${colorSwatches}</div>
      </div>

      <!-- Body -->
      <div class="shop-card-body">
        <!-- Name + Price -->
        <div class="shop-card-meta">
          <div>
            <h3 class="shop-card-name">${p.name}</h3>
            <p class="shop-card-sub">${p.subtitle}</p>
          </div>
          <div>
            <div class="shop-card-price" id="price-${p.id}" style="color:${p.accentColor}">₺${defPrice}</div>
            <div class="shop-base-price" id="base-price-${p.id}" style="color:${p.accentColor}44">₺${p.price} baz</div>
          </div>
        </div>

        <!-- Rating + Dims -->
        <div class="shop-card-stats">
          <div class="shop-rating">
            <span class="shop-stars" style="color:${p.accentColor}">${stars}</span>
            <span class="shop-rating-val">${p.rating}</span>
            <span class="shop-rating-count">(${p.reviews})</span>
          </div>
          <div class="shop-dims">📐 ${p.dims}</div>
        </div>

        <!-- Material selector -->
        <div class="shop-section-label">🧪 Filament Malzeme</div>
        <div class="shop-mat-chips" id="mat-chips-${p.id}">${matChips}</div>

        <!-- Mat description -->
        <div class="shop-mat-desc" id="mat-desc-${p.id}">${defMat.desc}</div>

        <!-- Quality selector -->
        <div class="shop-section-label">🎯 Baskı Kalitesi</div>
        <div class="shop-qual-chips" id="qual-chips-${p.id}">${qualChips}</div>

        <!-- Price breakdown -->
        <div class="shop-price-breakdown" id="breakdown-${p.id}">
          <div class="breakdown-row">
            <span>Baz fiyat</span><span>₺${p.price}</span>
          </div>
          <div class="breakdown-row">
            <span>Malzeme (${defMat.name})</span><span>×${defMat.mult.toFixed(2)}</span>
          </div>
          <div class="breakdown-row">
            <span>Kalite (${defQ.name})</span><span>×${defQ.mult.toFixed(2)}</span>
          </div>
          <div class="breakdown-total">
            <span>Toplam</span><span id="breakdown-total-${p.id}" style="color:${p.accentColor}">₺${defPrice}</span>
          </div>
        </div>

        <!-- CTA -->
        <div class="shop-card-footer">
          <button class="shop-add-btn" data-id="${p.id}" style="--accent:${p.accentColor}">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            Sepete Ekle
          </button>
          <button class="shop-ai-btn" data-id="${p.id}" data-name="${p.name}" title="AI ile özelleştir">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

// ══════════════════════════════════════════════════════
// 3D CARD VIEWER
// ══════════════════════════════════════════════════════
function init3DCard(canvas, product) {
  const scene    = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0.6, 5.5);

  function resize() {
    const w = canvas.offsetWidth  || 280;
    const h = canvas.offsetHeight || 210;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(canvas.parentElement);

  // Lights
  scene.add(new THREE.AmbientLight(0x0a1628, 1.0));
  const col = new THREE.Color(product.colors[0].hex);

  const keyLight  = new THREE.PointLight(col, 4.0, 22);
  keyLight.position.set(3, 5, 4);
  scene.add(keyLight);

  const fillLight = new THREE.PointLight(0x7B2FFF, 1.8, 18);
  fillLight.position.set(-4, -2, 2);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
  rimLight.position.set(0, 8, -6);
  scene.add(rimLight);

  // Build model
  const group = new THREE.Group();
  product.buildFn(group, col);
  scene.add(group);

  // Floor grid
  const gridGeo = new THREE.PlaneGeometry(7, 7, 12, 12);
  const gridMat = new THREE.MeshBasicMaterial({ color: col, wireframe: true, transparent: true, opacity: 0.035 });
  const grid = new THREE.Mesh(gridGeo, gridMat);
  grid.rotation.x = -Math.PI / 2;
  grid.position.y = -1.8;
  scene.add(grid);

  // Store state
  const state = {
    group, keyLight, gridMat,
    colorable: group.userData.colorable || {},
    selectedMat: product.defaultMaterial,
    selectedQual: product.defaultQuality,
    basePrice: product.price,
    accentColor: product.accentColor,
  };
  cardStates.set(product.id, state);

  // Drag
  let isDragging = false, prevX = 0, prevY = 0, velX = 0, velY = 0;
  canvas.addEventListener('mousedown', e => { isDragging = true; prevX = e.clientX; prevY = e.clientY; canvas.style.cursor = 'grabbing'; });
  window.addEventListener('mouseup',   () => { isDragging = false; canvas.style.cursor = 'grab'; });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    velY = (e.clientX - prevX) * 0.009; velX = (e.clientY - prevY) * 0.009;
    prevX = e.clientX; prevY = e.clientY;
  });
  canvas.addEventListener('touchstart', e => { isDragging = true; prevX = e.touches[0].clientX; prevY = e.touches[0].clientY; }, { passive: true });
  canvas.addEventListener('touchmove',  e => {
    if (!isDragging) return;
    velY = (e.touches[0].clientX - prevX) * 0.009; velX = (e.touches[0].clientY - prevY) * 0.009;
    prevX = e.touches[0].clientX; prevY = e.touches[0].clientY;
  }, { passive: true });
  canvas.addEventListener('touchend', () => { isDragging = false; });
  canvas.style.cursor = 'grab';

  let hovered = false;
  canvas.closest('.shop-card')?.addEventListener('mouseenter', () => { hovered = true; });
  canvas.closest('.shop-card')?.addEventListener('mouseleave', () => { hovered = false; });

  // Loop
  const clock = new THREE.Clock();
  let rafId, active = false;

  new IntersectionObserver(entries => {
    entries.forEach(e => { active = e.isIntersecting; if (active && !rafId) loop(); });
  }, { threshold: 0.05 }).observe(canvas);

  function loop() {
    if (!active) { rafId = null; return; }
    rafId = requestAnimationFrame(loop);
    const t = clock.getElapsedTime();
    const spd = hovered ? 0.020 : 0.008;

    if (!isDragging) {
      group.rotation.y += spd;
      group.rotation.x = Math.sin(t * 0.35) * 0.10;
    } else {
      group.rotation.y += velY;
      group.rotation.x += velX;
    }
    velX *= 0.86; velY *= 0.86;
    keyLight.intensity = 3.5 + Math.sin(t * 2.0) * 0.55;
    renderer.render(scene, camera);
  }

  window.addEventListener('beforeunload', () => { cancelAnimationFrame(rafId); renderer.dispose(); });
}

// ── Color update ──────────────────────────────────────
function updateModelColor(productId, hexColor) {
  const state = cardStates.get(productId);
  if (!state) return;
  const c = new THREE.Color(hexColor);
  state.keyLight.color.set(c);
  state.gridMat.color.set(c);
  const { primaryMats = [], accentMats = [] } = state.colorable;
  primaryMats.forEach(m => {
    m.emissive.set(c);
    m.emissiveIntensity = 0.10;
    m.specular.set(c);
  });
  accentMats.forEach(m => m.color.set(c));
}

// ══════════════════════════════════════════════════════
// MODEL BUILDERS — Detailed
// ══════════════════════════════════════════════════════

function makePrimaryMat(col, shine = 140) {
  return new THREE.MeshPhongMaterial({
    color: 0x060c18, emissive: col, emissiveIntensity: 0.10,
    specular: col, shininess: shine,
  });
}
function makeAccentMat(col, opacity = 0.80) {
  return new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity });
}
function makeWireMat(col) {
  return new THREE.MeshBasicMaterial({ color: col, wireframe: true, transparent: true, opacity: 0.14 });
}

// 1 ── Drone Frame ─────────────────────────────────────
function buildDroneFrame(group, col) {
  const pm = makePrimaryMat(col, 150);
  const am = makeAccentMat(col, 0.85);
  const wm = makeWireMat(col);

  // Center plate (octagon feel via CylinderGeometry)
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.18, 8), pm);
  group.add(plate);

  // X-pattern cross beams
  [0, Math.PI/2].forEach(a => {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.14, 0.20), pm);
    beam.rotation.y = a;
    group.add(beam);
  });

  // Diagonal arms (4)
  [Math.PI/4, -Math.PI/4, Math.PI*3/4, -Math.PI*3/4].forEach(a => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.10, 0.15), pm);
    arm.rotation.y = a;
    group.add(arm);
  });

  // Motor pods + propellers
  const corners = [[1.1,1.1],[-1.1,1.1],[1.1,-1.1],[-1.1,-1.1]];
  corners.forEach(([x,z]) => {
    const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.20, 0.28, 16), pm);
    pod.position.set(x,0.08,z);
    group.add(pod);

    // Prop disc
    const prop = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.025, 6, 32), am);
    prop.position.set(x, 0.24, z);
    prop.rotation.x = Math.PI/2;
    group.add(prop);

    // Motor bell top
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.10, 12), pm);
    bell.position.set(x, 0.24, z);
    group.add(bell);
  });

  // FPV camera pod (front)
  const camBody = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.30, 0.28), pm);
  camBody.position.set(0, 0.05, -0.60);
  group.add(camBody);
  const lens = new THREE.Mesh(new THREE.SphereGeometry(0.10, 16, 16), new THREE.MeshPhongMaterial({
    color: 0x000a14, emissive: col, emissiveIntensity: 0.30, specular: col, shininess: 300
  }));
  lens.position.set(0, 0.05, -0.77);
  group.add(lens);

  // Battery tray (bottom)
  const batt = new THREE.Mesh(new THREE.BoxGeometry(0.80, 0.16, 0.55), pm);
  batt.position.set(0, -0.15, 0);
  group.add(batt);

  // Antenna (2)
  [-0.30, 0.30].forEach(x => {
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.60, 6), am);
    ant.position.set(x, 0.42, 0.30);
    group.add(ant);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), am);
    tip.position.set(x, 0.72, 0.30);
    group.add(tip);
  });

  // Landing gear (4)
  [[0.7,-0.7],[0.7,0.7],[-0.7,-0.7],[-0.7,0.7]].forEach(([x,z]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,0.40,6), pm);
    leg.position.set(x*0.8, -0.28, z*0.8);
    leg.rotation.z = (x > 0 ? 1 : -1) * 0.18;
    group.add(leg);
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,0.35,6), pm);
    foot.rotation.x = Math.PI/2;
    foot.position.set(x*0.8, -0.45, z*0.8 + (z > 0 ? 0.15 : -0.15));
    group.add(foot);
  });

  // LED strips on arms
  [[1.1,0],[0,-1.1],[-1.1,0],[0,1.1]].forEach(([x,z]) => {
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9 }));
    led.position.set(x * 0.85, 0.1, z * 0.85);
    group.add(led);
  });

  // Wireframe overlay on center
  group.add(new THREE.Mesh(new THREE.CylinderGeometry(0.67, 0.67, 0.20, 8), wm));

  group.userData.colorable = { primaryMats: [pm], accentMats: [am] };
  group.position.y = 0.15;
  group.scale.setScalar(0.78);
}

// 2 ── Wave Vase ──────────────────────────────────────
function buildWaveVase(group, col) {
  const points = [];
  for (let i = 0; i <= 60; i++) {
    const t  = i / 60;
    const y  = t * 3.6 - 1.8;
    const bulge = Math.sin(t * Math.PI);
    const wave  = Math.sin(t * Math.PI * 7) * 0.07 * bulge;
    const r     = 0.08 + bulge * 0.72 + wave;
    points.push(new THREE.Vector2(r, y));
  }

  const geo = new THREE.LatheGeometry(points, 48);
  const pm  = new THREE.MeshPhongMaterial({
    color: 0x030d0a, emissive: col, emissiveIntensity: 0.14,
    specular: col, shininess: 200, transparent: true, opacity: 0.94, side: THREE.DoubleSide,
  });
  const wm = new THREE.MeshBasicMaterial({ color: col, wireframe: true, transparent: true, opacity: 0.13 });

  group.add(new THREE.Mesh(geo, pm));
  const wireShell = new THREE.Mesh(geo.clone(), wm);
  wireShell.scale.setScalar(1.012);
  group.add(wireShell);

  // Foot ring
  const foot = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.025, 8, 32), makeAccentMat(col, 0.75));
  foot.position.y = -1.78;
  foot.rotation.x = Math.PI / 2;
  group.add(foot);

  // Rim ring
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.03, 8, 32), makeAccentMat(col, 0.80));
  rim.position.y = 1.8;
  rim.rotation.x = Math.PI / 2;
  group.add(rim);

  // Inner glow disc
  const glow = new THREE.Mesh(new THREE.CircleGeometry(0.07, 24), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.30 }));
  glow.position.y = 1.78;
  glow.rotation.x = -Math.PI / 2;
  group.add(glow);

  group.userData.colorable = { primaryMats: [pm], accentMats: [] };
  group.scale.setScalar(0.90);
}

// 3 ── Gear Set ────────────────────────────────────────
function buildGearSet(group, col) {
  function makeGear(teeth, r, thick) {
    const shape = new THREE.Shape();
    const th = r * 0.21;
    for (let i = 0; i < teeth; i++) {
      const a0 = (i / teeth) * Math.PI * 2;
      const a1 = ((i + 0.3) / teeth) * Math.PI * 2;
      const a2 = ((i + 0.7) / teeth) * Math.PI * 2;
      const a3 = ((i + 1.0) / teeth) * Math.PI * 2;
      if (i === 0) shape.moveTo(Math.cos(a0)*r, Math.sin(a0)*r);
      else shape.lineTo(Math.cos(a0)*r, Math.sin(a0)*r);
      shape.lineTo(Math.cos(a1)*(r+th), Math.sin(a1)*(r+th));
      shape.lineTo(Math.cos(a2)*(r+th), Math.sin(a2)*(r+th));
      shape.lineTo(Math.cos(a3)*r, Math.sin(a3)*r);
    }
    shape.closePath();
    const hole = new THREE.Path(); hole.absarc(0,0,r*0.28,0,Math.PI*2,true);
    shape.holes.push(hole);
    // Spokes (3 holes on large gear)
    if (r > 0.7) {
      [0, Math.PI*2/3, Math.PI*4/3].forEach(a => {
        const sp = new THREE.Path();
        sp.absarc(Math.cos(a)*r*0.55, Math.sin(a)*r*0.55, r*0.12, 0, Math.PI*2, true);
        shape.holes.push(sp);
      });
    }
    return new THREE.ExtrudeGeometry(shape, { depth: thick, bevelEnabled: false });
  }

  const pm = makePrimaryMat(col, 170);
  const am = makeAccentMat(col, 0.90);

  // Main gear (large)
  const g1 = new THREE.Mesh(makeGear(20, 0.95, 0.28), pm);
  g1.position.set(-0.5, 0, 0); g1.rotation.x = -Math.PI/2;
  group.add(g1);

  // Medium gear
  const g2 = new THREE.Mesh(makeGear(12, 0.58, 0.28), pm);
  g2.position.set(0.92, 0, 0); g2.rotation.x = -Math.PI/2;
  group.add(g2);

  // Small gear
  const g3 = new THREE.Mesh(makeGear(8, 0.36, 0.22), pm);
  g3.position.set(0.92, 0.72, 0); g3.rotation.x = -Math.PI/2;
  group.add(g3);

  // Axle cylinders
  [[g1.position.x, 0.95], [g2.position.x, 0.58], [g3.position.x, 0.36]].forEach(([x, r]) => {
    const axle = new THREE.Mesh(new THREE.CylinderGeometry(r*0.18, r*0.18, 0.70, 12),
      new THREE.MeshPhongMaterial({ color: col, emissive: col, emissiveIntensity: 0.40 }));
    axle.position.set(x, 0.25, g3.position.z);
    group.add(axle);
  });

  // Base plate
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.10, 1.1), pm);
  base.position.set(0.22, -0.15, 0.25);
  group.add(base);

  group.userData.colorable = { primaryMats: [pm], accentMats: [am] };
  group.userData.gears = { g1, g2, g3 };
  group.position.set(0, -0.4, 0);
  group.scale.setScalar(0.95);
}

// 4 ── Phone Stand ─────────────────────────────────────
function buildPhoneStand(group, col) {
  const pm = makePrimaryMat(col, 130);
  const am = makeAccentMat(col, 0.80);

  // Base plate (with rounded look via cylinder)
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.90, 0.14, 32), pm);
  base.position.y = -1.1;
  group.add(base);

  // Hinge post
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.45, 10), pm);
  post.position.set(0, -0.85, -0.1);
  group.add(post);

  // Back support (main slab)
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.60, 2.0, 0.14), pm);
  back.position.set(0, 0, -0.44);
  back.rotation.x = -Math.PI * 0.11;
  group.add(back);

  // Ventilation slots (5 horizontal cuts - represented as slightly lighter strips)
  [0.6, 0.2, -0.2, -0.6].forEach(y => {
    const slot = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.06, 0.02), am);
    slot.position.set(0, y, -0.36);
    group.add(slot);
  });

  // Phone cradle lip
  const lip = new THREE.Mesh(new THREE.BoxGeometry(1.50, 0.20, 0.24), pm);
  lip.position.set(0, -0.95, 0.12);
  group.add(lip);

  // Rubber pad strips (slight contrast)
  [-0.55, 0.55].forEach(x => {
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.26),
      new THREE.MeshPhongMaterial({ color: 0x050505, emissive: col, emissiveIntensity: 0.04, shininess: 50 }));
    pad.position.set(x, -0.95, 0.14);
    group.add(pad);
  });

  // Cable channel (torus)
  const cable = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.038, 8, 20), am);
  cable.position.set(0, -0.96, 0.14);
  cable.rotation.x = Math.PI/2;
  group.add(cable);

  // Accent strip top of back
  const strip = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.045, 0.045), am);
  strip.position.set(0, 0.98, -0.38);
  group.add(strip);

  // Side accent lines
  [-0.82, 0.82].forEach(x => {
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.8, 0.04), am);
    line.position.set(x, 0, -0.38);
    group.add(line);
  });

  group.userData.colorable = { primaryMats: [pm], accentMats: [am] };
  group.scale.setScalar(0.72);
  group.position.y = 0.12;
}

// 5 ── Cable Organizer ─────────────────────────────────
function buildCableOrganizer(group, col) {
  const pm = makePrimaryMat(col, 100);
  const am = makeAccentMat(col, 0.65);

  // Main body
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.40, 0.50, 0.65), pm);
  group.add(body);

  // Top rail
  const rail = new THREE.Mesh(new THREE.BoxGeometry(2.40, 0.06, 0.06), am);
  rail.position.y = 0.26;
  group.add(rail);

  // 8 cable clips
  for (let i = 0; i < 8; i++) {
    const x = -1.68 + i * 0.48;
    const arch = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.055, 10, 20, Math.PI),
      new THREE.MeshPhongMaterial({ color: 0x060610, emissive: col, emissiveIntensity: 0.18, specular: col, shininess: 130 }));
    arch.position.set(x, 0.28, 0);
    arch.rotation.z = Math.PI;
    group.add(arch);

    // Inner slot
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.04), am);
    slot.position.set(x, 0.16, 0.02);
    group.add(slot);

    // LED dot
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), makeAccentMat(col, 0.95));
    dot.position.set(x, 0.44, 0);
    group.add(dot);
  }

  // End caps
  [-1.22, 1.22].forEach(x => {
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.50, 0.65), am);
    cap.position.set(x, 0, 0);
    group.add(cap);
  });

  // Mounting tape strip (bottom)
  const tape = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.06, 0.62),
    new THREE.MeshBasicMaterial({ color: 0x2a2a44, transparent: true, opacity: 0.85 }));
  tape.position.y = -0.28;
  group.add(tape);

  group.userData.colorable = { primaryMats: [pm], accentMats: [am] };
  group.scale.setScalar(0.80);
}

// 6 ── Mini House ─────────────────────────────────────
function buildMiniHouse(group, col) {
  const wallMat = makePrimaryMat(col, 120);
  const roofMat = new THREE.MeshPhongMaterial({ color: 0x050810, emissive: 0x5b21b6, emissiveIntensity: 0.15, specular: 0x8b5cf6, shininess: 90 });
  const winMat  = makeAccentMat(col, 0.85);
  const am      = makeAccentMat(col, 0.45);

  // Foundation
  const foundation = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.09, 6), wallMat);
  foundation.position.y = -0.79;
  group.add(foundation);

  // Main walls
  const walls = new THREE.Mesh(new THREE.BoxGeometry(1.80, 1.35, 1.45), wallMat);
  walls.position.y = -0.03;
  group.add(walls);

  // Side extension (garage or porch)
  const ext = new THREE.Mesh(new THREE.BoxGeometry(0.80, 0.85, 0.80), wallMat);
  ext.position.set(-1.28, -0.28, -0.32);
  group.add(ext);

  // Main roof
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(0, 1.38, 0.95, 4, 1), roofMat);
  roof.position.y = 0.97;
  roof.rotation.y = Math.PI/4;
  group.add(roof);

  // Extension roof
  const roofExt = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.68, 0.55, 4, 1), roofMat);
  roofExt.position.set(-1.28, 0.44, -0.32);
  roofExt.rotation.y = Math.PI/4;
  group.add(roofExt);

  // Chimney
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.65, 0.22), wallMat);
  chimney.position.set(0.52, 1.35, 0.28);
  group.add(chimney);
  // Chimney cap
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.11, 0.08, 8), wallMat);
  cap.position.set(0.52, 1.69, 0.28);
  group.add(cap);

  // Windows (glowing)
  [[-0.52, 0.10, 0.73], [0.52, 0.10, 0.73], [-0.52, 0.10, -0.73], [0.52, 0.10, -0.73],
   [-0.52, 0.10, -0.40], [0.52, 0.10, -0.40]].forEach(([x,y,z]) => {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(0.30, 0.34), winMat);
    w.position.set(x,y,z);
    if (Math.abs(z) > 0.72) w.rotation.y = z < 0 ? Math.PI : 0;
    else w.rotation.y = x > 0 ? Math.PI/2 : -Math.PI/2;
    group.add(w);
  });

  // Door
  const door = new THREE.Mesh(new THREE.PlaneGeometry(0.30, 0.56), winMat);
  door.position.set(0, -0.37, 0.731);
  group.add(door);

  // Garden path (flat discs)
  const path = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.02, 8), am);
  path.position.set(0, -0.75, 1.1);
  group.add(path);

  // Tree
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.38, 8), wallMat);
  trunk.position.set(0.92, -0.60, 0.85);
  group.add(trunk);
  const foliage = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.55, 8), new THREE.MeshPhongMaterial({ color: 0x052208, emissive: 0x16a34a, emissiveIntensity: 0.20, shininess: 80 }));
  foliage.position.set(0.92, -0.22, 0.85);
  group.add(foliage);

  // Base glow ring
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.28, 0.025, 6, 48), makeAccentMat(col, 0.38));
  ring.position.y = -0.74;
  ring.rotation.x = Math.PI/2;
  group.add(ring);

  group.userData.colorable = { primaryMats: [wallMat], accentMats: [winMat] };
  group.scale.setScalar(0.78);
}

// 7 ── Robot Joint ─────────────────────────────────────
function buildRobotJoint(group, col) {
  const pm = makePrimaryMat(col, 160);
  const am = makeAccentMat(col, 0.85);

  // Servo body
  const servo = new THREE.Mesh(new THREE.BoxGeometry(0.80, 1.10, 0.60), pm);
  group.add(servo);

  // Output shaft disc
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.30, 0.12, 20), pm);
  disc.position.set(0, 0.58, 0.02);
  disc.rotation.x = Math.PI/2;
  group.add(disc);

  // Shaft horn (cross)
  [0, Math.PI/2].forEach(a => {
    const horn = new THREE.Mesh(new THREE.BoxGeometry(0.60, 0.08, 0.08), am);
    horn.position.set(0, 0.58, 0.02);
    horn.rotation.y = a;
    horn.rotation.x = Math.PI/2;
    group.add(horn);
  });

  // Mounting brackets (4 corners)
  [[0.44,0.58],[0.44,-0.58],[-0.44,0.58],[-0.44,-0.58]].forEach(([x,y]) => {
    const brk = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.22, 0.55), pm);
    brk.position.set(x, y, 0);
    group.add(brk);
    // Screw head
    const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 8), am);
    screw.rotation.z = Math.PI/2;
    screw.position.set(x + 0.06, y, 0);
    group.add(screw);
  });

  // Bearing ring
  const bearing = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.045, 10, 28), am);
  bearing.position.set(0, 0.58, 0.025);
  bearing.rotation.x = Math.PI/2;
  group.add(bearing);

  // Wire channel
  const wire = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.65), am);
  wire.position.set(0.32, -0.3, 0);
  group.add(wire);

  // LED status indicator
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.95 }));
  led.position.set(0, -0.48, 0.32);
  group.add(led);

  group.userData.colorable = { primaryMats: [pm], accentMats: [am] };
  group.scale.setScalar(0.88);
}

// 8 ── Headphone Stand ─────────────────────────────────
function buildHeadphoneStand(group, col) {
  const pm = makePrimaryMat(col, 150);
  const am = makeAccentMat(col, 0.80);

  // Base disc
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.85, 0.14, 32), pm);
  base.position.y = -1.40;
  group.add(base);

  // Base glow ring
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.025, 8, 40), am);
  ring.position.y = -1.33;
  ring.rotation.x = Math.PI/2;
  group.add(ring);

  // Stem (upright pole)
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.12, 2.20, 20), pm);
  stem.position.y = -0.28;
  group.add(stem);

  // Arch (lathe — smooth curve)
  const archPts = [];
  for (let i = 0; i <= 30; i++) {
    const t = i / 30;
    const a = t * Math.PI;
    archPts.push(new THREE.Vector2(Math.sin(a) * 0.72, Math.cos(a) * 0.72 + 1.0));
  }
  const archGeo = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(archPts.map(p => new THREE.Vector3(p.x, p.y, 0))),
    32, 0.075, 10, false
  );
  group.add(new THREE.Mesh(archGeo, pm));

  // Earcup rests (left + right)
  [-0.72, 0.72].forEach(x => {
    const cup = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), pm);
    cup.position.set(x, 1.0, 0);
    group.add(cup);
    const cupGlow = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 14), makeAccentMat(col, 0.15));
    cupGlow.position.set(x, 1.0, 0);
    group.add(cupGlow);
  });

  // Hook at top
  const hookGeo = new THREE.TorusGeometry(0.18, 0.06, 8, 20, Math.PI);
  const hook = new THREE.Mesh(hookGeo, am);
  hook.position.set(0, 1.74, 0);
  group.add(hook);

  // Cable management clip
  const clip = new THREE.Mesh(new THREE.TorusGeometry(0.10, 0.03, 8, 16, Math.PI), am);
  clip.position.set(0, -0.5, 0.12);
  clip.rotation.x = Math.PI/2;
  group.add(clip);

  group.userData.colorable = { primaryMats: [pm], accentMats: [am] };
  group.scale.setScalar(0.70);
  group.position.y = 0.10;
}

// 9 ── Planter ─────────────────────────────────────────
function buildPlanter(group, col) {
  const pm = makePrimaryMat(col, 110);
  const am = makeAccentMat(col, 0.70);

  // Hex body (tapered) — approximate with CylinderGeometry 6-sided
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.70, 0.52, 1.60, 6), pm);
  group.add(body);

  // Rim (wider top flare)
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.72, 0.14, 6), pm);
  rim.position.y = 0.82;
  group.add(rim);

  // Inner surface
  const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.48, 1.50, 6),
    new THREE.MeshPhongMaterial({ color: 0x020804, emissive: col, emissiveIntensity: 0.06, side: THREE.BackSide }));
  inner.position.y = 0.04;
  group.add(inner);

  // Drainage holes (3 circles on bottom)
  [0, Math.PI*2/3, Math.PI*4/3].forEach(a => {
    const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 10), am);
    hole.position.set(Math.cos(a)*0.22, -0.80, Math.sin(a)*0.22);
    group.add(hole);
  });

  // Saucer / tray
  const saucer = new THREE.Mesh(new THREE.CylinderGeometry(0.80, 0.72, 0.10, 6), pm);
  saucer.position.y = -0.90;
  group.add(saucer);

  // Hex pattern on sides (accent lines)
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI/6;
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.55, 0.03), am);
    line.position.set(Math.cos(a)*0.60, 0, Math.sin(a)*0.60);
    line.rotation.y = a;
    group.add(line);
  }

  // Glow ring at rim
  const glowRing = new THREE.Mesh(new THREE.TorusGeometry(0.80, 0.025, 8, 30), am);
  glowRing.position.y = 0.90;
  glowRing.rotation.x = Math.PI/2;
  group.add(glowRing);

  group.userData.colorable = { primaryMats: [pm], accentMats: [am] };
  group.scale.setScalar(0.88);
}

// 10 ── Fidget Spinner ──────────────────────────────────
function buildFidgetSpinner(group, col) {
  const pm = makePrimaryMat(col, 180);
  const am = makeAccentMat(col, 0.90);

  // Central bearing assembly
  const outerRing = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.09, 14, 40), pm);
  group.add(outerRing);
  const innerRing = new THREE.Mesh(new THREE.TorusGeometry(0.20, 0.055, 12, 32), am);
  group.add(innerRing);
  const center = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.20, 16), pm);
  center.rotation.x = Math.PI/2;
  group.add(center);

  // 3 arms at 120° each
  [0, Math.PI*2/3, Math.PI*4/3].forEach(a => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.80, 0.22, 0.18),
      new THREE.MeshPhongMaterial({ color: 0x060c18, emissive: col, emissiveIntensity: 0.09, specular: col, shininess: 160 }));
    arm.position.set(Math.cos(a)*0.62, 0, Math.sin(a)*0.62);
    arm.rotation.y = a + Math.PI/2;
    group.add(arm);

    // Weight pod at tip
    const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.20, 0.20, 16), pm);
    pod.position.set(Math.cos(a)*1.10, 0, Math.sin(a)*1.10);
    pod.rotation.x = Math.PI/2;
    group.add(pod);

    // Weight pocket
    const pocket = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.14, 14), am);
    pocket.position.set(Math.cos(a)*1.10, 0, Math.sin(a)*1.10);
    pocket.rotation.x = Math.PI/2;
    group.add(pocket);

    // Accent dot
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.95 }));
    dot.position.set(Math.cos(a)*1.10, 0.12, Math.sin(a)*1.10);
    group.add(dot);
  });

  group.userData.colorable = { primaryMats: [pm], accentMats: [am] };
  group.scale.setScalar(0.85);
}

// 11 ── GoPro Mount ────────────────────────────────────
function buildGoProMount(group, col) {
  const pm = makePrimaryMat(col, 145);
  const am = makeAccentMat(col, 0.80);

  // Camera plate
  const plate = new THREE.Mesh(new THREE.BoxGeometry(1.10, 0.80, 0.14), pm);
  plate.position.y = 0.85;
  group.add(plate);

  // Camera outline
  const camWire = new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.84, 0.15), new THREE.MeshBasicMaterial({ color: col, wireframe: true, transparent: true, opacity: 0.16 }));
  camWire.position.y = 0.85;
  group.add(camWire);

  // Lens circle
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 20),
    new THREE.MeshPhongMaterial({ color: 0x000510, emissive: col, emissiveIntensity: 0.35, specular: col, shininess: 280 }));
  lens.rotation.x = Math.PI/2;
  lens.position.set(0, 0.85, 0.10);
  group.add(lens);

  // Pivot arm
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.95, 0.14), pm);
  arm.position.set(0, 0.12, -0.05);
  arm.rotation.z = 0.08;
  group.add(arm);

  // Pivot joint
  const joint = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.22, 16), pm);
  joint.position.set(0, 0.56, -0.05);
  joint.rotation.z = Math.PI/2;
  group.add(joint);

  // Knob (lock nut)
  const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.12, 6), am);
  knob.position.set(0.18, 0.56, -0.05);
  knob.rotation.z = Math.PI/2;
  group.add(knob);

  // Base (mounting surface)
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.14, 0.85), pm);
  base.position.y = -0.60;
  group.add(base);

  // Clamp tabs
  [-0.36, 0.36].forEach(x => {
    const tab = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.28, 0.80), pm);
    tab.position.set(x, -0.58, 0);
    group.add(tab);
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.10, 8), am);
    bolt.rotation.z = Math.PI/2;
    bolt.position.set(x + 0.06, -0.58, 0.28);
    group.add(bolt);
  });

  // Accent lines
  const strip = new THREE.Mesh(new THREE.BoxGeometry(1.10, 0.04, 0.04), am);
  strip.position.set(0, 0.46, 0.08);
  group.add(strip);

  group.userData.colorable = { primaryMats: [pm], accentMats: [am] };
  group.scale.setScalar(0.82);
}

// 12 ── Hex Storage Box ───────────────────────────────
function buildHexStorage(group, col) {
  const pm = makePrimaryMat(col, 130);
  const am = makeAccentMat(col, 0.75);

  // Main hex body
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.80, 0.78, 1.20, 6), pm);
  group.add(body);

  // Lid (slightly wider for snap fit)
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.84, 0.82, 0.22, 6), pm);
  lid.position.y = 0.70;
  group.add(lid);

  // Lid top detail ring
  const lidRing = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.06, 6), am);
  lidRing.position.y = 0.82;
  group.add(lidRing);

  // Finger groove on lid
  const groove = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.04, 8, 18), am);
  groove.position.y = 0.82;
  groove.rotation.x = Math.PI/2;
  group.add(groove);

  // Internal dividers (cross pattern visible from top)
  [0, Math.PI/3, Math.PI*2/3].forEach(a => {
    const div = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.15, 1.55), pm);
    div.rotation.y = a;
    group.add(div);
  });

  // Label area (recessed rectangle on side)
  const label = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.34, 0.04), am);
  label.position.set(0, -0.14, 0.82);
  group.add(label);

  // Hex pattern edge accents
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI/6;
    const edge = new THREE.Mesh(new THREE.BoxGeometry(0.025, 1.20, 0.025), am);
    edge.position.set(Math.cos(a)*0.80, 0, Math.sin(a)*0.80);
    group.add(edge);
  }

  // Bottom ring
  const bottomRing = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.028, 8, 24), am);
  bottomRing.position.y = -0.62;
  bottomRing.rotation.x = Math.PI/2;
  group.add(bottomRing);

  group.userData.colorable = { primaryMats: [pm], accentMats: [am] };
  group.scale.setScalar(0.85);
}

// ══════════════════════════════════════════════════════
// COLOR PICKERS
// ══════════════════════════════════════════════════════
function initColorPickers() {
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      const pid = swatch.dataset.product;
      const hex = swatch.dataset.hex;
      const name = swatch.dataset.name;

      // Update UI active state
      document.querySelectorAll(`.color-swatch[data-product="${pid}"]`).forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');

      // Update label
      const label = document.getElementById(`color-label-${pid}`);
      if (label) label.textContent = name;

      // Update 3D model
      updateModelColor(pid, hex);

      // Update price display accent color
      const priceEl = document.getElementById(`price-${pid}`);
      const totalEl = document.getElementById(`breakdown-total-${pid}`);
      if (priceEl) priceEl.style.color = hex;
      if (totalEl) totalEl.style.color = hex;
    });
  });
}

// ══════════════════════════════════════════════════════
// MATERIAL + QUALITY SELECTORS
// ══════════════════════════════════════════════════════
function initMaterialQualitySelectors() {
  // Material chips
  document.querySelectorAll('.mat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const pid = chip.dataset.product;
      const mid = chip.dataset.mat;
      document.querySelectorAll(`.mat-chip[data-product="${pid}"]`).forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const state = cardStates.get(pid);
      if (state) state.selectedMat = mid;

      // Update description
      const descEl = document.getElementById(`mat-desc-${pid}`);
      if (descEl) descEl.textContent = MATERIALS_DB[mid].desc;

      recalcPrice(pid);
    });
  });

  // Quality chips
  document.querySelectorAll('.qual-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const pid = chip.dataset.product;
      const qid = chip.dataset.qual;
      document.querySelectorAll(`.qual-chip[data-product="${pid}"]`).forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const state = cardStates.get(pid);
      if (state) state.selectedQual = qid;

      recalcPrice(pid);
    });
  });

  // AI customize button
  document.querySelectorAll('.shop-ai-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const name = btn.dataset.name;
      // scroll to AI section & pre-fill
      document.getElementById('ai')?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        const inp = document.getElementById('ai-input');
        if (inp) {
          inp.value = `${name} için özel tasarım istiyorum`;
          inp.dispatchEvent(new Event('input'));
          inp.focus();
        }
      }, 600);
      e.stopPropagation();
    });
  });
}

function recalcPrice(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  const state   = cardStates.get(productId);
  if (!product || !state) return;

  const mat  = MATERIALS_DB[state.selectedMat];
  const qual = QUALITIES_DB.find(q => q.id === state.selectedQual);
  const total = Math.round(product.price * mat.mult * qual.mult);

  // Update displayed price
  const priceEl = document.getElementById(`price-${productId}`);
  if (priceEl) priceEl.textContent = `₺${total}`;

  // Update breakdown
  const bd = document.getElementById(`breakdown-${productId}`);
  if (bd) {
    bd.querySelector('.breakdown-row:nth-child(2) span:last-child').textContent = `×${mat.mult.toFixed(2)}`;
    bd.querySelector('.breakdown-row:nth-child(2) span:first-child').textContent = `Malzeme (${mat.name})`;
    bd.querySelector('.breakdown-row:nth-child(3) span:last-child').textContent = `×${qual.mult.toFixed(2)}`;
    bd.querySelector('.breakdown-row:nth-child(3) span:first-child').textContent = `Kalite (${qual.name})`;
    const totalSpan = document.getElementById(`breakdown-total-${productId}`);
    if (totalSpan) totalSpan.textContent = `₺${total}`;
  }
}

// ══════════════════════════════════════════════════════
// FILTERS + SORT
// ══════════════════════════════════════════════════════
function initFilters() {
  document.querySelectorAll('.shop-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.shop-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      document.querySelectorAll('.shop-card').forEach(card => {
        const show = f === 'all' || card.dataset.category === f;
        card.style.display = show ? '' : 'none';
      });
    });
  });

  document.getElementById('shop-sort')?.addEventListener('change', e => sortProducts(e.target.value));
}

function sortProducts(mode) {
  const grid = document.getElementById('shop-grid');
  if (!grid) return;
  const cards = [...grid.querySelectorAll('.shop-card')];
  cards.sort((a, b) => {
    const pa = PRODUCTS.find(p => p.id === a.dataset.id);
    const pb = PRODUCTS.find(p => p.id === b.dataset.id);
    if (!pa || !pb) return 0;
    if (mode === 'price-asc')  return pa.price - pb.price;
    if (mode === 'price-desc') return pb.price - pa.price;
    if (mode === 'rating')     return pb.rating - pa.rating;
    return 0;
  });
  cards.forEach(c => grid.appendChild(c));
}

// ══════════════════════════════════════════════════════
// CART
// ══════════════════════════════════════════════════════
let cart = [];

function initCartBadge() {
  const nav = document.querySelector('.nav-actions');
  if (!nav || document.getElementById('nav-cart')) return;
  const btn = document.createElement('button');
  btn.className = 'nav-cart-btn'; btn.id = 'nav-cart';
  btn.innerHTML = `
    <svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
    <span class="nav-cart-badge" id="nav-cart-badge" style="display:none">0</span>`;
  nav.insertBefore(btn, nav.firstChild);
}

function addToCart(id, btn) {
  cart.push(id);
  const badge = document.getElementById('nav-cart-badge');
  if (badge) { badge.style.display = 'flex'; badge.textContent = cart.length; badge.classList.remove('badge-pop'); badge.offsetWidth; badge.classList.add('badge-pop'); }
  const og = btn.innerHTML;
  btn.innerHTML = `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg> Eklendi!`;
  btn.style.cssText += ';background:rgba(52,211,153,0.18);border-color:#34D399;color:#34D399;';
  setTimeout(() => { btn.innerHTML = og; btn.style.cssText = btn.style.cssText.replace(/background:[^;]+;border-color:[^;]+;color:[^;]+;?/, ''); }, 2000);
  showToast(`🛒 ${PRODUCTS.find(p=>p.id===id)?.name || 'Ürün'} sepete eklendi!`);
}

function showToast(msg) {
  let c = document.getElementById('toast-container');
  if (!c) { c = document.createElement('div'); c.id = 'toast-container'; document.body.appendChild(c); }
  const t = document.createElement('div');
  t.className = 'shop-toast'; t.textContent = msg;
  c.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 380); }, 3000);
}

export { PRODUCTS };
