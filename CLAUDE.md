---
description: 
alwaysApply: true
---

CLAUDE.md - Ads Funnel Dashboard (Full Stack)

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Project Overview

A full-stack ad performance tracking dashboard that monitors the complete customer journey from Facebook ad click through to closed deals. The system integrates Facebook Ads data with GoHighLevel CRM data to provide granular, contact-level attribution and funnel analytics.

Project Structure

Plain Text


ads-funnel-dashboard/
├── frontend/              # Next.js 16 dashboard (React 19)
│   ├── app/              # App Router pages and components
│   ├── lib/              # Utilities and query functions
│   ├── public/           # Static assets
│   └── package.json
│
└── backend/              # Supabase backend
    └── supabase/
        ├── functions/    # Edge Functions (webhooks, sync)
        └── migrations/   # Database schema migrations





Frontend - Next.js Dashboard

Tech Stack

•
Next.js 16 with App Router (React 19)

•
Supabase for database and real-time subscriptions

•
Tailwind CSS 4 for styling

•
Recharts for data visualization

•
react-day-picker for date range selection

Development Commands

Bash


cd frontend
npm run dev      # Start development server at localhost:3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint


Data Model

The dashboard pulls from three Supabase tables:

1. ads table

Facebook ad performance data (synced via Edge Function):

•
ad_id, ad_name - Facebook ad identifiers

•
campaign_id, campaign_name - Campaign info

•
adset_id, adset_name - Ad set info

•
date - Performance date

•
spend, impressions, clicks - Core metrics

•
reach, cpm, cpc, ctr - Extended metrics

•
leads, purchases - Conversion data

Unique constraint: (ad_id, date) - one record per ad per day

2. events table

Conversion events from GoHighLevel webhooks:

•
contact_id - GoHighLevel contact ID

•
event_type - "booked_call", "showed_up", "deal_won"

•
ad_id - Links to Facebook ad

•
calendar_type - "Qualified" or "DQ"

•
cash_collected - Revenue amount

•
created_at - Event timestamp

3. contacts table

Granular contact-level tracking (NEW - contact-level attribution):

•
Identity: ghl_contact_id, first_name, last_name, email, phone

•
Attribution: ad_id, ad_name, campaign_id, adset_id, UTM parameters

•
Custom Fields: revenue, investment_ability, deal_value, scaling_challenge

•
Pipeline: current_pipeline, current_stage, pipeline_stage_history (JSONB)

•
Calendar: calendar_id, calendar_name, is_qualified

•
Timestamps: form_submitted_at, call_booked_at, showed_up_at, deal_closed_at, etc.

•
Financial: final_deal_value

Application Structure

The dashboard is built as a single client component in app/page.tsx:

Main Components:

•
Dashboard - Root component with state management and data fetching

•
MarketingCard - Summary KPIs (cost per booked, qualified rate, ABR)

•
MarketingExpandedView - Modal with ad rankings tables

•
CostAnalysisWidget - Cost metrics and trend charts

•
RevenueAnalysisWidget - Revenue metrics and trend charts

•
BestPerformingAdsWidget - Detailed per-ad metrics table

•
RankingTable / KpiCard - Reusable display components

Key Metrics Calculated

Marketing Metrics:

•
Cost per Booked: total_spend / booked_calls

•
Qualified Rate: (qualified_calls / booked_calls) × 100

•
ABR (Appointment Booking Rate): (booked_calls / total_clicks) × 100

Funnel Metrics:

•
Show Rate: (shows / booked_calls) × 100

•
Close Rate: (deals_won / booked_calls) × 100

•
ROAS: total_revenue / total_spend

Per-Ad Metrics (Contact-Level):

•
Total Leads, Calls Booked, Qualified/DQ, Shows, Closes

•
Booking Rate, Qualified Rate, Show Rate, Close Rate

•
Cost per Lead, Cost per Booking, Cost per Show, Cost per Close

•
Total Revenue, Average Deal Value, ROI

Environment Variables

Required in frontend/.env.local:

Plain Text


NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key





Backend - Supabase

Tech Stack

•
Supabase (PostgreSQL + Edge Functions )

•
Deno runtime for Edge Functions

•
Facebook Ads API integration

•
GoHighLevel webhook integration

Edge Functions

1. gohighlevel-webhook

URL: https://[project-ref].supabase.co/functions/v1/gohighlevel-webhook

Purpose: Receives webhooks from GoHighLevel and stores events/contacts in database

Handles:

•
Form submissions with UTM parameters → creates contact record

•
Appointment bookings → updates call_booked_at, sets is_qualified

•
Appointment status changes → updates showed_up_at or no_show_at

•
Pipeline stage changes → updates current_stage, appends to pipeline_stage_history

•
Deal closures → updates deal_closed_at, final_deal_value

Event Types:

•
ContactCreate / form_submission

•
AppointmentCreate / call_booked

•
AppointmentUpdate (status changes )

•
OpportunityStageUpdate / pipeline_stage_changed

•
OpportunityStatusUpdate / deal_closed

Calendar IDs:

•
Qualified: gJ3K5tJoorALAQBTWcv2

•
DQ: 4mYGkeS43WkbhpUzNDkp

Pipelines:

•
"Unconnected | Catalyst Marketing"

•
"Connected | Catalyst Marketing"

2. sync-facebook-ads

URL: https://[project-ref].supabase.co/functions/v1/sync-facebook-ads

Purpose: Daily sync of ad performance data from Facebook Ads API

Methods: GET, POST

Request (optional ):

JSON


{
  "start_date": "2024-01-01",
  "end_date": "2024-01-07"
}


Defaults to last 7 days if no dates provided.

Fetches:

•
Ad spend, impressions, clicks

•
Campaign, ad set, and ad names

•
Daily breakdown with automatic pagination

3. facebook-importer

URL: https://[project-ref].supabase.co/functions/v1/facebook-importer

Purpose: Historical import of ad data with extended metrics

Method: POST (required )

Request:

JSON


{
  "start_date": "2024-01-01",
  "end_date": "2024-03-31",
  "campaign_ids": ["optional_filter"],
  "include_inactive": false
}


Features:

•
Extended metrics: reach, CPM, CPC, CTR, leads, purchases

•
Campaign filtering

•
Retry logic for rate limiting

•
Batch processing for large imports

•
Max 365 days per import

4. ghl-historical-import (NEW)

URL: https://[project-ref].supabase.co/functions/v1/ghl-historical-import

Purpose: One-time import of existing GoHighLevel contacts into contacts table

Method: POST

Request:

JSON


{
  "start_date": "2024-01-01",
  "batchSize": 100,
  "dryRun": false
}


Features:

•
Fetches all contacts from GHL API

•
Enriches with opportunities and appointments

•
Transforms to contacts table schema

•
Batch upsert to database

Environment Variables

Required in Supabase project settings (Settings → Edge Functions → Secrets ):

•
FACEBOOK_ACCESS_TOKEN - For Facebook Ads API

•
FACEBOOK_AD_ACCOUNT_ID - Your ad account ID (with or without act_ prefix)

•
GHL_API_KEY - GoHighLevel API key (for historical import)

•
GHL_LOCATION_ID - GoHighLevel location ID

•
SUPABASE_URL - Auto-provided by Supabase

•
SUPABASE_SERVICE_ROLE_KEY - For admin database access

Deployment Commands

Bash


cd backend

# Deploy individual functions
supabase functions deploy gohighlevel-webhook
supabase functions deploy sync-facebook-ads
supabase functions deploy facebook-importer
supabase functions deploy ghl-historical-import

# View logs
supabase functions logs gohighlevel-webhook --tail





Database Schema

Migration Files Location

backend/supabase/migrations/

Key Tables

ads

SQL


CREATE TABLE ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id TEXT NOT NULL,
  ad_name TEXT,
  campaign_id TEXT,
  campaign_name TEXT,
  adset_id TEXT,
  adset_name TEXT,
  date DATE NOT NULL,
  spend NUMERIC,
  impressions INTEGER,
  clicks INTEGER,
  reach INTEGER,
  cpm NUMERIC,
  cpc NUMERIC,
  ctr NUMERIC,
  leads INTEGER,
  purchases INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT ads_ad_id_date_unique UNIQUE (ad_id, date)
);


events

SQL


CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id TEXT,
  event_type TEXT,
  ad_id TEXT,
  calendar_type TEXT,
  cash_collected NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);


contacts

SQL


CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ghl_contact_id TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  
  -- Attribution
  ad_id TEXT,
  ad_name TEXT,
  campaign_id TEXT,
  campaign_name TEXT,
  adset_id TEXT,
  adset_name TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  fbclid TEXT,
  
  -- Custom Fields
  revenue NUMERIC,
  investment_ability NUMERIC,
  deal_value NUMERIC,
  scaling_challenge TEXT,
  
  -- Pipeline
  current_pipeline TEXT,
  current_stage TEXT,
  pipeline_stage_history JSONB DEFAULT '[]'::jsonb,
  
  -- Calendar
  calendar_id TEXT,
  calendar_name TEXT,
  is_qualified BOOLEAN,
  
  -- Timestamps
  form_submitted_at TIMESTAMP,
  call_booked_at TIMESTAMP,
  call_scheduled_for TIMESTAMP,
  showed_up_at TIMESTAMP,
  no_show_at TIMESTAMP,
  qualified_at TIMESTAMP,
  disqualified_at TIMESTAMP,
  deal_closed_at TIMESTAMP,
  
  -- Financial
  final_deal_value NUMERIC,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);





Data Flow Architecture

1. Facebook Ads → Supabase

•
sync-facebook-ads Edge Function runs daily (or on-demand)

•
Fetches ad performance data from Facebook Ads API

•
Upserts into ads table

2. GoHighLevel → Supabase (Real-time)

•
Webhooks configured in GHL workflows

•
Send events to gohighlevel-webhook Edge Function

•
Creates/updates records in contacts table

•
Tracks full funnel: form → booking → show → close

3. Historical Data Import

•
ghl-historical-import Edge Function (one-time)

•
Fetches existing contacts from GHL API

•
Backfills contacts table with historical data

4. Dashboard Queries

•
Frontend queries ads and contacts tables

•
Joins data to calculate per-ad attribution

•
Real-time updates via Supabase subscriptions




Contact-Level Tracking Implementation

GoHighLevel Workflow Setup

Required Workflows:

1.
Form Submission → webhook on form submit

2.
Appointment Booked → webhook on appointment create

3.
Appointment Status → webhook on appointment update

4.
Pipeline Stage Changed → webhook on opportunity stage change (both pipelines)

5.
Deal Closed → webhook when stage = "Deal Closed"

Facebook Ads URL Parameters

All ads must include these URL parameters:

Plain Text


?ad_id={{ad.id}}&ad_name={{ad.name}}&campaign_id={{campaign.id}}&campaign_name={{campaign.name}}&adset_id={{adset.id}}&adset_name={{adset.name}}&utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&fbclid={{fbclid}}


Form Hidden Fields

GoHighLevel forms must have hidden fields to capture:

•
ad_id, ad_name, campaign_id, campaign_name, adset_id, adset_name

•
utm_source, utm_medium, utm_campaign, utm_content, utm_term

•
fbclid

Each hidden field maps to a custom contact field in GHL.




Dashboard Sections (Planned)

1. Marketing Section (Phase 1 - In Progress)

•
Main Card: Cost per Booked, % Qualified, ABR

•
Expandable View: Ad rankings by each metric

•
Phase 2: Video ad previews (embedded player)

2. Sales Performance Section (Planned)

•
Setter/closer performance metrics

•
Conversion rates by sales rep

•
Pipeline velocity

3. Unit Economics Section (Planned)

•
LTV (Lifetime Value)

•
CAC (Customer Acquisition Cost)

•
Payback period

•
Cohort analysis




Code Conventions

TypeScript

•
Use strict typing

•
Define interfaces for all data structures

•
Prefer interface over type for object shapes

React Components

•
Use functional components with hooks

•
Client components: 'use client' directive at top

•
Server components: default (no directive)

Supabase Queries

•
Use createClient from @supabase/supabase-js

•
Handle errors explicitly

•
Use .select() with specific columns when possible

Naming Conventions

•
Components: PascalCase (MarketingCard)

•
Functions: camelCase (getAdPerformance)

•
Files: kebab-case (dashboard-queries.ts)

•
Database tables: snake_case (contacts, pipeline_stage_history)

File Organization

•
Queries in frontend/lib/queries.ts

•
Utilities in frontend/lib/utils.ts

•
Components in frontend/app/ (co-located with pages)

•
Edge Functions in backend/supabase/functions/[function-name]/index.ts




Testing & Debugging

Frontend

Bash


cd frontend
npm run dev
# Visit http://localhost:3000


Backend Functions

Bash


cd backend

# Test locally
supabase functions serve gohighlevel-webhook

# Test with curl
curl -X POST http://localhost:54321/functions/v1/gohighlevel-webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"test","contact_id":"test_123"}'

# View logs
supabase functions logs gohighlevel-webhook --tail


Database Queries

SQL


-- Check recent contacts
SELECT * FROM contacts ORDER BY created_at DESC LIMIT 10;

-- Check contacts with attribution
SELECT COUNT(* ) FROM contacts WHERE ad_id IS NOT NULL;

-- Top performing ads
SELECT ad_name, COUNT(*) as leads, 
  COUNT(call_booked_at) as booked,
  COUNT(deal_closed_at) as closed,
  SUM(final_deal_value) as revenue
FROM contacts
WHERE ad_id IS NOT NULL
GROUP BY ad_name
ORDER BY revenue DESC;





Common Tasks

Add a new metric to dashboard

1.
Update query in frontend/lib/queries.ts

2.
Add to component state in app/page.tsx

3.
Update UI to display new metric

Add a new Edge Function

1.
Create backend/supabase/functions/[name]/index.ts

2.
Add environment variables in Supabase dashboard

3.
Deploy: supabase functions deploy [name]

4.
Test with curl or Postman

Update database schema

1.
Create migration: supabase migration new [name]

2.
Write SQL in generated file

3.
Apply: supabase db push

4.
Update TypeScript types if needed

Debug webhook issues

1.
Check GHL workflow is published (not draft)

2.
View function logs: supabase functions logs gohighlevel-webhook

3.
Verify webhook URL is correct

4.
Check custom field API keys match exactly




Resources

•
Next.js 16 Docs

•
Supabase Docs

•
Facebook Ads API

•
GoHighLevel API

•
Recharts Documentation




Current Status

✅ Completed:

•
Frontend dashboard with Cost Analysis, Revenue Analysis, Best Performing Ads

•
Facebook Ads sync functionality

•
Basic event tracking

•
Date range filtering

•
Contacts table schema created

•
GoHighLevel webhook function code written

•
Dashboard queries for contact-level analysis written

🚧 In Progress:

•
GoHighLevel workflow configuration

•
Contact-level tracking implementation

•
Marketing Section Phase 1 UI

📋 Planned:

•
Marketing Section Phase 2 (video ad previews)

•
Sales Performance Section

•
Unit Economics Section

•
Historical data import from GHL


## Autonomous Development Mode

When given a task, Claude should:

1. **Understand the requirement** - Read the prompt carefully
2. **Check current state** - Query database/files to understand current implementation
3. **Plan the changes** - Identify which files/tables need modification
4. **Make changes** - Edit code, run SQL, update schema
5. **Test locally** - Run dev server, check for errors
6. **Deploy if needed** - Deploy Edge Functions, run migrations
7. **Verify** - Test the feature works end-to-end
8. **Report** - Summarize what was done and show results

### Debugging Protocol

When encountering errors:
1. **Read the full error message** (don't skip stack traces)
2. **Query database** if data-related (use Supabase MCP)
3. **Check relevant files** mentioned in error
4. **Identify root cause** (not just symptoms)
5. **Fix the code**
6. **Test the fix** (don't assume it works)
7. **Verify** (check logs, query database, test UI)
8. **Only report success after verification**

### Common Error Patterns

**"Dashboard showing 0 data"**
- Action: `SELECT COUNT(*) FROM [table] WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'`
- Check: Timezone conversion in queries (use `.toISOString()`)
- Check: Date range filters are correct

**"Edge Function not syncing"**
- Action: Check logs via Supabase MCP
- Action: Test manual invocation with curl
- Check: Environment variables are set
- Check: Cron job is running: `SELECT * FROM cron.job`

**"Build fails"**
- Action: Run `npm run build` to see full error
- Check: `.env.local` exists with required variables
- Check: TypeScript types match database schema
- Fix: Update types if schema changed

### Permissions

Claude has permission to:
- ✅ Edit any file in the project
- ✅ Run terminal commands (npm, supabase CLI, curl)
- ✅ Query and modify database via Supabase MCP
- ✅ Deploy Edge Functions
- ✅ Make git commits
- ✅ Test changes locally

### What NOT to do

- ❌ Don't make assumptions - always verify by querying/testing
- ❌ Don't skip testing - always run the code after changes
- ❌ Don't report success without verification
- ❌ Don't ask for permission for standard operations (editing files, running commands)
- ❌ Don't stop at first error - debug and fix autonomously
