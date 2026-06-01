create extension if not exists pgcrypto;

create table businesses (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  owner_email text not null unique,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table users (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  email text not null,
  password_hash text not null,
  first_name text not null,
  role text not null default 'owner',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, email)
);

create table instagram_accounts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  instagram_account_id text not null,
  instagram_username text not null,
  page_id text,
  access_token_encrypted text not null,
  token_status text not null default 'active',
  connected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, instagram_account_id)
);

create table telegram_settings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null unique references businesses(id) on delete cascade,
  bot_token_encrypted text,
  bot_username text,
  chat_id text,
  notification_enabled boolean not null default false,
  last_test_status text not null default 'not_tested',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  price integer not null,
  discount_price integer,
  description text not null,
  delivery_info text,
  colors jsonb not null default '[]',
  variants jsonb not null default '[]',
  faq jsonb not null default '[]',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table campaigns (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  product_id uuid not null references products(id),
  name text not null,
  instagram_url text,
  first_dm_message text not null,
  auto_dm_enabled boolean not null default true,
  start_date timestamptz,
  end_date timestamptz,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table campaign_keywords (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  campaign_id uuid not null references campaigns(id) on delete cascade,
  product_id uuid not null references products(id),
  keyword text not null,
  normalized_keyword text not null,
  match_type text not null default 'exact',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, normalized_keyword)
);

create table instagram_comments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  instagram_comment_id text not null,
  instagram_user_id text,
  instagram_username text,
  comment_text text not null,
  normalized_text text not null,
  campaign_id uuid references campaigns(id),
  product_id uuid references products(id),
  processed_status text not null default 'received',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, instagram_comment_id)
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  instagram_user_id text,
  instagram_username text,
  lead_id uuid,
  product_id uuid references products(id),
  campaign_id uuid references campaigns(id),
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_type text not null,
  message_text text not null,
  external_message_id text,
  created_at timestamptz not null default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  instagram_user_id text,
  instagram_username text,
  customer_name text not null,
  phone text not null,
  product_id uuid not null references products(id),
  campaign_id uuid not null references campaigns(id),
  conversation_id uuid references conversations(id),
  source_comment_id uuid references instagram_comments(id),
  status text not null default 'new',
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table conversations add constraint conversations_lead_id_fkey foreign key (lead_id) references leads(id);

create table export_jobs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  format text not null,
  status text not null default 'queued',
  file_url text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  actor_user_id uuid references users(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index idx_campaign_keywords_lookup on campaign_keywords (business_id, normalized_keyword, status);
create index idx_leads_business_status_created on leads (business_id, status, created_at desc);
create index idx_messages_conversation_created on messages (conversation_id, created_at);
