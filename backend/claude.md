# Ad Tracking Backend

## Overview
Supabase backend with Edge Functions for webhook processing and Facebook Ads sync.

## Tech Stack
- Supabase (PostgreSQL + Edge Functions)
- Deno runtime for Edge Functions
- Facebook Ads API
- GoHighLevel webhook integration

## Database Tables

### events
Tracks user actions from GoHighLevel webhooks:
- `id` (uuid, primary key)
- `contact_id` (text) - GoHighLevel contact ID
- `event_type` (text) - "booked_call", "showed_up", "deal_won"
- `ad_id` (text) - Links to Facebook ad
- `calendar_type` (text) - "Qualified" or "DQ"
- `cash_collected` (numeric) - Revenue amount
- `created_at` (timestamp)

### ads
Stores Facebook ad performance data:
- `id` (uuid, primary key)
- `ad_id` (text) - Facebook ad ID
- `ad_name` (text) - Ad name from Facebook
- `campaign_id` (text)
- `campaign_name` (text)
- `adset_id` (text) - Facebook ad set ID
- `adset_name` (text) - Ad set name
- `date` (date) - Performance date
- `spend` (numeric) - Daily ad spend
- `impressions` (integer)
- `clicks` (integer)
- `reach` (integer) - Optional, from facebook-importer
- `cpm` (numeric) - Optional, cost per mille
- `cpc` (numeric) - Optional, cost per click
- `ctr` (numeric) - Optional, click-through rate
- `leads` (integer) - Optional, lead conversions
- `purchases` (integer) - Optional, purchase conversions
- `created_at` (timestamp)

**Unique constraint:** `(ad_id, date)` - ensures one record per ad per day

## Edge Functions

### gohighlevel-webhook
**URL:** https://kdvdshszbntysrgzgspp.supabase.co/functions/v1/gohighlevel-webhook

**Purpose:** Receives webhooks from GoHighLevel and stores events in database

**Handles:**
- Form submissions with UTM parameters
- Pipeline stage changes (booked_call, showed_up, deal_won )
- Contact data with ad attribution

### sync-facebook-ads
**URL:** https://kdvdshszbntysrgzgspp.supabase.co/functions/v1/sync-facebook-ads

**Purpose:** Daily sync of ad performance data from Facebook Ads API

**Methods:** GET, POST

**Request (optional):**
```json
{
  "start_date": "2024-01-01",
  "end_date": "2024-01-07"
}
```
Defaults to last 7 days if no dates provided.

**Fetches:**
- Ad spend, impressions, clicks
- Campaign, ad set, and ad names
- Daily breakdown with automatic pagination

### facebook-importer
**URL:** https://kdvdshszbntysrgzgspp.supabase.co/functions/v1/facebook-importer

**Purpose:** Historical import of ad data with extended metrics

**Method:** POST (required)

**Request:**
```json
{
  "start_date": "2024-01-01",
  "end_date": "2024-03-31",
  "campaign_ids": ["optional_filter"],
  "include_inactive": false
}
```

**Features:**
- Extended metrics: reach, CPM, CPC, CTR, leads, purchases
- Campaign filtering
- Retry logic for rate limiting
- Batch processing for large imports
- Max 365 days per import

## Environment Variables
Required in Supabase project settings:
- `FACEBOOK_ACCESS_TOKEN` - For Facebook Ads API
- `FACEBOOK_AD_ACCOUNT_ID` - Your ad account ID (with or without `act_` prefix)
- `SUPABASE_URL` - Auto-provided by Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - For admin database access

## Deployment
Deploy functions with:
```bash
supabase functions deploy gohighlevel-webhook
supabase functions deploy sync-facebook-ads
supabase functions deploy facebook-importer
```

## Database Migration
To add the new columns for extended metrics, run:
```sql
ALTER TABLE ads
ADD COLUMN IF NOT EXISTS adset_id TEXT,
ADD COLUMN IF NOT EXISTS adset_name TEXT,
ADD COLUMN IF NOT EXISTS reach INTEGER,
ADD COLUMN IF NOT EXISTS cpm NUMERIC,
ADD COLUMN IF NOT EXISTS cpc NUMERIC,
ADD COLUMN IF NOT EXISTS ctr NUMERIC,
ADD COLUMN IF NOT EXISTS leads INTEGER,
ADD COLUMN IF NOT EXISTS purchases INTEGER;

-- Add unique constraint for upsert
ALTER TABLE ads
ADD CONSTRAINT ads_ad_id_date_unique UNIQUE (ad_id, date);
```


