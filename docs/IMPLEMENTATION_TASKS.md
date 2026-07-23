# Autosell-AI Production Implementation Tasks

Ushbu hujjat platformani demo/skeleton holatidan real ishlaydigan production productga olib chiqish uchun asosiy ishlar ro'yxatidir.

## Ishlash qoidasi

- `[ ]` — bajarilmagan.
- `[x]` — kod yozildi, test qilindi va ishlashi tasdiqlandi.
- Faqat kod bilan yozilgan task bajarilgan hisoblanmaydi; unga test yoki amaliy tekshiruv dalili kerak.
- Har bir bosqich alohida commit bilan saqlanadi.
- Ishlar avval working branchda bajariladi. `main`ga merge yoki push faqat alohida ruxsatdan keyin qilinadi.

## 0. Boshlang'ich nazorat

- [x] Ishlayotgan branch nomi va upstream tekshirildi.
- [x] GitHub `main` branchiga hech qanday o'zgarish kiritilmasligi tasdiqlandi.
- [x] Local development, staging va production environmentlari alohida belgilandi.
- [x] `.env.example` barcha kerakli o'zgaruvchilar bilan yangilandi.
- [x] Secretlar Git tarixiga kirmasligi uchun `.gitignore` tekshirildi.
- [x] CI tekshiruvlari: lint, typecheck, unit test va build buyruqlari belgilandi.

## 1. Database va persistence

- [ ] PostgreSQL ulanish qatlami yaratildi.
- [ ] SQLAlchemy 2.0 async konfiguratsiyasi qo'shildi.
- [ ] Alembic migration tizimi o'rnatildi.
- [ ] `schema.sql` dagi jadvallar migrationlarga ko'chirildi.
- [ ] `businesses` va `users` modellari yaratildi.
- [ ] `instagram_accounts` modeli yaratildi.
- [ ] `telegram_settings` modeli yaratildi.
- [ ] `products` modeli yaratildi.
- [ ] `campaigns` va `campaign_keywords` modellari yaratildi.
- [ ] `instagram_comments` modeli yaratildi.
- [ ] `conversations` va `messages` modellari yaratildi.
- [ ] `leads` modeli yaratildi.
- [ ] `export_jobs` va `audit_logs` modellari yaratildi.
- [ ] Foreign key, unique constraint va indexlar migrationlarda tekshirildi.
- [ ] Repository/service qatlami yaratildi.
- [ ] `demo_store.py` production requestlaridan chiqarildi.
- [ ] API qayta ishga tushganda ma'lumotlar saqlanib qolishi test qilindi.

## 2. Authentication va multi-tenant security

- [ ] Owner register endpointi real user va business yaratadi.
- [ ] Password hashing Argon2 yoki bcrypt bilan ishlaydi.
- [ ] Login parolni tekshiradi va signed JWT qaytaradi.
- [ ] Logout/token invalidation mexanizmi belgilanadi.
- [ ] Auth middleware JWT’dan current userni oladi.
- [ ] Har bir request uchun current `business_id` aniqlanadi.
- [ ] Barcha tenant querylari `business_id` bilan cheklanadi.
- [ ] Owner role tekshiruvi qo'shildi.
- [ ] PostgreSQL Row-Level Security policylar yaratildi.
- [ ] RLS session context transaction ichida o'rnatiladi.
- [ ] Unauthenticated va boshqa tenantga tegishli requestlar rad etilishi test qilindi.

## 3. Products va campaigns API

- [ ] Products CRUD database bilan ishlaydi.
- [ ] Product maydonlari TZ bilan bir xil qilindi: narx, chegirma, ranglar, variantlar, FAQ va delivery.
- [ ] Product active/inactive holati ishlaydi.
- [ ] Campaigns CRUD database bilan ishlaydi.
- [ ] Campaign start/end date va active/inactive holati tekshiriladi.
- [ ] Campaign faqat o'z tenantidagi active productga ulanadi.
- [ ] Campaign keyword yaratish va yangilash ishlaydi.
- [ ] Bir tenant ichida active keyword takrorlanishiga yo'l qo'yilmaydi.
- [ ] Keyword exact-match qoidasi implement qilindi.
- [ ] Keyword normalization trim, lowercase, `#`, nuqta va ortiqcha belgilarni TZ bo'yicha qayta ishlaydi.
- [ ] Unknown keyword uchun product taxmin qilinmaydi.
- [ ] API validation va to'g'ri HTTP statuslar test qilindi.

## 4. Frontend va backend ulanishi

- [ ] Frontend API client yaratildi.
- [ ] Auth state va token saqlash strategiyasi tanlandi.
- [ ] Login/register ekranlari backendga ulandi.
- [ ] Dashboard metrics backenddan olinadi.
- [ ] Leads ro'yxati backenddan olinadi.
- [ ] Conversations backenddan olinadi.
- [ ] Products sahifasi real CRUD bilan ishlaydi.
- [ ] Campaigns sahifasi real CRUD bilan ishlaydi.
- [ ] Integrations sahifasi real statuslarni ko'rsatadi.
- [ ] Hard-coded lead, campaign, business va metric ma'lumotlari olib tashlandi.
- [ ] Loading, empty, error va unauthorized holatlari qo'shildi.
- [ ] 3 til, dark/light theme va mavjud dizayn saqlanib qoldi.
- [ ] Frontend API contract test qilindi.

## 5. Instagram Meta integration

- [ ] Meta App ID, App Secret va redirect URL environment orqali sozlandi.
- [ ] Instagram OAuth connect endpointi Meta login URL beradi.
- [ ] OAuth callback code’ni token bilan almashtiradi.
- [ ] Instagram Business/Creator account ma'lumotlari olinadi.
- [ ] Instagram account va page ma'lumotlari databasega saqlanadi.
- [ ] Access token AES-256-GCM bilan shifrlanib saqlanadi.
- [ ] Token decrypt qilish faqat server-side service orqali bajariladi.
- [ ] Token expiry va reconnect holati ishlaydi.
- [ ] Webhook GET verification production token bilan ishlaydi.
- [ ] Webhook POST body `X-Hub-Signature-256` orqali HMAC-SHA256 tekshiriladi.
- [ ] Noto'g'ri signature 401/403 bilan rad etiladi.
- [ ] Meta comment eventlari real payload formatidan parse qilinadi.
- [ ] Comment ID va user ma'lumotlari saqlanadi.
- [ ] Comment keyword campaign/product bilan bog'lanadi.
- [ ] Private Reply Meta API orqali yuboriladi.
- [ ] Meta API error va rate limit holatlari qayta ishlanadi.
- [ ] Test Meta app orqali comment-to-DM flow tasdiqlandi.

## 6. Redis deduplication va background jobs

- [ ] Redis client konfiguratsiyasi yaratildi.
- [ ] Comment va message eventlari uchun idempotency key belgilandi.
- [ ] Redis `SETNX` deduplication ishlaydi.
- [ ] Deduplication TTL kamida 24 soat qilindi.
- [ ] Duplicate event 200 OK bilan xavfsiz yakunlanadi.
- [ ] Celery broker va worker konfiguratsiyasi yaratildi.
- [ ] Private Reply background taskga o'tkazildi.
- [ ] AI response background taskga o'tkazildi.
- [ ] Lead extraction background taskga o'tkazildi.
- [ ] Telegram notification background taskga o'tkazildi.
- [ ] Export background taskga o'tkazildi.
- [ ] Retry, backoff va dead-letter/error holatlari belgilandi.
- [ ] Worker tasklari idempotent ishlashi test qilindi.

## 7. AI sales assistant

- [ ] AI provider abstraction yaratildi.
- [ ] Groq provider server-side ulanadi.
- [ ] Model nomi environment/config orqali boshqariladi.
- [ ] Prompt faqat campaign/product ma'lumotlari bilan tuziladi.
- [ ] AI narx yoki productni taxmin qilmaydi.
- [ ] Conversation tarixi AI context sifatida uzatiladi.
- [ ] Mijozga qisqa va sotuvga yo'naltirilgan javob beriladi.
- [ ] AI email va manzil so'ramaydi.
- [ ] Ism ajratib olish ishlaydi.
- [ ] O'zbekiston telefon raqamini ajratib olish va normalizatsiya ishlaydi.
- [ ] Ism yoki telefon yetishmasa, AI faqat kerakli ma'lumotni so'raydi.
- [ ] Ism va telefon to'liq bo'lsa, lead yaratish event yuboriladi.
- [ ] AI timeout, provider error va fallback holatlari qayta ishlanadi.
- [ ] Prompt injection va noma'lum product savollariga guardrail qo'shildi.
- [ ] Real test conversation bilan AI flow tasdiqlandi.

## 8. CRM leads va conversations

- [ ] Webhook yoki DM flow’dan real lead yaratiladi.
- [ ] Lead business, Instagram user, product va campaign bilan bog'lanadi.
- [ ] Lead statuslari TZ bilan bir xil qilindi.
- [ ] Lead statusini o'zgartirish endpointi database bilan ishlaydi.
- [ ] Lead qidirish ishlaydi.
- [ ] Product, campaign va status bo'yicha filterlar ishlaydi.
- [ ] Conversation va message tarixi saqlanadi.
- [ ] CRM lead sahifasida conversation tarixi ko'rinadi.
- [ ] Dashboard latest leads real ma'lumotdan ko'rsatiladi.
- [ ] Lead duplicate yaratishdan himoya qilindi.

## 9. Telegram integration

- [ ] Telegram bot token va chat ID formasi ishlaydi.
- [ ] Token format validation qo'shildi.
- [ ] Token AES-256-GCM bilan shifrlanadi.
- [ ] Telegram `getMe` orqali connection test ishlaydi.
- [ ] Telegram groupga test message real yuboriladi.
- [ ] Yangi lead uchun real notification yuboriladi.
- [ ] Notification formatida product, campaign, customer, phone va Instagram ma'lumotlari bor.
- [ ] Telegram API error va retry holatlari qayta ishlanadi.
- [ ] Token dashboardda ochiq ko'rsatilmaydi.

## 10. Exportlar

- [ ] Export request databasega job sifatida yoziladi.
- [ ] Excel export real `.xlsx` fayl yaratadi.
- [ ] Excel’da leads va analytics sheetlari bo'ladi.
- [ ] PDF export real PDF fayl yaratadi.
- [ ] Export status queued/processing/ready/failed holatlarini ko'rsatadi.
- [ ] Faqat shu tenantga tegishli export yuklab olinadi.
- [ ] Download endpoint vaqtinchalik signed URL yoki xavfsiz fayl oqimini beradi.
- [ ] Katta export background worker orqali bajariladi.

## 11. Security, reliability va observability

- [ ] Production secretlar default qiymatlarsiz ishlaydi.
- [ ] Encryption key uzunligi qat'iy 32 byte sifatida validation qilinadi.
- [ ] CORS faqat kerakli production originlarga cheklanadi.
- [ ] API rate limiting qo'shildi.
- [ ] Webhook request size va timeout limitlari qo'shildi.
- [ ] Audit loglar muhim auth, integration va data o'zgarishlarini yozadi.
- [ ] Sensitive tokenlar loglarga chiqmasligi tekshirildi.
- [ ] Health endpoint database va Redis holatini ham tekshiradi.
- [ ] Structured application logging qo'shildi.
- [ ] Error response formatlari bir xil qilindi.
- [ ] Backup va restore jarayoni hujjatlashtirildi.
- [ ] Production error monitoring sozlandi.

## 12. Testlar

- [ ] Keyword normalization unit testlari yozildi.
- [ ] Phone extraction unit testlari yozildi.
- [ ] Crypto encrypt/decrypt testlari yozildi.
- [ ] Auth register/login/middleware testlari yozildi.
- [ ] Tenant isolation testlari yozildi.
- [ ] Product va campaign CRUD integration testlari yozildi.
- [ ] Duplicate keyword validation test qilindi.
- [ ] Webhook verification testlari yozildi.
- [ ] Webhook signature valid/invalid testlari yozildi.
- [ ] Redis deduplication test qilindi.
- [ ] Lead extraction test qilindi.
- [ ] Telegram notification test qilindi.
- [ ] Excel/PDF export testlari yozildi.
- [ ] Frontend typecheck va build o'tadi.
- [ ] Frontend API error/loading holatlari test qilindi.
- [ ] Eski `index.html`/`app.js` testlari yangilandi yoki olib tashlandi.
- [ ] End-to-end test: Instagram comment → DM → AI → lead → Telegram o'tadi.

## 13. Deployment va production release

- [ ] Web, API, worker, PostgreSQL va Redis deployment arxitekturasi belgilanadi.
- [ ] API uchun production hosting sozlanadi.
- [ ] Worker alohida process/container sifatida ishlaydi.
- [ ] Production database migration ishlaydi.
- [ ] Production environment variablelari sozlanadi.
- [ ] Vercel web deployment API base URL bilan ulandi.
- [ ] Meta webhook production URL’ga o'rnatildi.
- [ ] Telegram production bot bilan test qilindi.
- [ ] HTTPS va secure cookie/token siyosati tekshirildi.
- [ ] Production smoke test bajarildi.
- [ ] Rollback va migration rollback rejasi tayyorlandi.
- [ ] Release checklist to'liq bajarildi.

## 14. Hujjatlar va topshirish

- [ ] README real local setup bilan yangilandi.
- [ ] Environment variablelar jadvali yozildi.
- [ ] Database migration va seed qo'llanmasi yozildi.
- [ ] Meta App setup qo'llanmasi yozildi.
- [ ] Telegram bot setup qo'llanmasi yozildi.
- [ ] Production deployment qo'llanmasi yozildi.
- [ ] API endpoint hujjatlari yangilandi.
- [ ] TZ bilan tasklar mosligi qayta tekshirildi.
- [ ] Bajarilgan tasklar `[x]` qilib belgilandi.
- [ ] Known limitations va keyingi V1/V2 ishlari yozildi.
- [ ] User review uchun branchdagi yakuniy diff tayyorlandi.

## Release gate

`main`ga merge/push qilishdan oldin quyidagilar majburiy:

- [ ] Database persistence ishlaydi.
- [ ] Auth va tenant isolation ishlaydi.
- [ ] Frontend real API bilan ishlaydi.
- [ ] Instagram webhook signature tekshiriladi.
- [ ] Comment-to-DM-to-lead-to-Telegram flow real testdan o'tadi.
- [ ] Test, typecheck va build muvaffaqiyatli.
- [ ] Production secretlar xavfsiz sozlangan.
- [ ] User branchni ko'rib chiqib, push/merge uchun aniq ruxsat berdi.
