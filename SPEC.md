# HELOC Lead Pilot (Next.js App Router + Tailwind + Supabase)

## Goal

Build a HELOC lead-gen pilot that collects email-first leads and supports daily batching into a rolling shared Google Sheet.

## Core User Flow

Route: `/heloc` (single-page multi-step form)
Steps:

1. Property basics

   - ZIP (5 digits)
   - Primary residence (yes/no)
   - Property type: single_family | condo_townhome | 2_4_unit

2. Equity estimate

   - Estimated home value (slider)
   - Current mortgage balance (slider)
   - Compute: est_equity = max(0, homeValue - mortgageBalance)
   - Validation: mortgageBalance <= homeValue

3. Use case

   - home_improvement | debt_consolidation | emergency | education | other

4. Timeline

   - 0-30 | 1-3 | 3-6 | research

5. Credit band (approx)

   - 740+ | 700-739 | 660-699 | <660 | not_sure

6. Results + email capture
   - Show estimated available range: 35%–55% of est_equity (informational only; not a guarantee)
   - Capture: first_name, email
   - Required consent checkbox: contact via EMAIL only
   - Footer: Not a lender; estimates informational; links to /privacy and /terms (create placeholder pages)

## Lead Scoring (deterministic)

- Equity >= 100k: +25; else if >= 50k: +15
- Timeline 0-30 or 1-3: +25
- Credit 740+ or 700-739: +20
- Primary residence: +15
- Use case home_improvement or debt_consolidation: +15
- Cap score at 100
- Tier: HOT (>=70), WARM (50-69), NURTURE (<50)

## Storage (Supabase)

Table: `leads`
Fields:

- id uuid pk default gen_random_uuid()
- created_at timestamptz default now()
- zip text not null
- primary_residence boolean not null
- property_type text not null
- est_home_value int not null
- mortgage_balance int not null
- est_equity int not null
- use_case text not null
- timeline text not null
- credit_band text not null
- first_name text
- email text not null
- lead_score int not null
- lead_tier text not null
- status text default 'new' not null
- batch_date date

RLS:

- Enable RLS
- Allow anon INSERT only
- No SELECT policies for public
  Client uses anon key; server uses service role key.

## Daily Batch Admin Endpoints (CSV export for Google Sheets)

Auth: require header `x-admin-token` matching env var `ADMIN_EXPORT_TOKEN`

1. GET `/api/admin/leads/export`

- Select leads where status='new'
- Sort by lead_score desc then created_at asc
- Return CSV with columns:
  Batch Date, Lead Score, Tier, Email, ZIP, Estimated Equity, Estimated Home Value,
  Mortgage Balance, Use Case, Timeline, Credit Band, Primary Residence, Property Type,
  Submitted At, Lead ID

2. POST `/api/admin/leads/mark-sent`

- Update leads set status='sent', batch_date=today where status='new'
- Return JSON { ok: true, batch_date: today }

## Env Vars

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server-only)
- ADMIN_EXPORT_TOKEN

## Dependencies

- @supabase/supabase-js

## Deliverables

- /heloc page with good Tailwind styling
- /privacy and /terms placeholder pages
- lib helpers: supabase client (anon), supabase server (service role), scoring logic
- Admin API routes for export + mark-sent
- README with setup + how to run daily batch
