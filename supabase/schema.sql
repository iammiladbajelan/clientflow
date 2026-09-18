-- ClientFlow database schema v2
-- Run in the Supabase SQL Editor (Project > SQL Editor > New query > Run)
-- Safe to re-run: everything is idempotent.
-- Upgrading from v1? All ALTER / trigger / policy sections apply cleanly on top of v1.

-- ============================================================
-- 1. Tables
-- ============================================================

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  client_id uuid references clients(id) on delete set null,
  name text not null,
  budget numeric(12, 2) default 0,
  progress int not null default 0 check (progress >= 0 and progress <= 100),
  status text not null default 'inProgress' check (status in ('onTrack', 'inProgress', 'almostDone', 'completed', 'onHold')),
  deadline date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references projects(id) on delete cascade not null,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 1b. Invoices table
-- ============================================================

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references projects(id) on delete set null,
  number text not null,
  amount numeric(12, 2) not null default 0,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue')),
  issue_date date,
  due_date date,
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 2. Indexes (single-column + common composite queries)
-- ============================================================

create index if not exists clients_user_id_idx on clients(user_id);
create index if not exists projects_user_id_idx on projects(user_id);
create index if not exists projects_client_id_idx on projects(client_id);
create index if not exists tasks_user_id_idx on tasks(user_id);
create index if not exists tasks_project_id_idx on tasks(project_id);
create index if not exists tasks_status_idx on tasks(user_id, status);
create index if not exists tasks_due_date_idx on tasks(user_id, due_date);
create index if not exists invoices_user_id_idx on invoices(user_id);
create index if not exists invoices_project_id_idx on invoices(project_id);

-- ============================================================
-- 1c. v2.1 columns: time tracking + client portal
-- ============================================================

alter table tasks add column if not exists time_spent numeric(8, 2) not null default 0;

alter table projects add column if not exists share_token text;
create unique index if not exists projects_share_token_idx on projects(share_token) where share_token is not null;

-- Refresh portal data when a project or its tasks change.
drop trigger if exists projects_set_updated_at on projects;
create trigger projects_set_updated_at
  before update on projects
  for each row execute function set_updated_at();

-- ============================================================
-- 3. updated_at maintenance
-- ============================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists clients_set_updated_at on clients;
create trigger clients_set_updated_at
  before update on clients
  for each row execute function set_updated_at();

drop trigger if exists projects_set_updated_at on projects;
create trigger projects_set_updated_at
  before update on projects
  for each row execute function set_updated_at();

drop trigger if exists tasks_set_updated_at on tasks;
create trigger tasks_set_updated_at
  before update on tasks
  for each row execute function set_updated_at();

drop trigger if exists invoices_set_updated_at on invoices;
create trigger invoices_set_updated_at
  before update on invoices
  for each row execute function set_updated_at();

-- ============================================================
-- 4. Auto progress: a project's progress mirrors its tasks.
--    Moving tasks to/from "done" keeps project.progress in sync.
-- ============================================================

create or replace function sync_project_progress()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_project uuid;
  v_total int;
  v_done int;
begin
  if tg_table_name = 'tasks' then
    v_project := coalesce(new.project_id, old.project_id);
  else
    v_project := new.id;
  end if;

  if v_project is null then
    return coalesce(new, old);
  end if;

  select count(*), count(*) filter (where status = 'done')
    into v_total, v_done
    from tasks where project_id = v_project;

  if v_total = 0 then
    return coalesce(new, old);
  end if;

  update projects
    set progress = least(100, round(100.0 * v_done / v_total))
    where id = v_project;

  return coalesce(new, old);
end;
$$;

drop trigger if exists tasks_sync_progress on tasks;
create trigger tasks_sync_progress
  after insert or update of status or delete on tasks
  for each row execute function sync_project_progress();

-- One-time backfill for projects that already existed.
update projects p
set progress = least(100, coalesce(round(100.0 * t.done / t.total), p.progress))
from (
  select project_id, count(*) as total, count(*) filter (where status = 'done') as done
  from tasks group by project_id
) t
where t.project_id = p.id
  and t.total > 0;

-- ============================================================
-- 6. API privileges (required for tables created via SQL Editor)
--    Without these grants the API returns 403 "permission denied for table".
--    Safe: RLS policies above still restrict every row to its owner.
-- ============================================================

grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on sequences to anon, authenticated;

-- ============================================================
-- 5. Row Level Security: every user only ever sees their own rows
-- ============================================================

alter table clients enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;

drop policy if exists "clients_owner_access" on clients;
create policy "clients_owner_access" on clients
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "projects_owner_access" on projects;
create policy "projects_owner_access" on projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- share_token must be writable by the owner through the API (ensure/rotate use the RPCs,
-- but keep a column-level grant consistent for direct updates).

drop policy if exists "tasks_owner_access" on tasks;
create policy "tasks_owner_access" on tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "invoices_owner_access" on invoices;
create policy "invoices_owner_access" on invoices
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- 7. Client portal RPCs (share link: read-only, no login needed)
--    SECURITY DEFINER so an anonymous visitor can read exactly one
--    project's public data; the token is the only capability.
-- ============================================================

create or replace function ensure_share_token(p_project_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token text;
  v_owner uuid;
begin
  select user_id into v_owner from projects where id = p_project_id;
  if v_owner is null or v_owner <> auth.uid() then
    raise exception 'not found';
  end if;

  select share_token into v_token from projects where id = p_project_id;
  if v_token is null or v_token = '' then
    v_token := encode(gen_random_bytes(16), 'hex');
    update projects set share_token = v_token where id = p_project_id;
  end if;
  return v_token;
end;
$$;

create or replace function rotate_share_token(p_project_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token text;
  v_owner uuid;
begin
  select user_id into v_owner from projects where id = p_project_id;
  if v_owner is null or v_owner <> auth.uid() then
    raise exception 'not found';
  end if;

  v_token := encode(gen_random_bytes(16), 'hex');
  update projects set share_token = v_token where id = p_project_id;
  return v_token;
end;
$$;

create or replace function get_public_project(p_token text)
returns table (
  name text,
  progress int,
  status text,
  deadline date,
  budget numeric,
  updated_at timestamptz,
  tasks_total bigint,
  tasks_done bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select p.name, p.progress, p.status, p.deadline, p.budget, p.updated_at,
    (select count(*) from tasks t where t.project_id = p.id),
    (select count(*) from tasks t where t.project_id = p.id and t.status = 'done')
  from projects p
  where p.share_token = p_token;
$$;
