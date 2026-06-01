# TEXNIK VAZIFA v3.0

## Loyiha nomi
Instagram AI Sales Bot CRM

## Loyiha turi
SaaS CRM + Instagram Comment-to-DM Automation + Telegram Notification

## Loyiha maqsadi
Instagram reels, post, video va reklamalardan kelayotgan mijozlarni avtomatik ushlab qolish, mijoz commentga maxsus kalit so'z yozganda unga Instagram DM orqali javob yuborish, AI yordamida professional sotuv suhbatini olib borish, mijozdan ism va telefon raqamini olish, CRM bazaga saqlash va Telegram guruhga yangi lid sifatida yuborish.

---

# 1. ASOSIY ISHLASH MODELI

## 1.1 Oddiy biznes flow

Owner Instagram'da reel, post, video yoki reklama joylaydi.

Masalan videoda aytadi:

```text
Yumshoq mebel narxini bilish uchun kommentariyaga 55 deb yozing.
```

Mijoz kommentariyaga yozadi:

```text
55
```

Tizim dashboarddagi ma'lumotdan tekshiradi:

```text
55 = Yumshoq mebel
```

Keyin bot Instagram Private Reply orqali mijozning DM'siga birinchi xabarni yuboradi.

AI DM ichida professional sotuvchi kabi qisqa, aniq va savdoga yo'naltirilgan suhbat olib boradi.

Asosiy maqsad:

```text
Mijoz ismi
Telefon raqami
Qiziqqan mahsulot
```

Email va manzil so'ralmaydi.

## 1.2 To'liq jarayon

- [ ] Owner Instagram'da reel/post/video/reklama joylaydi.
- [ ] Owner dashboardda mahsulot yaratadi.
- [ ] Owner dashboardda kampaniya yaratadi.
- [ ] Owner kampaniyaga mahsulot biriktiradi.
- [ ] Owner kampaniyaga maxsus kalit so'z biriktiradi.
- [ ] Mijoz Instagram commentga kalit so'z yozadi.
- [ ] Instagram webhook serverga comment event yuboradi.
- [ ] Server webhook signature tekshiradi.
- [ ] Server duplicate eventlarni Redis orqali tekshiradi.
- [ ] Tizim comment matnini normalizatsiya qiladi.
- [ ] Tizim kalit so'zni bazadan qidiradi.
- [ ] Mahsulot va kampaniya topiladi.
- [ ] Bot Instagram Private Reply orqali mijoz DM'siga birinchi xabar yuboradi.
- [ ] Mijoz DM'da javob beradi.
- [ ] AI DM ichida sotuv suhbatini davom ettiradi.
- [ ] AI mijozdan ism va telefon raqamini oladi.
- [ ] CRM'da yangi lead yaratiladi.
- [ ] Telegram guruhga yangi lead haqida xabar yuboriladi.
- [ ] Owner yoki sotuvchilar Telegram guruh orqali mijozga bog'lanadi.

---

# 2. MUHIM QARORLAR

- [ ] Reels/post/video Instagram ilovasining o'zida joylanadi.
- [ ] Dashboard Instagram o'rniga post joylamaydi.
- [ ] Dashboard faqat mahsulot, kampaniya, kalit so'z, AI, CRM, Telegram va integration sozlamalarini boshqaradi.
- [ ] Operator moduli bo'lmaydi.
- [ ] Owner Telegram guruhga kerakli operatorlarni o'zi qo'shadi.
- [ ] Email so'ralmaydi.
- [ ] Manzil so'ralmaydi.
- [ ] Asosiy lead ma'lumoti ism va telefon raqam bo'ladi.
- [ ] Instagram username yoki Instagram user ID imkon bo'lsa avtomatik saqlanadi.
- [ ] AI mahsulotni o'zi taxmin qilmaydi.
- [ ] Mahsulot `keyword -> campaign -> product` orqali aniqlanadi.
- [ ] Agar kalit so'z topilmasa, AI mahsulotni taxmin qilmaydi.
- [ ] Tokenlar database'da ochiq matnda saqlanmaydi.
- [ ] Barcha muhim tokenlar AES-256-GCM orqali shifrlanadi.

---

# 3. OWNER DASHBOARD

## 3.1 Dashboard bo'limlari

- [ ] Dashboard
- [ ] CRM Leads
- [ ] Conversations
- [ ] Products
- [ ] Campaigns & Keywords
- [ ] Instagram Integration
- [ ] Telegram Integration
- [ ] AI Sales Settings
- [ ] Exports
- [ ] Security
- [ ] Settings

## 3.2 Dashboard umumiy ko'rsatkichlari

Dashboard asosiy sahifasida quyidagilar ko'rsatiladi:

- [ ] Bugungi leadlar soni
- [ ] Jami leadlar soni
- [ ] Active kampaniyalar soni
- [ ] Eng ko'p lead olib kelgan mahsulot
- [ ] Telegram integration holati
- [ ] Instagram integration holati
- [ ] Oxirgi kelgan leadlar
- [ ] AI suhbatlari soni

---

# 4. PRODUCTS BO'LIMI

## 4.1 Mahsulot CRUD

Owner mahsulot yaratishi, ko'rishi, tahrirlashi va inactive qilishi mumkin.

Mahsulot maydonlari:

- [ ] Mahsulot nomi
- [ ] Narx
- [ ] Chegirma narxi
- [ ] Qisqa tavsif
- [ ] Dostavka ma'lumoti
- [ ] Mavjud ranglar
- [ ] Mavjud variantlar
- [ ] Mahsulot holati: active/inactive
- [ ] FAQ
- [ ] Created at
- [ ] Updated at

## 4.2 Mahsulot ma'lumotlaridan AI foydalanishi

AI mahsulot haqida faqat dashboardda kiritilgan ma'lumotlar asosida javob beradi.

AI quyidagilarni ishlatadi:

- [ ] Mahsulot nomi
- [ ] Narx
- [ ] Chegirma narxi
- [ ] Qisqa tavsif
- [ ] Dostavka ma'lumoti
- [ ] Ranglar
- [ ] Variantlar
- [ ] FAQ

Agar kerakli ma'lumot mahsulotda bo'lmasa, AI noto'g'ri javob to'qib chiqarmaydi.

---

# 5. CAMPAIGNS & KEYWORDS BO'LIMI

## 5.1 Kampaniya yaratish

Owner har bir reklama uchun kampaniya yaratadi.

Kampaniya maydonlari:

- [ ] Kampaniya nomi
- [ ] Mahsulot
- [ ] Kalit so'z
- [ ] Instagram post/reel/ad linki
- [ ] Birinchi DM matni
- [ ] Avto DM statusi: on/off
- [ ] Boshlanish sanasi
- [ ] Tugash sanasi
- [ ] Status: active/inactive
- [ ] Created at
- [ ] Updated at

Misol:

```text
Kampaniya: May oyi yumshoq mebel reklamasi
Mahsulot: Yumshoq mebel
Kalit so'z: 55
Narx: 4 500 000 so'mdan
Avto DM: yoqilgan
```

## 5.2 Kampaniya ishlash sharti

Kampaniya ishlashi uchun quyidagilar bo'lishi kerak:

- [ ] Kampaniya active bo'lishi kerak.
- [ ] Mahsulot active bo'lishi kerak.
- [ ] Kalit so'z active bo'lishi kerak.
- [ ] Instagram integration active bo'lishi kerak.
- [ ] Avto DM yoqilgan bo'lishi kerak.

---

# 6. KEYWORD CAMPAIGN ENGINE

## 6.1 Vazifasi

Keyword Campaign Engine commentdagi kalit so'z orqali mijoz qaysi mahsulotga qiziqqanini aniqlaydi.

Misol:

```text
55 = Yumshoq mebel
77 = Oshxona mebeli
88 = Ofis kreslosi
```

## 6.2 Qoidalar

- [ ] Har bir active kampaniyada kalit so'z bo'lishi kerak.
- [ ] Bitta biznes ichida active kalit so'z takrorlanmasligi kerak.
- [ ] Boshqa biznesda bir xil kalit so'z ishlatilishi mumkin.
- [ ] MVP'da faqat exact match ishlatiladi.
- [ ] Mijoz aynan `55` yozsa, `55` kampaniyasi ishga tushadi.
- [ ] Keyinchalik contains yoki regex match qo'shilishi mumkin.
- [ ] AI mahsulotni kalit so'zsiz taxmin qilmaydi.

## 6.3 Keyword normalization

Comment matni tekshiruvdan oldin normalizatsiya qilinadi.

Qoidalar:

- [ ] Oldi va oxiridagi bo'sh joylar olib tashlanadi.
- [ ] Katta-kichik harflar farqi hisobga olinmaydi.
- [ ] `#55` `55` sifatida taniladi.
- [ ] `55.` `55` sifatida taniladi.
- [ ] `55 ` `55` sifatida taniladi.
- [ ] ` 55` `55` sifatida taniladi.
- [ ] `MEBEL55` va `mebel55` bir xil deb olinadi.
- [ ] Emoji va ortiqcha tinish belgilari tozalanadi.

## 6.4 Duplicate keyword tekshirish

Agar owner active kampaniyada ishlatilayotgan kalit so'zni qayta kiritsa, dashboard xatolik beradi:

```text
Bu kalit so'z aktiv kampaniyada ishlatilmoqda. Boshqa kalit so'z tanlang.
```

## 6.5 Kalit so'z topilmasa

Agar commentdagi kalit so'z topilmasa:

- [ ] Mahsulot taxmin qilinmaydi.
- [ ] AI noto'g'ri mahsulot bo'yicha DM yubormaydi.
- [ ] Default holatda Private Reply yuborilmaydi.
- [ ] Owner xohlasa fallback public reply yoqishi mumkin.
- [ ] Fallback public reply misoli: `Ma'lumot olish uchun reklamadagi kodni to'g'ri yozing.`

---

# 7. INSTAGRAM INTEGRATSIYA

## 7.1 Ulanish

Instagram integratsiya Meta API orqali amalga oshiriladi.

Owner dashboardda "Instagram ulash" tugmasini bosadi.

Meta login oynasi ochiladi.

Owner Instagram Business yoki Creator account'ini ulaydi.

Instagram paroli tizimga kiritilmaydi.

## 7.2 Talab qilinadigan imkoniyatlar

Tizim quyidagi imkoniyatlarga ega bo'lishi kerak:

- [ ] Comment webhooklarni olish
- [ ] Comment matnini o'qish
- [ ] Commentga private reply yuborish
- [ ] DM xabarlarni olish
- [ ] DM orqali javob yuborish
- [ ] Instagram account/page ma'lumotlarini olish

## 7.3 Muhim xavfsizlik

- [ ] Instagram paroli tizimga kiritilmaydi.
- [ ] Meta OAuth orqali access token olinadi.
- [ ] Access token AES-256-GCM orqali shifrlanadi.
- [ ] Webhook signature verification majburiy bo'ladi.
- [ ] Production uchun Meta App Review va kerakli permissionlar olinadi.
- [ ] Token muddati tugasa, dashboardda reconnect holati ko'rsatiladi.

## 7.4 Webhook verification

Meta webhook ulanishida GET verification ishlaydi.

- [ ] Server `hub.challenge` ni qabul qiladi.
- [ ] Server verify tokenni tekshiradi.
- [ ] Token to'g'ri bo'lsa, `hub.challenge` qaytariladi.
- [ ] Token noto'g'ri bo'lsa, request rad etiladi.

## 7.5 Webhook signature verification

POST webhook requestlar uchun `X-Hub-Signature-256` tekshiriladi.

Talab:

- [ ] Request body HMAC-SHA256 orqali tekshiriladi.
- [ ] Meta App Secret ishlatiladi.
- [ ] Signature noto'g'ri bo'lsa, request rad etiladi.
- [ ] Signature to'g'ri bo'lsa, event queue'ga yuboriladi.

## 7.6 Comment-to-DM

Commentdan DM'ga yozish Instagram Private Reply orqali amalga oshiriladi.

Flow:

- [ ] Mijoz commentga kalit so'z yozadi.
- [ ] Webhook comment event yuboradi.
- [ ] Tizim kalit so'zni aniqlaydi.
- [ ] Tizim comment ID orqali private reply yuboradi.
- [ ] Mijoz DM'da javob bergach, AI suhbatni davom ettiradi.

## 7.7 Private Reply cheklovi

- [ ] Commentdan keyin mijozga birinchi DM Instagram Private Reply orqali yuboriladi.
- [ ] Keyingi AI suhbat mijoz DM'da javob bergandan keyin davom etadi.
- [ ] Tizim Meta API permissionlari va rate limitlariga amal qiladi.
- [ ] Private Reply spam maqsadida ishlatilmaydi.
- [ ] Rate limit holatlarida retry/backoff mexanizmi ishlaydi.

---

# 8. TELEGRAM INTEGRATSIYA

## 8.1 Dashboard sozlamalari

Owner dashboardda quyidagilarni kiritadi:

- [ ] Telegram bot token
- [ ] Telegram bot username
- [ ] Telegram group/chat ID
- [ ] Notification status
- [ ] Test message button

## 8.2 Ulanish jarayoni

- [ ] Owner Telegram'da BotFather orqali bot yaratadi.
- [ ] Owner bot token oladi.
- [ ] Owner botni kerakli Telegram guruhga qo'shadi.
- [ ] Owner group/chat ID'ni dashboardga kiritadi.
- [ ] Tizim token formatini tekshiradi.
- [ ] Tizim Telegram API orqali bot token ishlashini tekshiradi.
- [ ] Tizim bot guruhga xabar yubora olishini tekshiradi.
- [ ] Owner test xabar yuboradi.
- [ ] Test muvaffaqiyatli bo'lsa, sozlama saqlanadi.
- [ ] Bot token AES-256-GCM orqali shifrlanadi.

## 8.3 Telegram xabar formati

Yangi lead kelganda Telegram guruhga shunday xabar yuboriladi:

```text
Yangi lid

Mahsulot: Yumshoq mebel
Kalit so'z: 55
Kampaniya: May oyi reklamasi
Mijoz: Akmal
Telefon: +998 90 111 22 33
Instagram: @akmal_home
Manba: Comment -> DM
Comment: 55
Status: Yangi
```

## 8.4 Operatorlar

- [ ] Operatorlar tizim ichida alohida boshqarilmaydi.
- [ ] Owner Telegram guruhga kerakli sotuvchilarni o'zi qo'shadi.
- [ ] Tizim faqat Telegram guruhga lead xabarlarini yuboradi.

---

# 9. AI SALES ASSISTANT

## 9.1 AI vazifasi

AI professional sotuvchi va marketolog sifatida ishlaydi.

AI'ning asosiy vazifasi:

- [ ] Mijozga mahsulot haqida qisqa va aniq ma'lumot berish
- [ ] Mijozni suhbatda ushlab qolish
- [ ] Ism va telefon raqamini olish
- [ ] Suhbatni muloyim yakunlash
- [ ] CRM uchun lead ma'lumotlarini ajratib olish

## 9.2 AI qoidalari

AI quyidagi qoidalarga amal qiladi:

- [ ] Qisqa yozadi.
- [ ] Aniq javob beradi.
- [ ] Mijozni ortiqcha savollar bilan qiynamaydi.
- [ ] Email so'ramaydi.
- [ ] Manzil so'ramaydi.
- [ ] Faqat ism va telefon olishga harakat qiladi.
- [ ] Mahsulotni noto'g'ri taxmin qilmaydi.
- [ ] Narxni faqat bazadagi ma'lumotdan aytadi.
- [ ] O'zini AI deb tanishtirmaydi.
- [ ] Suhbatni muloyim yakunlaydi.
- [ ] Operator tez orada bog'lanishini aytadi.
- [ ] Agar mahsulot ma'lumoti bazada bo'lmasa, noto'g'ri javob to'qib chiqarmaydi.
- [ ] Juda uzun matn yozmaydi.
- [ ] Har bir javob sotuv maqsadiga xizmat qiladi.

## 9.3 AI birinchi DM namunasi

```text
Assalomu alaykum. Yumshoq mebel bo'yicha yozdingiz. Narxlar 4 500 000 so'mdan boshlanadi, o'lcham va matoga qarab aniq hisoblab beramiz. Sizga mos variantni aytishimiz uchun ismingiz va telefon raqamingizni yozib qoldiring.
```

## 9.4 AI yakuniy xabar namunasi

```text
Rahmat, Akmal. Ma'lumotlaringiz qabul qilindi. Suhbatingiz uchun rahmat, tez orada operatorimiz siz bilan bog'lanadi.
```

## 9.5 Lead extraction

AI yoki backend mijoz xabaridan quyidagilarni ajratib oladi:

- [ ] Ism
- [ ] Telefon raqam

Agar ism bor, telefon yo'q bo'lsa, AI telefon so'raydi.

Agar telefon bor, ism yo'q bo'lsa, AI ism so'raydi.

Agar ikkalasi ham bo'lsa, lead complete hisoblanadi.

---

# 10. CRM LEADS

## 10.1 Lead ma'lumotlari

CRM'da har bir lead quyidagi ma'lumotlar bilan saqlanadi:

- [ ] Lead ID
- [ ] Business ID
- [ ] Instagram user ID
- [ ] Instagram username
- [ ] Mijoz ismi
- [ ] Telefon raqam
- [ ] Mahsulot ID
- [ ] Mahsulot nomi
- [ ] Campaign ID
- [ ] Kalit so'z
- [ ] Comment ID
- [ ] Comment matni
- [ ] Conversation ID
- [ ] Lead status
- [ ] Created at
- [ ] Updated at

## 10.2 Lead statuslari

- [ ] new
- [ ] contacted
- [ ] interested
- [ ] client
- [ ] rejected

## 10.3 CRM imkoniyatlari

- [ ] Leadlar ro'yxatini ko'rish
- [ ] Lead qidirish
- [ ] Leadni mahsulot bo'yicha filterlash
- [ ] Leadni kampaniya bo'yicha filterlash
- [ ] Leadni status bo'yicha filterlash
- [ ] Lead statusini o'zgartirish
- [ ] Lead suhbat tarixini ko'rish
- [ ] Leadlarni Excel eksport qilish
- [ ] Leadlarni PDF eksport qilish

---

# 11. CONVERSATIONS

## 11.1 Suhbat tarixi

Tizim DM suhbatlarini saqlaydi.

Saqlanadigan ma'lumotlar:

- [ ] Conversation ID
- [ ] Business ID
- [ ] Instagram user ID
- [ ] Lead ID
- [ ] Product ID
- [ ] Campaign ID
- [ ] Message sender: customer/ai/system
- [ ] Message text
- [ ] Created at

## 11.2 Suhbatdan foydalanish

Suhbat tarixi quyidagilar uchun ishlatiladi:

- [ ] AI kontekstni tushunishi
- [ ] CRM'da lead tarixini ko'rsatish
- [ ] Telegram xabarida qisqa summary berish
- [ ] Audit va sifat nazorati

---

# 12. DATABASE SXEMASI

## 12.1 Asosiy jadvallar

- [ ] businesses
- [ ] users
- [ ] instagram_accounts
- [ ] telegram_settings
- [ ] products
- [ ] campaigns
- [ ] campaign_keywords
- [ ] instagram_comments
- [ ] conversations
- [ ] messages
- [ ] leads
- [ ] export_jobs
- [ ] audit_logs

## 12.2 businesses jadvali

```text
id
business_name
owner_email
status
created_at
updated_at
```

## 12.3 users jadvali

```text
id
business_id
email
password_hash
first_name
role
status
created_at
updated_at
```

## 12.4 instagram_accounts jadvali

```text
id
business_id
instagram_account_id
instagram_username
page_id
access_token_encrypted
token_status
connected_at
created_at
updated_at
```

## 12.5 telegram_settings jadvali

```text
id
business_id
bot_token_encrypted
bot_username
chat_id
notification_enabled
last_test_status
created_at
updated_at
```

## 12.6 products jadvali

```text
id
business_id
name
price
discount_price
description
delivery_info
variants
faq
status
created_at
updated_at
```

## 12.7 campaigns jadvali

```text
id
business_id
product_id
name
instagram_url
first_dm_message
auto_dm_enabled
start_date
end_date
status
created_at
updated_at
```

## 12.8 campaign_keywords jadvali

```text
id
business_id
campaign_id
product_id
keyword
normalized_keyword
match_type
status
created_at
updated_at
```

## 12.9 instagram_comments jadvali

```text
id
business_id
instagram_comment_id
instagram_user_id
instagram_username
comment_text
normalized_text
campaign_id
product_id
processed_status
created_at
updated_at
```

## 12.10 conversations jadvali

```text
id
business_id
instagram_user_id
instagram_username
lead_id
product_id
campaign_id
status
created_at
updated_at
```

## 12.11 messages jadvali

```text
id
business_id
conversation_id
sender_type
message_text
external_message_id
created_at
```

## 12.12 leads jadvali

```text
id
business_id
instagram_user_id
instagram_username
customer_name
phone
product_id
campaign_id
keyword
comment_id
comment_text
conversation_id
status
created_at
updated_at
```

## 12.13 export_jobs jadvali

```text
id
business_id
export_type
status
file_url
filters
created_at
completed_at
```

## 12.14 audit_logs jadvali

```text
id
business_id
user_id
action
entity_type
entity_id
metadata
created_at
```

---

# 13. MULTI-TENANT XAVFSIZLIK

## 13.1 Business isolation

Har bir biznes alohida tenant hisoblanadi.

Barcha tenantga tegishli jadvallarda `business_id` bo'lishi shart.

- [ ] users
- [ ] instagram_accounts
- [ ] telegram_settings
- [ ] products
- [ ] campaigns
- [ ] campaign_keywords
- [ ] instagram_comments
- [ ] conversations
- [ ] messages
- [ ] leads
- [ ] export_jobs
- [ ] audit_logs

## 13.2 Row-Level Security

PostgreSQL Row-Level Security ishlatiladi.

Maqsad:

- [ ] Bir biznes boshqa biznes mahsulotlarini ko'ra olmaydi.
- [ ] Bir biznes boshqa biznes kampaniyalarini ko'ra olmaydi.
- [ ] Bir biznes boshqa biznes leadlarini ko'ra olmaydi.
- [ ] Bir biznes boshqa biznes tokenlarini ko'ra olmaydi.
- [ ] Har bir so'rov `business_id` orqali izolyatsiya qilinadi.

## 13.3 RLS session context

Backend har bir database transaction uchun current business context o'rnatadi.

```sql
SET LOCAL app.current_tenant_id = :business_id;
```

---

# 14. WEBHOOK DEDUPLIKATSIYA

Instagram bir xil webhook eventni qayta yuborishi mumkin.

Shuning uchun Redis ishlatiladi.

## 14.1 Algoritm

- [ ] Webhook event keladi.
- [ ] Event/comment/message ID olinadi.
- [ ] Redis'da SETNX qilinadi.
- [ ] Agar key oldin mavjud bo'lsa, server 200 OK qaytaradi.
- [ ] Agar key yangi bo'lsa, event Celery queue'ga yuboriladi.
- [ ] Redis TTL kamida 24 soat bo'ladi.

## 14.2 Redis key namunasi

```text
webhook:instagram:comment:{comment_id}
webhook:instagram:message:{message_id}
```

---

# 15. BACKGROUND JOBS

Webhook ichida og'ir ishlar bajarilmaydi.

Celery background job sifatida ishlaydi.

Celery bajaradigan ishlar:

- [ ] Keyword match
- [ ] Instagram Private Reply yuborish
- [ ] AI javob tayyorlash
- [ ] Lead extraction
- [ ] CRM lead yaratish
- [ ] Telegram notification yuborish
- [ ] Excel export
- [ ] PDF export

---

# 16. EXPORT MODULI

## 16.1 Excel export

Excel ichida quyidagilar bo'ladi:

- [ ] Leads varog'i
- [ ] Analytics varog'i

Leads ustunlari:

- [ ] Mijoz
- [ ] Telefon
- [ ] Instagram
- [ ] Mahsulot
- [ ] Kalit so'z
- [ ] Kampaniya
- [ ] Status
- [ ] Yaratilgan sana

Analytics ma'lumotlari:

- [ ] Jami leadlar
- [ ] Mahsulotlar bo'yicha leadlar
- [ ] Kampaniyalar bo'yicha leadlar
- [ ] Statuslar bo'yicha leadlar

## 16.2 PDF export

PDF hisobotda quyidagilar bo'ladi:

- [ ] Biznes nomi
- [ ] Hisobot sanasi
- [ ] Jami leadlar
- [ ] Mahsulotlar bo'yicha leadlar
- [ ] Kampaniyalar bo'yicha leadlar
- [ ] Statuslar bo'yicha tahlil
- [ ] Leadlar jadvali

---

# 17. XAVFSIZLIK TALABLARI

Majburiy xavfsizlik talablari:

- [ ] Instagram webhook signature verification
- [ ] Telegram bot token encryption
- [ ] Instagram access token encryption
- [ ] JWT authentication
- [ ] Password hashing
- [ ] Rate limiting
- [ ] Audit logs
- [ ] HTTPS
- [ ] Environment variables orqali master key
- [ ] AES-256-GCM encryption
- [ ] Owner role
- [ ] CORS policy
- [ ] Secure cookies yoki secure token storage
- [ ] API request validation

---

# 18. TEXNOLOGIK STACK

## 18.1 Backend

- [ ] Python 3.11+
- [ ] FastAPI
- [ ] SQLAlchemy 2.0 Async
- [ ] Alembic
- [ ] PostgreSQL 15+
- [ ] Redis
- [ ] Celery

## 18.2 AI

- [ ] Configurable AI provider
- [ ] Claude yoki boshqa model
- [ ] Model nomi env/config orqali boshqariladi
- [ ] AI prompt settings dashboarddan sozlanadi
- [ ] AI fallback/error handling bo'ladi

## 18.3 Export

- [ ] OpenPyXL
- [ ] ReportLab yoki WeasyPrint

## 18.4 Frontend

- [ ] React yoki Next.js
- [ ] Owner dashboard
- [ ] Responsive admin UI

## 18.5 DevOps

- [ ] Docker Compose
- [ ] web-api container
- [ ] celery-worker container
- [ ] postgres container
- [ ] redis container

---

# 19. API CONTRACTS

## 19.1 Auth API

- [ ] POST /api/auth/register
- [ ] POST /api/auth/login
- [ ] POST /api/auth/logout
- [ ] GET /api/auth/me

## 19.2 Products API

- [ ] GET /api/products
- [ ] POST /api/products
- [ ] GET /api/products/{id}
- [ ] PATCH /api/products/{id}
- [ ] DELETE /api/products/{id}

## 19.3 Campaigns API

- [ ] GET /api/campaigns
- [ ] POST /api/campaigns
- [ ] GET /api/campaigns/{id}
- [ ] PATCH /api/campaigns/{id}
- [ ] DELETE /api/campaigns/{id}

## 19.4 Instagram API

- [ ] GET /api/integrations/instagram/connect
- [ ] GET /api/integrations/instagram/callback
- [ ] GET /api/webhooks/instagram
- [ ] POST /api/webhooks/instagram

## 19.5 Telegram API

- [ ] GET /api/integrations/telegram
- [ ] POST /api/integrations/telegram
- [ ] POST /api/integrations/telegram/test

## 19.6 CRM API

- [ ] GET /api/leads
- [ ] GET /api/leads/{id}
- [ ] PATCH /api/leads/{id}
- [ ] GET /api/conversations/{id}

## 19.7 Export API

- [ ] POST /api/exports
- [ ] GET /api/exports/{id}
- [ ] GET /api/exports/{id}/download

---

# 20. MVP SCOPE

MVP'da bajariladi:

- [ ] Owner register/login
- [ ] Instagram integration
- [ ] Telegram integration
- [ ] Products CRUD
- [ ] Campaigns & Keywords CRUD
- [ ] Comment webhook
- [ ] Keyword exact match
- [ ] Keyword normalization
- [ ] Instagram Private Reply DM
- [ ] AI DM sales conversation
- [ ] Lead extraction: ism + telefon
- [ ] CRM lead list
- [ ] Conversation history
- [ ] Telegram group notification
- [ ] Basic Excel export
- [ ] Token encryption
- [ ] Webhook signature verification
- [ ] Redis deduplication
- [ ] Celery background jobs

MVP'da bajarilmaydi:

- [ ] Operator moduli
- [ ] Email yig'ish
- [ ] Manzil yig'ish
- [ ] Murakkab analytics
- [ ] White-label domain
- [ ] Billing
- [ ] Advanced role management
- [ ] Multiple Telegram group routing

---

# 21. V1 SCOPE

V1'da qo'shiladi:

- [ ] PDF export
- [ ] Lead status management
- [ ] Campaign performance analytics
- [ ] PostgreSQL RLS to'liq joriy qilish
- [ ] Audit logs
- [ ] Better AI prompt settings
- [ ] Webhook retry dashboard
- [ ] Token reconnect flow
- [ ] Dashboard analytics widgets

---

# 22. V2 SCOPE

V2'da qo'shiladi:

- [ ] Multiple Telegram group routing
- [ ] Advanced analytics
- [ ] Semantic FAQ cache
- [ ] White-label
- [ ] Subscription billing
- [ ] Custom domain
- [ ] Campaign A/B testing
- [ ] Advanced AI sales scripts

---

# 23. YAKUNIY ISHLASH SXEMASI

```text
Instagram reel/post/reklama
        ↓
Mijoz commentga kalit so'z yozadi
        ↓
Instagram webhook serverga event yuboradi
        ↓
Webhook signature tekshiriladi
        ↓
Redis duplicate eventlarni to'sadi
        ↓
Comment text normalizatsiya qilinadi
        ↓
Keyword Campaign Engine mahsulotni topadi
        ↓
Bot Instagram DM'ga Private Reply yuboradi
        ↓
Mijoz DM'da javob beradi
        ↓
AI sotuvchi suhbatlashadi
        ↓
Ism + telefon olinadi
        ↓
CRM lead yaratiladi
        ↓
Telegram guruhga xabar yuboriladi
```

---

# 24. YAKUNIY XULOSA

Ushbu loyiha oddiy chatbot emas.

Bu Instagram reklamalardan lid yig'uvchi, commentdagi kalit so'z orqali mahsulotni aniqlovchi, mijozga DM orqali professional sotuvchi kabi javob beruvchi, ism va telefon raqamini oluvchi, CRM'da lead saqlovchi va Telegram guruhga xabar yuboruvchi professional SaaS automation platformadir.

Asosiy model:

```text
Comment keyword -> DM automation -> AI sales conversation -> CRM lead -> Telegram notification
```
