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
            <input type="file" id="viewer-file-input" accept=".stl" style="display:none;" multiple />
          </div>

          <!-- File List (shown after uploads) -->
          <div class="viewer-file-list" id="viewer-file-list" style="display:none;"></div>

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
              ${[
                {key:'PLA+',    label:'PLA+'},
                {key:'PETG',    label:'PETG'},
                {key:'ABS',     label:'ABS'},
                {key:'TPU',     label:'TPU'},
                {key:'ASA',     label:'ASA'},
                {key:'CF-PLA',  label:'CF-PLA'},
                {key:'Resin',   label:'Resin'},
                {key:'Silk',    label:'Silk'},
                {key:'Matte',   label:'Matte'},
                {key:'Wood',    label:'Wood'},
                {key:'HIPS',    label:'HIPS'},
                {key:'Nylon',   label:'Nylon'},
              ].map((m, i) => `
                <button class="viewer-mat-chip ${i===0?'active':''}" data-mat="${m.key}">${m.label}</button>
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
              <span class="viewer-stat-label">Yatay Uzunluk</span>
              <span class="viewer-stat-val" id="stat-x">-</span>
            </div>
            <div class="viewer-stat">
              <span class="viewer-stat-label">En</span>
              <span class="viewer-stat-val" id="stat-y">-</span>
            </div>
            <div class="viewer-stat">
              <span class="viewer-stat-label">Uzunluk</span>
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
              <span class="eco-label">PLA+ Filament (700 TL/kg)</span>
              <span class="eco-value">~70 TL</span>
            </div>
            <div class="eco-row">
              <span class="eco-label">Elektrik (~3 Saat)</span>
              <span class="eco-value">~2.7 TL</span>
            </div>
            <div class="eco-row">
              <span class="eco-label">Bakım &amp; Amortisman</span>
              <span class="eco-value">~6 TL</span>
            </div>
            <div class="eco-row" style="border-top:1px solid rgba(255,255,255,0.08);margin-top:8px;padding-top:8px;">
              <span class="eco-label" style="font-size:0.68rem;color:#64748B;">💡 Gram Başına Maliyet Tablosu</span>
            </div>
            <div class="eco-row"><span class="eco-label">PLA+</span><span class="eco-value">₺0.70/g</span></div>
            <div class="eco-row"><span class="eco-label">PETG</span><span class="eco-value">₺0.90/g</span></div>
            <div class="eco-row"><span class="eco-label">ABS</span><span class="eco-value">₺0.75/g</span></div>
            <div class="eco-row"><span class="eco-label">TPU</span><span class="eco-value">₺1.10/g</span></div>
            <div class="eco-row"><span class="eco-label">ASA</span><span class="eco-value">₺0.85/g</span></div>
            <div class="eco-row"><span class="eco-label">CF-PLA</span><span class="eco-value">₺1.50/g</span></div>
            <div class="eco-row"><span class="eco-label">Resin</span><span class="eco-value">₺1.00/g</span></div>
            <div class="eco-row"><span class="eco-label">Silk PLA</span><span class="eco-value">₺1.00/g</span></div>
            <div class="eco-row"><span class="eco-label">Matte PLA</span><span class="eco-value">₺0.75/g</span></div>
            <div class="eco-row"><span class="eco-label">Wood PLA</span><span class="eco-value">₺1.10/g</span></div>
            <div class="eco-row"><span class="eco-label">HIPS</span><span class="eco-value">₺0.80/g</span></div>
            <div class="eco-row"><span class="eco-label">Nylon PA</span><span class="eco-value">₺1.60/g</span></div>
            <div class="eco-total">
              <span>~65.5 TL</span>
            </div>
          </div>

          <!-- Column 2: Calculator -->
          <div class="eco-card eco-card-dark" style="background:linear-gradient(145deg,#0F1623,#161E2E);border:1px solid rgba(123,170,247,0.2);position:relative;overflow:hidden;">
            <!-- Subtle glow top -->
            <div style="position:absolute;top:-40px;left:50%;transform:translateX(-50%);width:200px;height:80px;background:radial-gradient(ellipse,rgba(123,170,247,0.15) 0%,transparent 70%);pointer-events:none;"></div>

            <div class="eco-card-header" style="font-size:0.7rem;letter-spacing:0.1em;color:#7BAAF7;margin-bottom:18px;">🧮 MALİYET HESAPLAYICI</div>

            <!-- Filament buton grid -->
            <div style="margin-bottom:16px;">
              <div style="font-size:0.65rem;color:#64748B;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;">Filament Seç</div>
              <div id="eco-mat-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;"></div>
            </div>

            <!-- Seçili filament bilgisi -->
            <div id="eco-selected-banner" style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-radius:10px;background:rgba(123,170,247,0.08);border:1px solid rgba(123,170,247,0.2);margin-bottom:14px;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span id="eco-sel-icon" style="font-size:1.2rem;">🌿</span>
                <div>
                  <div id="eco-sel-name" style="font-size:0.82rem;font-weight:700;color:#E2E8F0;">PLA+</div>
                  <div id="eco-sel-desc" style="font-size:0.65rem;color:#64748B;">Kolay baskı · Biyobozunur</div>
                </div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:0.65rem;color:#64748B;">gram başına</div>
                <div id="eco-sel-pgram" style="font-size:1rem;font-weight:800;color:#7BAAF7;font-family:monospace;">₺0.70</div>
              </div>
            </div>

            <!-- Parametreler yan yana -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">
              <div class="eco-input-group" style="margin:0;">
                <label>AĞIRLIK (G)</label>
                <input type="number" id="calc-weight" value="100" style="padding:10px;font-size:0.9rem;" />
              </div>
              <div class="eco-input-group" style="margin:0;">
                <label>SÜRE (SAAT)</label>
                <input type="number" id="calc-time" value="3" style="padding:10px;font-size:0.9rem;" />
              </div>
            </div>

            <!-- Gizli kg fiyat input (JS için) -->
            <input type="hidden" id="calc-fil-price" value="700" />

            <!-- Hesapla butonu -->
            <button id="eco-calc-btn" style="width:100%;padding:13px;border-radius:12px;border:none;background:linear-gradient(135deg,#3D5278,#5B7AB0);color:#fff;font-size:0.92rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.2s;margin-bottom:14px;">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 20h16a2 2 0 002-2V8a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              Hesapla
            </button>

            <!-- Sonuç kutusu -->
            <div id="eco-result-card" style="border-radius:14px;background:linear-gradient(135deg,rgba(34,197,94,0.08),rgba(16,185,129,0.05));border:1px solid rgba(34,197,94,0.25);padding:16px;">
              <div style="font-size:0.62rem;color:#64748B;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:6px;">TAHMİNİ TOPLAM MALİYET</div>
              <div id="calc-total-cost" style="font-size:2.2rem;font-weight:900;color:#22C55E;font-family:monospace;line-height:1;">70.00 TL</div>
              <div style="margin-top:10px;display:flex;flex-direction:column;gap:4px;">
                <div style="display:flex;justify-content:space-between;font-size:0.7rem;">
                  <span style="color:#64748B;">Filament</span>
                  <span id="eco-breakdown-fil" style="color:#94A3B8;font-family:monospace;">₺70.00</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:0.7rem;">
                  <span style="color:#64748B;">Elektrik</span>
                  <span id="eco-breakdown-elec" style="color:#94A3B8;font-family:monospace;">₺2.70</span>
                </div>
                <div style="height:1px;background:rgba(255,255,255,0.06);margin:4px 0;"></div>
                <div style="display:flex;justify-content:space-between;font-size:0.7rem;">
                  <span style="color:#64748B;">Gram başına</span>
                  <span id="eco-breakdown-pg" style="color:#22C55E;font-family:monospace;font-weight:700;">₺0.70/g</span>
                </div>
              </div>
            </div>
            <p style="font-size:0.6rem;color:#374151;margin-top:8px;text-align:center;">Filament + Elektrik (150W/6₺ kWh) dahil</p>
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
  scene.background = new THREE.Color(0x060A14); // Derin koyu mavi — tok kontrast

  const camera = new THREE.PerspectiveCamera(45, 16 / 10, 0.01, 1000);
  camera.position.set(0, 2, 6);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

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

  // Lights — Soft Studio
  scene.add(new THREE.AmbientLight(0xffffff, 1.8));
  const keyLight = new THREE.DirectionalLight(0xfff8f0, 3.5);
  keyLight.position.set(5, 8, 6);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xf0f5ff, 1.5);
  fillLight.position.set(-5, 2, 3);
  scene.add(fillLight);
  const rimLight = new THREE.PointLight(0xddeeff, 2.0, 80);
  rimLight.position.set(0, 10, -8);
  scene.add(rimLight);
  const topLight = new THREE.DirectionalLight(0xffffff, 0.8);
  topLight.position.set(0, -5, 5);
  scene.add(topLight);

  // Grid floor — görünür, derin mavi
  const grid = new THREE.GridHelper(20, 30, 0x1a2a6e, 0x0d1429);
  grid.position.y = -1.5;
  scene.add(grid);

  // Placeholder küp — tok ve dramatik
  const placeholderGeo = new THREE.BoxGeometry(1, 1, 1);
  const placeholderMat = new THREE.MeshPhongMaterial({
    color: 0x3B2FFF,
    emissive: 0x1A0880,
    specular: 0xC0C0FF,
    shininess: 100,
    transparent: true,
    opacity: 0.55,
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
    modelSize: null,
    selectedMaterial: 'PLA+',
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
  document.querySelectorAll('.viewer-mat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.viewer-mat-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const mat = chip.dataset.mat;
      if (viewerState) {
        viewerState.selectedMaterial = mat;
      }
      recalculatePrice();
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


  // ── Eco Calculator — Yeni Görsel Hesaplayıcı ────────────────────
  const ECO_MATS = [
    { key:'pla',   name:'PLA+',     icon:'🌿', kg:700,  pg:0.70, desc:'Kolay baskı · Biyobozunur',    color:'#22C55E' },
    { key:'petg',  name:'PETG',     icon:'💧', kg:900,  pg:0.90, desc:'Dayanıklı · Şeffaf seçenek',   color:'#3B82F6' },
    { key:'abs',   name:'ABS',      icon:'🔧', kg:750,  pg:0.75, desc:'Isıya dayanıklı · Sert',       color:'#F59E0B' },
    { key:'tpu',   name:'TPU',      icon:'🧲', kg:1100, pg:1.10, desc:'Esnek · Çarpma emici',         color:'#EC4899' },
    { key:'asa',   name:'ASA',      icon:'☀️', kg:850,  pg:0.85, desc:'UV dayanımlı · Dış mekan',    color:'#F97316' },
    { key:'cf',    name:'CF-PLA',   icon:'⚡', kg:1500, pg:1.50, desc:'Karbon takviyeli · Ultra sert', color:'#6366F1' },
    { key:'resin', name:'Resin',    icon:'💎', kg:1000, pg:1.00, desc:'Yüksek detay · SLA/MSLA',      color:'#8B5CF6' },
    { key:'silk',  name:'Silk',     icon:'✨', kg:1000, pg:1.00, desc:'İpeksi parlaklık · Dekoratif', color:'#F0ABFC' },
    { key:'matte', name:'Matte',    icon:'🎨', kg:750,  pg:0.75, desc:'Mat yüzey · Modern estetik',   color:'#94A3B8' },
    { key:'wood',  name:'Wood',     icon:'🪵', kg:1100, pg:1.10, desc:'Ahşap dokulu · Boyanabilir',   color:'#A16207' },
    { key:'hips',  name:'HIPS',     icon:'🔩', kg:800,  pg:0.80, desc:'ABS destek · Kimyasal çözünür',color:'#D4D4D8' },
    { key:'nylon', name:'Nylon',    icon:'⚙️', kg:1600, pg:1.60, desc:'Mühendislik sınıfı · PA',      color:'#7C3AED' },
  ];

  let ecoSelMat = ECO_MATS[0];

  function buildEcoMatGrid() {
    const grid = document.getElementById('eco-mat-grid');
    if (!grid) return;
    grid.innerHTML = '';
    ECO_MATS.forEach(mat => {
      const btn = document.createElement('button');
      btn.title = mat.name;
      btn.style.cssText = `
        display:flex;flex-direction:column;align-items:center;gap:3px;
        padding:8px 4px;border-radius:10px;cursor:pointer;transition:all 0.18s;
        border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);
        font-size:0.58rem;font-weight:700;color:#64748B;
      `;
      btn.innerHTML = `<span style="font-size:1.1rem;">${mat.icon}</span><span style="letter-spacing:0.02em;">${mat.name}</span>`;
      btn.addEventListener('click', () => {
        ecoSelMat = mat;
        // Aktif stil
        grid.querySelectorAll('button').forEach(b => {
          b.style.borderColor = 'rgba(255,255,255,0.08)';
          b.style.background = 'rgba(255,255,255,0.03)';
          b.style.color = '#64748B';
        });
        btn.style.borderColor = mat.color + '88';
        btn.style.background = mat.color + '18';
        btn.style.color = mat.color;
        // Banner güncelle
        updateEcoBanner(mat);
        // Fiyat input güncelle
        const priceInput = document.getElementById('calc-fil-price');
        if (priceInput) priceInput.value = mat.kg;
        runEcoCalc();
      });
      if (mat.key === 'pla') {
        // Varsayılan aktif
        setTimeout(() => btn.click(), 50);
      }
      grid.appendChild(btn);
    });
  }

  function updateEcoBanner(mat) {
    const icon = document.getElementById('eco-sel-icon');
    const name = document.getElementById('eco-sel-name');
    const desc = document.getElementById('eco-sel-desc');
    const pg   = document.getElementById('eco-sel-pgram');
    const banner = document.getElementById('eco-selected-banner');
    if (icon) icon.textContent = mat.icon;
    if (name) { name.textContent = mat.name; name.style.color = mat.color; }
    if (desc) desc.textContent = mat.desc;
    if (pg)   { pg.textContent = `₺${mat.pg.toFixed(2)}`; pg.style.color = mat.color; }
    if (banner) banner.style.borderColor = mat.color + '44';
  }

  function runEcoCalc() {
    const filPrice = parseFloat(document.getElementById('calc-fil-price')?.value) || ecoSelMat.kg;
    const weight   = parseFloat(document.getElementById('calc-weight')?.value)    || 100;
    const time     = parseFloat(document.getElementById('calc-time')?.value)      || 3;
    const filCost  = filPrice * (weight / 1000);
    const elecCost = 0.15 * time * 6;
    const perGram  = filPrice / 1000;
    const total    = filCost + elecCost;

    const totalEl = document.getElementById('calc-total-cost');
    const filEl   = document.getElementById('eco-breakdown-fil');
    const elecEl  = document.getElementById('eco-breakdown-elec');
    const pgEl    = document.getElementById('eco-breakdown-pg');

    if (totalEl) { totalEl.textContent = total.toFixed(2) + ' TL'; totalEl.style.color = ecoSelMat.color || '#22C55E'; }
    if (filEl)   filEl.textContent   = `₺${filCost.toFixed(2)}`;
    if (elecEl)  elecEl.textContent  = `₺${elecCost.toFixed(2)}`;
    if (pgEl)    { pgEl.textContent  = `₺${perGram.toFixed(2)}/g`; pgEl.style.color = ecoSelMat.color || '#22C55E'; }

    // Sonuç kutusu rengi güncelle
    const card = document.getElementById('eco-result-card');
    if (card) card.style.borderColor = (ecoSelMat.color || '#22C55E') + '44';
  }

  buildEcoMatGrid();
  document.getElementById('eco-calc-btn')?.addEventListener('click', runEcoCalc);
  // Girdi değişince canlı hesapla
  ['calc-weight','calc-time'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', runEcoCalc);
  });
  setTimeout(runEcoCalc, 300);
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
    viewerState.modelSize = size; // Store geometry sizes for dynamic pricing

    // Move grid to bottom of model
    const scaledMin = geometry.boundingBox.min.y * scale;
    viewerState.grid.position.y = scaledMin - 0.05;

    // Update stats
    document.getElementById('stat-x').textContent = `${(size.x).toFixed(1)} mm`;
    document.getElementById('stat-y').textContent = `${(size.y).toFixed(1)} mm`;
    document.getElementById('stat-z').textContent = `${(size.z).toFixed(1)} mm`;
    document.getElementById('viewer-canvas-stats').style.display = 'flex';

    recalculatePrice(); // Recalculate price dynamically based on size and material

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
  if (viewerState) {
    viewerState.modelSize = null; // Clear dimension metrics
  }
  // Show placeholder again
  if (viewerState?.placeholder) viewerState.placeholder.visible = true;
  document.getElementById('upload-file-info').style.display = 'none';
  document.getElementById('viewer-canvas-hint').style.display = 'flex';
  document.getElementById('viewer-canvas-stats').style.display = 'none';
  document.getElementById('viewer-file-input').value = '';
  recalculatePrice(); // Reset price display
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

// ══════════════════════════════════════════════════════
// DYNAMIC PRICING ENGINE — Boyut Bazlı Fiyatlandırma
// Türkiye piyasası 2026 ortalama filament fiyatları
// ══════════════════════════════════════════════════════
const FILAMENT_COSTS = {
  // Standart filamentler
  'PLA+':   { pricePerGram: 0.70, density: 1.24, label: 'PLA+' },
  'PETG':   { pricePerGram: 0.90, density: 1.27, label: 'PETG' },
  'ABS':    { pricePerGram: 0.75, density: 1.04, label: 'ABS' },
  'TPU':    { pricePerGram: 1.10, density: 1.20, label: 'TPU' },
  'ASA':    { pricePerGram: 0.85, density: 1.07, label: 'ASA' },
  'CF-PLA': { pricePerGram: 1.50, density: 1.30, label: 'CF-PLA' },
  'Resin':  { pricePerGram: 1.00, density: 1.15, label: 'Resin' },
  // Yeni filament çeşitleri
  'Silk':   { pricePerGram: 1.00, density: 1.24, label: 'Silk PLA' },
  'Matte':  { pricePerGram: 0.75, density: 1.24, label: 'Matte PLA' },
  'Wood':   { pricePerGram: 1.10, density: 1.28, label: 'Wood PLA' },
  'HIPS':   { pricePerGram: 0.80, density: 1.04, label: 'HIPS' },
  'Nylon':  { pricePerGram: 1.60, density: 1.14, label: 'Nylon PA' },
};

// Boyut kılavuzu: mm cinsinden baskı alanı (X·Y) ve yükseklik (Z) bazlı fiyat
// Formül: baskı_alanı_cm² × birim_alan_fiyat + yükseklik_cm × birim_yük_fiyat + malzeme
const BASE_AREA_PRICE = 1.2;   // ₺ / cm² baskı tabanı
const BASE_HEIGHT_PRICE = 3.5; // ₺ / cm yükseklik
const PROFIT_MARGIN = 0.38;    // %62 karlılık (maliyet / 0.38 = satış fiyatı)

function recalculatePrice() {
  const priceEl = document.getElementById('viewer-price');
  if (!priceEl) return;

  const mat = viewerState?.selectedMaterial || 'PLA+';
  const filInfo = FILAMENT_COSTS[mat] || FILAMENT_COSTS['PLA+'];

  if (!viewerState?.modelSize) {
    // Boyut yok: sadece malzeme bazlı başlangıç fiyatı
    const baseCostPer100g = filInfo.pricePerGram * 100;
    const baseRetail = Math.round(baseCostPer100g / PROFIT_MARGIN);
    priceEl.textContent = `₺${baseRetail}+`;
    return;
  }

  const size = viewerState.modelSize; // mm cinsinden

  // ── 1. Boyut bazlı fiyat bileşeni ──
  const areaX_cm = size.x / 10;   // mm → cm
  const areaY_cm = size.y / 10;
  const heightZ_cm = size.z / 10;

  // Baskı tabanı alanı (X × Y cm²)
  const printArea_cm2 = areaX_cm * areaY_cm;
  const areaPrice = printArea_cm2 * BASE_AREA_PRICE;

  // Yükseklik katkısı
  const heightPrice = heightZ_cm * BASE_HEIGHT_PRICE;

  // ── 2. Malzeme (filament) maliyet bileşeni ──
  const rawVolume_cm3 = (size.x * size.y * size.z) / 1000;
  // Doluluk katsayısı: küçük parçalar daha katı
  let solidFactor = 0.22;
  if (rawVolume_cm3 > 100) solidFactor = 0.16;
  if (rawVolume_cm3 > 500) solidFactor = 0.11;
  const estWeight_g = Math.max(2, rawVolume_cm3 * solidFactor * filInfo.density);
  const materialCost = estWeight_g * filInfo.pricePerGram;

  // ── 3. Elektrik maliyeti ──
  const estTimeHours = Math.max(0.5, estWeight_g / 18);
  const electricityCost = estTimeHours * 0.15 * 6;

  // ── 4. Toplam maliyet → satış fiyatı ──
  const totalCost = materialCost + electricityCost + areaPrice + heightPrice;
  const salePrice = totalCost / PROFIT_MARGIN;

  // ── 5. Boyut özet bilgisi ──
  const breakdown = `${size.x.toFixed(0)}×${size.y.toFixed(0)}×${size.z.toFixed(0)}mm · ~${estWeight_g.toFixed(0)}g`;

  priceEl.textContent = `₺${Math.round(salePrice)}`;

  // Yardımcı bilgi: breakdown satırı göster
  let subEl = document.getElementById('viewer-price-sub');
  if (!subEl) {
    subEl = document.createElement('div');
    subEl.id = 'viewer-price-sub';
    subEl.style.cssText = 'font-size:0.6rem;color:#64748B;font-family:monospace;margin-top:2px;';
    priceEl.parentNode.appendChild(subEl);
  }
  subEl.textContent = breakdown;
}
