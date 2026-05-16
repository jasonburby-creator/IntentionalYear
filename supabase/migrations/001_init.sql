-- Adventure Planner schema
-- Run this in the Supabase SQL editor (one time).

-- =========================================
-- Tables
-- =========================================

create table if not exists planners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  year int not null,
  title text not null default 'LIVE YOUR ADVENTURE',
  owner_name text not null default '',
  share_token text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, year)
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  planner_id uuid not null references planners(id) on delete cascade,
  name text not null,
  color text not null default '#e5e5e0',
  text_color text not null default '#1a1a1a',
  description text default '',
  items text[] default '{}',
  sort_order int not null default 0,
  created_at timestamptz default now()
);

create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  planner_id uuid not null references planners(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  label text not null,
  month int not null check (month between 0 and 11),
  start_day int not null check (start_day between 1 and 31),
  end_day int not null check (end_day between 1 and 31),
  created_at timestamptz default now()
);

create index if not exists idx_planners_user on planners(user_id);
create index if not exists idx_planners_share on planners(share_token);
create index if not exists idx_categories_planner on categories(planner_id);
create index if not exists idx_entries_planner on entries(planner_id);

-- Auto-update updated_at on planners
create or replace function bump_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_planners_updated on planners;
create trigger trg_planners_updated
before update on planners
for each row execute function bump_updated_at();

-- =========================================
-- Row Level Security
-- =========================================

alter table planners enable row level security;
alter table categories enable row level security;
alter table entries enable row level security;

-- Planners: owner can do anything; anyone can read if share_token is set
drop policy if exists "planners_owner_all" on planners;
create policy "planners_owner_all" on planners
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "planners_public_read_by_token" on planners;
create policy "planners_public_read_by_token" on planners
  for select using (share_token is not null);

-- Categories: tied to planner ownership; public read if parent planner has a share_token
drop policy if exists "categories_owner_all" on categories;
create policy "categories_owner_all" on categories
  for all using (
    exists (select 1 from planners p where p.id = categories.planner_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from planners p where p.id = categories.planner_id and p.user_id = auth.uid())
  );

drop policy if exists "categories_public_read" on categories;
create policy "categories_public_read" on categories
  for select using (
    exists (select 1 from planners p where p.id = categories.planner_id and p.share_token is not null)
  );

-- Entries: same pattern
drop policy if exists "entries_owner_all" on entries;
create policy "entries_owner_all" on entries
  for all using (
    exists (select 1 from planners p where p.id = entries.planner_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from planners p where p.id = entries.planner_id and p.user_id = auth.uid())
  );

drop policy if exists "entries_public_read" on entries;
create policy "entries_public_read" on entries
  for select using (
    exists (select 1 from planners p where p.id = entries.planner_id and p.share_token is not null)
  );
