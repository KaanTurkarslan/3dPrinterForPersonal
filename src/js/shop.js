/**
 * CustomShape3D — Shop Module v3
 * 12 Products · Live Color Picker · Material & Quality Selectors · Detailed 3D Models
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { observeNewReveals } from './animations.js';

// ══════════════════════════════════════════════════════
// MATERIALS DATABASE
// Fiyatlar: Türkiye piyasası 2026 ortalaması (Trendyol/Hepsiburada/SAMM)
// pricePerKg: ₺/kg ortalama piyasa fiyatı
// cost100g: pricePerKg / 10 (100g = 1/10 kg maliyeti)
// ══════════════════════════════════════════════════════
export const MATERIALS_DB = {
  pla: {
    name: 'PLA+', mult: 1.00, temp: '200°C', icon: '🌿', shine: 120,
    pricePerKg: 700,
    cost100g: 70,
    desc: 'Kolay baskı · Biyobozunur · İdeal başlangıç',
    longDesc: 'En popüler 3D baskı malzemesi. Düşük erime sıcaklığı ve kolay işlenebilirliği ile başlangıç seviyeden profesyonele her kullanıcıya uygun.',
    brands: ['Creality Ender PLA+', 'Sunlu PLA+', 'Filenta PLA+'],
    strength: 3, flexibility: 1, heatResist: 1, difficulty: 1,
    color: '#22C55E',
  },
  petg: {
    name: 'PETG', mult: 1.30, temp: '235°C', icon: '💧', shine: 160,
    pricePerKg: 900,
    cost100g: 90,
    desc: 'Su geçirmez · Gıda güvenli · Yüksek dayanım',
    longDesc: 'Gıda güvenli ve su geçirmez yapısıyla mutfak gereçleri, kaplar ve dış mekan kullanımı için ideal. PLA\'ya kıyasla çok daha dayanıklı.',
    brands: ['Creality PETG', 'Polymaker PETG', 'Bambu PETG'],
    strength: 4, flexibility: 2, heatResist: 3, difficulty: 2,
    color: '#3B82F6',
  },
  abs: {
    name: 'ABS', mult: 1.20, temp: '240°C', icon: '🔥', shine: 110,
    pricePerKg: 750,
    cost100g: 75,
    desc: 'Isı dayanımlı · Sağlam · Otomotiv uyumlu',
    longDesc: 'Yüksek ısı direnci ve mekanik dayanımı ile otomotiv, elektronik gövde ve endüstriyel parçalar için tercih edilir. Kapalı kasa yazıcı gerektirir.',
    brands: ['Creality ABS', 'eSUN ABS+', 'Filamix ABS'],
    strength: 4, flexibility: 2, heatResist: 4, difficulty: 3,
    color: '#F59E0B',
  },
  tpu: {
    name: 'TPU', mult: 1.50, temp: '220°C', icon: '🤸', shine: 70,
    pricePerKg: 1100,
    cost100g: 110,
    desc: 'Esnek lastik · Çarpmaya dayanıklı · Anti-slip',
    longDesc: 'Kauçuk benzeri esnek yapısıyla ayakkabı tabanı, conta, koruyucu kılıf ve titreşim söndürücü parçalar için mükemmel. Çarpmaya ve aşınmaya dayanıklı.',
    brands: ['Sunlu TPU', 'eSUN eTpu', 'Polymaker PolyFlex'],
    strength: 3, flexibility: 5, heatResist: 2, difficulty: 3,
    color: '#EC4899',
  },
  asa: {
    name: 'ASA', mult: 1.60, temp: '245°C', icon: '☀️', shine: 130,
    pricePerKg: 850,
    cost100g: 85,
    desc: 'UV dayanımlı · Dış mekan · Renk kalıcılığı',
    longDesc: 'UV ışınlarına ve hava koşullarına karşı üstün direnç sunar. Bahçe ekipmanları, araç aksesuarları ve dış mekan levhaları için en iyi seçim.',
    brands: ['Polymaker ASA', 'Sunlu ASA', 'Fiberlogy ASA'],
    strength: 4, flexibility: 2, heatResist: 4, difficulty: 3,
    color: '#F97316',
  },
  cf: {
    name: 'CF-PLA', mult: 2.40, temp: '215°C', icon: '⚡', shine: 200,
    pricePerKg: 1500,
    cost100g: 150,
    desc: 'Karbon fiber · Ultra hafif · Endüstriyel güç',
    longDesc: 'Karbon fiber katkılı PLA; hafif ama son derece sağlam bir malzeme. Drone çerçeveleri, RC araç parçaları ve endüstriyel prototipler için idealdir. Sert nozül gerektirir.',
    brands: ['Bambu CF-PLA', 'Polymaker PolyLite CF', 'eSUN PLA-CF'],
    strength: 5, flexibility: 1, heatResist: 3, difficulty: 4,
    color: '#6366F1',
  },
  resin: {
    name: 'Resin', mult: 2.80, temp: 'UV', icon: '💎', shine: 280,
    pricePerKg: 1000,
    cost100g: 100,
    desc: 'Ultra yüksek detay · Pürüzsüz yüzey · Sanatsal',
    longDesc: 'UV reçine baskı; rakipsiz yüzey kalitesi ve detay hassasiyeti sağlar. Mücevher kalıpları, figürinler ve diş/tıp protezleri için kullanılır. SLA/MSLA yazıcı gerektirir.',
    brands: ['Elegoo ABS-Like Resin', 'Anycubic Resin', 'Creality Resin'],
    strength: 3, flexibility: 1, heatResist: 2, difficulty: 4,
    color: '#8B5CF6',
  },
  // ── Yeni Filament Çeşitleri ──────────────────────────
  silk: {
    name: 'Silk PLA', mult: 1.40, temp: '210°C', icon: '✨', shine: 260,
    pricePerKg: 1000,
    cost100g: 100,
    desc: 'İpeksi parlaklık · Göz alıcı yüzey · Dekoratif',
    longDesc: 'İpek gibi parlayan yüzey dokusuyla figürin, heykel, trofeler ve dekoratif objeler için eşsiz bir görünüm sunar. Standart PLA işlem kolaylığını korur.',
    brands: ['Bambu Silk PLA', 'eSUN Silk PLA', 'Sunlu Silk'],
    strength: 2, flexibility: 1, heatResist: 1, difficulty: 1,
    color: '#F0ABFC',
  },
  matte: {
    name: 'Matte PLA', mult: 1.05, temp: '205°C', icon: '🎨', shine: 30,
    pricePerKg: 750,
    cost100g: 75,
    desc: 'Mat yüzey · Parmak izi gizler · Modern estetik',
    longDesc: 'Yansımasız mat yüzey; fotoğraf çekmek ve sergileme için ideal. Parmak izini ve çizikleri gizler, boyamak için mükemmel zemin sağlar.',
    brands: ['Polymaker PolyTerra', 'Bambu Matte', 'eSUN Matte'],
    strength: 3, flexibility: 1, heatResist: 1, difficulty: 1,
    color: '#94A3B8',
  },
  wood: {
    name: 'Wood PLA', mult: 1.55, temp: '215°C', icon: '🪵', shine: 40,
    pricePerKg: 1100,
    cost100g: 110,
    desc: 'Ahşap dokulu · Gerçekçi görünüm · Zımpara / Boyama uyumlu',
    longDesc: 'Gerçek ahşap talaşı içeren dolgu maddesi sayesinde baskı sonrası zımparalanabilir ve boyanabilir yüzey elde edilir. Mobilya, sanat eseri ve rustik dekor için idealdir.',
    brands: ['Polymaker Wood', 'eSUN Wood PLA', 'Sunlu Wood'],
    strength: 2, flexibility: 1, heatResist: 1, difficulty: 2,
    color: '#A16207',
  },
  hips: {
    name: 'HIPS', mult: 1.15, temp: '230°C', icon: '🔩', shine: 90,
    pricePerKg: 800,
    cost100g: 80,
    desc: 'ABS destek malzemesi · Hafif · Kimyasal çözünür',
    longDesc: 'Yüksek etki dayanımlı polistiren; limonene solüsyonunda çözünür ve ABS baskılar için çıkarılabilir destek yapısı olarak kullanılır. Kalıp ve model yapımı için tercih edilir.',
    brands: ['eSUN HIPS', 'Polymaker HIPS', 'Fiberlogy HIPS'],
    strength: 3, flexibility: 2, heatResist: 3, difficulty: 3,
    color: '#D4D4D8',
  },
  nylon: {
    name: 'Nylon PA', mult: 2.30, temp: '250°C', icon: '⚙️', shine: 100,
    pricePerKg: 1600,
    cost100g: 160,
    desc: 'Mühendislik sınıfı · Yüksek dayanım · Nem yönetimi gerektirir',
    longDesc: 'Mühendislik sınıfı poliamid; yüksek çekme mukavemeti, yorulma direnci ve kimyasal dayanımıyla dişli, bağlantı parçaları ve fonksiyonel prototipler için endüstri standardıdır.',
    brands: ['Polymaker PA12', 'Bambu PA-CF', 'eSUN Nylon'],
    strength: 5, flexibility: 3, heatResist: 5, difficulty: 5,
    color: '#7C3AED',
  },
};


export const QUALITIES_DB = [
  { id: 'draft',    name: 'Taslak',   layer: '0.30mm', mult: 0.75, icon: '⚡' },
  { id: 'standard', name: 'Standart', layer: '0.20mm', mult: 1.00, icon: '✅' },
  { id: 'fine',     name: 'İnce',     layer: '0.10mm', mult: 1.55, icon: '🔬' },
  { id: 'ultra',    name: 'Ultra',    layer: '0.05mm', mult: 2.20, icon: '💎' },
];

// ══════════════════════════════════════════════════════
// PRODUCTS
// ══════════════════════════════════════════════════════
export const PRODUCTS = [
  {
    "id": "custom-upload",
    "name": "Kendi Modeliniz",
    "subtitle": "STL / OBJ Dosyası Yükle",
    "description": "Kendi tasarladığınız veya internetten indirdiğiniz STL/OBJ formatındaki 3D dosyalarınızı yükleyin, anında fiyat alın ve sipariş verin.",
    "price": 29,
    "category": "ozel",
    "rating": 5.0,
    "reviews": 0,
    "dims": "Belirsiz",
    "accentColor": "#F43F5E",
    "badge": "Özel",
    "badgeColor": "#F43F5E",
    "printablesUrl": null,
    "designer": "Siz",
    "thumbnail": "https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=640&auto=format&fit=crop",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "cf",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      }
    ],
    buildFn: buildCustomUpload
  },
  {
    "id": "printables-1725199",
    "name": "Palet Bardak Altlığı",
    "subtitle": "Retro Mini Palet Tasarımı · Ahşap Hissiyatlı · Şık Dekor",
    "description": "Masanıza endüstriyel ve eğlenceli bir hava katacak mini palet şeklinde bardak altlığı. Özellikle ahşap veya PLA+ filamentler ile harika sonuçlar verir. Dayanıklı yapısıyla sıcak ve soğuk içecekler için uygundur.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1725199-pallet-coaster",
    "thumbnail": "https://media.printables.com/media/prints/8d025699-98a6-4a0c-b6ec-968d6e0d8792/images/12941053_1ea26549-c5cd-4e64-9225-90da382f5c08_fb5681a4-c928-408a-92f4-31cd18d82f42/thumbs/inside/640x480/jpg/20260515_081726817_ios.webp",
    "price": 39,
    "category": "dekor",
    "rating": 4.8,
    "reviews": 412,
    "dims": "97 × 97 × 12 mm",
    "accentColor": "#10B981",
    "badge": "🥇 Çok Satan",
    "badgeColor": "#10B981",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1725226",
    "name": "Silikon & Derz Nozül Uçları",
    "subtitle": "Hassas Silikon Uygulamaları İçin Nozül Seti · Pratik Derz Çekme",
    "description": "Evdeki tamirat ve derz dolgu işlerinizde profesyonel sonuçlar elde etmenizi sağlayan farklı açılarda nozül seti. Silikon kartuşlarının ucuna takılarak pürüzsüz ve temiz bitişler sağlar.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1725226-silicone-caulk-cartridge-finishing-nozzle-tips",
    "thumbnail": "https://media.printables.com/media/prints/926475a7-42ff-4de0-99ab-da5ec29f706a/images/12941289_84d4c359-2018-40e6-9543-6b70ec1730cb_8a24e5dc-2768-4beb-adf0-09dd2aa79f5f/thumbs/inside/640x480/jpg/20260515_085626766_ios.webp",
    "price": 59,
    "category": "dekor",
    "rating": 5.0,
    "reviews": 420,
    "dims": "75 × 75 × 90 mm",
    "accentColor": "#F97316",
    "badge": "🏆 Yılın Modeli",
    "badgeColor": "#F97316",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1725214",
    "name": "Matkap Tipi Boya Karıştırıcı",
    "subtitle": "Boya ve Sıvı Karışımlar İçin Pratik Matkap Aparatı · Yüksek Verim",
    "description": "Boya, alçı ve diğer sıvı karışımları matkabınız yardımıyla hızlıca homojen hale getirmek için tasarlanmış mekanik mikser aparatı. Temizlemesi kolaydır ve petg/abs gibi dayanıklı malzemelerle üretilir.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1725214-drill-paint-mixer",
    "thumbnail": "https://media.printables.com/media/prints/3919aa40-90e7-44c3-8aaa-6c6698535da8/images/12941201_5eaf5771-4f2a-4951-8ba7-9696d6f46be8_837e28f0-138b-41e4-8744-c999ba4ce002/thumbs/inside/640x480/jpg/20260515_084230325_ios.webp",
    "price": 89,
    "category": "mekanik",
    "rating": 4.7,
    "reviews": 147,
    "dims": "72 × 72 × 87 mm",
    "accentColor": "#8B5CF6",
    "badge": "⭐ Popüler",
    "badgeColor": "#8B5CF6",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1731885",
    "name": "Rulo Mekanizmalı Saklama Kutusu",
    "subtitle": "Katlanabilir Modüler Düzenleyici Kutu · Alan Tasarrufu",
    "description": "İçine koyacağınız malzemeye göre rulo gibi kıvrılabilen, kapak mekanizmalı yaratıcı saklama kutusu. Masaüstü kırtasiye veya hırdavat malzemelerinizi düzenlemek için son derece pratiktir.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1731885-roll-up-storage-box-organizer",
    "thumbnail": "https://media.printables.com/media/prints/f547e10c-b3a0-4996-b1a3-e2b17604fddd/images/12987081_35b0e024-fbd0-4b7c-bff4-d5cc892a619e_e80f5fae-73f4-4e09-8ce6-e637f0fe9c21/thumbs/inside/640x480/png/2.webp",
    "price": 99,
    "category": "aksesuar",
    "rating": 4.7,
    "reviews": 187,
    "dims": "162 × 162 × 77 mm",
    "accentColor": "#8B5CF6",
    "badge": "⭐ Popüler",
    "badgeColor": "#8B5CF6",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1724779",
    "name": "Heavy-Duty Gravity Phone Mount &amp; Articulated Arm",
    "subtitle": "Printables Top Modeli · Yüksek Kaliteli 3D Baskı",
    "description": "Heavy-Duty Gravity Phone Mount &amp; Articulated Arm modeli, 3D yazıcı topluluğu tarafından tasarlanmış yüksek puanlı popüler bir modeldir. PLA, PETG ve ABS filamentler ile basılmaya uygundur.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1724779-heavy-duty-gravity-phone-mount-articulated-arm",
    "thumbnail": "https://media.printables.com/media/prints/853d3d83-2197-41ed-b3ac-555820ac02f6/images/12937822_31e1fb12-8e45-4207-a7ad-ba099414ef47_55cc3064-0518-4e58-ad1d-733c61fd9f57/thumbs/inside/640x480/png/phoneholderwitharmcover3.webp",
    "price": 179,
    "category": "dekor",
    "rating": 5.0,
    "reviews": 128,
    "dims": "123 × 123 × 38 mm",
    "accentColor": "#F97316",
    "badge": "🏆 Yılın Modeli",
    "badgeColor": "#F97316",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1728813",
    "name": "Evrensel Masaüstü Kablo Düzenleyici",
    "subtitle": "Çok Kanallı Kablo Yönetim Sistemi · Düzenli Çalışma Alanları",
    "description": "Şarj, veri ve güç kablolarınızın masanın arkasına düşmesini engelleyen şık masaüstü kablo tutucu. Arkasındaki çift taraflı bant yuvası ile masanıza kolayca sabitlenir.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1728813-universal-desk-cable-holder",
    "thumbnail": "https://media.printables.com/media/prints/02666f3a-00ea-4e2d-b4a4-4a1d008d91c0/images/12963895_99d371a8-1ad9-4f6e-ba0b-b25802719f5a_e5ed44d7-5ca1-4bba-911e-e9968af70219/thumbs/inside/640x480/jpg/v3360.webp",
    "price": 159,
    "category": "aksesuar",
    "rating": 5.0,
    "reviews": 206,
    "dims": "81 × 81 × 96 mm",
    "accentColor": "#F97316",
    "badge": "🏆 Yılın Modeli",
    "badgeColor": "#F97316",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1723128",
    "name": "Modüler Sarmaşık ve Bitki Destek Çubuğu",
    "subtitle": "Eklenebilir Yapıda Çiçek ve Bitki Destek Direği · Kolay Kurulum",
    "description": "Saksı bitkileriniz büyüdükçe birbirine ekleyerek uzatabileceğiniz modüler destek sistemi. İçerisine yosun veya toprak doldurulabilir haznesi sayesinde bitkilerinizin nemli kalmasına yardımcı olur.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1723128-modular-climbing-moss-pole-and-plant-support",
    "thumbnail": "https://media.printables.com/media/prints/09747439-5adf-4b33-9cb9-d20c39527f64/images/12925823_19e5c4b9-ba23-4fd0-ad3f-592182df4791_8805c1bb-2143-438a-af4f-0c1dc1a7c185/thumbs/inside/640x480/jpg/horizontal.webp",
    "price": 169,
    "category": "aksesuar",
    "rating": 4.8,
    "reviews": 38,
    "dims": "43 × 43 × 58 mm",
    "accentColor": "#10B981",
    "badge": "🥇 Çok Satan",
    "badgeColor": "#10B981",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1720553",
    "name": "Yivli Ayarlanabilir Mobilya Ayağı",
    "subtitle": "43-71 mm Yükseklik Ayarlı Yivli Ayak · Dayanıklı Mekanizma",
    "description": "Yamuk diş yivli mekanizması sayesinde yüksek ağırlıkları rahatça taşıyabilen, 43 ile 71 mm arasında yüksekliği ayarlanabilen pratik mobilya ayağı. Masa veya sehpa dengesizliklerini gidermek için idealdir.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1720553-adjustable-furniture-leg-43-71-mm-with-trapezoidal",
    "thumbnail": "https://media.printables.com/media/prints/4b33f528-ee34-4ace-8b54-9caa1271434e/images/12906935_74ea1f85-59e5-4bc6-ad8a-5c132f797a75_7b5a16a3-d393-4fe7-995e-d1b5d654f009/thumbs/inside/640x480/jpg/dsc00241.webp",
    "price": 39,
    "category": "mekanik",
    "rating": 4.8,
    "reviews": 62,
    "dims": "67 × 67 × 32 mm",
    "accentColor": "#10B981",
    "badge": "🥇 Çok Satan",
    "badgeColor": "#10B981",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1711281",
    "name": "Güçlendirilmiş Evrensel Askı",
    "subtitle": "Yüksek Taşıma Kapasiteli Duvar Askısı · Kolay Montaj",
    "description": "Özel iç yapısı sayesinde yüksek ağırlıkları (baskı kalitesine bağlı olarak 15 kg'a kadar) kırılmadan taşıyabilen çok amaçlı duvar askısı. Garaj, mutfak veya antre kullanımı için uygundur.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1711281-strong-universal-hook",
    "thumbnail": "https://media.printables.com/media/prints/5eff61a1-383e-4e11-b5f3-3514eaed9fe0/images/12843507_ff0bdfc4-08ed-434b-87cf-ab0128d86b50_fff1cc96-aff0-4a8a-bb76-f123e28dbcb5/thumbs/inside/640x480/jpg/v35.webp",
    "price": 109,
    "category": "aksesuar",
    "rating": 4.5,
    "reviews": 463,
    "dims": "178 × 178 × 43 mm",
    "accentColor": "#A1A1AA",
    "badge": "Top Model",
    "badgeColor": "#A1A1AA",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1715172",
    "name": "Geliştirilmiş 608 Rulman",
    "subtitle": "Sürtünmesiz Çalışan 3D Yazıcı Rulmanı · Yağlama Gerektirmez",
    "description": "Fidget spinnerlar veya mekanik projeleriniz için bilyeleriyle birlikte tamamen 3D yazıcıda basılabilen geliştirilmiş 608 standart rulman tasarımı. PLA+ filament ile mükemmel akıcılıkta çalışır.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1715172-a-better-608-bearing",
    "thumbnail": "https://media.printables.com/media/prints/d9709c11-48be-44be-94d3-de1ecbbd8dbc/images/12885484_901ea8e4-6203-4413-aee9-91068058ad69_0ebde046-3f20-4cda-95bc-6223cc7d387b/thumbs/inside/640x480/jpg/screenshot-2026-05-10-210915.webp",
    "price": 49,
    "category": "mekanik",
    "rating": 4.6,
    "reviews": 212,
    "dims": "107 × 107 × 72 mm",
    "accentColor": "#A1A1AA",
    "badge": "Top Model",
    "badgeColor": "#A1A1AA",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1734124",
    "name": "Çok Renkli Sevimli Bukalemun",
    "subtitle": "Eklemli Hareketli Bukalemun Figürü · Eğlenceli Oyuncak",
    "description": "Tek parça halinde basılan (Print-in-Place) ve basıldıktan sonra tüm eklemleri hareket edebilen sevimli bukalemun figürü. Çok renkli (multi-color) veya geçişli filamentlerle göz alıcı görünür.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1734124-colormix-chameleon",
    "thumbnail": "https://media.printables.com/media/prints/52148676-9ef2-4f25-8946-5de83f2d7f72/images/13000789_2e4eac6c-9946-4530-8a31-14cdb7359eba_213a2fea-0f29-489a-81f6-6de476613919/thumbs/inside/640x480/jpg/chameleon_2.webp",
    "price": 69,
    "category": "oyuncak",
    "rating": 4.8,
    "reviews": 88,
    "dims": "133 × 133 × 98 mm",
    "accentColor": "#10B981",
    "badge": "🥇 Çok Satan",
    "badgeColor": "#10B981",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1735583",
    "name": "Ergonomik Masaüstü Monitör Standı",
    "subtitle": "Masaüstü Düzenleyici Monitör Yükseltici · Şık Tasarım",
    "description": "Monitörünüzü göz hizasına yükselterek boyun ağrılarını azaltan ve altındaki boşluk sayesinde klavyenizi gizlemenizi sağlayan şık, modüler monitör standı.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1735583-monitor-stand",
    "thumbnail": "https://media.printables.com/media/prints/f5c3275c-2459-4e00-917d-d8287466d29f/images/13010774_5c0a49e7-d89f-445e-a05a-5663451ddfb8_80d14ee7-9d87-4cfa-8229-f7e81c9f791c/thumbs/inside/640x480/png/concept.webp",
    "price": 49,
    "category": "aksesuar",
    "rating": 4.6,
    "reviews": 232,
    "dims": "137 × 137 × 52 mm",
    "accentColor": "#A1A1AA",
    "badge": "Top Model",
    "badgeColor": "#A1A1AA",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1714616",
    "name": "Zıplayan Yaylı Disk",
    "subtitle": "Esnek TPU Yay Sistemli Eğlenceli Disk · Zıplayan Yapı",
    "description": "İçerisindeki dairesel yay geometrisi sayesinde yere atıldığında yüksek oranda zıplayan yenilikçi oyuncak disk. Özellikle TPU gibi esnek filamentlerle basıldığında tam performans gösterir.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1714616-bouncy-puck",
    "thumbnail": "https://media.printables.com/media/prints/d5e3d445-f206-4fc9-8aea-c3187bed474e/images/12885406_63d54296-82ec-4f17-b317-261c1642e507_122c6961-d30a-4c58-adfb-e51f5fd618c0/thumbs/inside/640x480/jpeg/img_5501.webp",
    "price": 139,
    "category": "aksesuar",
    "rating": 4.9,
    "reviews": 117,
    "dims": "182 × 182 × 47 mm",
    "accentColor": "#F97316",
    "badge": "🏆 Yılın Modeli",
    "badgeColor": "#F97316",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1728548",
    "name": "Bahçe & Balkon Otomatik Sulama Aparatı",
    "subtitle": "Pet Şişe Uyumlu Akıllı Bitki Sulama Hunisi · Pratik Kullanım",
    "description": "Standart pet şişeleri ters çevirerek saksı toprağına yavaşça su vermesini sağlayan damlama uçlu sulama aparatı. Tatillerde çiçeklerinizin kurumasını önlemek için pratik bir çözümdür.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1728548-watering-spike-for-garden-and-balcony",
    "thumbnail": "https://media.printables.com/media/prints/7b78ea34-f1bc-4ffe-89c3-71c3a9dbd77a/images/12962287_5bb81691-6387-4f6b-822f-f5044aa2f4d6_b3f4494e-537d-4d12-81f3-f0a8188b9a71/thumbs/inside/640x480/png/watering-spike.webp",
    "price": 39,
    "category": "aksesuar",
    "rating": 5.0,
    "reviews": 424,
    "dims": "159 × 159 × 74 mm",
    "accentColor": "#F97316",
    "badge": "🏆 Yılın Modeli",
    "badgeColor": "#F97316",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1718436",
    "name": "Otomotiv Tipi Kablo İçi Sigorta Yuvası",
    "subtitle": "Bıçak Tipi Sigortalar İçin Kablo Tipi Yuva · Güvenli Elektrik",
    "description": "Standart oto bıçak sigortalarını kablo arasına güvenle bağlamanızı sağlayan kapaklı sigorta kutusu aparatı. ABS veya ASA gibi ısıya dayanıklı filamentlerle üretilmesi tavsiye edilir.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1718436-short-inline-automotive-blade-fuse-holder",
    "thumbnail": "https://media.printables.com/media/prints/9d705bd8-8ced-448c-ac4b-8840c4435d3b/images/12891383_9024662c-6bde-4c60-86c0-0aee2bdb1181_a0b5cd37-43b8-4f4c-b31f-cda5e06dee67/thumbs/inside/640x480/jpg/20260330_195840.webp",
    "price": 119,
    "category": "aksesuar",
    "rating": 4.7,
    "reviews": 137,
    "dims": "102 × 102 × 17 mm",
    "accentColor": "#8B5CF6",
    "badge": "⭐ Popüler",
    "badgeColor": "#8B5CF6",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1714764",
    "name": "Mini Eklemli Gece Ejderhası",
    "subtitle": "Hareketli Kanat ve Gövdeli Ejderha Oyuncağı · Efsanevi Karakter",
    "description": "Tüm omurgası ve kanatları hareketli olacak şekilde tasarlanmış, efsanevi ejderha figürü. Desteksiz olarak tek parça halinde basılabilir. Çocuklar ve koleksiyoncular için harika bir hediyedir.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1714764-mini-flexi-night-dragon",
    "thumbnail": "https://media.printables.com/media/prints/a3d1862f-32e1-45aa-96e9-3b9b0c476474/images/12867686_e39d3036-d0eb-4994-a2f4-fbf621552a75_4a61219b-38a2-4ef2-a373-71e0b650d3ce/thumbs/inside/640x480/jpg/mini-night-dragon-1.webp",
    "price": 34,
    "category": "oyuncak",
    "rating": 4.5,
    "reviews": 203,
    "dims": "88 × 88 × 103 mm",
    "accentColor": "#A1A1AA",
    "badge": "Top Model",
    "badgeColor": "#A1A1AA",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1728331",
    "name": "UFO Tasarımlı Estetik Gece Lambası",
    "subtitle": "Retro Fütüristik Masa Lambası Şablonu · Loş Işık Keyfi",
    "description": "İçerisine standart LED ampul veya şerit LED yerleştirerek kullanabileceğiniz, uzay gemisi formunda tasarlanmış göze hitap eden modern masa lambası. Şeffaf filamentler ile harika ışık süzülmesi sunar.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1728331-ufo-desklamp",
    "thumbnail": "https://media.printables.com/media/prints/9026720d-c90b-4486-8321-cc5e37186bae/images/12960973_e1bbc950-54bf-41ae-a505-041dae59d940_a18ee189-d1e0-4ee9-8030-919031d1643e/thumbs/inside/640x480/png/gemini_generated_image_yid1mhyid1mhyid1.webp",
    "price": 34,
    "category": "dekor",
    "rating": 4.9,
    "reviews": 181,
    "dims": "176 × 176 × 41 mm",
    "accentColor": "#F97316",
    "badge": "🏆 Yılın Modeli",
    "badgeColor": "#F97316",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1725221",
    "name": "Pet Şişe Uyumlu Eşek Arısı Tuzağı",
    "subtitle": "Kimyasal İçermeyen Doğal Böcek ve Arı Hunisi · Çevre Dostu",
    "description": "Boş pet şişelerin yan tarafına delik açılarak takılan, içerisine şekerli su konularak sinek ve eşek arılarını yakalayan huni biçimli aparat. Yaz aylarında balkon ve bahçeler için kurtarıcıdır.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1725221-bottle-wasp-trap",
    "thumbnail": "https://media.printables.com/media/prints/5d30597a-a34a-46d4-b8e5-a2e661084f2e/images/12941238_5887e52b-16d4-43e7-afd1-4a90a3b40598_73d46909-371f-46e8-9002-f508a0121c2e/thumbs/inside/640x480/jpg/33cefe9b-8fe2-4b37-a69b-83fd858e65f5.webp",
    "price": 29,
    "category": "aksesuar",
    "rating": 4.6,
    "reviews": 528,
    "dims": "113 × 113 × 78 mm",
    "accentColor": "#A1A1AA",
    "badge": "Top Model",
    "badgeColor": "#A1A1AA",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1732231",
    "name": "Star Wars AT-ST Walker Figürü",
    "subtitle": "Yüksek Detaylı Ölçekli Keşif Aracı · İmparatorluk Yürüyücüsü",
    "description": "Star Wars evreninin ikonik iki ayaklı keşif aracı AT-ST'nin 3D yazıcılar için optimize edilmiş yüksek detaylı parçalı modeli. Montaj gerektirir ve boyanmaya son derece uygundur.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1732231-at-st-walker-star-wars-vehicle-3d-printable",
    "thumbnail": "https://media.printables.com/media/prints/aeb934bf-597e-4ebe-b102-c32b4f605354/images/12989259_9a688380-5a4b-4b03-9692-9c0386faab2a_6f9fddc4-dc17-48e7-9e65-788f55b3445f/thumbs/inside/640x480/png/at_st_photo1.webp",
    "price": 139,
    "category": "oyuncak",
    "rating": 4.7,
    "reviews": 491,
    "dims": "186 × 186 × 51 mm",
    "accentColor": "#8B5CF6",
    "badge": "⭐ Popüler",
    "badgeColor": "#8B5CF6",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1732328",
    "name": "Star Wars TIE Interceptor Savaş Gemisi",
    "subtitle": "İmparatorluk Filosu Ölçekli Maket · Kolay Geçmeli Parçalar",
    "description": "İmparatorluğun en hızlı avcı gemilerinden biri olan TIE Interceptor'ın yapıştırıcı gerektirmeden birbirine geçen parçalardan oluşan 3D maket modeli. Standıyla birlikte sergilenmeye hazırdır.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1732328-tie-interceptor-starfighter-star-wars-3d-printable",
    "thumbnail": "https://media.printables.com/media/prints/99b90868-8c1d-49ee-9762-01260d623a59/images/12989852_d225d131-1e50-42c0-89a3-110aed002edd_94633905-c5df-4845-9430-017f666cd765/thumbs/inside/640x480/png/tie_interceptor_photo1.webp",
    "price": 149,
    "category": "oyuncak",
    "rating": 4.6,
    "reviews": 348,
    "dims": "173 × 173 × 88 mm",
    "accentColor": "#A1A1AA",
    "badge": "Top Model",
    "badgeColor": "#A1A1AA",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1723329",
    "name": "Eklemli Tatlı Yavru Kızıl Panda",
    "subtitle": "Hareketli Oyuncak, Anahtarlık ve Magnet Uyumlu Mini Figür",
    "description": "Büyük tüylü kuyruğu ve hareketli bacaklarıyla basabileceğiniz en şirin kızıl panda modeli. Sırtındaki delik sayesinde anahtarlık veya magnet olarak da kullanılabilir.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1723329-fluffy-tail-cute-flexi-baby-red-panda-articulated",
    "thumbnail": "https://media.printables.com/media/prints/5e29d4c4-808a-439e-ab98-7de50f458851/images/12927377_30f3867c-28a8-4396-95d1-8955d503fbf7_cac81a46-df04-47f6-9d1b-3ac87beb0cfc/thumbs/inside/640x480/png/461.webp",
    "price": 59,
    "category": "dekor",
    "rating": 4.7,
    "reviews": 525,
    "dims": "60 × 60 × 25 mm",
    "accentColor": "#8B5CF6",
    "badge": "⭐ Popüler",
    "badgeColor": "#8B5CF6",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1735723",
    "name": "The Mandalorian - Düşünen Heykel",
    "subtitle": "Büst & Heykel Formunda Detaylı Tasarım · Koleksiyonluk Sanat",
    "description": "Din Djarin'in (Mando) miğferiyle tahtında veya kayasında oturup düşündüğü sahneden esinlenilen sanatsal heykel büstü. Yüksek detaylı reçine (Resin) veya kaliteli PLA baskılar için uygundur.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1735723-the-mandalorian-contemplation-statue",
    "thumbnail": "https://media.printables.com/media/prints/39d026a0-e1c7-4270-b25d-8aea7a8c4f60/images/13011557_5f558544-359b-4b45-acf7-1481f68daa28_ab1ec3e0-dc26-4f3e-b649-9e7cea91b714/thumbs/inside/640x480/jpg/sm-2.webp",
    "price": 59,
    "category": "oyuncak",
    "rating": 5.0,
    "reviews": 326,
    "dims": "111 × 111 × 76 mm",
    "accentColor": "#F97316",
    "badge": "🏆 Yılın Modeli",
    "badgeColor": "#F97316",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1715794",
    "name": "Rulmanlı Kablo Kasnağı / Makara",
    "subtitle": "Sürtünmesiz Makaralı Kablo Yönlendirme Sistemi · Mekanik",
    "description": "İçerisine 608 rulman takılarak kabloları veya ipleri pürüzsüzce yönlendirmenizi sağlayan rulmanlı makara kasnağı. Spor aletleri veya atölye mekanizmaları için dayanıklıdır.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1715794-cable-pulley",
    "thumbnail": "https://media.printables.com/media/prints/95032f22-27a3-491b-ad09-ae6869333209/images/12875625_673e8af6-66ce-4e9a-9196-dac9afb314f4_5f4a92c8-71ab-46f7-a7d7-4219517a904e/thumbs/inside/640x480/jpg/20260509_211250.webp",
    "price": 175,
    "category": "aksesuar",
    "rating": 4.9,
    "reviews": 425,
    "dims": "170 × 170 × 85 mm",
    "accentColor": "#F97316",
    "badge": "🏆 Yılın Modeli",
    "badgeColor": "#F97316",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1722657",
    "name": "Eklemli Hareketli Karıncayiyen (Pangolin)",
    "subtitle": "Gerçekçi Pullu ve Hareketli Hayvan Figürü · PiP Tasarım",
    "description": "Gerçek bir pangolin gibi kıvrılıp top haline gelebilen, pulları tek tek hareketli yenilikçi eklem yapısına sahip 3D figür. Desteksiz olarak tek seferde basılır ve harika bir stres oyuncağıdır.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1722657-articulated-pangolin",
    "thumbnail": "https://media.printables.com/media/prints/3549d14f-590c-4cfb-82e5-b3148fda5fe0/images/12933721_0e4e7895-f813-4a8a-b779-5edf0c630b62_1e423379-2a2a-458d-bcab-8fcf4bcc9411/thumbs/inside/640x480/jpg/20260517_201043986.webp",
    "price": 89,
    "category": "dekor",
    "rating": 4.9,
    "reviews": 33,
    "dims": "98 × 98 × 13 mm",
    "accentColor": "#F97316",
    "badge": "🏆 Yılın Modeli",
    "badgeColor": "#F97316",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1732333",
    "name": "Star Wars X-Wing Savaş Gemisi",
    "subtitle": "Asi Birliği İkonik Avcı Uçağı Maketi · Detaylı Parça Seti",
    "description": "Star Wars evreninin efsanevi savaş gemisi X-Wing Starfighter'ın kanatları açılıp kapanabilen, standlı ve yüksek detaylı 3D modeli. Sergilemek isteyen bilimkurgu hayranları için mükemmeldir.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1732333-x-wing-fighter-starship-star-wars-3d-printable",
    "thumbnail": "https://media.printables.com/media/prints/404a806c-5be7-4266-a9ef-bd5f4d079130/images/12989868_ad7175cc-3c7c-4525-89d9-fa7ec556a1b9_3355c5fc-f05e-4fca-b995-92aefd5a31b8/thumbs/inside/640x480/png/x_wing_photo1.webp",
    "price": 89,
    "category": "oyuncak",
    "rating": 4.6,
    "reviews": 184,
    "dims": "179 × 179 × 44 mm",
    "accentColor": "#A1A1AA",
    "badge": "Top Model",
    "badgeColor": "#A1A1AA",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1740060",
    "name": "Katlanabilir Modüler Ayakkabılık",
    "subtitle": "Tek Seferde Basılan Katlanır Ayakkabı Rafı · Mekanik Tasarım",
    "description": "Eklemleriyle birlikte tek seferde basılıp açılan, modüler olarak üst üste eklenebilen katlanabilir ayakkabı rafı sistemi. Antrede alan tasarrufu yapmanızı sağlar.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1740060-folding-shoe-rack-print-in-place",
    "thumbnail": "https://media.printables.com/media/prints/ea038090-68fb-40fd-9ab5-b92ec03b7303/images/13067370_3244e04d-6d7f-4c53-b884-0f7723820790_ca670771-856c-497d-8a5a-617a656f6af2/thumbs/inside/640x480/jpg/shoerack2.webp",
    "price": 179,
    "category": "aksesuar",
    "rating": 4.7,
    "reviews": 391,
    "dims": "96 × 96 × 61 mm",
    "accentColor": "#8B5CF6",
    "badge": "⭐ Popüler",
    "badgeColor": "#8B5CF6",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1739140",
    "name": "Pratik Ayakkabı Asma Klipsi",
    "subtitle": "Ayakkabıları Düzenli Asmak İçin Çiftli Askı Aparatı",
    "description": "Spor ayakkabılarınızı veya botlarınızı dolap raylarına ya da askılıklara çift olarak asmanızı sağlayan dayanıklı ve esnek tasarımlı klips aparatı.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1739140-shoe-hanging-clip",
    "thumbnail": "https://media.printables.com/media/prints/11380f74-199b-48ef-9c80-902392c75c45/images/13035485_f0b798e6-6c85-4b0e-9e54-a86c39800597_c400b583-752c-43bf-9e05-134fcb500795/thumbs/inside/640x480/png/document.webp",
    "price": 149,
    "category": "aksesuar",
    "rating": 4.6,
    "reviews": 224,
    "dims": "119 × 119 × 34 mm",
    "accentColor": "#A1A1AA",
    "badge": "Top Model",
    "badgeColor": "#A1A1AA",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1725737",
    "name": "Ropener - Akıllı Stor Perde Açıcı",
    "subtitle": "Akıllı Ev Uyumlu Otomatik Perde Motoru Aparatı · Açık Kaynak",
    "description": "Stor perdelerin zincir mekanizmasına bağlanarak motor yardımıyla perdeleri otomatik açıp kapatan açık kaynak kodlu aparat seti. ESPHome ve Home Assistant entegrasyonu için yuvaları hazırdır.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1725737-ropener-open-source-smart-curtain-opener-esphome-h",
    "thumbnail": "https://media.printables.com/media/prints/73fc4e29-60e2-4dad-83bb-f1e94e7f4b44/images/12952832_6c9ccb3f-daee-4531-bb33-12ee87ef3a61_89aa25a8-dd6a-4fd2-99b3-780af8e2e4e4/thumbs/inside/640x480/jpg/ropener-kit-21.webp",
    "price": 79,
    "category": "dekor",
    "rating": 4.8,
    "reviews": 522,
    "dims": "67 × 67 × 82 mm",
    "accentColor": "#10B981",
    "badge": "🥇 Çok Satan",
    "badgeColor": "#10B981",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1731380",
    "name": "Pratik Çilek Sapı Ayıklayıcı",
    "subtitle": "Meyve Saplarını Hızlıca Ayıklayan Hijyenik Aparat",
    "description": "Çilek ve benzeri meyvelerin saplarını ezmeden, tek hamlede kolayca çıkaran ergonomik ve temizlemesi kolay mutfak yardımcısı aparatı.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1731380-strawberry-stem-remover",
    "thumbnail": "https://media.printables.com/media/prints/1731380/images/12983018_ecd9d0b4-0cb7-42dc-b342-94573f48ee70_269cc770-b19d-43a8-899e-02b2b7de8af1/thumbs/inside/640x480/jpg/image_1731380.webp",
    "price": 99,
    "category": "aksesuar",
    "rating": 4.8,
    "reviews": 470,
    "dims": "85 × 85 × 50 mm",
    "accentColor": "#10B981",
    "badge": "🥇 Çok Satan",
    "badgeColor": "#10B981",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1729695",
    "name": "Desteksiz Basılabilen Bilyeler",
    "subtitle": "Pürüzsüz Dairesel Mermer ve Bilye Seti · Desteksiz Baskı",
    "description": "3D yazıcılarda alt kısımlarında çökme olmadan, destek malzemesi kullanmadan tamamen pürüzsüz küreler basabilmeniz için tasarlanmış özel bilye modelleri.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1729695-no-support-marbles",
    "thumbnail": "https://media.printables.com/media/prints/10ffd8ae-34d3-4ff6-8945-6d67aa75e368/images/12987776_54c24d4f-852a-4a1a-8a0a-31a32abbde27_2f896bd1-28e9-4302-ab06-92fc53e5bae2/thumbs/inside/640x480/png/3d-printable-marble-2000-x-1500-px-1.webp",
    "price": 25,
    "category": "aksesuar",
    "rating": 4.7,
    "reviews": 197,
    "dims": "132 × 132 × 47 mm",
    "accentColor": "#8B5CF6",
    "badge": "⭐ Popüler",
    "badgeColor": "#8B5CF6",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1718473",
    "name": "Barok Tarzı Oval Çerçeve",
    "subtitle": "Sanatsal Klasik Duvar Çerçevesi · CNC & 3D Uyumlu Detay",
    "description": "Klasik İtalyan barok tarzı deniz kabuğu motifleriyle süslenmiş, ayna veya resimleriniz için kullanabileceğiniz duvar çerçevesi modeli. Altın sarısı veya bronz renklerle şık durur.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1718473-baroque-shell-oval-frame-3d-stl-model-for-cnc-and",
    "thumbnail": "https://media.printables.com/media/prints/1ca5e423-8bbd-42dd-9d09-f8b9f012c248/images/12891700_2878fecd-6246-4176-a230-4e4c98e0a718_a0b62804-5f2e-4e4c-891c-63f8a55b0443/thumbs/inside/640x480/jpg/impaginazione-rendering-19.webp",
    "price": 129,
    "category": "dekor",
    "rating": 4.8,
    "reviews": 438,
    "dims": "103 × 103 × 68 mm",
    "accentColor": "#10B981",
    "badge": "🥇 Çok Satan",
    "badgeColor": "#10B981",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1727689",
    "name": "9 Gramlık Eklemli Minik Kalamar",
    "subtitle": "Ultra Hafif Hareketli Tentaküllü Kalamar Oyuncağı",
    "description": "Yalnızca 9 gram filament harcayarak çok kısa sürede basılabilen, tüm kolları hareketli ve esnek minik kalamar figürü. Özellikle çocuklar için sevimli bir stres oyuncağıdır.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1727689-calamar-de-9g-squid-petit-jouet-a-tentacules-mobil",
    "thumbnail": "https://media.printables.com/media/prints/bc4676c3-4e24-4c86-af7c-f583a83e1005/images/12956803_2afb64d9-b3cd-4ec2-81c9-84623792b7cb_1693494a-dc94-4ee8-93b2-ddaacd2ac2d5/thumbs/inside/640x480/png/copilot_20260520_151648.webp",
    "price": 99,
    "category": "oyuncak",
    "rating": 4.7,
    "reviews": 437,
    "dims": "42 × 42 × 57 mm",
    "accentColor": "#8B5CF6",
    "badge": "⭐ Popüler",
    "badgeColor": "#8B5CF6",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1721715",
    "name": "Daire Çizim ve İşaretleme Aparatı",
    "subtitle": "Farklı Çaplarda Daire Çizmek İçin Atölye Cetveli",
    "description": "Ortasına bir kalem yerleştirerek dilediğiniz çapta kusursuz daireler çizmenizi ve merkez noktası bulmanızı sağlayan pratik marangozluk ve hobi cetvel aparatı.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1721715-circle-marker-tool",
    "thumbnail": "https://media.printables.com/media/prints/f2a9232b-7c99-475a-a80f-7267577be6d8/images/12914859_4f53805e-817a-494f-a2d7-1200a6b305f8_b14dad25-6219-4008-9837-8c5805d11e7f/thumbs/inside/640x480/png/cuddlebun-toy-19.webp",
    "price": 139,
    "category": "mekanik",
    "rating": 4.7,
    "reviews": 535,
    "dims": "150 × 150 × 65 mm",
    "accentColor": "#8B5CF6",
    "badge": "⭐ Popüler",
    "badgeColor": "#8B5CF6",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1738755",
    "name": "Sağlam Evrensel El Aletleri Askısı",
    "subtitle": "Tornavida, Pense ve Anahtarlar İçin Düzenleyici Panel",
    "description": "Atölyenizde veya garajınızda tornavida, pense, kumpas gibi el aletlerini düzenli ve el altında tutmanızı sağlayan modüler duvar paneli askısı.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1738755-strong-universal-tool-holder",
    "thumbnail": "https://media.printables.com/media/prints/6aff1cff-6970-4953-887c-04b4aa2afd42/images/13042154_499957eb-87d3-4f42-9c95-b972902a95f3_e7010b99-0cf1-463a-b862-29855101467b/thumbs/inside/640x480/jpg/v14372.webp",
    "price": 49,
    "category": "aksesuar",
    "rating": 4.5,
    "reviews": 439,
    "dims": "124 × 124 × 39 mm",
    "accentColor": "#A1A1AA",
    "badge": "Top Model",
    "badgeColor": "#A1A1AA",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1716804",
    "name": "Baykuşlu Rüzgar Çanı",
    "subtitle": "Rüzgarda Ses Çıkaran Estetik Baykuşlu Bahçe Dekoru",
    "description": "Balkonunuza veya bahçenize asabileceğiniz, rüzgar estikçe birbirine çarparak hoş sesler çıkaran baykuş figürlü dekoratif rüzgar çanı seti.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1716804-hooting-owl-wind-chime",
    "thumbnail": "https://media.printables.com/media/prints/5956a600-a40a-4e3d-b1c5-d9b8f0a16253/images/12934543_735c66e3-e40c-4c13-9f0e-8acd8461c04d_680a4e60-8bfc-43f3-bd68-63d06a72e63d/thumbs/inside/640x480/webp/hooting-wind-chimes-owls-v0-e39jlqxg151h1.webp",
    "price": 49,
    "category": "dekor",
    "rating": 4.8,
    "reviews": 212,
    "dims": "157 × 157 × 22 mm",
    "accentColor": "#10B981",
    "badge": "🥇 Çok Satan",
    "badgeColor": "#10B981",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  },
  {
    "id": "printables-1734575",
    "name": "Kademeli Mekanik Kartlık V2",
    "subtitle": "Kızaklı Mekanizmaya Sahip İnce Kartlık Cüzdan V2",
    "description": "Alttaki tetik çekildiğinde kartlarınızı kademeli olarak yukarı fırlatan, cebinizde yer kaplamayan modern kızaklı cüzdan tasarımı. Plakalarla güçlendirilmiştir.",
    "designer": "",
    "printablesUrl": "https://www.printables.com/model/1734575-cascade-card-wallet-v2",
    "thumbnail": "https://media.printables.com/media/prints/a99c32ad-810a-45df-9194-809c6af80700/images/13035553_416d01e9-9763-4a3e-af63-dc4986db5d77_3adada31-22c0-43e4-ad3e-a49fa38419a3/thumbs/inside/640x480/png/screenshot-2026-05-25-154103.webp",
    "price": 139,
    "category": "aksesuar",
    "rating": 5.0,
    "reviews": 288,
    "dims": "123 × 123 × 88 mm",
    "accentColor": "#F97316",
    "badge": "🏆 Yılın Modeli",
    "badgeColor": "#F97316",
    "availableMaterials": [
      "pla",
      "petg",
      "abs",
      "resin"
    ],
    "defaultMaterial": "pla",
    "defaultQuality": "standard",
    "colors": [
      {
        "name": "Siyah",
        "hex": "#111827"
      },
      {
        "name": "Beyaz",
        "hex": "#F9FAFB"
      },
      {
        "name": "Kırmızı",
        "hex": "#EF4444"
      },
      {
        "name": "Mavi",
        "hex": "#3B82F6"
      },
      {
        "name": "Gri",
        "hex": "#6B7280"
      }
    ],
    buildFn: buildPlanter
  }
];


let wishlist = [];
let searchQuery = '';
let categoryFilter = 'all';
let maxPriceFilter = 1000;
let onlyWishlistFilter = false;
let sortMode = 'default';
let shopCurrentPage = 1;
const ITEMS_PER_PAGE = 6;
let shopFilteredProducts = [];

// Three.js Quick View reference state
let qvScene = null;
let qvRenderer = null;
let qvCamera = null;
let qvControls = null;
let qvModelGroup = null;
let qvRafId = null;
let qvClock = null;
let qvAutoRotate = true;

export function initShop() {
  initWishlist();
  renderShopSection();
  initSidebarEvents();
  initCartBadge();

  // Register dynamically added .reveal elements
  const shopSection = document.getElementById('shop');
  if (shopSection) {
    observeNewReveals(shopSection);
    setTimeout(() => {
      shopSection.querySelectorAll('.reveal:not(.in-view)').forEach(el => el.classList.add('in-view'));
    }, 300);
  }
}

function initWishlist() {
  try {
    const saved = localStorage.getItem('shop_wishlist');
    wishlist = saved ? JSON.parse(saved) : [];
  } catch (e) {
    wishlist = [];
  }
}

function toggleWishlist(pid, btn) {
  const index = wishlist.indexOf(pid);
  if (index === -1) {
    wishlist.push(pid);
    btn.classList.add('active');
    const svg = btn.querySelector('svg');
    if (svg) svg.setAttribute('fill', 'currentColor');
    showToast('❤️ Ürün favorilerinize eklendi!');
  } else {
    wishlist.splice(index, 1);
    btn.classList.remove('active');
    const svg = btn.querySelector('svg');
    if (svg) svg.setAttribute('fill', 'none');
    showToast('💔 Ürün favorilerinizden çıkarıldı.');
  }
  localStorage.setItem('shop_wishlist', JSON.stringify(wishlist));
  
  if (onlyWishlistFilter) {
    updateFilters();
  }
}

function renderShopSection() {
  const section = document.getElementById('shop');
  if (!section) return;

  const shopProducts = PRODUCTS.filter(p => p.id !== 'custom-upload');
  
  section.innerHTML = `
    <div class="container">
      <div class="section-label-bar">
        <span class="section-label-tag">Mağaza</span>
      </div>
      <div class="section-header reveal">
        <div class="section-pill" style="color:#EDEDED;border-color:rgba(237,237,237,0.2);background:rgba(237,237,237,0.05)">
          Premium Tasarımlar
        </div>
        <h2 class="section-title">3D Baskı <span class="gradient-text">Koleksiyonu</span></h2>
        <p class="section-desc">En popüler Printables tasarımları, anlık arama, favoriler ve etkileşimli 3D hızlı önizleme modali ile yeniden tasarlandı.</p>
      </div>

      <div class="shop-layout">
        <!-- Sol: Filtreleme Paneli (Sidebar) -->
        <aside class="shop-sidebar">
          <!-- Arama Çubuğu -->
          <div class="sidebar-block">
            <label class="sidebar-label" for="shop-search">🔎 Arama</label>
            <div class="search-input-wrapper">
              <input type="text" id="shop-search" class="sidebar-input" placeholder="Model ara..." value="${searchQuery}" />
            </div>
          </div>

          <!-- Kategoriler -->
          <div class="sidebar-block">
            <label class="sidebar-label">📂 Kategoriler</label>
            <div class="sidebar-categories">
              <button class="sidebar-cat-btn ${categoryFilter === 'all' ? 'active' : ''}" data-filter="all">
                <span>Tümü</span>
                <span class="cat-count">${shopProducts.length}</span>
              </button>
              <button class="sidebar-cat-btn ${categoryFilter === 'mekanik' ? 'active' : ''}" data-filter="mekanik">
                <span>⚙️ Mekanik</span>
                <span class="cat-count">${shopProducts.filter(p => p.category === 'mekanik').length}</span>
              </button>
              <button class="sidebar-cat-btn ${categoryFilter === 'dekor' ? 'active' : ''}" data-filter="dekor">
                <span>🏠 Dekor</span>
                <span class="cat-count">${shopProducts.filter(p => p.category === 'dekor').length}</span>
              </button>
              <button class="sidebar-cat-btn ${categoryFilter === 'aksesuar' ? 'active' : ''}" data-filter="aksesuar">
                <span>🎒 Aksesuar</span>
                <span class="cat-count">${shopProducts.filter(p => p.category === 'aksesuar').length}</span>
              </button>
            </div>
          </div>

          <!-- Fiyat Aralığı Slider'ı -->
          <div class="sidebar-block">
            <div class="price-range-header">
              <label class="sidebar-label" for="price-range-slider">💰 Maksimum Fiyat</label>
              <span id="price-slider-val" class="price-slider-val">₺${maxPriceFilter}</span>
            </div>
            <input type="range" id="price-range-slider" min="50" max="1000" step="25" value="${maxPriceFilter}" class="sidebar-range" />
            <div class="range-labels">
              <span>₺50</span>
              <span>₺1000</span>
            </div>
          </div>

          <!-- Favoriler Filtresi ve Sıralama -->
          <div class="sidebar-block">
            <label class="sidebar-label">⚙️ Seçenekler</label>
            
            <!-- Favoriler Toggle -->
            <button id="wishlist-toggle-btn" class="wishlist-toggle-btn ${onlyWishlistFilter ? 'active' : ''}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="${onlyWishlistFilter ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              Sadece Favoriler
            </button>

            <!-- Sıralama Dropdown -->
            <div style="margin-top: 16px;">
              <select class="shop-sort-select" id="shop-sort" style="width: 100%;">
                <option value="default" ${sortMode === 'default' ? 'selected' : ''}>Sıralama (Önerilen)</option>
                <option value="price-asc" ${sortMode === 'price-asc' ? 'selected' : ''}>Fiyat: Düşükten Yükseğe</option>
                <option value="price-desc" ${sortMode === 'price-desc' ? 'selected' : ''}>Fiyat: Yüksekten Düşüğe</option>
                <option value="rating" ${sortMode === 'rating' ? 'selected' : ''}>Müşteri Puanı</option>
              </select>
            </div>
          </div>
        </aside>

        <!-- Sağ: Ürün Listesi Grid'i -->
        <main class="shop-content">
          <div class="shop-grid" id="shop-grid"></div>
          <div class="shop-pagination" id="shop-pagination"></div>
        </main>
      </div>
    </div>

    <!-- 3D Hızlı Önizleme Modali (Quick View) -->
    <div id="shop-quickview-modal" class="shop-modal" aria-hidden="true">
      <div class="shop-modal-backdrop" id="modal-backdrop-close"></div>
      <div class="shop-modal-container">
        <button class="shop-modal-close" id="modal-close-btn" aria-label="Kapat">&times;</button>
        <div class="shop-modal-content">
          <!-- Sol Kolon: 3D Viewport -->
          <div class="shop-modal-viewer-col">
            <div class="shop-modal-canvas-wrap">
              <canvas id="quickview-canvas"></canvas>
              <div class="shop-modal-canvas-controls">
                <button class="canvas-ctrl-btn" id="qv-ctrl-rotate">↺ Oto</button>
                <button class="canvas-ctrl-btn" id="qv-ctrl-reset">Sıfırla</button>
              </div>
            </div>
          </div>

          <!-- Sağ Kolon: Detaylar -->
          <div class="shop-modal-info-col">
            <div class="shop-modal-badge" id="qv-badge">Badge</div>
            <h3 class="shop-modal-title" id="qv-title">Ürün Adı</h3>
            <p class="shop-modal-subtitle" id="qv-subtitle">Ürün Alt Başlığı</p>
            
            <div class="shop-modal-meta">
              <span class="shop-modal-rating" id="qv-rating">★★★★★ 5.0</span>
              <span class="shop-modal-designer" id="qv-designer">soozafone</span>
            </div>

            <div class="shop-modal-specs">
              <div class="qv-spec-row"><strong>📐 Boyutlar:</strong> <span id="qv-dims">Belirsiz</span></div>
              <div class="qv-spec-row"><strong>📂 Kategori:</strong> <span id="qv-category">Mekanik</span></div>
            </div>

            <!-- İnteraktif Renk ve Fiyat Hesaplayıcı -->
            <div class="qv-config-section">
              <div class="qv-config-label">Renk Seçimi</div>
              <div class="qv-color-swatches" id="qv-color-swatches"></div>
              <div class="qv-selected-color-label">Renk: <span id="qv-selected-color-name">-</span></div>
            </div>

            <div class="qv-price-box">
              <span class="qv-price-label">Fiyat Aralığı:</span>
              <span class="qv-price-value" id="qv-price-val">₺0 - ₺0</span>
            </div>

            <div class="qv-actions">
              <a href="#" id="qv-customize-btn" class="qv-btn-primary">
                ⚙️ Siparişi Özelleştir & Satın Al
              </a>
              <button id="qv-cart-quick-btn" class="qv-btn-secondary">
                🛒 Hızlı Sepete Ekle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  updateFilters();
}

function initSidebarEvents() {
  const searchInput = document.getElementById('shop-search');
  const slider = document.getElementById('price-range-slider');
  const sliderVal = document.getElementById('price-slider-val');
  const wishlistToggle = document.getElementById('wishlist-toggle-btn');
  const sortSelect = document.getElementById('shop-sort');

  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    updateFilters();
  });

  document.querySelectorAll('.sidebar-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      categoryFilter = btn.dataset.filter;
      updateFilters();
    });
  });

  slider?.addEventListener('input', (e) => {
    maxPriceFilter = parseInt(e.target.value);
    if (sliderVal) sliderVal.textContent = `₺${maxPriceFilter}`;
    updateFilters();
  });

  wishlistToggle?.addEventListener('click', () => {
    onlyWishlistFilter = !onlyWishlistFilter;
    wishlistToggle.classList.toggle('active', onlyWishlistFilter);
    const svg = wishlistToggle.querySelector('svg');
    if (svg) svg.setAttribute('fill', onlyWishlistFilter ? 'currentColor' : 'none');
    updateFilters();
  });

  sortSelect?.addEventListener('change', (e) => {
    sortMode = e.target.value;
    updateFilters();
  });

  // Modal close handlers
  document.getElementById('modal-close-btn')?.addEventListener('click', closeQuickView);
  document.getElementById('modal-backdrop-close')?.addEventListener('click', closeQuickView);
}

function updateFilters() {
  const shopProducts = PRODUCTS.filter(p => p.id !== 'custom-upload');
  
  shopFilteredProducts = shopProducts.filter(p => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    
    if (searchQuery) {
      const matchName = p.name.toLowerCase().includes(searchQuery);
      const matchSub = p.subtitle.toLowerCase().includes(searchQuery);
      const matchDes = (p.designer || '').toLowerCase().includes(searchQuery);
      if (!matchName && !matchSub && !matchDes) return false;
    }

    if (p.price > maxPriceFilter) return false;

    if (onlyWishlistFilter && !wishlist.includes(p.id)) return false;

    return true;
  });

  if (sortMode === 'price-asc') {
    shopFilteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortMode === 'price-desc') {
    shopFilteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortMode === 'rating') {
    shopFilteredProducts.sort((a, b) => b.rating - a.rating);
  }

  renderShopPage(1);
}

function renderShopPage(page) {
  shopCurrentPage = page;
  const grid = document.getElementById('shop-grid');
  if (!grid) return;

  if (shopFilteredProducts.length === 0) {
    grid.innerHTML = `
      <div class="shop-empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 16px; color: var(--muted);">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 8px;">Model Bulunamadı</h3>
        <p style="color: var(--muted); font-size: 0.85rem; max-width: 280px; margin: 0 auto;">Arama veya filtre kriterlerinize uyan bir tasarım bulunamadı. Lütfen filtrelerinizi temizleyin.</p>
      </div>
    `;
    const paginationContainer = document.getElementById('shop-pagination');
    if (paginationContainer) paginationContainer.innerHTML = '';
    return;
  }

  const totalPages = Math.ceil(shopFilteredProducts.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const pageProducts = shopFilteredProducts.slice(start, start + ITEMS_PER_PAGE);

  grid.innerHTML = pageProducts.map(p => renderProductCard(p)).join('');

  grid.querySelectorAll('.shop-wish-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pid = btn.dataset.id;
      toggleWishlist(pid, btn);
    });
  });

  grid.querySelectorAll('.shop-card-quickview-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pid = btn.dataset.id;
      openQuickView(pid);
    });
  });

  renderPagination(totalPages);

  if (page !== 1) {
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function renderPagination(totalPages) {
  const container = document.getElementById('shop-pagination');
  if (!container || totalPages <= 1) {
    if (container) container.innerHTML = '';
    return;
  }

  let html = '<div class="pagination">';
  html += `<button class="page-btn page-prev" ${shopCurrentPage === 1 ? 'disabled' : ''} data-page="${shopCurrentPage - 1}">&larr;</button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === shopCurrentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  html += `<button class="page-btn page-next" ${shopCurrentPage === totalPages ? 'disabled' : ''} data-page="${shopCurrentPage + 1}">&rarr;</button>`;
  html += '</div>';
  container.innerHTML = html;

  container.querySelectorAll('.page-btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => renderShopPage(parseInt(btn.dataset.page)));
  });
}

function renderProductCard(p) {
  const prices = p.availableMaterials.map(mid => {
    const matMult = MATERIALS_DB[mid].mult;
    const minQ = Math.min(...QUALITIES_DB.map(q => q.mult));
    const maxQ = Math.max(...QUALITIES_DB.map(q => q.mult));
    return {
      min: Math.round(p.price * matMult * minQ),
      max: Math.round(p.price * matMult * maxQ),
    };
  });
  const minPrice = Math.min(...prices.map(pr => pr.min));
  const maxPrice = Math.max(...prices.map(pr => pr.max));

  const isFavorited = wishlist.includes(p.id);
  const imgUrl = p.thumbnail || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=640&auto=format&fit=crop';

  const designerHtml = p.designer && p.designer !== 'CustomShape3D' && p.designer !== 'Siz'
    ? `<div class="shop-card-designer">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        ${p.designer}
       </div>`
    : '';

  return `
    <div class="shop-card reveal" data-id="${p.id}" id="card-${p.id}"
         onclick="window.location.href='product.html?id=${p.id}'">
      
      <div class="shop-card-media">
        <img src="${imgUrl}" alt="${p.name}" class="shop-card-img" loading="lazy" />
        <div class="shop-card-overlay">
          <button class="shop-card-quickview-btn" data-id="${p.id}" title="3D Hızlı Önizleme">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            3D Önizleme
          </button>
        </div>
        
        <div class="shop-card-badge" style="background:${p.badgeColor}d8;color:#fff;border-color:transparent">${p.badge}</div>
        
        <button class="shop-wish-btn ${isFavorited ? 'active' : ''}" data-id="${p.id}" aria-label="Favorilere Ekle">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="${isFavorited ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>

      <div class="shop-card-body">
        <h3 class="shop-card-name">${p.name}</h3>
        <p class="shop-card-sub">${p.subtitle}</p>
        ${designerHtml}
        <div class="shop-card-footer">
          <div class="shop-card-stars">★ ${p.rating}</div>
          <div class="shop-card-price">₺${minPrice} - ₺${maxPrice}</div>
        </div>
      </div>
    </div>
  `;
}

function openQuickView(productId) {
  const p = PRODUCTS.find(prod => prod.id === productId);
  if (!p) return;

  const modal = document.getElementById('shop-quickview-modal');
  if (!modal) return;

  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';

  const badge = document.getElementById('qv-badge');
  badge.textContent = p.badge;
  badge.style.background = p.badgeColor + '22';
  badge.style.color = p.badgeColor;
  badge.style.border = `1px solid ${p.badgeColor}44`;

  document.getElementById('qv-title').textContent = p.name;
  document.getElementById('qv-subtitle').textContent = p.subtitle;
  document.getElementById('qv-rating').textContent = `★ ${p.rating} (${p.reviews} değerlendirme)`;
  document.getElementById('qv-designer').textContent = p.designer ? `Tasarımcı: ${p.designer}` : '';
  document.getElementById('qv-dims').textContent = p.dims;
  document.getElementById('qv-category').textContent = p.category === 'mekanik' ? '⚙️ Mekanik' : p.category === 'dekor' ? '🏠 Dekor' : '🎒 Aksesuar';

  const customizeBtn = document.getElementById('qv-customize-btn');
  if (customizeBtn) {
    customizeBtn.setAttribute('href', `product.html?id=${p.id}`);
  }

  const quickCartBtn = document.getElementById('qv-cart-quick-btn');
  if (quickCartBtn) {
    const newBtn = quickCartBtn.cloneNode(true);
    quickCartBtn.parentNode.replaceChild(newBtn, quickCartBtn);
    newBtn.addEventListener('click', () => {
      addToCart(p.id, newBtn);
    });
  }

  const prices = p.availableMaterials.map(mid => {
    const matMult = MATERIALS_DB[mid].mult;
    const minQ = Math.min(...QUALITIES_DB.map(q => q.mult));
    const maxQ = Math.max(...QUALITIES_DB.map(q => q.mult));
    return {
      min: Math.round(p.price * matMult * minQ),
      max: Math.round(p.price * matMult * maxQ),
    };
  });
  const minPrice = Math.min(...prices.map(pr => pr.min));
  const maxPrice = Math.max(...prices.map(pr => pr.max));
  document.getElementById('qv-price-val').textContent = `₺${minPrice} - ₺${maxPrice}`;

  const colorContainer = document.getElementById('qv-color-swatches');
  colorContainer.innerHTML = '';
  let selectedHex = p.colors[0].hex;
  
  p.colors.forEach((c, idx) => {
    const btn = document.createElement('button');
    btn.className = `qv-color-swatch ${idx === 0 ? 'active' : ''}`;
    btn.style.backgroundColor = c.hex;
    btn.title = c.name;
    btn.addEventListener('click', () => {
      colorContainer.querySelectorAll('.qv-color-swatch').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedHex = c.hex;
      document.getElementById('qv-selected-color-name').textContent = c.name;
      updateQVModelColor(c.hex);
    });
    colorContainer.appendChild(btn);
  });
  document.getElementById('qv-selected-color-name').textContent = p.colors[0].name;

  // Viewport Handling
  const canvas = document.getElementById('quickview-canvas');
  const canvasControls = modal.querySelector('.shop-modal-canvas-controls');
  const wrap = canvas.parentElement;

  // Clear any existing preview image
  let existingImg = wrap.querySelector('.qv-preview-img');
  if (existingImg) {
    existingImg.remove();
  }

  if (p.id === 'custom-upload') {
    canvas.style.display = 'block';
    if (canvasControls) canvasControls.style.display = 'flex';
    initQuickView3D(p, selectedHex);
  } else {
    canvas.style.display = 'none';
    if (canvasControls) canvasControls.style.display = 'none';
    cleanupQuickView3D();

    const img = document.createElement('img');
    img.className = 'qv-preview-img';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '12px';
    img.src = p.thumbnail;
    wrap.appendChild(img);
  }
}

function initQuickView3D(p, initialHex) {
  cleanupQuickView3D();

  const canvas = document.getElementById('quickview-canvas');
  const wrap = canvas.parentElement;
  if (!canvas || !wrap) return;

  qvScene = new THREE.Scene();
  qvScene.background = new THREE.Color(0x060810);

  qvCamera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  qvCamera.position.set(0, 0.6, 5.2);

  qvRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  qvRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  qvRenderer.outputColorSpace = THREE.LinearSRGBColorSpace;

  function resize() {
    const w = wrap.offsetWidth || 350;
    const h = wrap.offsetHeight || 300;
    if (w === 0 || h === 0) return;
    qvRenderer.setSize(w, h, false);
    qvCamera.aspect = w / h;
    qvCamera.updateProjectionMatrix();
  }
  
  requestAnimationFrame(() => {
    resize();
    new ResizeObserver(resize).observe(wrap);
  });

  qvControls = new OrbitControls(qvCamera, canvas);
  qvControls.enableDamping = true;
  qvControls.dampingFactor = 0.07;
  qvControls.autoRotate = qvAutoRotate;
  qvControls.autoRotateSpeed = 1.5;
  qvControls.target.set(0, 0, 0);

  qvScene.add(new THREE.AmbientLight(0x0D1633, 2.8));

  const keyLight = new THREE.DirectionalLight(0xfff8f0, 4.0);
  keyLight.position.set(4, 6, 5);
  qvScene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xf0f5ff, 2.0);
  fillLight.position.set(-5, 1, 3);
  qvScene.add(fillLight);

  const rimLight = new THREE.PointLight(0xddeeff, 2.5, 40);
  rimLight.position.set(0, 5, -5);
  qvScene.add(rimLight);

  const gridGeo = new THREE.PlaneGeometry(6, 6, 10, 10);
  const gridMat = new THREE.MeshBasicMaterial({ color: 0x1d2c60, wireframe: true, transparent: true, opacity: 0.12 });
  const grid = new THREE.Mesh(gridGeo, gridMat);
  grid.rotation.x = -Math.PI / 2;
  qvScene.add(grid);

  qvModelGroup = new THREE.Group();
  const col = new THREE.Color(initialHex);
  try {
    const buildFn = p.buildFn || buildCustomUpload;
    buildFn(qvModelGroup, col);
  } catch (err) {
    console.error('[Quick View 3D] Build error:', err);
  }
  qvScene.add(qvModelGroup);

  const rotBtn = document.getElementById('qv-ctrl-rotate');
  if (rotBtn) {
    rotBtn.classList.toggle('active', qvAutoRotate);
    rotBtn.textContent = qvAutoRotate ? '↺ Oto' : '⏸ Dur';
    
    const newRotBtn = rotBtn.cloneNode(true);
    rotBtn.parentNode.replaceChild(newRotBtn, rotBtn);
    newRotBtn.addEventListener('click', () => {
      qvAutoRotate = !qvAutoRotate;
      qvControls.autoRotate = qvAutoRotate;
      newRotBtn.classList.toggle('active', qvAutoRotate);
      newRotBtn.textContent = qvAutoRotate ? '↺ Oto' : '⏸ Dur';
    });
  }

  const resetBtn = document.getElementById('qv-ctrl-reset');
  if (resetBtn) {
    const newResetBtn = resetBtn.cloneNode(true);
    resetBtn.parentNode.replaceChild(newResetBtn, resetBtn);
    newResetBtn.addEventListener('click', () => {
      qvControls.reset();
      qvCamera.position.set(0, 0.6, 5.2);
    });
  }

  qvClock = new THREE.Clock();
  
  function qvLoop() {
    if (!qvScene) return;
    qvRafId = requestAnimationFrame(qvLoop);
    qvControls.update();
    qvRenderer.render(qvScene, qvCamera);
  }
  
  qvLoop();
}

function updateQVModelColor(hex) {
  if (!qvModelGroup) return;
  const newCol = new THREE.Color(hex);
  qvModelGroup.traverse(obj => {
    if (obj.isMesh && obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach(m => { if (m.color) m.color.set(newCol); });
      } else if (obj.material.color) {
        obj.material.color.set(newCol);
      }
    }
  });
}

function cleanupQuickView3D() {
  if (qvRafId) {
    cancelAnimationFrame(qvRafId);
    qvRafId = null;
  }
  if (qvRenderer) {
    qvRenderer.dispose();
    qvRenderer = null;
  }
  if (qvControls) {
    qvControls.dispose();
    qvControls = null;
  }
  if (qvScene) {
    qvScene.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
    qvScene = null;
  }
  qvCamera = null;
  qvModelGroup = null;
}

function closeQuickView() {
  const modal = document.getElementById('shop-quickview-modal');
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'true');
  modal.classList.remove('show');
  document.body.style.overflow = '';
  cleanupQuickView3D();
}

// ══════════════════════════════════════════════════════
// MODEL BUILDERS — Detailed
// ══════════════════════════════════════════════════════

function makePrimaryMat(col) {
  return new THREE.MeshLambertMaterial({ color: col });
}
function makeAccentMat(col, opacity = 0.90) {
  return new THREE.MeshLambertMaterial({ color: col, transparent: true, opacity });
}
function makeWireMat(col) {
  return new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.0 });
}

// 0 ── Custom Upload ─────────────────────────────────────
function buildCustomUpload(group, col) {
  const pm = makePrimaryMat(col, 130);
  const geo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
  const mesh = new THREE.Mesh(geo, pm);
  group.add(mesh);
  
  group.userData.colorable = { primaryMats: [pm], accentMats: [] };
  group.userData.isCustom = true; 
}

function loadUserSTL(file, pid) {
  const state = cardStates.get(pid);
  if (!state) return;
  const url = URL.createObjectURL(file);
  const loader = new STLLoader();
  
  loader.load(url, (geometry) => {
    state.group.children.slice().forEach(c => {
      if (c.isMesh) {
        c.geometry.dispose();
        state.group.remove(c);
      }
    });
    geometry.center();
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    const size = new THREE.Vector3();
    geometry.boundingBox.getSize(size);
    const scale = 1.5 / Math.max(size.x, size.y, size.z);
    
    const mat = state.colorable.primaryMats[0];
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.scale.setScalar(scale);
    
    state.group.add(mesh);
    showToast('STL dosyası başarıyla yüklendi! 🚀');
    
    const nameEl = document.querySelector(`#card-${pid} .shop-card-name`);
    const subEl = document.querySelector(`#card-${pid} .shop-card-sub`);
    if (nameEl) nameEl.textContent = file.name.substring(0, 20);
    if (subEl) subEl.textContent = 'Yüklenen Model';
  }, undefined, (err) => {
    console.error(err);
    showToast('STL yüklenirken hata oluştu.');
  });
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
  const lens = new THREE.Mesh(new THREE.SphereGeometry(0.10, 16, 16), makeAccentMat(0x000a14, 0.95));
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
  const pm  = new THREE.MeshLambertMaterial({
    color: col, transparent: true, opacity: 0.94, side: THREE.DoubleSide
  });
  const wm = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.0 });

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
      makeAccentMat(col, 0.95));
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
      new THREE.MeshLambertMaterial({ color: 0x111116 }));
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
      makeAccentMat(col, 0.90));
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
  const roofMat = new THREE.MeshLambertMaterial({ color: 0x3b21b6 });
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
  const foliage = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.55, 8), new THREE.MeshLambertMaterial({ color: 0x16a34a }));
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
    new THREE.MeshLambertMaterial({ color: 0x020804, side: THREE.BackSide }));
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
      makeAccentMat(col, 0.95));
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
  const camWire = new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.84, 0.15), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.0 }));
  camWire.position.y = 0.85;
  group.add(camWire);

  // Lens circle
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 20),
    makeAccentMat(0x000510, 0.90));
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
// ══════════════════════════════════════════════════════

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

export {
  buildCustomUpload,
  buildDroneFrame,
  buildGearSet,
  buildPhoneStand,
  buildCableOrganizer,
  buildMiniHouse,
  buildRobotJoint,
  buildHeadphoneStand,
  buildPlanter,
  buildFidgetSpinner,
  buildGoProMount,
  buildHexStorage
};
