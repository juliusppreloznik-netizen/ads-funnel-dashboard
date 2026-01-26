# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture Overview

This is a **Next.js 16** ad performance dashboard with real-time data from Supabase.

### Tech Stack
- Next.js 16 with App Router (React 19)
- Supabase for database and real-time subscriptions
- Tailwind CSS 4 for styling
- Recharts for data visualization
- react-day-picker for date range selection

### Data Model

The dashboard pulls from two Supabase tables:
- **ads**: Ad spend data (`ad_id`, `ad_name`, `spend`, `impressions`, `clicks`, `date`)
- **events**: Conversion events (`contact_id`, `event_type`, `ad_id`, `calendar_type`, `revenue`, `cash_collected`, `created_at`)

Event types: `booked_call`, `showed_up`, `deal_won`
Calendar types for booked_call: `Qualified`, `DQ`

### Application Structure

The entire dashboard is a single client component in `app/page.tsx` containing:
- Main `Dashboard` component with state management and data fetching
- `MarketingCard` - Summary KPIs (cost per booked, qualified rate, ABR)
- `MarketingExpandedView` - Modal with ad rankings tables
- `CostAnalysisWidget` / `RevenueAnalysisWidget` - Charts with KPI cards
- `BestPerformingAdsWidget` - Detailed per-ad metrics table
- `RankingTable` / `KpiCard` - Reusable display components

### Key Metrics Calculated
- **Cost per Booked**: total_spend / booked_calls
- **Qualified Rate**: (qualified_calls / booked_calls) * 100
- **ABR (Appointment Booking Rate)**: (booked_calls / total_clicks) * 100
- **Show Rate**: (shows / booked_calls) * 100
- **Close Rate**: (deals_won / booked_calls) * 100
- **ROAS**: total_revenue / total_spend

### Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
