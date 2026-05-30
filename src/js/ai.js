/**
 * CustomShape3D — AI Design Assistant Module
 * Soru sormaz · Doğrudan tasarlar · 3D önizleme günceller
 */

import * as THREE from 'three';
import { MATERIALS_DB } from './shop.js';
import { askQwen } from './qwen.js';

// ══════════════════════════════════════════════════════
// AI STATE
// ══════════════════════════════════════════════════════
const aiState = {
  currentModel: 'vase',
  vaseStyle: 'wave',   // wave | straight | spiral | tapered | bulge
  vaseColor: '#34D399',
  scene: null,
  camera: null,
  renderer: null,
  group: null,
  keyLight: null,
  active: false,
  rafId: null,
  clock: null,
  messages: [],
};

// ══════════════════════════════════════════════════════
// RESPONSE BANK — Turkish, no questions!
// ══════════════════════════════════════════════════════
const RESPONSES = [
  // Vase modifications
  {
    keys: ['düz vazo','düz bir vazo','silindirik vazo','sade vazo','düz hal','vazonun düz','düz şekil'],
    action: () => switchVaseStyle('straight'),
    reply: (p) => `Düz silindirik vazo hazır! 🏺\n\n**Boyutlar:** 180mm yükseklik × 80mm çap\n**Önerilen malzeme:** PETG — su geçirmez, pürüzsüz yüzey\n**Baskı süresi:** ~5 saat (0.2mm katman)\n**Tahmini fiyat:** ₺95\n\nSağ panelde canlı 3D önizlemeyi görebilirsiniz. Farklı malzeme veya renk seçmek ister misiniz?`,
    actions: ['spiral yap','daha geniş yap','PETG seç','sepete ekle'],
  },
  {
    keys: ['spiral vazo','sarmal vazo','helikal vazo','dönen vazo','burgulu'],
    action: () => switchVaseStyle('spiral'),
    reply: () => `Spiral vazo tasarımı oluşturuldu! 🌀\n\n**Yükseklik:** 180mm | **Çap:** 80mm\n**Sarmal:** 3 tam dönüş\n**Önerilen:** PETG veya Resin (ultra detay)\n**Baskı notu:** Spiral formlar için destek yapısı önerilmez — spiral kendi kendini taşır.\n**Fiyat:** ₺110–₺320 (malzemeye göre)`,
    actions: ['dalga yap','düz yap','resin seç'],
  },
  {
    keys: ['dalga vazo','dalgalı vazo','wave vazo','dalga geri','dalgalı geri'],
    action: () => switchVaseStyle('wave'),
    reply: () => `Dalga vazo tasarımına geri döndük! 〰️\n\n**Dalga frekansı:** 7 çevrim\n**Dalga genliği:** 8mm\n**İdeal:** PETG — dalga detaylarını mükemmel yansıtır.\n**Baskı kalitesi:** 0.15mm katman önerilir.`,
    actions: ['düz yap','spiral yap','renk değiştir'],
  },
  {
    keys: ['şişkin vazo','balon vazo','geniş vazo','yuvarlak vazo','küresel'],
    action: () => switchVaseStyle('bulge'),
    reply: () => `Şişkin / balon vazo hazır! 🫧\n\n**Form:** Merkezden şişen, dar tabanlı\n**Kapasite:** Standarta göre %40 daha geniş\n**Not:** Bu form PLA+ ile harika çalışır — ağırlık merkezi düşük, stabil.\n**Fiyat:** ₺105`,
    actions: ['düz yap','daralt','PLA seç'],
  },
  {
    keys: ['konik vazo','daralan vazo','üstten dar','koni şekli'],
    action: () => switchVaseStyle('tapered'),
    reply: () => `Konik / daralan vazo oluşturuldu! 📐\n\n**Taban çapı:** 90mm | **Üst çap:** 45mm\n**Bu form:** Ağırlık merkezini aşağıda tutar, devrilmeye karşı dayanıklı.\n**İdeal malzeme:** ABS — ısı dayanımı yüksek.`,
    actions: ['genişlet','spiral ekle','ABS seç'],
  },

  // Material queries
  {
    keys: ['pla nedir','pla özellikleri','pla hakkında'],
    action: null,
    reply: () => `**PLA+ Özellikleri** 🌿\n\nEn popüler 3D baskı malzemesi:\n• **Sıcaklık:** 200°C baskı, 60°C tabla\n• **Mukavemet:** Orta-yüksek\n• **Esneklik:** Rijit (kırılgan değil)\n• **Avantaj:** Kolay baskı, biyobozunur, renk yelpazesi geniş\n• **Dezavantaj:** 60°C üzerinde deforme olabilir\n• **Kullanım:** Dekor, prototip, aksesuar\n• **Fiyat çarpanı:** ×1.0 (baz fiyat)`,
    actions: ['PETG göster','ABS göster','CF-PLA göster'],
  },
  {
    keys: ['petg nedir','petg özellikleri','petg hakkında'],
    action: null,
    reply: () => `**PETG Özellikleri** 💧\n\nGıda güvenli, su geçirmez polimer:\n• **Sıcaklık:** 235°C baskı\n• **Isı dayanımı:** 80°C\n• **Özellik:** Yarı şeffaf olabilir, çok güzel parlaklık\n• **Avantaj:** PLA kadar kolay, ABS kadar güçlü\n• **Gıda güvenli:** Evet (doğru baskı koşullarında)\n• **Kullanım:** Vazo, kap, dış mekan parçaları\n• **Fiyat çarpanı:** ×1.30`,
    actions: ['ABS göster','Resin göster','TPU göster'],
  },
  {
    keys: ['abs nedir','abs özellikleri'],
    action: null,
    reply: () => `**ABS Özellikleri** 🔥\n\nEndüstriyel standart polimer:\n• **Sıcaklık:** 240°C baskı, kapalı kasa gerektirir\n• **Isı dayanımı:** 105°C\n• **Avantaj:** Sert, darbe dayanımlı, işlenebilir\n• **Dezavantaj:** Büzülme riski, iyi havalandırma gerektirir\n• **Kullanım:** Otomotiv, mekanik parçalar, dronlar\n• **Fiyat çarpanı:** ×1.20`,
    actions: ['CF-PLA göster','PETG göster'],
  },
  {
    keys: ['tpu nedir','tpu özellikleri','esnek filament','kauçuk baskı'],
    action: null,
    reply: () => `**TPU Özellikleri** 🤸\n\nTermoplastik Poliüretan — esnek:\n• **Sıcaklık:** 220°C\n• **Esneklik:** Lastik gibi — katlanır, bükülür, geri döner\n• **Çekme mukavemeti:** Çok yüksek\n• **Kullanım:** Kılıf, conta, ayakkabı tabanlığı, kablo tutucu\n• **Baskı notu:** Yavaş baskı (25mm/s) önerilir\n• **Fiyat çarpanı:** ×1.50`,
    actions: ['PLA göster','PETG göster'],
  },
  {
    keys: ['cf pla','karbon fiber','karbon'],
    action: null,
    reply: () => `**CF-PLA (Karbon Fiber) Özellikleri** ⚡\n\nKarbon fiber takviyeli yüksek performans:\n• **Mukavemet:** PLA'nın 2.5 katı\n• **Ağırlık:** %20 daha hafif\n• **Yüzey:** Matte karbon doku görünümü\n• **Önemli:** Abrasif — sertleştirilmiş çelik nozzle gerektirir\n• **Kullanım:** Drone, robot parçaları, yarışa hazır bileşenler\n• **Fiyat çarpanı:** ×2.40`,
    actions: ['Drone için CF seç','PETG göster'],
  },
  {
    keys: ['resin nedir','resin özellikleri','uv resin'],
    action: null,
    reply: () => `**Resin (UV Kürlenen) Özellikleri** 💎\n\nUltra yüksek detay için:\n• **Katman yüksekliği:** 0.025–0.05mm (FDM'in 4-8 katı detay)\n• **Yüzey:** Ayna pürüzsüzlüğü, post-process gerektirir\n• **Kullanım:** Minyatür, maket, takı, sanat objesi\n• **Dezavantaj:** Kırılgan, UV'den koruma gerektirir\n• **Özel gereksinim:** UV fırın ile kürleme\n• **Fiyat çarpanı:** ×2.80`,
    actions: ['Resin ile maket seç','Mini ev modeli'],
  },

  // Print quality
  {
    keys: ['hızlı baskı','çabuk','ucuz baskı','ekonomik baskı','draft'],
    action: null,
    reply: () => `**Taslak Kalite (0.3mm)** ⚡\n\nEn hızlı, en ekonomik seçenek:\n• **Hız:** Normal baskının 2 katı\n• **Detay:** Düşük — yüzey çizgileri görünür\n• **Kullanım:** Fonksiyonel prototip, test parçaları\n• **Fiyat:** Baz fiyatın ×0.75'i\n• **Uyarı:** Dekoratif veya görünür parçalar için önerilmez`,
    actions: ['standart kalite','ince kalite'],
  },
  {
    keys: ['kaliteli baskı','yüksek kalite','detaylı baskı','ince baskı','fine'],
    action: null,
    reply: () => `**İnce Kalite (0.1mm)** 🔬\n\nProfesyonel sonuç için:\n• **Katman:** 0.1mm — parmakla hissedilemez çizgiler\n• **Süre:** Standarda göre 2.5× daha uzun\n• **Sonuç:** Yüzey düzgünlüğü mükemmel\n• **İdeal:** Görünür parçalar, dekor, hediye\n• **Fiyat:** Baz fiyatın ×1.55'i`,
    actions: ['ultra kalite','standart kalite'],
  },

  // Specific product requests
  {
    keys: ['drone yap','drone tasarla','fpv drone','racing drone'],
    action: () => switchAIModel('drone'),
    reply: () => `FPV Racing Drone gövdesi yüklendi! 🚁\n\n**Wheelbase:** 220mm\n**Ağırlık:** ~85g (CF-PLA ile)\n**Motor desteği:** 2205-2306 boyut\n**Önerilen malzeme:** CF-PLA — maksimum dayanım, minimum ağırlık\n**Kamera yuvası:** GoPro / Runcam uyumlu\n**Baskı süresi:** ~12 saat\n**Fiyat:** ₺280–₺672 (malzemeye göre)`,
    actions: ['CF-PLA seç','sepete ekle','renk değiştir'],
  },
  {
    keys: ['dişli','gear','mekanizma yap','çark'],
    action: () => switchAIModel('gear'),
    reply: () => `Dişli mekanizma seti hazırlandı! ⚙️\n\n**Oran:** 2.7:1 redüksiyon\n**Büyük dişli:** 20 diş\n**Orta dişli:** 12 diş\n**Küçük dişli:** 8 diş\n**Malzeme önerisi:** PETG — düşük sürtünme, iyi aşınma direnci\n**Yağlama:** PTFE bazlı gres ile 6 ayda bir`,
    actions: ['PETG seç','ABS seç','daha büyük yap'],
  },
  {
    keys: ['telefon standı','telefon tutucu','stand yap'],
    action: () => switchAIModel('phone'),
    reply: () => `Telefon standı tasarımı hazır! 📱\n\n**Açı:** 15°–75° arası ayarlanabilir\n**Uyum:** 4"–13" ekran\n**Kablo deliği:** USB-C / Lightning uyumlu\n**Taban:** Anti-slip kaplama (TPU ile)\n**Önerilen:** PLA+ (rijit stand için) veya TPU (grip için)\n**Ağırlık:** 45g`,
    actions: ['PLA seç','TPU seç','sepete ekle'],
  },

  // Design modifications
  {
    keys: ['büyüt','daha büyük','büyük yap','boyutu arttır','genişlet'],
    action: () => scaleAIModel(1.25),
    reply: () => `Boyut %25 artırıldı! 📏\n\nYeni boyutlar hesaplandı:\n• **Ağırlık:** +%25 malzeme kullanımı\n• **Süre:** +%25 baskı süresi\n• **Fiyat:** Orantılı artış\n\nDaha da büyütmek ister misiniz?`,
    actions: ['tekrar büyüt','küçült','orijinal boyut'],
  },
  {
    keys: ['küçült','daha küçük','küçük yap','boyutu azalt','daralt'],
    action: () => scaleAIModel(0.80),
    reply: () => `Boyut %20 küçültüldü! 📐\n\nDaha kompakt versiyon:\n• **Malzeme:** %20 tasarruf\n• **Süre:** %20 kısalma\n• **Fiyat:** Düşecek\n\nHâlâ çok büyük mü?`,
    actions: ['tekrar küçült','büyüt','orijinal boyut'],
  },
  {
    keys: ['renk değiştir','renk seç','farklı renk','renge bak'],
    action: null,
    reply: () => `Renk seçenekleri için mağaza kartındaki **renk dairelerine** tıklayabilirsiniz 🎨\n\nPopüler seçimler:\n• **Siyah** → Şık, profesyonel\n• **Beyaz** → Minimalist, clean\n• **Metalik Gri** → Endüstriyel görünüm\n• **Özel renk** → RAL/Pantone renk kodunu bize gönderin\n\nHangi ürün için renk seçmek istersiniz?`,
    actions: ['kırmızı yap','siyah yap','beyaz yap'],
  },

  // Color shortcuts
  {
    keys: ['kırmızı yap','kırmızı renk','kırmızı'],
    action: () => tintAIModel('#EF4444'),
    reply: () => `Kırmızı uygulandı! 🔴 RAL 3020 trafik kırmızısı tonunda. Tam matte veya parlak yüzey için baskı sonrası boyama da mümkün.`,
    actions: ['siyah yap','beyaz yap'],
  },
  {
    keys: ['siyah yap','siyah renk','mat siyah'],
    action: () => tintAIModel('#111827'),
    reply: () => `Siyah uygulandı! ⚫ Gece serisi. CF-PLA seçerseniz doğal karbon fiber doku eşlik eder — ekstra maliyet yok.`,
    actions: ['beyaz yap','kırmızı yap','karbon fiber'],
  },
  {
    keys: ['beyaz yap','beyaz renk','buz beyazı'],
    action: () => tintAIModel('#F9FAFB'),
    reply: () => `Beyaz uygulandı! ⚪ İskandinav minimalist tarz. Resin seçerseniz fildişi-beyaz yüzey pürüzsüzlüğü elde edersiniz.`,
    actions: ['resin seç','siyah yap'],
  },

  // Price & delivery
  {
    keys: ['fiyat','ne kadar','kaç para','maliyet','ücret'],
    action: null,
    reply: () => `**Fiyatlandırma** 💰\n\nFiyat 3 faktöre bağlı:\n\n1. **Baz fiyat** — modele göre ₺45–₺320\n2. **Malzeme çarpanı** — PLA+ (×1.0) → Resin (×2.8)\n3. **Kalite çarpanı** — Taslak (×0.75) → Ultra (×2.2)\n\n**Örnek:** Dalga vazo + PETG + Standart = ₺95×1.3×1.0 = ₺124\n\nHer kart üzerinde canlı fiyat hesaplayıcı mevcut!`,
    actions: ['ucuzunu göster','en iyisi ne'],
  },
  {
    keys: ['teslimat','ne zaman gelir','kargo','gönderim','süre'],
    action: null,
    reply: () => `**Teslimat Süreleri** 📦\n\n• **Taslak kalite:** 24 saat baskı + kargo\n• **Standart:** 48 saat + kargo\n• **İnce/Ultra:** 72–96 saat + kargo\n\n**Kargo:**\n• Türkiye içi standart: 1–3 iş günü\n• Ekspres (ek ücret): 1 iş günü\n\nSipariş verildikten sonra WhatsApp ile anlık takip bildirimi alırsınız! 🚚`,
    actions: ['sipariş ver','fiyat sor'],
  },

  // Generic help
  {
    keys: ['merhaba','selam','hey','hi','günaydın','iyi günler'],
    action: null,
    reply: () => `Merhaba! 👋 CustomShape3D AI Tasarım Asistanı'na hoş geldiniz!\n\n**Neler yapabilirim?**\n• 3D model tasarımını doğrudan değiştiririm\n• Filament malzeme önerisi sunarım\n• Canlı 3D önizleme ile tasarımı gösteririm\n• Baskı parametrelerini optimize ederim\n\n**Deneyin:** *"Dalga vazonun düz halini göster"* veya *"Drone için en iyi malzeme ne?"*`,
    actions: ['vazo tasarımı','drone yap','fiyat öğren'],
  },
  {
    keys: ['teşekkür','sağol','harika','süper','iyi','tamam'],
    action: null,
    reply: () => `Rica ederim! 😊 Başka bir tasarım denemek ister misiniz?`,
    actions: ['yeni tasarım','sepete ekle'],
  },
];

// Fallback
const FALLBACK_REPLY = (input) =>
  `"${input}" isteğini anladım! 🎯\n\nŞu anda bu konuda spesifik bir şablonum yok, ama size en yakın tasarımı oluşturuyorum. Daha spesifik olabilirsiniz: malzeme (PLA/PETG/ABS), boyut (küçük/orta/büyük) veya şekil (yuvarlak/köşeli/organik) belirtirseniz hemen uygularım!`;

// ══════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════
export function initAI() {
  renderAISection();
  initAI3DViewer();
  bindAIEvents();

  // Hero "AI ile Tasarla" button
  document.getElementById('btn-ai')?.addEventListener('click', () => {
    document.getElementById('ai')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Nav AI link
  document.querySelector('a[href="#ai"]')?.addEventListener('click', () => {
    setTimeout(() => document.getElementById('ai-input')?.focus(), 600);
  });
}

// ══════════════════════════════════════════════════════
// RENDER AI SECTION
// ══════════════════════════════════════════════════════
function renderAISection() {
  const section = document.getElementById('ai');
  if (!section) return;

  section.className = 'section section-alt';
  section.innerHTML = `
    <div class="container">
      <!-- Header -->
      <div class="section-header reveal">
        <div class="section-pill" style="color:#FBBF24;border-color:rgba(251,191,36,0.2);background:rgba(251,191,36,0.05)">
          <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#FBBF24;animation:pulse-dot 2s infinite;margin-right:4px"></span>
          Canlı AI Asistan
        </div>
        <h2 class="section-title">AI ile <span class="gradient-text">Tasarla</span></h2>
        <p class="section-desc">Doğal dille tasarım isteyin — AI hemen uygular, 3D önizleme anında güncellenir.</p>
      </div>

      <!-- Main layout -->
      <div class="ai-layout">

        <!-- Left: Chat -->
        <div class="ai-chat-panel">
          <!-- Messages -->
          <div class="ai-messages" id="ai-messages">
            <div class="ai-msg ai-msg--bot">
              <div class="ai-msg-avatar">
                <svg width="14" height="14" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                </svg>
              </div>
              <div class="ai-msg-bubble">
                <div class="ai-msg-name">CustomShape3D AI</div>
                <p>Merhaba! Ben tasarım asistanınızım. 🎨<br><br>
                <strong>Soru sormam</strong> — <em>doğrudan yaparım.</em><br><br>
                Deneyin: <em>"dalga vazonun düz halini istiyorum"</em> veya <em>"drone için CF-PLA ne kadar güçlü?"</em></p>
                <div class="ai-action-btns">
                  <button class="ai-action-btn" data-prompt="dalga vazonun düz halini istiyorum">Düz vazo</button>
                  <button class="ai-action-btn" data-prompt="spiral vazo yap">Spiral vazo</button>
                  <button class="ai-action-btn" data-prompt="CF-PLA hakkında bilgi ver">CF-PLA nedir?</button>
                  <button class="ai-action-btn" data-prompt="drone tasarla">Drone</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Suggested prompts -->
          <div class="ai-suggestions" id="ai-suggestions">
            <button class="ai-suggest" data-prompt="Dalga vazonun düz halini istiyorum">🏺 Düz vazo</button>
            <button class="ai-suggest" data-prompt="PETG malzeme özellikleri">💧 PETG nedir?</button>
            <button class="ai-suggest" data-prompt="En kaliteli baskı kalitesini seç">🔬 İnce kalite</button>
            <button class="ai-suggest" data-prompt="Teslimat süresi ne kadar">📦 Teslimat</button>
            <button class="ai-suggest" data-prompt="Drone tasarla CF-PLA ile">🚁 Drone</button>
            <button class="ai-suggest" data-prompt="Vazoyu büyüt">📏 Büyüt</button>
          </div>

          <!-- Input -->
          <div class="ai-input-bar">
            <div class="ai-input-wrap">
              <textarea
                id="ai-input"
                class="ai-input"
                placeholder="Tasarımınızı tarif edin… (örn: 'dalga vazonun düz halini istiyorum')"
                rows="1"
              ></textarea>
              <button class="ai-send-btn" id="ai-send-btn" aria-label="Gönder">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
            <p class="ai-input-hint">
              <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              AI soru sormaz — doğrudan tasarımı uygular. Türkçe veya İngilizce yazabilirsiniz.
            </p>
          </div>
        </div>

        <!-- Right: 3D Preview + Info -->
        <div class="ai-preview-panel">
          <div class="ai-preview-header">
            <div class="ai-preview-live">
              <span class="viewer-live-dot"></span> CANLI 3D ÖNİZLEME
            </div>
            <div class="ai-model-label" id="ai-model-label">Dalga Vazo</div>
          </div>

          <!-- 3D Canvas -->
          <div class="ai-canvas-wrap">
            <canvas id="ai-canvas" class="ai-canvas"></canvas>
          </div>

          <!-- Specs panel -->
          <div class="ai-specs-panel" id="ai-specs-panel">
            <div class="ai-spec-row">
              <span class="ai-spec-icon">📐</span>
              <span class="ai-spec-label">Boyut</span>
              <span class="ai-spec-val" id="ai-spec-size">80 × 80 × 180 mm</span>
            </div>
            <div class="ai-spec-row">
              <span class="ai-spec-icon">🧪</span>
              <span class="ai-spec-label">Malzeme</span>
              <span class="ai-spec-val" id="ai-spec-mat">PETG</span>
            </div>
            <div class="ai-spec-row">
              <span class="ai-spec-icon">⏱</span>
              <span class="ai-spec-label">Süre</span>
              <span class="ai-spec-val" id="ai-spec-time">~5 saat</span>
            </div>
            <div class="ai-spec-row">
              <span class="ai-spec-icon">💰</span>
              <span class="ai-spec-label">Fiyat</span>
              <span class="ai-spec-val" id="ai-spec-price">₺124</span>
            </div>
          </div>

          <!-- Material quick-pick -->
          <div class="ai-mat-row">
            ${Object.entries(MATERIALS_DB).map(([id, m]) =>
              `<button class="ai-mat-pill" data-mat="${id}" title="${m.desc}">${m.icon} ${m.name}</button>`
            ).join('')}
          </div>

          <!-- Add to cart -->
          <button class="ai-cart-btn" id="ai-cart-btn">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            Bu Tasarımı Sipariş Et
          </button>
        </div>
      </div>
    </div>
  `;
}

// ══════════════════════════════════════════════════════
// 3D VIEWER (AI Panel)
// ══════════════════════════════════════════════════════
function initAI3DViewer() {
  const canvas = document.getElementById('ai-canvas');
  if (!canvas) return;

  aiState.scene    = new THREE.Scene();
  aiState.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  aiState.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  aiState.renderer.setClearColor(0x000000, 0);
  aiState.clock    = new THREE.Clock();

  aiState.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  aiState.camera.position.set(0, 0.5, 5.5);

  function resize() {
    const w = canvas.offsetWidth  || 360;
    const h = canvas.offsetHeight || 320;
    aiState.renderer.setSize(w, h);
    aiState.camera.aspect = w / h;
    aiState.camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(canvas.parentElement);

  // Lighting
  aiState.scene.add(new THREE.AmbientLight(0x081420, 1.0));
  aiState.keyLight = new THREE.PointLight(new THREE.Color('#34D399'), 4.5, 25);
  aiState.keyLight.position.set(3, 5, 4);
  aiState.scene.add(aiState.keyLight);

  const fill = new THREE.PointLight(0x7B2FFF, 2.0, 20);
  fill.position.set(-4, -2, 2);
  aiState.scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffffff, 0.5);
  rim.position.set(0, 8, -6);
  aiState.scene.add(rim);

  // Grid
  const gm = new THREE.MeshBasicMaterial({ color: '#34D399', wireframe: true, transparent: true, opacity: 0.04 });
  const grid = new THREE.Mesh(new THREE.PlaneGeometry(8, 8, 14, 14), gm);
  grid.rotation.x = -Math.PI/2;
  grid.position.y = -2.0;
  aiState.scene.add(grid);

  // Build initial model (wave vase)
  buildAIVase();

  // Drag
  let drag = false, px = 0, py = 0, vx = 0, vy = 0;
  canvas.addEventListener('mousedown', e => { drag = true; px = e.clientX; py = e.clientY; canvas.style.cursor = 'grabbing'; });
  window.addEventListener('mouseup', () => { drag = false; canvas.style.cursor = 'grab'; });
  window.addEventListener('mousemove', e => {
    if (!drag) return;
    vy = (e.clientX - px) * 0.009; vx = (e.clientY - py) * 0.009;
    px = e.clientX; py = e.clientY;
  });
  canvas.style.cursor = 'grab';

  // Observe
  new IntersectionObserver(entries => {
    aiState.active = entries[0].isIntersecting;
    if (aiState.active && !aiState.rafId) aiLoop();
  }, { threshold: 0.1 }).observe(canvas);

  function aiLoop() {
    if (!aiState.active) { aiState.rafId = null; return; }
    aiState.rafId = requestAnimationFrame(aiLoop);
    const t = aiState.clock.getElapsedTime();
    if (!drag) {
      aiState.group.rotation.y += 0.010;
      aiState.group.rotation.x = Math.sin(t * 0.38) * 0.08;
    } else {
      aiState.group.rotation.y += vy;
      aiState.group.rotation.x += vx;
    }
    vx *= 0.87; vy *= 0.87;
    aiState.keyLight.intensity = 4.0 + Math.sin(t * 1.9) * 0.6;
    aiState.renderer.render(aiState.scene, aiState.camera);
  }
}

// ── Build AI Vase ──────────────────────────────────────
function buildAIVase(style = 'wave') {
  if (aiState.group) {
    aiState.scene.remove(aiState.group);
    aiState.group.traverse(c => { if (c.isMesh) { c.geometry.dispose(); c.material.dispose(); } });
  }

  const col   = new THREE.Color(aiState.vaseColor);
  aiState.keyLight.color.set(col);
  aiState.group = new THREE.Group();

  const points = [];
  for (let i = 0; i <= 64; i++) {
    const t = i / 64;
    const y = t * 3.8 - 1.9;
    const b = Math.sin(t * Math.PI);

    let r;
    switch (style) {
      case 'straight':
        r = 0.55 + (t < 0.05 || t > 0.97 ? 0.05 : 0);
        break;
      case 'spiral':
        r = 0.15 + b * 0.60 + Math.sin(t * Math.PI * 4) * 0.10 * b;
        break;
      case 'tapered':
        r = 0.65 - t * 0.35;
        break;
      case 'bulge':
        r = 0.12 + Math.pow(Math.sin(t * Math.PI), 1.4) * 0.80;
        break;
      default: // wave
        r = 0.10 + b * 0.68 + Math.sin(t * Math.PI * 7) * 0.08 * b;
    }
    points.push(new THREE.Vector2(Math.max(0.06, r), y));
  }

  const geo = new THREE.LatheGeometry(points, 52);
  const mat = new THREE.MeshPhongMaterial({
    color: 0x030c0a, emissive: col, emissiveIntensity: 0.14,
    specular: col, shininess: 200, transparent: true, opacity: 0.94, side: THREE.DoubleSide,
  });
  const wm = new THREE.MeshBasicMaterial({ color: col, wireframe: true, transparent: true, opacity: 0.12 });

  aiState.group.add(new THREE.Mesh(geo, mat));
  const ws = new THREE.Mesh(geo.clone(), wm);
  ws.scale.setScalar(1.012);
  aiState.group.add(ws);

  // Foot ring
  const foot = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.028, 8, 32),
    new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.75 }));
  foot.position.y = -1.88;
  foot.rotation.x = Math.PI/2;
  aiState.group.add(foot);

  // Rim ring
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.032, 8, 32),
    new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.80 }));
  rim.position.y = 1.88;
  rim.rotation.x = Math.PI/2;
  aiState.group.add(rim);

  aiState.group.scale.setScalar(0.92);
  aiState.scene.add(aiState.group);
}

// ── Build AI Drone ─────────────────────────────────────
function buildAIDrone() {
  if (aiState.group) {
    aiState.scene.remove(aiState.group);
    aiState.group.traverse(c => { if (c.isMesh) { c.geometry.dispose(); c.material.dispose(); } });
  }

  const col = new THREE.Color(aiState.vaseColor);
  aiState.keyLight.color.set(col);
  aiState.group = new THREE.Group();

  const pm = new THREE.MeshPhongMaterial({ color: 0x060c18, emissive: col, emissiveIntensity: 0.10, specular: col, shininess: 150 });
  const am = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.85 });

  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.60, 0.60, 0.16, 8), pm);
  aiState.group.add(plate);

  [0, Math.PI/2].forEach(a => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.13, 0.18), pm);
    arm.rotation.y = a;
    aiState.group.add(arm);
  });

  [[1.1,1.1],[-1.1,1.1],[1.1,-1.1],[-1.1,-1.1]].forEach(([x,z]) => {
    const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.20, 0.26, 16), pm);
    pod.position.set(x, 0.08, z);
    aiState.group.add(pod);
    const prop = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.024, 6, 32), am);
    prop.position.set(x, 0.22, z); prop.rotation.x = Math.PI/2;
    aiState.group.add(prop);
  });

  const cam = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.28, 0.26), pm);
  cam.position.set(0, 0.04, -0.58);
  aiState.group.add(cam);

  aiState.group.scale.setScalar(0.80);
  aiState.scene.add(aiState.group);
}

// ── Build AI Gear ──────────────────────────────────────
function buildAIGear() {
  if (aiState.group) {
    aiState.scene.remove(aiState.group);
    aiState.group.traverse(c => { if (c.isMesh) { c.geometry.dispose(); c.material.dispose(); } });
  }
  const col = new THREE.Color(aiState.vaseColor);
  aiState.keyLight.color.set(col);
  aiState.group = new THREE.Group();

  const pm = new THREE.MeshPhongMaterial({ color: 0x060c10, emissive: col, emissiveIntensity: 0.10, specular: col, shininess: 170 });
  const am = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.85 });

  function gearMesh(teeth, r, thick) {
    const shape = new THREE.Shape();
    const th = r * 0.22;
    for (let i = 0; i < teeth; i++) {
      const a0 = (i/teeth)*Math.PI*2;
      const a1 = ((i+0.3)/teeth)*Math.PI*2;
      const a2 = ((i+0.7)/teeth)*Math.PI*2;
      const a3 = ((i+1)/teeth)*Math.PI*2;
      if (i===0) shape.moveTo(Math.cos(a0)*r, Math.sin(a0)*r);
      else shape.lineTo(Math.cos(a0)*r, Math.sin(a0)*r);
      shape.lineTo(Math.cos(a1)*(r+th), Math.sin(a1)*(r+th));
      shape.lineTo(Math.cos(a2)*(r+th), Math.sin(a2)*(r+th));
      shape.lineTo(Math.cos(a3)*r, Math.sin(a3)*r);
    }
    shape.closePath();
    const hole = new THREE.Path(); hole.absarc(0,0,r*0.3,0,Math.PI*2,true); shape.holes.push(hole);
    return new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: thick, bevelEnabled: false }), pm);
  }

  const g1 = gearMesh(20, 0.95, 0.28); g1.position.set(-0.5, 0, 0); g1.rotation.x = -Math.PI/2;
  const g2 = gearMesh(12, 0.58, 0.28); g2.position.set(0.92, 0, 0); g2.rotation.x = -Math.PI/2;
  [g1, g2].forEach(g => aiState.group.add(g));

  const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.60, 12),
    new THREE.MeshPhongMaterial({ color: col, emissive: col, emissiveIntensity: 0.40 }));
  axle.position.set(-0.5, 0.24, 0);
  aiState.group.add(axle);

  aiState.group.scale.setScalar(0.95);
  aiState.group.position.set(0, -0.35, 0);
  aiState.scene.add(aiState.group);
}

// ── Build AI Phone Stand ───────────────────────────────
function buildAIPhone() {
  if (aiState.group) {
    aiState.scene.remove(aiState.group);
    aiState.group.traverse(c => { if (c.isMesh) { c.geometry.dispose(); c.material.dispose(); } });
  }
  const col = new THREE.Color(aiState.vaseColor);
  aiState.keyLight.color.set(col);
  aiState.group = new THREE.Group();

  const pm = new THREE.MeshPhongMaterial({ color: 0x060c18, emissive: col, emissiveIntensity: 0.09, specular: col, shininess: 130 });
  const am = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.80 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.85, 0.14, 32), pm);
  base.position.y = -1.1;
  aiState.group.add(base);

  const back = new THREE.Mesh(new THREE.BoxGeometry(1.55, 1.95, 0.13), pm);
  back.position.set(0, 0, -0.42); back.rotation.x = -0.35;
  aiState.group.add(back);

  const lip = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.19, 0.22), pm);
  lip.position.set(0, -0.93, 0.12);
  aiState.group.add(lip);

  const strip = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.04, 0.04), am);
  strip.position.set(0, 0.95, -0.36);
  aiState.group.add(strip);

  aiState.group.scale.setScalar(0.72);
  aiState.group.position.y = 0.12;
  aiState.scene.add(aiState.group);
}

// ══════════════════════════════════════════════════════
// MODEL SWITCHERS
// ══════════════════════════════════════════════════════
function switchVaseStyle(style) {
  aiState.currentModel = 'vase';
  aiState.vaseStyle = style;
  buildAIVase(style);

  const labels = { wave:'Dalga Vazo', straight:'Düz Silindirik Vazo', spiral:'Spiral Vazo', tapered:'Konik Vazo', bulge:'Şişkin Vazo' };
  const sizes  = { wave:'80×80×180mm', straight:'80×80×180mm', spiral:'80×80×200mm', tapered:'90×45×180mm', bulge:'90×90×170mm' };
  const times  = { wave:'~5 saat', straight:'~4 saat', spiral:'~6 saat', tapered:'~4.5 saat', bulge:'~5.5 saat' };

  document.getElementById('ai-model-label').textContent = labels[style] || 'Vazo';
  document.getElementById('ai-spec-size').textContent   = sizes[style]  || '80×80×180mm';
  document.getElementById('ai-spec-time').textContent   = times[style]  || '~5 saat';
}

function switchAIModel(model) {
  aiState.currentModel = model;
  const labels = { drone: 'FPV Racing Drone', gear: 'Dişli Mekanizma', phone: 'Telefon Standı' };
  const sizes  = { drone: '220×220×45mm', gear: '120×100×28mm', phone: '90×70×110mm' };
  const times  = { drone: '~12 saat', gear: '~8 saat', phone: '~3 saat' };
  const prices = { drone: '₺280–₺672', gear: '₺165–₺396', phone: '₺75–₺180' };

  if (model === 'drone') buildAIDrone();
  else if (model === 'gear') buildAIGear();
  else if (model === 'phone') buildAIPhone();
  else buildAIVase();

  document.getElementById('ai-model-label').textContent = labels[model] || model;
  document.getElementById('ai-spec-size').textContent   = sizes[model]  || '—';
  document.getElementById('ai-spec-time').textContent   = times[model]  || '—';
  document.getElementById('ai-spec-price').textContent  = prices[model] || '—';
}

function scaleAIModel(factor) {
  if (aiState.group) {
    aiState.group.scale.multiplyScalar(factor);
  }
}

function tintAIModel(hex) {
  aiState.vaseColor = hex;
  const col = new THREE.Color(hex);
  aiState.keyLight.color.set(col);
  if (aiState.currentModel === 'vase') buildAIVase(aiState.vaseStyle);
  else if (aiState.currentModel === 'drone') buildAIDrone();
  else if (aiState.currentModel === 'gear') buildAIGear();
  else if (aiState.currentModel === 'phone') buildAIPhone();
}

// ══════════════════════════════════════════════════════
// EVENT BINDING
// ══════════════════════════════════════════════════════
function bindAIEvents() {
  // Send button
  document.getElementById('ai-send-btn')?.addEventListener('click', sendMessage);

  // Enter key (shift+enter = newline)
  document.getElementById('ai-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  // Auto-resize textarea
  document.getElementById('ai-input')?.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
  });

  // Suggestion pills
  document.querySelectorAll('.ai-suggest').forEach(btn => {
    btn.addEventListener('click', () => {
      const inp = document.getElementById('ai-input');
      if (inp) { inp.value = btn.dataset.prompt; sendMessage(); }
    });
  });

  // Material quick-pick in AI panel
  document.querySelectorAll('.ai-mat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.ai-mat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const mid = pill.dataset.mat;
      const m   = MATERIALS_DB[mid];
      const inp = document.getElementById('ai-input');
      if (inp) { inp.value = `${m.name} malzeme hakkında bilgi ver`; sendMessage(); }
    });
  });

  // Cart button
  document.getElementById('ai-cart-btn')?.addEventListener('click', () => {
    const label = document.getElementById('ai-model-label')?.textContent || 'AI Tasarım';
    showAIToast(`🛒 "${label}" sepete eklendi!`);
  });
}

// ══════════════════════════════════════════════════════
// MESSAGING
// ══════════════════════════════════════════════════════
async function sendMessage() {
  const inp = document.getElementById('ai-input');
  if (!inp) return;
  const text = inp.value.trim();
  if (!text) return;

  appendMessage(text, 'user');
  inp.value = ''; inp.style.height = 'auto';

  // Find response
  const lower = text.toLowerCase();
  let matched = RESPONSES.find(r => r.keys.some(k => lower.includes(k)));

  // Show typing indicator
  const typingId = showTyping();

  try {
    if (matched && matched.action) {
      matched.action();
    }
    
    // Call Qwen model instead of hardcoded replies
    let reply = await askQwen(text);
    let actions = matched ? (matched.actions || []) : ['vazo tasarla','drone yap','fiyat sor','dalga vazo'];
    
    removeTyping(typingId);
    appendBotMessage(reply, actions);
  } catch (err) {
    removeTyping(typingId);
    appendBotMessage("Hata: " + err.message, []);
  }
}

function appendMessage(text, role) {
  const msgs = document.getElementById('ai-messages');
  if (!msgs) return;

  const div = document.createElement('div');
  div.className = `ai-msg ai-msg--${role}`;

  if (role === 'user') {
    div.innerHTML = `<div class="ai-msg-user-bubble">${escapeHtml(text)}</div>`;
  }

  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function appendBotMessage(text, actions = []) {
  const msgs = document.getElementById('ai-messages');
  if (!msgs) return;

  const div = document.createElement('div');
  div.className = 'ai-msg ai-msg--bot';

  const formatted = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');

  const actionBtns = actions.map(a =>
    `<button class="ai-action-btn" data-prompt="${a}">${a}</button>`
  ).join('');

  div.innerHTML = `
    <div class="ai-msg-avatar">
      <svg width="13" height="13" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
      </svg>
    </div>
    <div class="ai-msg-bubble">
      <div class="ai-msg-name">CustomShape3D AI</div>
      <p>${formatted}</p>
      ${actionBtns ? `<div class="ai-action-btns">${actionBtns}</div>` : ''}
    </div>
  `;

  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;

  // Bind action buttons
  div.querySelectorAll('.ai-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const inp = document.getElementById('ai-input');
      if (inp) { inp.value = btn.dataset.prompt; sendMessage(); }
    });
  });
}

let typingCounter = 0;
function showTyping() {
  const id = ++typingCounter;
  const msgs = document.getElementById('ai-messages');
  if (!msgs) return id;
  const div = document.createElement('div');
  div.className = 'ai-msg ai-msg--bot ai-typing';
  div.id = `typing-${id}`;
  div.innerHTML = `
    <div class="ai-msg-avatar"><svg width="13" height="13" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83"/></svg></div>
    <div class="ai-msg-bubble">
      <div class="ai-typing-dots"><span></span><span></span><span></span></div>
    </div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return id;
}
function removeTyping(id) {
  document.getElementById(`typing-${id}`)?.remove();
}

function showAIToast(msg) {
  let c = document.getElementById('toast-container');
  if (!c) { c = document.createElement('div'); c.id = 'toast-container'; document.body.appendChild(c); }
  const t = document.createElement('div');
  t.className = 'shop-toast'; t.textContent = msg;
  c.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 380); }, 3200);
}

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
