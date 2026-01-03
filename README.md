# HELOC Lead Pilot

Email-first HELOC lead intake built with Next.js App Router, Tailwind, and Supabase.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_EXPORT_TOKEN=your-admin-token
```

3. Create the `leads` table in Supabase:

```sql
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  zip text not null,
  primary_residence boolean not null,
  property_type text not null,
  est_home_value int not null,
  mortgage_balance int not null,
  est_equity int not null,
  use_case text not null,
  timeline text not null,
  credit_band text not null,
  first_name text,
  email text not null,
  lead_score int not null,
  lead_tier text not null,
  status text default 'new' not null,
  batch_date date
);
```

4. Enable RLS and allow anon inserts only:

```sql
alter table public.leads enable row level security;

create policy "Allow anon insert"
  on public.leads
  for insert
  to anon
  with check (true);
```

## Run the app

```bash
npm run dev
```

Open `http://localhost:3000/heloc`.

## Daily batch workflow

Export new leads (CSV):

```bash
curl -H "x-admin-token: $ADMIN_EXPORT_TOKEN" \
  http://localhost:3000/api/admin/leads/export
```

Mark leads as sent:

```bash
curl -X POST -H "x-admin-token: $ADMIN_EXPORT_TOKEN" \
  http://localhost:3000/api/admin/leads/mark-sent
```

## Internal admin page

Pilot-only access:

- Visit `/admin/batch?token=YOUR_ADMIN_EXPORT_TOKEN`
- Click download, upload into the Google Sheet (append only), then mark sent
- Security note: token-based access for pilot use only

## Routes

- `/heloc` lead intake form
- `/privacy` placeholder privacy page
- `/terms` placeholder terms page
