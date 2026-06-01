# Instagram AI Sales Bot CRM

Professional SaaS CRM for Instagram comment-to-DM automation, AI sales conversations, lead capture, and Telegram team notifications.

## Apps

- `apps/web` - Next.js owner dashboard
- `apps/api` - FastAPI backend API and webhook surface
- `packages/db` - SQL schema for Postgres
- `infra` - local Postgres and Redis compose
- `docs` - architecture and delivery notes

## Quick Start

```bash
cd apps/web
npm install
npm run dev
```

```bash
cd apps/api
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 4000
```

## MVP Flow

Instagram comment keyword -> webhook verification -> Redis dedupe -> campaign/product match -> Private Reply DM -> AI conversation -> lead extraction -> CRM lead -> Telegram group notification.
