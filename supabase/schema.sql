-- Выполнить в Supabase Dashboard -> SQL Editor

create extension if not exists pgcrypto; -- нужно для gen_random_uuid()

create table if not exists subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  user_email text,                     -- email на момент оформления, для показа на странице /unsubscribe
  status text not null default 'none', -- 'trial' | 'active' | 'canceled' | 'expired'
  payment_method_id text,              -- id сохранённого способа оплаты в ЮKassa (для автосписаний)
  current_period_end timestamptz,
  price_kopeks integer default 10000,  -- 100.00 ₽ в копейках, продление каждые 30 дней
  unsubscribe_token uuid not null default gen_random_uuid() unique, -- ссылка вида /unsubscribe?token=...
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists test_results (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  test_slug text not null,
  score integer,
  result_title text,
  created_at timestamptz default now()
);

create table if not exists payment_events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id),
  yookassa_payment_id text unique,
  amount_kopeks integer,
  status text,
  raw jsonb,
  created_at timestamptz default now()
);

-- RLS: пользователь видит только свои строки
alter table subscriptions enable row level security;
alter table test_results enable row level security;

-- payment_events нужна только Edge Functions (они используют service role и не
-- зависят от RLS). Включаем RLS БЕЗ единой policy для anon/authenticated —
-- это полностью закрывает таблицу от прямых запросов через публичный anon-ключ.
-- Без этой строки таблица была бы читаема/записываема кем угодно через Supabase API.
alter table payment_events enable row level security;

create policy "own subscription" on subscriptions
  for select using (auth.uid() = user_id);

create policy "own results" on test_results
  for select using (auth.uid() = user_id);

create policy "insert own results" on test_results
  for insert with check (auth.uid() = user_id);
