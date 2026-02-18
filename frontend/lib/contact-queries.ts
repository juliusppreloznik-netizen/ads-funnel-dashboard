// frontend/lib/contact-queries.ts
// Contact-level ad performance queries for the Ads Funnel Dashboard

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { format, startOfDay, endOfDay } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

// ============================================================================
// SUPABASE CLIENT INITIALIZATION
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Date range filter for queries */
export interface DateRangeFilter {
  from?: Date;
  to?: Date;
}

/** Raw contact record from the database */
export interface Contact {
  id: string;
  ghl_contact_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  // Attribution
  ad_id: string | null;
  ad_name: string | null;
  campaign_id: string | null;
  campaign_name: string | null;
  adset_id: string | null;
  adset_name: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  fbclid: string | null;
  // Custom fields
  revenue: number | null;
  investment_ability: number | null;
  deal_value: number | null;
  cash_collected: number | null;
  scaling_challenge: string | null;
  // Pipeline
  current_pipeline: string | null;
  current_stage: string | null;
  pipeline_stage_history: PipelineStageEntry[] | null;
  // Calendar
  calendar_id: string | null;
  calendar_name: string | null;
  is_qualified: boolean | null;
  // Timestamps
  form_submitted_at: string | null;
  call_booked_at: string | null;
  call_scheduled_for: string | null;
  showed_up_at: string | null;
  no_show_at: string | null;
  qualified_at: string | null;
  disqualified_at: string | null;
  deal_closed_at: string | null;
  // Financial
  final_deal_value: number | null;
  // Form responses (JSONB from GHL)
  form_responses: Record<string, string> | null;
  // Metadata
  created_at: string;
  updated_at: string;
}

/** Pipeline stage history entry */
export interface PipelineStageEntry {
  pipeline: string;
  stage: string;
  timestamp: string;
}

/** Ad record from the database */
export interface Ad {
  id: string;
  ad_id: string;
  ad_name: string | null;
  campaign_id: string | null;
  campaign_name: string | null;
  adset_id: string | null;
  adset_name: string | null;
  spend: number | null;
  impressions: number | null;
  clicks: number | null;
  date: string;
  reach: number | null;
  cpm: number | null;
  cpc: number | null;
  ctr: number | null;
  leads: number | null;
  purchases: number | null;
}

/** Funnel metrics per ad (contact-level) */
export interface AdFunnelMetrics {
  ad_id: string;
  ad_name: string;
  campaign_id: string | null;
  campaign_name: string | null;
  // Funnel counts
  total_leads: number;
  calls_booked: number;
  qualified_calls: number;
  dq_calls: number;
  shows: number;
  no_shows: number;
  deals_closed: number;
  // Revenue
  total_revenue: number;
  avg_deal_value: number;
  // Conversion rates (percentages)
  booking_rate: number; // calls_booked / total_leads
  qualified_rate: number; // qualified_calls / calls_booked
  show_rate: number; // shows / calls_booked
  close_rate: number; // deals_closed / calls_booked
}

/** Ad metrics with spend data (for cost analysis) */
export interface AdMetricsWithSpend extends AdFunnelMetrics {
  // Spend data
  total_spend: number;
  total_clicks: number;
  total_impressions: number;
  // Cost metrics
  cost_per_lead: number;
  cost_per_booked: number;
  cost_per_qualified: number;
  cost_per_show: number;
  cost_per_close: number;
  // ROI
  roas: number;
  roi_percentage: number;
}

/** Individual contact with funnel progression */
export interface ContactFunnelData {
  id: string;
  ghl_contact_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  // Attribution
  ad_id: string | null;
  ad_name: string | null;
  campaign_name: string | null;
  // Funnel stage (computed)
  current_funnel_stage: FunnelStage;
  // Timestamps
  form_submitted_at: string | null;
  call_booked_at: string | null;
  is_qualified: boolean | null;
  showed_up_at: string | null;
  deal_closed_at: string | null;
  // Revenue
  final_deal_value: number | null;
  // Pipeline
  current_stage: string | null;
}

/** Funnel stages */
export type FunnelStage =
  | "lead"
  | "booked"
  | "qualified"
  | "showed"
  | "closed"
  | "no_show"
  | "disqualified";

/** Aggregate marketing KPIs */
export interface MarketingKPIs {
  // Totals
  total_spend: number;
  total_leads: number;
  total_booked: number;
  total_qualified: number;
  total_dq: number;
  total_shows: number;
  total_closes: number;
  total_revenue: number;
  total_cash_collected: number;
  total_deal_value: number;
  // Ad metrics from ads table
  total_clicks: number;
  total_impressions: number;
  // Cost metrics
  cost_per_lead: number;
  cost_per_booked: number;
  cost_per_qualified: number;
  cost_per_dq: number;
  cost_per_show: number;
  cost_per_close: number;
  // Conversion rates
  booking_rate: number;
  qualified_rate: number;
  show_rate: number;
  close_rate: number;
  // ROI
  roas: number;
  roi_percentage: number;
  avg_deal_value: number;
}

/** Daily trend data point */
export interface DailyTrendData {
  date: string;
  // Contact funnel metrics
  leads: number;
  booked: number;
  qualified: number;
  dq: number;
  shows: number;
  closes: number;
  revenue: number;
  // Ad metrics from ads table
  spend: number;
  clicks: number;
  impressions: number;
  // Calculated daily rates
  booking_rate: number;
  show_rate: number;
  close_rate: number;
  // Calculated daily cost metrics
  cost_per_booked: number;
  cost_per_qualified: number;
  cost_per_dq: number;
  cost_per_show: number;
}

/** Source breakdown KPIs (campaign/adset/ad level) */
export interface SourceKPIs {
  source: string;
  sourceId: string;
  applications: number;
  qualified: number;
  dq: number;
  shown: number;
  closes: number;
  // Financial metrics
  spend: number;
  revenue: number;
  cashCollected: number;
  dealValue: number;
  // Calculated rates
  showRate: number;
  closeRate: number;
  costPerLead: number;
  roas: number;
}

/** Breakdown level for source table */
export type BreakdownLevel = "campaign" | "adset" | "ad";

/** Query result wrapper */
export interface QueryResult<T> {
  data: T | null;
  error: Error | null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the user's timezone
 */
function getUserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Converts a local date to the start of the day in UTC.
 * This ensures consistent timezone handling with Supabase.
 */
function getStartOfDayUTC(date: Date): Date {
  const userTimeZone = getUserTimeZone();
  // Convert the date to the user's timezone, get start of day, then convert back to UTC
  const zonedDate = toZonedTime(date, userTimeZone);
  const startOfDayLocal = startOfDay(zonedDate);
  return fromZonedTime(startOfDayLocal, userTimeZone);
}

/**
 * Converts a local date to the end of the day in UTC.
 * This ensures consistent timezone handling with Supabase.
 */
function getEndOfDayUTC(date: Date): Date {
  const userTimeZone = getUserTimeZone();
  // Convert the date to the user's timezone, get end of day, then convert back to UTC
  const zonedDate = toZonedTime(date, userTimeZone);
  const endOfDayLocal = endOfDay(zonedDate);
  return fromZonedTime(endOfDayLocal, userTimeZone);
}

/**
 * Format date for Supabase timestamp comparison (contacts table)
 * Uses UTC to match database storage format
 * NOTE: We use toISOString() which is properly handled by Supabase/PostgREST
 */
function formatDateForQuery(date: Date, type: "start" | "end"): string {
  const targetDate = type === "start" ? getStartOfDayUTC(date) : getEndOfDayUTC(date);
  // Use native toISOString() which Supabase handles correctly
  const formatted = targetDate.toISOString();
  console.log(`📅 [formatDateForQuery] ${type}: local=${date.toISOString()} -> UTC=${formatted}`);
  return formatted;
}

/**
 * Format date for Supabase date comparison (ads table)
 * The ads table uses DATE type (no timezone), so we just need the date string
 */
function formatDateOnly(date: Date): string {
  // For date-only columns, use the user's local date
  const userTimeZone = getUserTimeZone();
  const zonedDate = toZonedTime(date, userTimeZone);
  return format(zonedDate, "yyyy-MM-dd");
}

/**
 * Safe division helper
 */
function safeDivide(numerator: number, denominator: number): number {
  return denominator > 0 ? numerator / denominator : 0;
}

/**
 * Calculate percentage
 */
function toPercentage(numerator: number, denominator: number): number {
  return safeDivide(numerator, denominator) * 100;
}

/**
 * Determine funnel stage from contact data
 */
function getFunnelStage(contact: Contact): FunnelStage {
  if (contact.deal_closed_at) return "closed";
  if (contact.no_show_at) return "no_show";
  if (contact.showed_up_at) return "showed";
  if (contact.is_qualified === false || contact.disqualified_at) return "disqualified";
  if (contact.is_qualified === true || contact.qualified_at) return "qualified";
  if (contact.call_booked_at) return "booked";
  return "lead";
}

// ============================================================================
// DIAGNOSTIC FUNCTION
// ============================================================================

/**
 * Diagnostic function to check raw data availability in both tables
 * Run this to verify data exists before applying date filters
 */
export async function diagnoseDatabaseState(): Promise<void> {
  const supabase = getSupabase();

  console.log("🔬 [DIAGNOSTIC] Checking database state...");

  // Check contacts table
  const { data: allContacts, error: contactsError, count: contactsCount } = await supabase
    .from("contacts")
    .select("id, form_submitted_at, call_booked_at, is_qualified, showed_up_at, deal_closed_at", { count: "exact" })
    .limit(10);

  console.log("📊 [DIAGNOSTIC] Contacts table:", {
    totalCount: contactsCount,
    error: contactsError?.message ?? null,
    sampleRecords: allContacts?.map(c => ({
      id: c.id?.substring(0, 8) + "...",
      form_submitted_at: c.form_submitted_at,
      call_booked_at: c.call_booked_at,
      is_qualified: c.is_qualified,
      showed_up_at: c.showed_up_at,
      deal_closed_at: c.deal_closed_at,
    })),
  });

  // Check ads table
  const { data: allAds, error: adsError, count: adsCount } = await supabase
    .from("ads")
    .select("id, ad_id, ad_name, date, spend, clicks, impressions", { count: "exact" })
    .order("date", { ascending: false })
    .limit(10);

  console.log("📊 [DIAGNOSTIC] Ads table:", {
    totalCount: adsCount,
    error: adsError?.message ?? null,
    sampleRecords: allAds?.map(a => ({
      ad_id: a.ad_id?.substring(0, 12) + "...",
      ad_name: a.ad_name?.substring(0, 30),
      date: a.date,
      spend: a.spend,
      clicks: a.clicks,
      impressions: a.impressions,
    })),
  });

  // Get date ranges in the data
  const { data: minMaxContacts } = await supabase
    .from("contacts")
    .select("form_submitted_at")
    .not("form_submitted_at", "is", null)
    .order("form_submitted_at", { ascending: true })
    .limit(1);

  const { data: maxContacts } = await supabase
    .from("contacts")
    .select("form_submitted_at")
    .not("form_submitted_at", "is", null)
    .order("form_submitted_at", { ascending: false })
    .limit(1);

  const { data: minAds } = await supabase
    .from("ads")
    .select("date")
    .order("date", { ascending: true })
    .limit(1);

  const { data: maxAds } = await supabase
    .from("ads")
    .select("date")
    .order("date", { ascending: false })
    .limit(1);

  console.log("📅 [DIAGNOSTIC] Date ranges in data:", {
    contacts: {
      earliest: minMaxContacts?.[0]?.form_submitted_at ?? "none",
      latest: maxContacts?.[0]?.form_submitted_at ?? "none",
    },
    ads: {
      earliest: minAds?.[0]?.date ?? "none",
      latest: maxAds?.[0]?.date ?? "none",
    },
  });

  console.log("🔬 [DIAGNOSTIC] Complete");
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get funnel metrics per ad from contacts table
 * Returns: leads → booked → qualified → shows → closes with conversion rates
 */
export async function getContactLevelAdMetrics(
  dateRange?: DateRangeFilter
): Promise<QueryResult<AdFunnelMetrics[]>> {
  try {
    const supabase = getSupabase();

    // Build query
    let query = supabase
      .from("contacts")
      .select(`
        ad_id,
        ad_name,
        campaign_id,
        campaign_name,
        form_submitted_at,
        call_booked_at,
        is_qualified,
        showed_up_at,
        no_show_at,
        deal_closed_at,
        final_deal_value
      `)
      .not("ad_id", "is", null); // Only contacts with ad attribution

    // Apply date filter on form_submitted_at (when the lead came in)
    if (dateRange?.from) {
      query = query.gte("form_submitted_at", formatDateForQuery(dateRange.from, "start"));
    }
    if (dateRange?.to) {
      query = query.lte("form_submitted_at", formatDateForQuery(dateRange.to, "end"));
    }

    const { data: contacts, error } = await query;

    if (error) {
      console.error("Error fetching contacts:", error);
      return { data: null, error: new Error(error.message) };
    }

    if (!contacts || contacts.length === 0) {
      return { data: [], error: null };
    }

    // Group by ad_id and calculate metrics
    const adMetricsMap = new Map<string, {
      ad_id: string;
      ad_name: string;
      campaign_id: string | null;
      campaign_name: string | null;
      total_leads: number;
      calls_booked: number;
      qualified_calls: number;
      dq_calls: number;
      shows: number;
      no_shows: number;
      deals_closed: number;
      total_revenue: number;
    }>();

    for (const contact of contacts) {
      const adId = contact.ad_id!;

      if (!adMetricsMap.has(adId)) {
        adMetricsMap.set(adId, {
          ad_id: adId,
          ad_name: contact.ad_name || "Unknown Ad",
          campaign_id: contact.campaign_id,
          campaign_name: contact.campaign_name,
          total_leads: 0,
          calls_booked: 0,
          qualified_calls: 0,
          dq_calls: 0,
          shows: 0,
          no_shows: 0,
          deals_closed: 0,
          total_revenue: 0,
        });
      }

      const metrics = adMetricsMap.get(adId)!;

      // Count as lead if form_submitted_at exists
      if (contact.form_submitted_at) {
        metrics.total_leads++;
      }

      // Count as booked if call_booked_at exists
      if (contact.call_booked_at) {
        metrics.calls_booked++;

        // Qualified vs DQ
        if (contact.is_qualified === true) {
          metrics.qualified_calls++;
        } else if (contact.is_qualified === false) {
          metrics.dq_calls++;
        }
      }

      // Count shows
      if (contact.showed_up_at) {
        metrics.shows++;
      }

      // Count no-shows
      if (contact.no_show_at) {
        metrics.no_shows++;
      }

      // Count closed deals
      if (contact.deal_closed_at) {
        metrics.deals_closed++;
        metrics.total_revenue += Number(contact.final_deal_value) || 0;
      }
    }

    // Convert to array and calculate rates
    const adMetrics: AdFunnelMetrics[] = Array.from(adMetricsMap.values()).map((m) => ({
      ...m,
      avg_deal_value: safeDivide(m.total_revenue, m.deals_closed),
      booking_rate: toPercentage(m.calls_booked, m.total_leads),
      qualified_rate: toPercentage(m.qualified_calls, m.calls_booked),
      show_rate: toPercentage(m.shows, m.calls_booked),
      close_rate: toPercentage(m.deals_closed, m.calls_booked),
    }));

    // Sort by total_leads descending
    adMetrics.sort((a, b) => b.total_leads - a.total_leads);

    return { data: adMetrics, error: null };
  } catch (err) {
    console.error("Error in getContactLevelAdMetrics:", err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

/**
 * Get ad metrics with spend data (joins contacts with ads table)
 * Adds cost per lead, cost per booked, cost per qualified, cost per show, cost per close, ROAS
 */
export async function getContactLevelAdMetricsWithSpend(
  dateRange?: DateRangeFilter
): Promise<QueryResult<AdMetricsWithSpend[]>> {
  try {
    const supabase = getSupabase();

    // Get contact-level metrics first
    const { data: funnelMetrics, error: funnelError } = await getContactLevelAdMetrics(dateRange);

    if (funnelError) {
      return { data: null, error: funnelError };
    }

    if (!funnelMetrics || funnelMetrics.length === 0) {
      return { data: [], error: null };
    }

    // Fetch ads data with date filter
    let adsQuery = supabase.from("ads").select("ad_id, ad_name, spend, clicks, impressions, date");

    if (dateRange?.from) {
      adsQuery = adsQuery.gte("date", formatDateOnly(dateRange.from));
    }
    if (dateRange?.to) {
      adsQuery = adsQuery.lte("date", formatDateOnly(dateRange.to));
    }

    const { data: adsData, error: adsError } = await adsQuery;

    if (adsError) {
      console.error("Error fetching ads:", adsError);
      return { data: null, error: new Error(adsError.message) };
    }

    // Aggregate ads data by ad_id
    const adSpendMap = new Map<string, {
      total_spend: number;
      total_clicks: number;
      total_impressions: number;
    }>();

    if (adsData) {
      for (const ad of adsData) {
        const current = adSpendMap.get(ad.ad_id) || {
          total_spend: 0,
          total_clicks: 0,
          total_impressions: 0,
        };

        adSpendMap.set(ad.ad_id, {
          total_spend: current.total_spend + (Number(ad.spend) || 0),
          total_clicks: current.total_clicks + (Number(ad.clicks) || 0),
          total_impressions: current.total_impressions + (Number(ad.impressions) || 0),
        });
      }
    }

    // Merge funnel metrics with spend data
    const metricsWithSpend: AdMetricsWithSpend[] = funnelMetrics.map((metrics) => {
      const spendData = adSpendMap.get(metrics.ad_id) || {
        total_spend: 0,
        total_clicks: 0,
        total_impressions: 0,
      };

      const { total_spend, total_clicks, total_impressions } = spendData;

      return {
        ...metrics,
        total_spend,
        total_clicks,
        total_impressions,
        // Cost metrics
        cost_per_lead: safeDivide(total_spend, metrics.total_leads),
        cost_per_booked: safeDivide(total_spend, metrics.calls_booked),
        cost_per_qualified: safeDivide(total_spend, metrics.qualified_calls),
        cost_per_show: safeDivide(total_spend, metrics.shows),
        cost_per_close: safeDivide(total_spend, metrics.deals_closed),
        // ROI metrics
        roas: safeDivide(metrics.total_revenue, total_spend),
        roi_percentage: total_spend > 0
          ? ((metrics.total_revenue - total_spend) / total_spend) * 100
          : 0,
      };
    });

    // Sort by total_spend descending
    metricsWithSpend.sort((a, b) => b.total_spend - a.total_spend);

    return { data: metricsWithSpend, error: null };
  } catch (err) {
    console.error("Error in getContactLevelAdMetricsWithSpend:", err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

/**
 * Get individual contact records with funnel progression
 * For displaying lead lists and detailed contact views
 */
export async function getContactFunnelData(
  dateRange?: DateRangeFilter,
  options?: {
    adId?: string;
    funnelStage?: FunnelStage;
    limit?: number;
    offset?: number;
  }
): Promise<QueryResult<ContactFunnelData[]>> {
  try {
    const supabase = getSupabase();

    let query = supabase
      .from("contacts")
      .select(`
        id,
        ghl_contact_id,
        first_name,
        last_name,
        email,
        phone,
        ad_id,
        ad_name,
        campaign_name,
        form_submitted_at,
        call_booked_at,
        is_qualified,
        showed_up_at,
        no_show_at,
        deal_closed_at,
        final_deal_value,
        current_stage,
        disqualified_at,
        qualified_at
      `)
      .order("form_submitted_at", { ascending: false });

    // Apply date filter
    if (dateRange?.from) {
      query = query.gte("form_submitted_at", formatDateForQuery(dateRange.from, "start"));
    }
    if (dateRange?.to) {
      query = query.lte("form_submitted_at", formatDateForQuery(dateRange.to, "end"));
    }

    // Filter by ad_id if specified
    if (options?.adId) {
      query = query.eq("ad_id", options.adId);
    }

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 100) - 1);
    }

    const { data: contacts, error } = await query;

    if (error) {
      console.error("Error fetching contact funnel data:", error);
      return { data: null, error: new Error(error.message) };
    }

    if (!contacts) {
      return { data: [], error: null };
    }

    // Transform to ContactFunnelData
    const funnelData: ContactFunnelData[] = contacts.map((contact) => {
      const fullContact = contact as unknown as Contact;
      const stage = getFunnelStage(fullContact);

      return {
        id: contact.id,
        ghl_contact_id: contact.ghl_contact_id,
        name: [contact.first_name, contact.last_name].filter(Boolean).join(" ") || "Unknown",
        email: contact.email,
        phone: contact.phone,
        ad_id: contact.ad_id,
        ad_name: contact.ad_name,
        campaign_name: contact.campaign_name,
        current_funnel_stage: stage,
        form_submitted_at: contact.form_submitted_at,
        call_booked_at: contact.call_booked_at,
        is_qualified: contact.is_qualified,
        showed_up_at: contact.showed_up_at,
        deal_closed_at: contact.deal_closed_at,
        final_deal_value: contact.final_deal_value ? Number(contact.final_deal_value) : null,
        current_stage: contact.current_stage,
      };
    });

    // Filter by funnel stage if specified (client-side for now)
    if (options?.funnelStage) {
      return {
        data: funnelData.filter((c) => c.current_funnel_stage === options.funnelStage),
        error: null,
      };
    }

    return { data: funnelData, error: null };
  } catch (err) {
    console.error("Error in getContactFunnelData:", err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

/**
 * Get aggregate marketing KPIs across all ads
 * Combines spend from ads table with funnel data from contacts table
 */
export async function getMarketingKPIsFromContacts(
  dateRange?: DateRangeFilter
): Promise<QueryResult<MarketingKPIs>> {
  try {
    const supabase = getSupabase();

    console.log("🔍 [getMarketingKPIsFromContacts] Starting query...");
    console.log("📅 [getMarketingKPIsFromContacts] Date range:", dateRange);

    // Build date strings for logging
    const fromDateStr = dateRange?.from ? formatDateForQuery(dateRange.from, "start") : "undefined";
    const toDateStr = dateRange?.to ? formatDateForQuery(dateRange.to, "end") : "undefined";
    const fromDateOnly = dateRange?.from ? formatDateOnly(dateRange.from) : "undefined";
    const toDateOnly = dateRange?.to ? formatDateOnly(dateRange.to) : "undefined";

    console.log("📅 [getMarketingKPIsFromContacts] Contacts filter: form_submitted_at >= ", fromDateStr, " AND <= ", toDateStr);
    console.log("📅 [getMarketingKPIsFromContacts] Ads filter: date >= ", fromDateOnly, " AND <= ", toDateOnly);

    // Fetch contacts data
    // Use OR filter to include contacts where EITHER form_submitted_at OR call_booked_at is in range
    // This ensures we capture booking records that may have different ghl_contact_ids
    let contactsQuery = supabase
      .from("contacts")
      .select(`
        form_submitted_at,
        call_booked_at,
        is_qualified,
        showed_up_at,
        deal_closed_at,
        final_deal_value,
        cash_collected,
        deal_value,
        disqualified_at
      `);

    if (dateRange?.from && dateRange?.to) {
      const fromStr = formatDateForQuery(dateRange.from, "start");
      const toStr = formatDateForQuery(dateRange.to, "end");
      console.log("🔍 [getMarketingKPIsFromContacts] Filter range:", { fromStr, toStr });
      // Use simple filter on form_submitted_at only to avoid OR filter complexity
      // This captures all leads that submitted forms in the date range
      contactsQuery = contactsQuery
        .gte("form_submitted_at", fromStr)
        .lte("form_submitted_at", toStr);
    } else if (dateRange?.from) {
      const fromStr = formatDateForQuery(dateRange.from, "start");
      contactsQuery = contactsQuery.gte("form_submitted_at", fromStr);
    } else if (dateRange?.to) {
      const toStr = formatDateForQuery(dateRange.to, "end");
      contactsQuery = contactsQuery.lte("form_submitted_at", toStr);
    }

    // Fetch ads data with clicks and impressions
    let adsQuery = supabase.from("ads").select("spend, clicks, impressions");

    if (dateRange?.from) {
      adsQuery = adsQuery.gte("date", formatDateOnly(dateRange.from));
    }
    if (dateRange?.to) {
      adsQuery = adsQuery.lte("date", formatDateOnly(dateRange.to));
    }

    // Execute both queries in parallel
    const [contactsResult, adsResult] = await Promise.all([contactsQuery, adsQuery]);

    console.log("📊 [getMarketingKPIsFromContacts] Contacts query result:", {
      count: contactsResult.data?.length ?? 0,
      error: contactsResult.error?.message ?? null,
      sampleData: contactsResult.data?.slice(0, 3),
    });

    console.log("📊 [getMarketingKPIsFromContacts] Ads query result:", {
      count: adsResult.data?.length ?? 0,
      error: adsResult.error?.message ?? null,
      sampleData: adsResult.data?.slice(0, 3),
    });

    if (contactsResult.error) {
      console.error("❌ Error fetching contacts:", contactsResult.error);
      return { data: null, error: new Error(contactsResult.error.message) };
    }

    if (adsResult.error) {
      console.error("❌ Error fetching ads:", adsResult.error);
      return { data: null, error: new Error(adsResult.error.message) };
    }

    const contacts = contactsResult.data || [];
    const ads = adsResult.data || [];

    console.log("✅ [getMarketingKPIsFromContacts] Raw data counts - Contacts:", contacts.length, "Ads:", ads.length);

    // Calculate totals from ads
    const total_spend = ads.reduce((sum, ad) => sum + (Number(ad.spend) || 0), 0);
    const total_clicks = ads.reduce((sum, ad) => sum + (Number(ad.clicks) || 0), 0);
    const total_impressions = ads.reduce((sum, ad) => sum + (Number(ad.impressions) || 0), 0);

    // Calculate funnel totals from contacts
    let total_leads = 0;
    let total_booked = 0;
    let total_qualified = 0;
    let total_dq = 0;
    let total_shows = 0;
    let total_closes = 0;
    let total_revenue = 0;
    let total_cash_collected = 0;
    let total_deal_value = 0;

    for (const contact of contacts) {
      if (contact.form_submitted_at) total_leads++;
      if (contact.call_booked_at) {
        total_booked++;
        // Count qualified vs DQ
        if (contact.is_qualified === true) {
          total_qualified++;
        } else if (contact.is_qualified === false || contact.disqualified_at) {
          total_dq++;
        }
      }
      if (contact.showed_up_at) total_shows++;
      if (contact.deal_closed_at) {
        total_closes++;
        total_revenue += Number(contact.final_deal_value) || 0;
      }
      // Revenue tracking
      total_cash_collected += Number(contact.cash_collected) || 0;
      total_deal_value += Number(contact.deal_value) || 0;
    }

    const kpis: MarketingKPIs = {
      // Totals
      total_spend,
      total_leads,
      total_booked,
      total_qualified,
      total_dq,
      total_shows,
      total_closes,
      total_revenue,
      total_cash_collected,
      total_deal_value,
      // Ad metrics
      total_clicks,
      total_impressions,
      // Cost metrics
      cost_per_lead: safeDivide(total_spend, total_leads),
      cost_per_booked: safeDivide(total_spend, total_booked),
      cost_per_qualified: safeDivide(total_spend, total_qualified),
      cost_per_dq: safeDivide(total_spend, total_dq),
      cost_per_show: safeDivide(total_spend, total_shows),
      cost_per_close: safeDivide(total_spend, total_closes),
      // Conversion rates
      booking_rate: toPercentage(total_booked, total_leads),
      qualified_rate: toPercentage(total_qualified, total_booked),
      show_rate: toPercentage(total_shows, total_booked),
      close_rate: toPercentage(total_closes, total_booked),
      // ROI
      roas: safeDivide(total_revenue, total_spend),
      roi_percentage: total_spend > 0
        ? ((total_revenue - total_spend) / total_spend) * 100
        : 0,
      avg_deal_value: safeDivide(total_revenue, total_closes),
    };

    console.log("📈 [getMarketingKPIsFromContacts] Calculated KPIs:", {
      total_spend,
      total_leads,
      total_booked,
      total_qualified,
      total_dq,
      total_shows,
      total_closes,
      total_revenue,
      total_clicks,
      total_impressions,
    });

    return { data: kpis, error: null };
  } catch (err) {
    console.error("Error in getMarketingKPIsFromContacts:", err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

/**
 * Get daily time-series data for charts
 * Returns leads, booked, qualified, dq, shows, closes, revenue, spend, clicks, impressions by date
 * Also includes daily cost metrics (cost_per_qualified, cost_per_dq, cost_per_show)
 */
export async function getDailyContactTrends(
  dateRange?: DateRangeFilter
): Promise<QueryResult<DailyTrendData[]>> {
  try {
    const supabase = getSupabase();

    // Fetch contacts data
    let contactsQuery = supabase
      .from("contacts")
      .select(`
        form_submitted_at,
        call_booked_at,
        is_qualified,
        showed_up_at,
        deal_closed_at,
        final_deal_value,
        disqualified_at
      `);

    if (dateRange?.from) {
      contactsQuery = contactsQuery.gte("form_submitted_at", formatDateForQuery(dateRange.from, "start"));
    }
    if (dateRange?.to) {
      contactsQuery = contactsQuery.lte("form_submitted_at", formatDateForQuery(dateRange.to, "end"));
    }

    // Fetch ads data for the same date range
    let adsQuery = supabase.from("ads").select("date, spend, clicks, impressions");

    if (dateRange?.from) {
      adsQuery = adsQuery.gte("date", formatDateOnly(dateRange.from));
    }
    if (dateRange?.to) {
      adsQuery = adsQuery.lte("date", formatDateOnly(dateRange.to));
    }

    // Execute both queries in parallel
    const [contactsResult, adsResult] = await Promise.all([contactsQuery, adsQuery]);

    if (contactsResult.error) {
      console.error("Error fetching contacts for trends:", contactsResult.error);
      return { data: null, error: new Error(contactsResult.error.message) };
    }

    if (adsResult.error) {
      console.error("Error fetching ads for trends:", adsResult.error);
      return { data: null, error: new Error(adsResult.error.message) };
    }

    const contacts = contactsResult.data || [];
    const ads = adsResult.data || [];

    // Group ads data by date
    const adsMap = new Map<string, {
      spend: number;
      clicks: number;
      impressions: number;
    }>();

    for (const ad of ads) {
      const dateKey = ad.date;
      const current = adsMap.get(dateKey) || { spend: 0, clicks: 0, impressions: 0 };
      adsMap.set(dateKey, {
        spend: current.spend + (Number(ad.spend) || 0),
        clicks: current.clicks + (Number(ad.clicks) || 0),
        impressions: current.impressions + (Number(ad.impressions) || 0),
      });
    }

    // Group contacts by date
    const dailyMap = new Map<string, {
      leads: number;
      booked: number;
      qualified: number;
      dq: number;
      shows: number;
      closes: number;
      revenue: number;
    }>();

    for (const contact of contacts) {
      // Use form_submitted_at as the primary date
      if (!contact.form_submitted_at) continue;

      const dateKey = format(new Date(contact.form_submitted_at), "yyyy-MM-dd");

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          leads: 0,
          booked: 0,
          qualified: 0,
          dq: 0,
          shows: 0,
          closes: 0,
          revenue: 0,
        });
      }

      const dayData = dailyMap.get(dateKey)!;

      dayData.leads++;

      if (contact.call_booked_at) {
        dayData.booked++;
        // Count qualified vs DQ
        if (contact.is_qualified === true) {
          dayData.qualified++;
        } else if (contact.is_qualified === false || contact.disqualified_at) {
          dayData.dq++;
        }
      }
      if (contact.showed_up_at) dayData.shows++;
      if (contact.deal_closed_at) {
        dayData.closes++;
        dayData.revenue += Number(contact.final_deal_value) || 0;
      }
    }

    // Get all unique dates from both contacts and ads
    const allDates = new Set<string>([...dailyMap.keys(), ...adsMap.keys()]);

    // Convert to array and sort by date
    const trends: DailyTrendData[] = Array.from(allDates)
      .map((date) => {
        const contactData = dailyMap.get(date) || {
          leads: 0,
          booked: 0,
          qualified: 0,
          dq: 0,
          shows: 0,
          closes: 0,
          revenue: 0,
        };
        const adData = adsMap.get(date) || { spend: 0, clicks: 0, impressions: 0 };

        return {
          date,
          // Contact metrics
          leads: contactData.leads,
          booked: contactData.booked,
          qualified: contactData.qualified,
          dq: contactData.dq,
          shows: contactData.shows,
          closes: contactData.closes,
          revenue: contactData.revenue,
          // Ad metrics
          spend: adData.spend,
          clicks: adData.clicks,
          impressions: adData.impressions,
          // Conversion rates
          booking_rate: toPercentage(contactData.booked, contactData.leads),
          show_rate: toPercentage(contactData.shows, contactData.booked),
          close_rate: toPercentage(contactData.closes, contactData.booked),
          // Cost metrics
          cost_per_booked: safeDivide(adData.spend, contactData.booked),
          cost_per_qualified: safeDivide(adData.spend, contactData.qualified),
          cost_per_dq: safeDivide(adData.spend, contactData.dq),
          cost_per_show: safeDivide(adData.spend, contactData.shows),
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    return { data: trends, error: null };
  } catch (err) {
    console.error("Error in getDailyContactTrends:", err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

// ============================================================================
// SOURCE BREAKDOWN QUERY
// ============================================================================

/**
 * Get KPIs broken down by source (campaign, ad set, or ad)
 * Returns qualified calls, DQ calls, shown calls, closes, spend, revenue, rates per source
 */
export async function getSourceKPIs(
  dateRange?: DateRangeFilter,
  breakdownLevel: BreakdownLevel = "campaign"
): Promise<QueryResult<SourceKPIs[]>> {
  try {
    const supabase = getSupabase();

    // Determine which fields to use based on breakdown level
    // IMPORTANT: For "ad" level, we group by ad_id (not ad_name) to match Facebook Ads Manager
    // This is because multiple Facebook ads can share the same name but have different ad_ids
    const nameField =
      breakdownLevel === "campaign"
        ? "campaign_name"
        : breakdownLevel === "adset"
        ? "adset_name"
        : "ad_name";

    const idField =
      breakdownLevel === "campaign"
        ? "campaign_id"
        : breakdownLevel === "adset"
        ? "adset_id"
        : "ad_id";

    // For aggregation, use ad_id when breakdown is "ad" to match Facebook Ads Manager
    const groupByField = breakdownLevel === "ad" ? "ad_id" : nameField;

    // Build contacts query - always fetch both name and id fields
    let contactsQuery = supabase
      .from("contacts")
      .select(`
        ${nameField},
        ${idField},
        form_submitted_at,
        is_qualified,
        showed_up_at,
        deal_closed_at,
        disqualified_at,
        final_deal_value,
        cash_collected,
        deal_value
      `)
      .not(groupByField, "is", null);

    // Apply date filter
    if (dateRange?.from) {
      contactsQuery = contactsQuery.gte("form_submitted_at", formatDateForQuery(dateRange.from, "start"));
    }
    if (dateRange?.to) {
      contactsQuery = contactsQuery.lte("form_submitted_at", formatDateForQuery(dateRange.to, "end"));
    }

    // Build ads query for spend data - always fetch both name and id fields
    let adsQuery = supabase
      .from("ads")
      .select(`
        ${nameField},
        ${idField},
        spend
      `)
      .not(groupByField, "is", null);

    if (dateRange?.from) {
      adsQuery = adsQuery.gte("date", formatDateOnly(dateRange.from));
    }
    if (dateRange?.to) {
      adsQuery = adsQuery.lte("date", formatDateOnly(dateRange.to));
    }

    // Execute both queries in parallel
    const [contactsResult, adsResult] = await Promise.all([contactsQuery, adsQuery]);

    if (contactsResult.error) {
      console.error("Error fetching contacts for source KPIs:", contactsResult.error);
      return { data: null, error: new Error(contactsResult.error.message) };
    }

    if (adsResult.error) {
      console.error("Error fetching ads for source KPIs:", adsResult.error);
      return { data: null, error: new Error(adsResult.error.message) };
    }

    const contacts = contactsResult.data || [];
    const ads = adsResult.data || [];

    // Aggregate spend by groupByField (ad_id for ads, name for campaigns/adsets)
    const spendMap = new Map<string, number>();
    for (const ad of ads) {
      const groupKey = (ad as Record<string, unknown>)[groupByField] as string || "Unknown";
      const currentSpend = spendMap.get(groupKey) || 0;
      spendMap.set(groupKey, currentSpend + (Number(ad.spend) || 0));
    }

    // Group and aggregate contacts by groupByField
    // For "ad" breakdown, this groups by ad_id (not ad_name) to match Facebook Ads Manager
    const sourceMap = new Map<string, {
      source: string;        // Display name (ad_name, campaign_name, etc.)
      sourceId: string;      // ID (ad_id, campaign_id, etc.)
      groupKey: string;      // The actual grouping key (ad_id for ads, name for others)
      applications: number;
      qualified: number;
      dq: number;
      shown: number;
      closes: number;
      revenue: number;
      cashCollected: number;
      dealValue: number;
    }>();

    for (const contact of contacts) {
      const groupKey = (contact as Record<string, unknown>)[groupByField] as string || "Unknown";
      const sourceName = (contact as Record<string, unknown>)[nameField] as string || "Unknown";
      const sourceId = (contact as Record<string, unknown>)[idField] as string || "";

      if (!sourceMap.has(groupKey)) {
        sourceMap.set(groupKey, {
          source: sourceName,
          sourceId,
          groupKey,
          applications: 0,
          qualified: 0,
          dq: 0,
          shown: 0,
          closes: 0,
          revenue: 0,
          cashCollected: 0,
          dealValue: 0,
        });
      }

      const kpis = sourceMap.get(groupKey)!;

      // Count applications (form submissions)
      if (contact.form_submitted_at) {
        kpis.applications++;
      }

      // Count qualified calls
      if (contact.is_qualified === true) {
        kpis.qualified++;
      }

      // Count DQ calls
      if (contact.is_qualified === false || contact.disqualified_at) {
        kpis.dq++;
      }

      // Count shown calls
      if (contact.showed_up_at) {
        kpis.shown++;
      }

      // Count closes and revenue
      if (contact.deal_closed_at) {
        kpis.closes++;
        kpis.revenue += Number(contact.final_deal_value) || 0;
      }

      // Aggregate revenue tracking fields
      kpis.cashCollected += Number((contact as Record<string, unknown>).cash_collected) || 0;
      kpis.dealValue += Number((contact as Record<string, unknown>).deal_value) || 0;
    }

    // Also add ads that have spend but no contacts
    // This ensures we see all ads in the table, even those without any form submissions
    for (const ad of ads) {
      const groupKey = (ad as Record<string, unknown>)[groupByField] as string || "Unknown";
      const sourceName = (ad as Record<string, unknown>)[nameField] as string || "Unknown";
      const sourceId = (ad as Record<string, unknown>)[idField] as string || "";

      if (!sourceMap.has(groupKey)) {
        sourceMap.set(groupKey, {
          source: sourceName,
          sourceId,
          groupKey,
          applications: 0,
          qualified: 0,
          dq: 0,
          shown: 0,
          closes: 0,
          revenue: 0,
          cashCollected: 0,
          dealValue: 0,
        });
      }
    }

    // Calculate final metrics and convert to array
    // Use groupKey to look up spend (ensures ad_id matching for "ad" breakdown)
    const result: SourceKPIs[] = Array.from(sourceMap.values()).map((kpi) => {
      const spend = spendMap.get(kpi.groupKey) || 0;
      const booked = kpi.qualified + kpi.dq; // Total booked = qualified + DQ

      return {
        source: kpi.source,
        sourceId: kpi.sourceId,
        applications: kpi.applications,
        qualified: kpi.qualified,
        dq: kpi.dq,
        shown: kpi.shown,
        closes: kpi.closes,
        spend,
        revenue: kpi.revenue,
        cashCollected: kpi.cashCollected,
        dealValue: kpi.dealValue,
        showRate: booked > 0 ? (kpi.shown / booked) * 100 : 0,
        closeRate: kpi.shown > 0 ? (kpi.closes / kpi.shown) * 100 : 0,
        costPerLead: kpi.applications > 0 ? spend / kpi.applications : 0,
        roas: spend > 0 ? kpi.revenue / spend : 0,
      };
    });

    // Sort by spend (descending) by default
    result.sort((a, b) => b.spend - a.spend);

    return { data: result, error: null };
  } catch (err) {
    console.error("Error in getSourceKPIs:", err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

/**
 * Get contact count by funnel stage
 */
export async function getContactCountByStage(
  dateRange?: DateRangeFilter
): Promise<QueryResult<Record<FunnelStage, number>>> {
  try {
    const { data: contacts, error } = await getContactFunnelData(dateRange);

    if (error) {
      return { data: null, error };
    }

    const counts: Record<FunnelStage, number> = {
      lead: 0,
      booked: 0,
      qualified: 0,
      showed: 0,
      closed: 0,
      no_show: 0,
      disqualified: 0,
    };

    if (contacts) {
      for (const contact of contacts) {
        counts[contact.current_funnel_stage]++;
      }
    }

    return { data: counts, error: null };
  } catch (err) {
    console.error("Error in getContactCountByStage:", err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

/**
 * Get top performing ads by a specific metric
 */
export async function getTopAdsByMetric(
  metric: keyof AdMetricsWithSpend,
  dateRange?: DateRangeFilter,
  limit: number = 10
): Promise<QueryResult<AdMetricsWithSpend[]>> {
  const { data, error } = await getContactLevelAdMetricsWithSpend(dateRange);

  if (error || !data) {
    return { data: null, error };
  }

  // Sort by the specified metric (descending)
  const sorted = [...data].sort((a, b) => {
    const aVal = Number(a[metric]) || 0;
    const bVal = Number(b[metric]) || 0;
    return bVal - aVal;
  });

  return { data: sorted.slice(0, limit), error: null };
}

// ============================================================================
// LEADS BREAKDOWN DATA
// ============================================================================

/** Revenue distribution stats for a funnel stage */
export interface RevenueDistributionStats {
  stage: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  count: number;
}

/** Investment tier breakdown */
export interface InvestmentTier {
  label: string;
  count: number;
  percentage: number;
}

/** Investment breakdown by stage */
export interface InvestmentBreakdown {
  stage: string;
  tiers: InvestmentTier[];
}

/** Revenue funnel stage data */
export interface RevenueFunnelStage {
  stage: string;
  totalRevenue: number;
  count: number;
  avgRevenue: number;
}

/** Source quality metrics */
export interface SourceQuality {
  source: string;
  avgRevenue: number;
  qualRate: number;
  showRate: number;
  closeRate: number;
  totalRevenue: number;
  leadCount: number;
}

/** Daily revenue trend data */
export interface RevenueTrendPoint {
  date: string;
  avgRevenueQualified: number;
  avgRevenueShown: number;
  leadCount: number;
}

/** Investment heatmap row */
export interface InvestmentHeatmapRow {
  tier: string;
  qualified: number;
  shown: number;
  closed: number;
}

/** Complete leads breakdown data */
export interface LeadsBreakdownData {
  // KPI metrics
  avgRevenueQualified: number;
  avgRevenueShown: number;
  avgRevenueClosed: number;
  qualificationRate: number;
  showRate: number;
  closeRate: number;
  // Revenue distribution by stage
  revenueByStage: RevenueDistributionStats[];
  // Investment ability breakdown
  investmentBreakdown: InvestmentBreakdown[];
  // Revenue funnel
  revenueFunnel: RevenueFunnelStage[];
  // Source quality
  sourceQuality: SourceQuality[];
  // Revenue trends
  revenueTrends: RevenueTrendPoint[];
  // Investment heatmap
  investmentHeatmap: InvestmentHeatmapRow[];
}

// ============================================================================
// FORM RESPONSE HELPERS (for GHL form data)
// ============================================================================

/**
 * Extract form response value from contact's form_responses JSONB
 */
function getFormResponse(contact: Contact, fieldName: string): string | null {
  if (!contact.form_responses) return null;
  return contact.form_responses[fieldName] || null;
}

/**
 * Map revenue text from GHL form to numeric value (midpoint of range)
 */
function parseRevenueToNumber(revenueText: string | null): number {
  if (!revenueText) return 0;

  switch (revenueText) {
    case "Under $5k/month":
      return 2500; // Midpoint of $0-$5k
    case "$5k-$10k/month":
      return 7500; // Midpoint of $5k-$10k
    case "$10k-$25k/month":
      return 17500; // Midpoint of $10k-$25k
    case "$25k+/month":
      return 30000; // Conservative estimate for $25k+
    default:
      return 0;
  }
}

/**
 * Get revenue tier label from form response
 */
function getRevenueTier(revenueText: string | null): string {
  if (!revenueText) return "Unknown";
  return revenueText;
}

/**
 * Get investment tier label from form response
 */
function getInvestmentTierLabel(investmentText: string | null): string {
  if (!investmentText) return "Unknown";
  if (investmentText.includes("$5k in cash")) return "Cash Ready ($5k+)";
  if (investmentText.includes("financing")) return "Needs Financing";
  return "Unknown";
}

/**
 * Calculate revenue distribution statistics using form responses
 */
function calculateDistribution(stage: string, contacts: Contact[]): RevenueDistributionStats {
  const revenues = contacts
    .map((c) => {
      const revenue = getFormResponse(c, "revenue");
      return parseRevenueToNumber(revenue);
    })
    .filter((r) => r > 0)
    .sort((a, b) => a - b);

  if (revenues.length === 0) {
    return { stage, min: 0, q1: 0, median: 0, q3: 0, max: 0, count: 0 };
  }

  return {
    stage,
    min: revenues[0],
    q1: revenues[Math.floor(revenues.length * 0.25)] || revenues[0],
    median: revenues[Math.floor(revenues.length * 0.5)] || revenues[0],
    q3: revenues[Math.floor(revenues.length * 0.75)] || revenues[revenues.length - 1],
    max: revenues[revenues.length - 1],
    count: revenues.length,
  };
}

/**
 * Calculate investment tier breakdown using form responses
 */
function calculateInvestmentTiers(contacts: Contact[]): InvestmentTier[] {
  const tierKeys = ["Cash Ready ($5k+)", "Needs Financing", "Unknown"] as const;
  const counts: Record<string, number> = {
    "Cash Ready ($5k+)": 0,
    "Needs Financing": 0,
    Unknown: 0,
  };

  const total = contacts.length;

  contacts.forEach((c) => {
    const investment = getFormResponse(c, "investment_ability");
    const tierLabel = getInvestmentTierLabel(investment);
    counts[tierLabel]++;
  });

  return tierKeys.map((label) => ({
    label,
    count: counts[label],
    percentage: total > 0 ? (counts[label] / total) * 100 : 0,
  }));
}

/**
 * Check if contact's revenue falls within a tier based on form response
 */
function isInRevenueTier(contact: Contact, tier: string): boolean {
  const revenue = getFormResponse(contact, "revenue");
  const revenueTier = getRevenueTier(revenue);
  return revenueTier === tier;
}

/**
 * Get comprehensive leads breakdown data for the Leads Breakdown view
 * Uses form_responses JSONB field for revenue and investment data
 */
export async function getLeadsBreakdownData(
  dateRange?: DateRangeFilter
): Promise<QueryResult<LeadsBreakdownData>> {
  try {
    const supabase = getSupabase();

    // Fetch all contacts in date range
    let query = supabase.from("contacts").select("*");

    if (dateRange?.from) {
      query = query.gte("form_submitted_at", formatDateForQuery(dateRange.from, "start"));
    }
    if (dateRange?.to) {
      query = query.lte("form_submitted_at", formatDateForQuery(dateRange.to, "end"));
    }

    const { data: rawContacts, error } = await query;

    if (error) {
      console.error("Error fetching contacts for leads breakdown:", error);
      return { data: null, error: new Error(error.message) };
    }

    const contacts = (rawContacts || []) as Contact[];

    // Filter contacts by funnel stage
    const allLeads = contacts.filter((c) => c.form_submitted_at);
    const qualified = contacts.filter((c) => c.is_qualified === true);
    const shown = contacts.filter((c) => c.showed_up_at);
    const closed = contacts.filter((c) => c.deal_closed_at);

    // Helper to get revenue from form_responses
    const getContactRevenue = (c: Contact): number => {
      const revenue = getFormResponse(c, "revenue");
      return parseRevenueToNumber(revenue);
    };

    // Calculate KPI metrics using form responses
    const avgRevenueQualified =
      qualified.length > 0
        ? qualified.reduce((sum, c) => sum + getContactRevenue(c), 0) / qualified.length
        : 0;

    const avgRevenueShown =
      shown.length > 0
        ? shown.reduce((sum, c) => sum + getContactRevenue(c), 0) / shown.length
        : 0;

    const avgRevenueClosed =
      closed.length > 0
        ? closed.reduce((sum, c) => sum + getContactRevenue(c), 0) / closed.length
        : 0;

    const qualificationRate =
      allLeads.length > 0 ? (qualified.length / allLeads.length) * 100 : 0;

    const showRate = qualified.length > 0 ? (shown.length / qualified.length) * 100 : 0;

    const closeRate = shown.length > 0 ? (closed.length / shown.length) * 100 : 0;

    // Calculate revenue distribution by stage
    const revenueByStage: RevenueDistributionStats[] = [
      calculateDistribution("Applications", allLeads),
      calculateDistribution("Qualified", qualified),
      calculateDistribution("Shown", shown),
      calculateDistribution("Closed", closed),
    ];

    // Calculate investment ability breakdown
    const investmentBreakdown: InvestmentBreakdown[] = [
      { stage: "Applications", tiers: calculateInvestmentTiers(allLeads) },
      { stage: "Qualified", tiers: calculateInvestmentTiers(qualified) },
      { stage: "Shown", tiers: calculateInvestmentTiers(shown) },
      { stage: "Closed", tiers: calculateInvestmentTiers(closed) },
    ];

    // Calculate revenue funnel using form responses
    const revenueFunnel: RevenueFunnelStage[] = [
      {
        stage: "Applications",
        totalRevenue: allLeads.reduce((sum, c) => sum + getContactRevenue(c), 0),
        count: allLeads.length,
        avgRevenue:
          allLeads.length > 0
            ? allLeads.reduce((sum, c) => sum + getContactRevenue(c), 0) / allLeads.length
            : 0,
      },
      {
        stage: "Qualified",
        totalRevenue: qualified.reduce((sum, c) => sum + getContactRevenue(c), 0),
        count: qualified.length,
        avgRevenue: avgRevenueQualified,
      },
      {
        stage: "Shown",
        totalRevenue: shown.reduce((sum, c) => sum + getContactRevenue(c), 0),
        count: shown.length,
        avgRevenue: avgRevenueShown,
      },
      {
        stage: "Closed",
        totalRevenue: closed.reduce((sum, c) => sum + getContactRevenue(c), 0),
        count: closed.length,
        avgRevenue: avgRevenueClosed,
      },
    ];

    // Calculate source quality (grouped by campaign) using form responses
    const sourceMap = new Map<
      string,
      {
        source: string;
        totalRevenue: number;
        leadCount: number;
        qualified: number;
        shown: number;
        closed: number;
      }
    >();

    contacts.forEach((contact) => {
      const source = contact.campaign_name || "Unknown";
      if (!sourceMap.has(source)) {
        sourceMap.set(source, {
          source,
          totalRevenue: 0,
          leadCount: 0,
          qualified: 0,
          shown: 0,
          closed: 0,
        });
      }
      const stats = sourceMap.get(source)!;
      stats.leadCount++;
      stats.totalRevenue += getContactRevenue(contact);
      if (contact.is_qualified === true) stats.qualified++;
      if (contact.showed_up_at) stats.shown++;
      if (contact.deal_closed_at) stats.closed++;
    });

    const sourceQuality: SourceQuality[] = Array.from(sourceMap.values())
      .map((s) => ({
        source: s.source,
        avgRevenue: s.leadCount > 0 ? s.totalRevenue / s.leadCount : 0,
        qualRate: s.leadCount > 0 ? (s.qualified / s.leadCount) * 100 : 0,
        showRate: s.qualified > 0 ? (s.shown / s.qualified) * 100 : 0,
        closeRate: s.shown > 0 ? (s.closed / s.shown) * 100 : 0,
        totalRevenue: s.totalRevenue,
        leadCount: s.leadCount,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Calculate revenue trends (daily) using form responses
    const trendMap = new Map<
      string,
      {
        date: string;
        qualified: number[];
        shown: number[];
        leadCount: number;
      }
    >();

    contacts.forEach((contact) => {
      const date = contact.form_submitted_at?.split("T")[0];
      if (!date) return;
      if (!trendMap.has(date)) {
        trendMap.set(date, {
          date,
          qualified: [],
          shown: [],
          leadCount: 0,
        });
      }
      const trend = trendMap.get(date)!;
      trend.leadCount++;
      if (contact.is_qualified === true) {
        trend.qualified.push(getContactRevenue(contact));
      }
      if (contact.showed_up_at) {
        trend.shown.push(getContactRevenue(contact));
      }
    });

    const revenueTrends: RevenueTrendPoint[] = Array.from(trendMap.values())
      .map((t) => ({
        date: t.date,
        avgRevenueQualified:
          t.qualified.length > 0
            ? t.qualified.reduce((a, b) => a + b, 0) / t.qualified.length
            : 0,
        avgRevenueShown:
          t.shown.length > 0 ? t.shown.reduce((a, b) => a + b, 0) / t.shown.length : 0,
        leadCount: t.leadCount,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate investment heatmap based on revenue tiers from form responses
    const revenueTiers = ["Under $5k/month", "$5k-$10k/month", "$10k-$25k/month", "$25k+/month"];
    const investmentHeatmap: InvestmentHeatmapRow[] = revenueTiers.map((tier) => ({
      tier,
      qualified: qualified.filter((c) => isInRevenueTier(c, tier)).length,
      shown: shown.filter((c) => isInRevenueTier(c, tier)).length,
      closed: closed.filter((c) => isInRevenueTier(c, tier)).length,
    }));

    return {
      data: {
        avgRevenueQualified,
        avgRevenueShown,
        avgRevenueClosed,
        qualificationRate,
        showRate,
        closeRate,
        revenueByStage,
        investmentBreakdown,
        revenueFunnel,
        sourceQuality,
        revenueTrends,
        investmentHeatmap,
      },
      error: null,
    };
  } catch (err) {
    console.error("Error in getLeadsBreakdownData:", err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}
