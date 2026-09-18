# ClientFlow

A clean, fast workspace for freelancers and small agencies: clients, projects,
tasks (kanban with drag & drop) and pipeline value — in English and Persian
(LLL/RTL), light and dark.

## Stack

- **Next.js 16** (App Router) + React 19 + Tailwind CSS 4
- **Supabase** — auth (email/password), Postgres, Row Level Security
- No other runtime dependencies.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` (see `.env.example`):

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
   ```

3. Create the database schema: open the Supabase dashboard → SQL Editor →
   paste the contents of [`supabase/schema.sql`](supabase/schema.sql) → Run.
   It is idempotent and safe to re-run (it also upgrades a v1 database).

4. Run the dev server:

   ```bash
   npm run dev
   ```

## Features

- **Dashboard** — stat cards, project progress, upcoming tasks and deadlines.
- **Clients** — search, avatars, per-client project counts and value, edit.
- **Projects** — filters (status/client), inline progress slider (debounced
  writes), status badges, edit modal, overdue markers.
- **Tasks** — kanban with HTML5 drag & drop, priorities, due-date chips
  (Today/Tomorrow/in N days), descriptions, edit modal.
- **Auth** — login/signup with friendly mapped error messages, protected
  routes, no-flash theming/locale.
- **Settings** — theme (light/dark/system) and language (EN/FA, RTL) pickers.
- **Backend** — RLS on every table, `updated_at` triggers, and a trigger that
  keeps project progress in sync with done tasks.

## Project structure

```
app/            # routes (dashboard, clients, projects, tasks, settings, login)
components/     # app shell, icons, UI primitives (field, modal, toast, …)
contexts/       # auth + locale providers
lib/            # supabase client, typed data layer (api.ts), utils, translations
supabase/       # SQL schema (run once in the SQL editor)
types/          # shared domain types
```
