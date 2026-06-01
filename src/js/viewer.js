/**
 * CustomShape3D — Viewer Module
 * Full STL/OBJ Viewer with Bambu Studio Tutorial
 */

import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { observeNewReveals } from './animations.js';

let viewerState = null;

export function initViewer() {
  renderViewerSection();
}

// ══════════════════════════════════════════════════════
// RENDER SECTION HTML
// ══════════════════════════════════════════════════════
function renderViewerSection() {
  const section = document.getElementById('viewer');
  if (!section) return;

  section.innerHTML = `
    <div class="container">
      <div class="section-label-bar">
        <span class="section-label-tag">3D Viewer & Özel Yükleme</span>
      </div>
      <div class="section-header reveal">
        <div class="section-pill" style="color:#A1A1AA;border-color:rgba(161,161,170,0.2);background:rgba(161,161,170,0.05)">Kendi Modelinizi Getirin</div>
        <h2 class="section-title">STL Dosyanızı <span class="gradient-text">Yükleyin</span></h2>
        <p class="section-desc">STL dosyanızı yükleyin, 3D önizleme ile inceleyin. Filament rengi ve malzeme seçin, sipariş verin.</p>
      </div>

      <!-- Upload + Viewer Layout -->
      <div class="viewer-layout reveal">
        <!-- Left: Upload Panel -->
        <div class="viewer-upload-panel">
          <div class="upload-dropzone" id="upload-dropzone">
            <div class="upload-dropzone-icon">
              <svg width="48" height="48" fill="none" stroke="#A1A1AA" stroke-width="1.5" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17,8 12,3 7,8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <h3 class="upload-dropzone-title">Sürükle & Bırak</h3>
            <p class="upload-dropzone-sub">veya tıklayarak dosya seçin</p>
            <p class="upload-dropzone-formats">Desteklenen: .stl</p>
            <input type="file" id="viewer-file-input" accept=".stl" style="display:none;" />
          </div>

          <!-- File Info (shown after upload) -->
          <div class="upload-file-info" id="upload-file-info" style="display:none;">
            <div class="file-info-icon">
              <svg width="24" height="24" fill="none" stroke="#34D399" stroke-width="2" viewBox="0 0 24 24">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            </div>
            <div class="file-info-details">
              <div class="file-info-name" id="file-info-name">model.stl</div>
              <div class="file-info-size" id="file-info-size">0 KB</div>
            </div>
            <button class="file-info-clear" id="file-info-clear" title="Kaldır">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Color Picker -->
          <div class="viewer-color-section">
            <div class="viewer-option-label">Filament Rengi</div>
            <div class="viewer-color-swatches" id="viewer-color-swatches">
              ${[
                { name: 'Siyan', hex: '#EDEDED' },
                { name: 'Mor', hex: '#A1A1AA' },
                { name: 'Kırmızı', hex: '#EF4444' },
                { name: 'Yeşil', hex: '#34D399' },
                { name: 'Turuncu', hex: '#F59E0B' },
                { name: 'Pembe', hex: '#EC4899' },
                { name: 'Beyaz', hex: '#F9FAFB' },
                { name: 'Siyah', hex: '#111827' },
              ].map((c, i) => `
                <button class="viewer-color-btn ${i===0?'active':''}" data-hex="${c.hex}" data-name="${c.name}"
                  style="background:${c.hex}" title="${c.name}"></button>
              `).join('')}
            </div>
            <div class="viewer-color-label" id="viewer-color-label">Siyan</div>
          </div>

          <!-- Material -->
          <div class="viewer-material-section">
            <div class="viewer-option-label">Malzeme</div>
            <div class="viewer-mat-chips">
              ${['PLA+','PETG','ABS','TPU','CF-PLA','Resin'].map((m, i) => `
                <button class="viewer-mat-chip ${i===0?'active':''}" data-mat="${m}">${m}</button>
              `).join('')}
            </div>
          </div>

          <!-- CTA -->
          <div class="viewer-cta-panel">
            <div class="viewer-price-display">
              <span class="viewer-price-label">Tahmini Fiyat</span>
              <span class="viewer-price-value" id="viewer-price">₺50+</span>
            </div>
            <button class="btn-primary" id="viewer-order-btn" style="width:100%;padding:14px;border-radius:12px;">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
              Sipariş Ver
            </button>
          </div>
        </div>

        <!-- Right: 3D Preview Canvas -->
        <div class="viewer-canvas-panel">
          <div class="viewer-canvas-wrapper" id="viewer-canvas-wrapper">
            <canvas id="viewer-canvas"></canvas>
            <!-- Controls overlay -->
            <div class="viewer-canvas-controls">
              <button class="viewer-ctrl-pill" id="vc-wireframe">
                <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                Wireframe
              </button>
              <button class="viewer-ctrl-pill" id="vc-reset">
                <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="1,4 1,10 7,10"/><path d="M3.51 15a9 9 0 101.86-3.84L1 10"/></svg>
                Sıfırla
              </button>
              <button class="viewer-ctrl-pill" id="vc-fit">
                <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/></svg>
                Sığdır
              </button>
            </div>
            <div class="viewer-canvas-hint" id="viewer-canvas-hint">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17,8 12,3 7,8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              STL dosyası yükleyerek başlayın
            </div>
          </div>
          <div class="viewer-canvas-stats" id="viewer-canvas-stats" style="display:none;">
            <div class="viewer-stat">
              <span class="viewer-stat-label">Üçgen</span>
              <span class="viewer-stat-val" id="stat-triangles">-</span>
            </div>
            <div class="viewer-stat">
              <span class="viewer-stat-label">Boyut X</span>
              <span class="viewer-stat-val" id="stat-x">-</span>
            </div>
            <div class="viewer-stat">
              <span class="viewer-stat-label">Boyut Y</span>
              <span class="viewer-stat-val" id="stat-y">-</span>
            </div>
            <div class="viewer-stat">
              <span class="viewer-stat-label">Boyut Z</span>
              <span class="viewer-stat-val" id="stat-z">-</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ══════════ ECONOMIC ANALYSIS ══════════ -->
      <div class="eco-section reveal">
        <div class="section-label-bar" style="margin-top:80px;">
          <span class="section-label-tag" style="background:rgba(255,255,255,0.08);color:#a1a1aa;border-color:rgba(255,255,255,0.15);">Ekonomik Analiz</span>
        </div>
        <h2 class="section-title" style="margin-bottom: 40px;">100 Gram Baskı <span class="gradient-text">Ne Kadara Mal Olur?</span></h2>

        <div class="eco-grid">
          <!-- Column 1: Static Cost Breakdown -->
          <div class="eco-card">
            <div class="eco-card-header">BASKI MALİYETİ (100G PLA+)</div>
            <div class="eco-row">
              <span class="eco-label">Filamix PLA+ Payı</span>
              <span class="eco-value">~55 TL</span>
            </div>
            <div class="eco-row">
              <span class="eco-label">Elektrik (~3 Saat)</span>
              <span class="eco-value">~4.5 TL</span>
            </div>
            <div class="eco-row">
              <span class="eco-label">Bakım & Amortisman</span>
              <span class="eco-value">~6 TL</span>
            </div>
            <div class="eco-total">
              <span>Toplam Gider</span>
              <span>~65.5 TL</span>
            </div>
          </div>

          <!-- Column 2: Calculator -->
          <div class="eco-card eco-card-dark">
            <div class="eco-card-header">MALİYET HESAPLAYICI</div>
            
            <div class="eco-input-group">
              <label>FİLAMENT FİYATI (1KG / TL)</label>
              <input type="number" id="calc-fil-price" value="550" />
            </div>
            
            <div class="eco-input-group">
              <label>ÜRÜN AĞIRLIĞI (GRAM)</label>
              <input type="number" id="calc-weight" value="100" />
            </div>
            
            <div class="eco-input-group">
              <label>BASKI SÜRESİ (SAAT)</label>
              <input type="number" id="calc-time" value="3" />
            </div>
            
            <button class="btn-primary eco-calc-btn" id="eco-calc-btn">Hesapla</button>
            
            <div class="eco-result-box">
              <div class="eco-result-label">TAHMİNİ TOPLAM MALİYET</div>
              <div class="eco-result-value" id="calc-total-cost">59.50 TL</div>
            </div>
            <p class="eco-disclaimer">Filament + Elektrik (150W/6TL kWh) dahil hesaplanmıştır.</p>
          </div>

          <!-- Column 3: Yearly Savings -->
          <div class="eco-card">
            <div class="eco-card-header">YILLIK TASARRUF TABLOSU</div>
            <div class="eco-row">
              <span class="eco-label">Kendi Yazıcınızla (500g/Ay)</span>
              <span class="eco-value">~325 TL</span>
            </div>
            <div class="eco-row">
              <span class="eco-label">Dış Hizmet Tahmini</span>
              <span class="eco-value">~3.000 TL+</span>
            </div>
            <div class="eco-row eco-highlight">
              <span class="eco-label">Yıllık Tasarruf</span>
              <span class="eco-value">~32.000 TL</span>
            </div>
            <p class="eco-disclaimer" style="margin-top:16px;text-align:left;">Bambu Lab gibi hızlı yazıcılar enerji ve zaman tasarrufunu artırır.</p>
          </div>
        </div>
      </div>

      <!-- ══════════ BAMBU STUDIO TUTORIAL ══════════ -->
      <div class="bambu-section reveal">
        <div class="section-label-bar" style="margin-top:80px;">
          <span class="section-label-tag" style="background:rgba(34,197,94,0.08);color:#22c55e;border-color:rgba(34,197,94,0.25);">Bambu Studio Rehberi</span>
        </div>
        <div class="section-header" style="margin-bottom:48px;">
          <div class="section-pill" style="color:#22c55e;border-color:rgba(34,197,94,0.2);background:rgba(34,197,94,0.05)">Dilimleyici Nasıl Kullanılır?</div>
          <h2 class="section-title">Bambu Studio ile <span class="gradient-text">Hazırla</span></h2>
          <p class="section-desc">Modelinizi baskıya göndermeden önce doğru ayarları yapmanızı sağlayan ücretsiz dilimleyici yazılımı.</p>
        </div>

        <div class="bambu-steps">

          <div class="bambu-step reveal" style="--i:0">
            <div class="bambu-step-number">01</div>
            <div class="bambu-step-content">
              <div class="bambu-step-icon" style="background:rgba(34,197,94,0.08);border-color:rgba(34,197,94,0.25)">
                <svg width="24" height="24" fill="none" stroke="#22c55e" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17,8 12,3 7,8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div class="bambu-step-text">
                <h4 class="bambu-step-title">Modeli İçe Aktar</h4>
                <p class="bambu-step-desc">Bambu Studio'yu açın. <strong>File → Import</strong> ile STL dosyanızı yükleyin ya da doğrudan sürükle-bırak yapın. Model build plate üzerine yerleşir.</p>
                <div class="bambu-step-tip">
                  <span class="bambu-tip-badge">İpucu</span>
                  MakerWorld profillerini indirerek filament ayarlarını otomatik yükleyin.
                </div>
              </div>
            </div>
          </div>

          <div class="bambu-step reveal" style="--i:1">
            <div class="bambu-step-number">02</div>
            <div class="bambu-step-content">
              <div class="bambu-step-icon" style="background:rgba(237,237,237,0.08);border-color:rgba(237,237,237,0.25)">
                <svg width="24" height="24" fill="none" stroke="#EDEDED" stroke-width="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4"/>
                </svg>
              </div>
              <div class="bambu-step-text">
                <h4 class="bambu-step-title">Yazıcı & Filament Seç</h4>
                <p class="bambu-step-desc">Sol panelden yazıcı modelinizi seçin (ör. <strong>Bambu Lab A1</strong>). Filament için Generic PLA veya markalı profil kullanın. Nozul çapı genelde 0.4mm'dir.</p>
                <div class="bambu-step-tip">
                  <span class="bambu-tip-badge">İpucu</span>
                  "Senkronizasyon bilgileri" ile yazıcı ve filament ayarlarını eşitleyin.
                </div>
              </div>
            </div>
          </div>

          <div class="bambu-step reveal" style="--i:2">
            <div class="bambu-step-number">03</div>
            <div class="bambu-step-content">
              <div class="bambu-step-icon" style="background:rgba(251,191,36,0.08);border-color:rgba(251,191,36,0.25)">
                <svg width="24" height="24" fill="none" stroke="#FBBF24" stroke-width="2" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <line x1="3" y1="9" x2="21" y2="9"/>
                  <line x1="3" y1="15" x2="21" y2="15"/>
                  <line x1="9" y1="3" x2="9" y2="21"/>
                  <line x1="15" y1="3" x2="15" y2="21"/>
                </svg>
              </div>
              <div class="bambu-step-text">
                <h4 class="bambu-step-title">Kalite & Katman Ayarları</h4>
                <p class="bambu-step-desc">Üst menüden kalite profili seçin: <strong>0.20mm Standard</strong> çoğu model için idealdir. İnce detaylar için 0.10mm, hızlı baskı için 0.28mm seçebilirsiniz.</p>
                <div class="bambu-step-params">
                  <div class="bambu-param"><span>Katman Yüksekliği</span><strong>0.20 mm</strong></div>
                  <div class="bambu-param"><span>Başlangıç Katmanı</span><strong>0.20 mm</strong></div>
                  <div class="bambu-param"><span>Duvar Sayısı</span><strong>3</strong></div>
                </div>
              </div>
            </div>
          </div>

          <div class="bambu-step reveal" style="--i:3">
            <div class="bambu-step-number">04</div>
            <div class="bambu-step-content">
              <div class="bambu-step-icon" style="background:rgba(161,161,170,0.08);border-color:rgba(161,161,170,0.25)">
                <svg width="24" height="24" fill="none" stroke="#A1A1AA" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div class="bambu-step-text">
                <h4 class="bambu-step-title">Infill & Destek</h4>
                <p class="bambu-step-desc">Doluluk oranını ihtiyaca göre ayarlayın. Dekoratif modeller için <strong>%15</strong>, mekanik parçalar için <strong>%40+</strong> önerilir. Gerekirse destek yapısı ekleyin.</p>
                <div class="bambu-step-params">
                  <div class="bambu-param"><span>Doluluk (Decorative)</span><strong>%15</strong></div>
                  <div class="bambu-param"><span>Doluluk (Mechanical)</span><strong>%40</strong></div>
                  <div class="bambu-param"><span>Destek</span><strong>Otomatik</strong></div>
                </div>
              </div>
            </div>
          </div>

          <div class="bambu-step reveal" style="--i:4">
            <div class="bambu-step-number">05</div>
            <div class="bambu-step-content">
              <div class="bambu-step-icon" style="background:rgba(239,68,68,0.08);border-color:rgba(239,68,68,0.25)">
                <svg width="24" height="24" fill="none" stroke="#EF4444" stroke-width="2" viewBox="0 0 24 24">
                  <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                </svg>
              </div>
              <div class="bambu-step-text">
                <h4 class="bambu-step-title">Dilimle & Sonuçları Gözden Geçir</h4>
                <p class="bambu-step-desc">Sağ üstteki <strong>Dilimle</strong> butonuna basın. Sağ panelde baskı süresi, filament kullanımı ve maliyet tahmini görünür. "Renk şeması → Filament" ile katman renklerini kontrol edin.</p>
                <div class="bambu-step-tip">
                  <span class="bambu-tip-badge">Bilgi</span>
                  Dilimleme tamamlandıktan sonra "Open in Bambu Studio" ile yazıcıya gönderebilirsiniz.
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- CTA to upload -->
        <div class="bambu-cta reveal">
          <p class="bambu-cta-text">Modelinizi hazırladınız mı? Yukarıda STL dosyanızı yükleyin ve bize gönderin!</p>
          <button class="btn-primary" onclick="document.getElementById('upload-dropzone').scrollIntoView({behavior:'smooth',block:'center'})" style="padding:14px 32px;border-radius:12px;">
            STL Yükle → Sipariş Ver
          </button>
        </div>
      </div>
    </div>
  `;

  initViewerCanvas();
  initViewerInteractions();

  // Register newly added .reveal elements with the scroll observer
  // and also force them visible after a short delay as a safety fallback
  const viewerSection = document.getElementById('viewer');
  if (viewerSection) {
    observeNewReveals(viewerSection);
    // Safety: if user lands directly on this section, IntersectionObserver
    // may not fire — force visibility after 300ms
    setTimeout(() => {
      viewerSection.querySelectorAll('.reveal:not(.in-view)').forEach(el => el.classList.add('in-view'));
    }, 300);
  }
}

// ══════════════════════════════════════════════════════
// THREE.JS VIEWER
// ══════════════════════════════════════════════════════
function initViewerCanvas() {
  const canvas = document.getElementById('viewer-canvas');
  if (!canvas) return;

  const wrapper = document.getElementById('viewer-canvas-wrapper');

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080f1c);

  const camera = new THREE.PerspectiveCamera(45, 16 / 10, 0.01, 1000);
  camera.position.set(0, 2, 6);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Size the renderer correctly once the wrapper has layout
  function updateSize() {
    if (!wrapper) return;
    const w = wrapper.clientWidth || 800;
    const h = wrapper.clientHeight || 500;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  // Use ResizeObserver for reliable sizing
  if (wrapper) {
    const ro = new ResizeObserver(() => updateSize());
    ro.observe(wrapper);
  }
  // Also call immediately and after a short delay as fallback
  updateSize();
  setTimeout(updateSize, 100);
  setTimeout(updateSize, 500);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.minDistance = 0.5;
  controls.maxDistance = 200;
  controls.saveState();

  // Lights
  scene.add(new THREE.AmbientLight(0x445566, 1.2));
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
  keyLight.position.set(5, 8, 6);
  keyLight.castShadow = true;
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0x4488ff, 0.5);
  fillLight.position.set(-5, -3, -4);
  scene.add(fillLight);
  const rimLight = new THREE.PointLight(0xEDEDED, 1.0, 80);
  rimLight.position.set(0, 10, -8);
  scene.add(rimLight);

  // Grid floor
  const grid = new THREE.GridHelper(20, 30, 0x1a2a44, 0x0d1829);
  grid.position.y = -1.5;
  scene.add(grid);

  // Show something in the empty viewer — a subtle rotating cube placeholder
  const placeholderGeo = new THREE.BoxGeometry(1, 1, 1);
  const placeholderMat = new THREE.MeshPhongMaterial({
    color: 0x7B2FFF,
    emissive: 0x220044,
    specular: 0xffffff,
    shininess: 80,
    transparent: true,
    opacity: 0.18,
    wireframe: true,
  });
  const placeholder = new THREE.Mesh(placeholderGeo, placeholderMat);
  scene.add(placeholder);

  viewerState = {
    scene, camera, renderer, controls,
    mesh: null,
    placeholder,
    material: new THREE.MeshPhongMaterial({
      color: new THREE.Color('#EDEDED'),
      emissive: new THREE.Color('#003344'),
      specular: new THREE.Color('#ffffff'),
      shininess: 180,
    }),
    wireframeMode: false,
    grid,
  };

  // Render loop
  let raf;
  function animate() {
    raf = requestAnimationFrame(animate);
    controls.update();
    if (placeholder.visible) placeholder.rotation.y += 0.008;
    renderer.render(scene, camera);
  }
  animate();
}


// ══════════════════════════════════════════════════════
// INTERACTIONS
// ══════════════════════════════════════════════════════
function initViewerInteractions() {
  const dropzone  = document.getElementById('upload-dropzone');
  const fileInput = document.getElementById('viewer-file-input');

  // Click to open file dialog
  dropzone?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', (e) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  });

  // Drag & Drop
  dropzone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('drag-over');
  });
  dropzone?.addEventListener('dragleave', () => {
    dropzone.classList.remove('drag-over');
  });
  dropzone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.stl')) handleFile(file);
  });

  // Clear file
  document.getElementById('file-info-clear')?.addEventListener('click', clearFile);

  // Color swatches
  document.querySelectorAll('.viewer-color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.viewer-color-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const hex = btn.dataset.hex;
      const name = btn.dataset.name;
      document.getElementById('viewer-color-label').textContent = name;
      if (viewerState?.material) {
        viewerState.material.color.set(hex);
        viewerState.material.emissive.set(new THREE.Color(hex).multiplyScalar(0.1));
      }
    });
  });

  // Material chips (price update)
  const basePrices = { 'PLA+': 50, 'PETG': 65, 'ABS': 60, 'TPU': 75, 'CF-PLA': 120, 'Resin': 140 };
  document.querySelectorAll('.viewer-mat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.viewer-mat-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const mat = chip.dataset.mat;
      const priceEl = document.getElementById('viewer-price');
      if (priceEl) priceEl.textContent = `₺${basePrices[mat] || 50}+`;
    });
  });

  // Viewer controls
  document.getElementById('vc-wireframe')?.addEventListener('click', () => {
    if (!viewerState) return;
    viewerState.wireframeMode = !viewerState.wireframeMode;
    if (viewerState.material) viewerState.material.wireframe = viewerState.wireframeMode;
    document.getElementById('vc-wireframe').classList.toggle('active', viewerState.wireframeMode);
  });

  document.getElementById('vc-reset')?.addEventListener('click', () => {
    if (!viewerState) return;
    viewerState.controls.reset();
  });

  document.getElementById('vc-fit')?.addEventListener('click', fitCamera);

  // Order button
  document.getElementById('viewer-order-btn')?.addEventListener('click', () => {
    if (!viewerState?.mesh) {
      showViewerToast('Önce bir STL dosyası yükleyin!');
      return;
    }
    showViewerToast('Siparişiniz alındı! En kısa sürede sizinle iletişime geçeceğiz. 🚀');
  });

  // Eco Calculator
  document.getElementById('eco-calc-btn')?.addEventListener('click', () => {
    const filPrice = parseFloat(document.getElementById('calc-fil-price')?.value) || 0;
    const weight = parseFloat(document.getElementById('calc-weight')?.value) || 0;
    const time = parseFloat(document.getElementById('calc-time')?.value) || 0;
    
    // Filament cost: price per kg * (weight / 1000)
    const filCost = filPrice * (weight / 1000);
    // Electricity cost: 150W = 0.15kW. 0.15kW * time * 6 TL/kWh = 0.9 * time TL.
    const elecCost = 0.15 * time * 6;
    
    const total = filCost + elecCost;
    
    const resultEl = document.getElementById('calc-total-cost');
    if (resultEl) {
      resultEl.textContent = total.toFixed(2) + ' TL';
    }
  });
}

function handleFile(file) {
  if (!file || !file.name.endsWith('.stl')) {
    showViewerToast('Lütfen .stl uzantılı bir dosya seçin.');
    return;
  }

  // Update UI
  document.getElementById('viewer-canvas-hint').style.display = 'none';
  const infoEl = document.getElementById('upload-file-info');
  if (infoEl) {
    infoEl.style.display = 'flex';
    document.getElementById('file-info-name').textContent = file.name.substring(0, 30);
    document.getElementById('file-info-size').textContent = formatBytes(file.size);
  }

  // Hide placeholder cube
  if (viewerState?.placeholder) viewerState.placeholder.visible = false;

  const url = URL.createObjectURL(file);
  const loader = new STLLoader();

  showViewerToast('Yükleniyor...');

  loader.load(url, (geometry) => {
    if (!viewerState) return;

    // Remove old mesh
    if (viewerState.mesh) {
      viewerState.scene.remove(viewerState.mesh);
      viewerState.mesh.geometry.dispose();
    }

    geometry.center();
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();

    const size = new THREE.Vector3();
    geometry.boundingBox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2.5 / maxDim;

    const mesh = new THREE.Mesh(geometry, viewerState.material);
    mesh.scale.setScalar(scale);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    viewerState.scene.add(mesh);
    viewerState.mesh = mesh;

    // Move grid to bottom of model
    const scaledMin = geometry.boundingBox.min.y * scale;
    viewerState.grid.position.y = scaledMin - 0.05;

    // Update stats
    const tris = geometry.index ? geometry.index.count / 3 : geometry.attributes.position.count / 3;
    document.getElementById('stat-triangles').textContent = Math.round(tris).toLocaleString('tr');
    document.getElementById('stat-x').textContent = `${(size.x).toFixed(1)} mm`;
    document.getElementById('stat-y').textContent = `${(size.y).toFixed(1)} mm`;
    document.getElementById('stat-z').textContent = `${(size.z).toFixed(1)} mm`;
    document.getElementById('viewer-canvas-stats').style.display = 'flex';

    fitCamera();
    URL.revokeObjectURL(url);
    showViewerToast('Model yüklendi! 🎉');
  }, undefined, (err) => {
    console.error(err);
    showViewerToast('STL yüklenirken hata oluştu.');
  });
}

function clearFile() {
  if (viewerState?.mesh) {
    viewerState.scene.remove(viewerState.mesh);
    viewerState.mesh.geometry.dispose();
    viewerState.mesh = null;
  }
  // Show placeholder again
  if (viewerState?.placeholder) viewerState.placeholder.visible = true;
  document.getElementById('upload-file-info').style.display = 'none';
  document.getElementById('viewer-canvas-hint').style.display = 'flex';
  document.getElementById('viewer-canvas-stats').style.display = 'none';
  document.getElementById('viewer-file-input').value = '';
}

function fitCamera() {
  if (!viewerState?.mesh) return;
  const box = new THREE.Box3().setFromObject(viewerState.mesh);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = viewerState.camera.fov * (Math.PI / 180);
  const dist = maxDim / (2 * Math.tan(fov / 2));

  viewerState.controls.target.copy(center);
  viewerState.camera.position.set(center.x, center.y + maxDim * 0.3, center.z + dist * 1.4);
  viewerState.camera.lookAt(center);
  viewerState.controls.update();
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function showViewerToast(msg) {
  let c = document.getElementById('toast-container');
  if (!c) { c = document.createElement('div'); c.id = 'toast-container'; document.body.appendChild(c); }
  const t = document.createElement('div');
  t.className = 'shop-toast'; t.textContent = msg;
  c.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 380); }, 3000);
}
