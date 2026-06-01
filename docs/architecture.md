# Architecture

## Boundary

The system is multi-tenant from day one. Every business-owned table includes `business_id`; the API must resolve the current business from auth context before every query or mutation.

## Core Modules

1. Auth and tenant setup
2. Products
3. Campaigns and keywords
4. Instagram OAuth and webhooks
5. Keyword campaign engine
6. AI sales assistant
7. CRM leads and conversations
8. Telegram notifications
9. Exports and audit logs

## Runtime

- Web: Next.js owner dashboard
- API: FastAPI REST API
- Data: Postgres
- Cache/deduplication: Redis
- Jobs: worker process for DM, AI, Telegram, export tasks

## Security Decisions

- Instagram and Telegram tokens are encrypted with AES-256-GCM before storage.
- Instagram webhook requests must pass verification and signature checks.
- Duplicate webhook events are blocked with Redis SETNX and a 24-hour TTL.
- AI may answer only from dashboard product/campaign data.
