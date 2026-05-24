# 📋 TEXNIK TOPSHIRIQ № 2
## Dizayner Agent — "Visual Analyst" ga Aylantirish
### Loyiha: Multi-Agent SMM & Savdo Platformasi v3.3

---

## 1. MUAMMO (Joriy Holat)

Hozirgi Dizayner Agent **3 ta asosiy muammoga ega:**

### 1.1 Rasm almashtirilmoqda
```
Foydalanuvchi rasm yuklaydi
       ↓
Dizayner agent BUTUNLAY boshqa rasmni (Unsplash themes) ko'rsatadi
       ↓
Foydalanuvchining rasmi yo'qolib ketadi ❌
```

### 1.2 Photoroom API ulanmagan
`app.js` da Photoroom API chaqirilmaydi. Faqat themes dan boshqa URL olinadi.
Fon tozalash — **simulyatsiya**, haqiqiy jarayon emas.

### 1.3 Dizayner agentning roli noaniq
"Rasm dizaynini qiladi" deyilgan, lekin aslida hech narsa qilmaydi.

---

## 2. MAQSAD (Yangi Holat)

> **Foydalanuvchi tayyor rasm yuklaydi → Dizayner agent rasmni QABUL QILADI, tahlil qiladi, ko'rsatadi → Kopirayter matn yozadi.**

```
┌─────────────────────────────────────────────────────────┐
│  PIPELINE (To'g'ri Oqim)                                │
│                                                         │
│  [Rasm Yuklash]                                         │
│       ↓                                                 │
│  [1. Marketolog] → Auditoriya, Triggers, Hashtaglar     │
│       ↓                                                 │
│  [2. Dizayner ✨] → Rasmni qabul qiladi + AI tahlil    │
│       ↓              (rasmga TEGMAYDI)                  │
│  [3. Kopirayter] → Matn + Reels ssenariy                │
│       ↓                                                 │
│  [4. Sotuvchi]   → DM bot, FAQ, narx taklif             │
│       ↓                                                 │
│  [5. Assistent]  → Hamma ishni tekshiradi, Tasdiqlaydi  │
└─────────────────────────────────────────────────────────┘
```

---

## 3. DIZAYNER AGENTNING YANGI ROLI

### 3.1 Nom o'zgarmaydi: "Dizayner Agent"
### 3.2 Yangi funksiyalar:

```
┌──────────────────────────────────────────────────────────┐
│  DIZAYNER AGENT — Visual Analyst v2.0                   │
│                                                          │
│  [A] Rasmni ko'rsatish (Display)                        │
│      • Foydalanuvchi rasmini katta va aniq ko'rsatadi   │
│      • Loading animatsiya (2 soniya "tahlil qilmoqda")  │
│                                                          │
│  [B] AI Vizual Tahlil (Groq AI)                         │
│      • Mahsulot nomi + narxidan kelib chiqib:           │
│        - Post uchun tavsiya etilgan rang palitrasi       │
│        - Kayfiyat (Mood): Luxury / Natural / Energetic  │
│        - Optimal post format: 1:1, 4:5, yoki 9:16       │
│        - Font tavsiyasi (header uchun)                  │
│                                                          │
│  [C] Format Preview (3 ta ko'rinish)                    │
│      • Feed Post    1:1   → kvadrat preview             │
│      • Portrait     4:5   → vertikal preview            │
│      • Stories/Reels 9:16 → uzun vertikal preview       │
│                                                          │
│  [D] Sifat Sozlamalari (CSS Filter)                     │
│      • Yorqinlik (Brightness): slider 60–140%           │
│      • To'yinish (Saturation): slider 50–180%           │
│      • Kontrast (Contrast):    slider 80–130%           │
│      ⚠️ Faqat PREVIEW — asl rasm o'zgarmaydi            │
│                                                          │
│  [E] Yuklab Olish                                        │
│      • "Rasmni Yuklab Olish" tugmasi                    │
└──────────────────────────────────────────────────────────┘
```

---

## 4. TEXNIK AMALGA OSHIRISH

### 4.1 app.js — O'zgaradigan joylar

#### a) Global state: imageDataURL qo'shiladi
```javascript
// Foydalanuvchi yuklagan rasm — global, barcha agentlar ko'radi
let uploadedImageDataURL = null;

// fileInput change event'da:
reader.onload = (ev) => {
    uploadedImageDataURL = ev.target.result; // ← SAQLANADI
    previewImg.src = ev.target.result;
    ...
};
```

#### b) Auto-flow Designer step — TO'LIQ YANGILANADI
```javascript
// ── 2-QADAM: DIZAYNER AGENT (Visual Analyst) ────────────────────────────
switchTab('designer');
// ... loading ko'rsatiladi

// 1. Rasmni oladi (global variable dan)
const imageToShow = uploadedImageDataURL || null;

// 2. Rasmni pane'da ko'rsatadi
const designerPreviewImg = document.getElementById('designer-preview-img');
if (imageToShow) {
    designerPreviewImg.src = imageToShow;
    document.getElementById('designer-no-image').classList.add('hidden');
    document.getElementById('designer-has-image').classList.remove('hidden');
} else {
    // Rasm yuklanmagan — ogohlantirish
    document.getElementById('designer-no-image').classList.remove('hidden');
    document.getElementById('designer-has-image').classList.add('hidden');
}

// 3. AI Vizual Tahlil
let visualBrief = '';
try {
    visualBrief = await askGroq(
        `Sen vizual marketing ekspertisan. O'zbek tilida qisqa va aniq javob berasan.`,
        `Mahsulot: "${name}", Narxi: ${price} so'm.
Post uchun quyidagi formatda vizual tavsiyalar ber:
RANG: [3 ta HEX rang, vergul bilan, misol: #FF5733, #C0392B, #2C3E50]
KAYFIYAT: [bitta so'z: Luxury / Natural / Energetic / Minimal / Bold]
FORMAT: [bitta format: 1:1 / 4:5 / 9:16]
FONT_TAVSIYA: [bitta font nomi: Montserrat / Playfair Display / Oswald / Bebas Neue]`,
        200
    );
} catch(e) {
    visualBrief = 'RANG: #6C63FF, #FF6B6B, #FFA07A\nKAYFIYAT: Energetic\nFORMAT: 4:5\nFONT_TAVSIYA: Montserrat';
}

// 4. agentState saqlanadi
agentState.designer.data = {
    imageSrc: imageToShow,
    visualBrief: visualBrief
};
```

#### c) Manual Designer start — TO'LIQ YANGILANADI
```javascript
document.getElementById('start-designer').addEventListener('click', async () => {
    // themes ishlatilmaydi
    // uploadedImageDataURL dan foydalanadi
    // xuddi auto-flow kabi ishlaydi
});
```

#### d) Download tugmasi — uploadedImageDataURL dan foydalanadi
```javascript
// Agar foydalanuvchi rasmi bo'lsa → DataURL yuklash
// Agar yo'q → xabar ko'rsatish
```

---

### 4.2 index.html — Designer Pane to'liq yangilanadi

#### Yangi strukturasi:
```html
<!-- result-designer ichida -->
<div class="designer-result-layout">

  <!-- CHAP: Rasm Ko'rinishi -->
  <div class="designer-image-section">
    
    <!-- Rasm bor holatda -->
    <div id="designer-has-image" class="hidden">
      <div class="designer-format-tabs">
        <button class="fmt-tab active" data-ratio="1/1">1:1</button>
        <button class="fmt-tab" data-ratio="4/5">4:5</button>
        <button class="fmt-tab" data-ratio="9/16">9:16</button>
      </div>
      <div class="designer-img-frame" id="designer-img-frame">
        <img id="designer-preview-img" src="" alt="Post Rasmi">
      </div>
    </div>

    <!-- Rasm yo'q holatda -->
    <div id="designer-no-image" class="designer-no-img-box">
      <i data-lucide="image-off"></i>
      <p>Rasm yuklanmadi</p>
      <small>Chap paneldan rasm yuklang, keyin "Start" ni bosing</small>
    </div>

  </div>

  <!-- O'NG: AI Tahlil + Sozlamalar -->
  <div class="designer-controls">
    
    <!-- AI Vizual Brief -->
    <div class="rcard-h"><i data-lucide="sparkles"></i> AI Vizual Tahlil</div>
    <div id="designer-brief-box">
      <div class="brief-item">
        <span class="brief-label">Rang Palitra</span>
        <div class="brief-colors" id="brief-colors">
          <div class="color-dot" style="background:#6C63FF"></div>
          <div class="color-dot" style="background:#FF6B6B"></div>
          <div class="color-dot" style="background:#FFA07A"></div>
        </div>
      </div>
      <div class="brief-item">
        <span class="brief-label">Kayfiyat</span>
        <span class="brief-value" id="brief-mood">—</span>
      </div>
      <div class="brief-item">
        <span class="brief-label">Optimal Format</span>
        <span class="brief-value" id="brief-format">—</span>
      </div>
      <div class="brief-item">
        <span class="brief-label">Font Tavsiyasi</span>
        <span class="brief-value" id="brief-font">—</span>
      </div>
    </div>

    <!-- CSS Filter Sozlamalari -->
    <div class="rcard-h" style="margin-top:12px">
      <i data-lucide="sliders"></i> Ko'rinish Sozlamalari
    </div>
    <div class="range-row">
      <span>Yorqinlik</span>
      <input type="range" id="ctrl-brightness" min="60" max="140" value="100">
      <span id="val-brightness">100%</span>
    </div>
    <div class="range-row">
      <span>To'yinish</span>
      <input type="range" id="ctrl-saturation" min="50" max="180" value="100">
      <span id="val-saturation">100%</span>
    </div>
    <div class="range-row">
      <span>Kontrast</span>
      <input type="range" id="ctrl-contrast" min="80" max="130" value="100">
      <span id="val-contrast">100%</span>
    </div>

    <!-- Yuklab Olish -->
    <button class="btn btn-agent designer-btn" id="download-designed">
      <i data-lucide="download"></i> Rasmni Yuklab Olish
    </button>

  </div>
</div>
```

---

### 4.3 styles.css — Yangi uslublar

```css
/* Designer Image Frame — format ratio ga mos */
.designer-img-frame {
    width: 100%;
    aspect-ratio: 1 / 1; /* default — fmt-tab bilan o'zgaradi */
    overflow: hidden;
    border-radius: var(--r-md);
    border: 2px solid hsla(var(--designer), 0.3);
    background: rgba(0,0,0,0.3);
    transition: aspect-ratio var(--med);
}
.designer-img-frame img {
    width: 100%; height: 100%;
    object-fit: cover;
    transition: filter var(--med);
}

/* Format tab buttons */
.designer-format-tabs { display: flex; gap: 6px; margin-bottom: 8px; }
.fmt-tab {
    flex: 1; padding: 5px; border-radius: 6px;
    background: hsla(var(--designer), 0.1);
    border: 1px solid hsla(var(--designer), 0.25);
    color: hsl(var(--designer));
    font-size: .7rem; font-weight: 700; cursor: pointer;
    transition: all var(--fast);
}
.fmt-tab.active, .fmt-tab:hover {
    background: hsl(var(--designer));
    color: #000;
}

/* AI Brief box */
.brief-item { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid hsla(var(--border),.2); }
.brief-label { font-size: .68rem; color: hsl(var(--txt-3)); text-transform: uppercase; letter-spacing: .8px; }
.brief-value { font-size: .78rem; color: hsl(var(--txt)); font-weight: 600; }
.brief-colors { display: flex; gap: 4px; }
.color-dot { width: 18px; height: 18px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.2); }

/* No image state */
.designer-no-img-box {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 8px; padding: 40px 20px;
    border: 2px dashed hsla(var(--designer), 0.3);
    border-radius: var(--r-md);
    color: hsl(var(--txt-3));
    background: rgba(0,0,0,0.2);
}
.designer-no-img-box i { width: 32px; height: 32px; color: hsla(var(--designer), 0.5); }
```

---

## 5. DATA OQIMI (Agent→Agent)

```
agentState.designer.data = {
    imageSrc: "data:image/jpeg;base64,...",  // ← Keyingi agentlar uchun
    visualBrief: {
        colors: ["#6C63FF", "#FF6B6B", "#FFA07A"],
        mood: "Energetic",
        format: "4:5",
        font: "Montserrat"
    }
}

// Kopirayter bu ma'lumotni ishlatadi:
const mood = agentState.designer.data?.visualBrief?.mood || '';
const format = agentState.designer.data?.visualBrief?.format || '';
// Groq prompta qo'shiladi:
// "Rasm Kayfiyati: Energetic, Format: 4:5 uchun matn yoz"
```

---

## 6. O'ZGARMAYDIGAN QISMLAR

| Qism | Holat |
|------|-------|
| Marketolog agent | ✅ O'zgarmaydi |
| Kopirayter agent | ✅ Faqat vizual brief qo'shiladi |
| Sotuvchi agent | ✅ O'zgarmaydi |
| Assistent chat | ✅ O'zgarmaydi |
| Export card | ✅ O'zgarmaydi |
| Auto-flow pipeline | ✅ Faqat 2-qadam yangilanadi |
| Global `themes` object | ❌ O'chiriladi |

---

## 7. FAYLLAR RO'YXATI

| Fayl | O'zgarish |
|------|----------|
| `app.js` | Designer step (auto + manual), filter handler, download |
| `index.html` | Designer pane HTML to'liq yangilanadi |
| `styles.css` | `.designer-img-frame`, `.fmt-tab`, `.brief-*`, `.designer-no-img-box` |

---

## 8. UX/UI TALABLARI

- ✅ Rasm yuklanmagan bo'lsa → chiroyli "Rasm yuklanmadi" holati
- ✅ Format tabs (1:1 / 4:5 / 9:16) — aspect-ratio CSS bilan
- ✅ AI Brief animatsiya bilan yoziladi (typeText)
- ✅ Filter sliderlar real-time preview (CSS filter)
- ✅ Download — DataURL dan to'g'ridan-to'g'ri
- ✅ Loading animatsiya: "Rasm tahlil qilinmoqda..."
- ✅ Pipeline: Dizayner bitgach Kopirayter boshlaydi

---

## 9. KUTILGAN NATIJA

```
Foydalanuvchi: "Smart Termos Pro" rasmi yuklaydi → Start bosadi
       ↓
Marketolog: Auditoriya + Hashtaglar ✓
       ↓
Dizayner: 
  • Rasmni ko'rsatadi (o'sha yuklangan rasm)
  • AI tahlil: "Rang: #2C3E50, #3498DB, #ECF0F1 | Minimal | 1:1 | Oswald" ✓
       ↓
Kopirayter: Mahsulot + mood'ga mos AIDA matn + Reels ✓
       ↓
Sotuvchi: DM bot tayyor ✓
       ↓
Assistent: Hamma tekshirildi. Eksport qiling! 👑
```

---

*Tayyorlagan: AI Architect | Sana: 2026-05-24 | Versiya: 2.0*
