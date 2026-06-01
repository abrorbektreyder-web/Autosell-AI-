# Yangilangan Multi-Agent SMM & Savdo Ishchi Paneli Rejasi (v3.0)

Ushbu hujjat siz yuklagan har qanday mahsulot ma'lumotlarini qayta ishlovchi 5 ta agentning alohida tugmalarda (tablar qatorida) ishlashi hamda "Tayyor bo'ldi, xo'jayin!" konseptini chiroyli va tushunarli qilish rejasini belgilaydi.

---

## 1. Asosiy Muammo va Taklif Etilayotgan Yechim

**Muammo:**
Dasturdagi 3-ustunli layout yoki barcha xabarlar bitta terminal logda ketma-ket chiqishi foydalanuvchiga murakkab va tushunarsiz tuyuldi. Agentlarning o'rni va qaysi agent nima ish qilgani aniq ko'rinmadi.

**Yechim (Multi-Agent Auto-Flow):**
1. **Alohida Tugmalar (Tablar Qatori):** Ekran yuqori qismida barcha 5 ta agent chiroyli neon tugmalar ko'rinishida qator bo'lib turadi:
   * `👑 Assistent` (Shaxsiy Assistent - Jarayonlarni nazorat qiladi va yakuniy natijani topshiradi)
   * `📊 Marketolog` (Bozorni tahlil qilib, sotuvchi triggerlar va hashtaglar tayyorlaydi)
   * `🎨 Dizayner` (Photoroom API orqali mahsulot fonini tozalab, premium dizayn qiladi)
   * `✍️ Kopirayter` (Instagram uchun sotuvchi matn va slayd-shou ssenariysi yozadi)
   * `💰 Sotuvchi` (Instagram Direct simulyatori - mijozlar savollariga avtomatik javob berib, buyurtma oladi)

2. **Avtomatlashtirilgan Oqim (Auto-Tab Simulation):**
   * Foydalanuvchi chap panelda ma'lumotlarni to'ldirib **"Ishni Boshlash (Start)"** tugmasini bosadi.
   * Tizim o'z-o'zidan birma-bir har bir agent tabiga o'tib, ularning faollashganini ko'rsatadi:
     1. **Marketolog Tabiga o'tiladi:** Loader aylanadi va marketolog natijalari dynamic ravishda ekranda yoziladi.
     2. **Dizayner Tabiga o'tiladi:** Loader aylanadi va Photoroom foni tozalangan rasm slider orqali dynamic ravishda ochiladi.
     3. **Kopirayter Tabiga o'tiladi:** Matnlar va slayd ssenariylari dynamic yoziladi.
     4. **Assistent Tabiga qaytiladi:** Shaxsiy assistent barcha ishlarni tekshirib, sifat nazoratidan o'tkazib, yashil glowing **"Tayyor bo'ldi, xo'jayin! 👑"** hisobot kartasini ochadi.
   * Bu vizual oqim agentlar chindan ham ketma-ket hamkorlikda ishlayotganini juda tushunarli va yorqin ko'rsatib beradi!

3. **Tayyor Narsalarni Saqlash (Nusxalash va Yuklash):**
   * Assistentning final kartasida yirik va qulay tugmalar bo'ladi:
     * **Matnni Nusxalash** (Instagram post yozuvi uchun)
     * **Rasmni Yuklash (PNG)** (Photoroom tomonidan dizayn qilingan premium rasm)
     * **Reels Ssenariysini Yuklash (TXT)** (Slaydlar va audio yo'riqnoma matni)
     * **Instagramga Joylash (Meta API)** (Postni sahifaga avtomat joylash simulyatsiyasi)

---

## 2. Fayllardagi O'zgarishlar

### `index.html`
* O'ng panelning tabs tuzilishini yiriklashtiramiz. Har bir tab mazmuni alohida bento card ichida turadi.
* Loaderlar (Yuklanish animatsiyalari) va yashil visual checkmarklar qo'shiladi.
* Assistent tabida "Tayyor bo'ldi, xo'jayin!" eksport kartasini yanada yirik va zamonaviy qilamiz.

### `styles.css`
* Neon agent rang tizimi (Assistent: Binafsha, Marketolog: Sariq, Dizayner: Moviy, Kopirayter: Pushti, Sotuvchi: Yashil).
* Tablarni bosgandagi smooth neon border shadow effektlari.
* Avtomat o'tishlar va loaderlar uchun premium micro-animation effektlari.

### `app.js`
* Dynamic `setTimeout` zanjiri orqali avtomatik tab o'zgarishi (`switchTab`) logikasi.
* Har bir tab ichidagi elementlarning dynamic yozilish (typing) effektlari.
* Hujjatlarni yuklab olish (.txt, .png) va matnlarni clipboardga nusxalash amallari.

---

## 3. Tekshirish va Ishga Tushirish

* Ushbu plan tasdiqlangach, kod to'liq yoziladi.
* Foydalanuvchi o'z kompyuterida brauzerni bir marta yangilab (refresh) "Start" tugmasini bosishi va ajoyib oqimni kuzatishi kifoya bo'ladi.
