# CustomShape3D 🖨️

**3D Baskı Sipariş & Maliyet Hesaplama Platformu**

Kişisel ve ticari 3D baskı siparişleri için tasarlanmış, modern web teknolojileriyle geliştirilmiş tam özellikli bir e-ticaret platformu.

---

## 🌟 Özellikler

### 🛒 Ürün Kataloğu
- 12 adet hazır 3D baskı ürünü (drone çerçevesi, dişli seti, telefon standı, vb.)
- Her ürün için canlı 3D önizleme (Three.js tabanlı)
- Malzeme, kalite ve adet seçimi ile dinamik fiyatlandırma
- Renk seçici ile anlık model rengi güncelleme

### 🧵 12 Filament Çeşidi
| Filament | Gram Başına |
|----------|------------|
| PLA+ | ₺0.70/g |
| PETG | ₺0.90/g |
| ABS | ₺0.75/g |
| TPU | ₺1.10/g |
| ASA | ₺0.85/g |
| CF-PLA | ₺1.50/g |
| Resin | ₺1.00/g |
| Silk PLA | ₺1.00/g |
| Matte PLA | ₺0.75/g |
| Wood PLA | ₺1.10/g |
| HIPS | ₺0.80/g |
| Nylon PA | ₺1.60/g |

### 🧮 Filament Maliyet Hesaplayıcı
- Filament seçince anlık maliyet hesabı (ürün sayfası)
- 10g – 500g arası ayarlanabilir ağırlık slider'ı
- Dayanım, esneklik, ısı direnci ve zorluk çubukları
- Önerilen marka etiketleri

### 📐 STL 3D Viewer & Fiyatlandırma
- STL dosyası yükle, tarayıcıda 3D önizle
- **Boyut tabanlı dinamik fiyatlandırma**: X×Y (taban alanı) + Z (yükseklik) ölçülerine göre otomatik fiyat
- Wireframe, sıfırla, sığdır kontrolleri
- 12 malzeme seçeneğiyle anlık fiyat güncelleme

### 💰 Ekonomik Analiz Bölümü
- 100 Gram Baskı Ne Kadara Mal Olur? hesaplayıcısı
- Filament cinsi seçimi (emoji buton grid)
- Ağırlık + süre girişiyle tam maliyet analizi (filament + elektrik)
- Yıllık tasarruf tablosu

### 🤖 AI Asistan
- Yerleşik AI chat asistanı (Qwen tabanlı)
- 3D baskı soruları için özelleştirilmiş
- Bambu Studio rehberi (5 adımlı görsel kılavuz)

### 🛒 Sepet & Sipariş
- LocalStorage tabanlı kalıcı sepet
- Sipariş özeti, adet güncelleme, ürün silme
- WhatsApp / form tabanlı sipariş entegrasyonu

---

## 🚀 Kurulum & Çalıştırma

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Prodüksiyon build
npm run build
```

Tarayıcıda: `http://localhost:3000`

---

## 🏗️ Teknoloji Stack

| Teknoloji | Kullanım |
|-----------|----------|
| **Vite** | Build aracı & HMR |
| **Three.js** | 3D görüntüleme & model oluşturma |
| **Vanilla JS (ES Modules)** | Uygulama mantığı |
| **Vanilla CSS** | Tüm stiller |
| **Google Fonts (Inter + JetBrains Mono)** | Tipografi |

---

## 📁 Proje Yapısı

```
├── index.html          # Ana sayfa (hero, shop, viewer, AI)
├── product.html        # Ürün detay sayfası
├── src/
│   ├── main.js         # Giriş noktası
│   ├── js/
│   │   ├── shop.js     # Ürün kataloğu & MATERIALS_DB
│   │   ├── viewer.js   # STL viewer & fiyatlandırma motoru
│   │   ├── cart.js     # Sepet yönetimi
│   │   ├── ai.js       # AI asistan
│   │   ├── nav.js      # Navigasyon
│   │   ├── hero.js     # Hero bölümü animasyonları
│   │   └── animations.js # Scroll reveal animasyonları
│   └── css/            # Stil dosyaları
└── vite.config.js
```

---

## 👨‍💻 Geliştirici

**Kaan Türkarslan**  
Proje: Kişisel 3D Yazıcı Sipariş Platformu  
Fiyat verileri: Trendyol, Hepsiburada, SAMM Market — Haziran 2026
