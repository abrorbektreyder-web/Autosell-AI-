# Environment Setup

Autosell-AI uchta alohida environment bilan ishlaydi:

| Environment | Maqsad | Secret manbasi |
|---|---|---|
| Local | Developer kompyuteridagi ish va test | `.env` va `.env.local` |
| Staging | Productiondan oldingi integratsiya testi | Hosting secret manager |
| Production | Haqiqiy mijozlar va Meta/Telegram integratsiyasi | Hosting secret manager |

## Qoidalar

- `.env.example` faqat nomlar va xavfsiz local placeholderlarni saqlaydi.
- Haqiqiy token, parol va API key Git’ga yozilmaydi.
- Local secretlar `.env` yoki `.env.local` faylida saqlanadi; bu fayllar `.gitignore` orqali yopilgan.
- Staging va production secretlari hosting dashboard yoki secret manager orqali beriladi.
- Har bir environment alohida database, Redis namespace va integration credentials ishlatadi.
- Production’da local default key va verify token ishlatilmaydi.

## Environment variable guruhlari

- Runtime: `APP_ENV`, `PORT`, `API_BASE_URL`, `NEXT_PUBLIC_API_URL`, `CORS_ORIGINS`
- Data: `DATABASE_URL`, `REDIS_URL`
- Security: `ENCRYPTION_KEY`, `META_VERIFY_TOKEN`, `META_WEBHOOK_SECRET`
- Meta: `META_APP_ID`, `META_APP_SECRET`
- AI: `AI_PROVIDER`, `AI_MODEL`, `GROQ_API_KEY`
- Telegram: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`

Local boshlash:

```powershell
Copy-Item .env.example .env
```

Copy qilingan `.env` ichidagi secretlar faqat local test uchun to'ldiriladi.
