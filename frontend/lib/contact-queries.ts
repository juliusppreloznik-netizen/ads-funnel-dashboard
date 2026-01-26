// frontend/lib/contact-queries.ts
// Contact-level ad performance queries for the Ads Funnel Dashboard

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { format, startOfDay, endOfDay } from "date-fns";

// ============================================================================
// SUPABASE CLIENT INITIALIZATION
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let supabaseInstance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
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
  total_shows: number;
  total_closes: number;
  total_revenue: number;
  // Cost metrics
  cost_per_lead: number;
  cost_per_booked: number;
  cost_per_qualified: number;
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
  leads: number;
  booked: number;
  qualified: number;
  shows: number;
  closes: number;
  revenue: number;
  // Calculated daily rates
  booking_rate: number;
  show_rate: number;
  close_rate: number;
}

/** Query result wrapper */
export interface QueryResult<T> {
  data: T | null;
  error: Error | null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format date for Supabase timestamp comparison
 */
function formatDateForQuery(date: Date, type: "start" | "end"): string {
  const targetDate = type === "start" ? startOfDay(date) : endOfDay(date);
  return format(targetDate, "yyyy-MM-dd'T'HH:mm:ss");
}

/**
 * Format date for Supabase date comparison (ads table)
 */
function formatDateOnly(date: Date): string {
  return format(date, "yyyy-MM-dd");
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

    // Fetch contacts data
    let contactsQuery = supabase
      .from("contacts")
      .select(`
        form_submitted_at,
        call_booked_at,
        is_qualified,
        showed_up_at,
        deal_closed_at,
        final_deal_value
      `);

    if (dateRange?.from) {
      contactsQuery = contactsQuery.gte(
        "form_submitted_at",
        formatDateForQuery(dateRange.from, "start")
      );
    }
    if (dateRange?.to) {
      contactsQuery = contactsQuery.lte(
        "form_submitted_at",
        formatDateForQuery(dateRange.to, "end")
      );
    }

    // Fetch ads data
    let adsQuery = supabase.from("ads").select("spend, clicks, impressions");

    if (dateRange?.from) {
      adsQuery = adsQuery.gte("date", formatDateOnly(dateRange.from));
    }
    if (dateRange?.to) {
      adsQuery = adsQuery.lte("date", formatDateOnly(dateRange.to));
    }

    // Execute both queries in parallel
    const [contactsResult, adsResult] = await Promise.all([contactsQuery, adsQuery]);

    if (contactsResult.error) {
      console.error("Error fetching contacts:", contactsResult.error);
      return { data: null, error: new Error(contactsResult.error.message) };
    }

    if (adsResult.error) {
      console.error("Error fetching ads:", adsResult.error);
      return { data: null, error: new Error(adsResult.error.message) };
    }

    const contacts = contactsResult.data || [];
    const ads = adsResult.data || [];

    // Calculate totals from ads
    const total_spend = ads.reduce((sum, ad) => sum + (Number(ad.spend) || 0), 0);

    // Calculate funnel totals from contacts
    let total_leads = 0;
    let total_booked = 0;
    let total_qualified = 0;
    let total_shows = 0;
    let total_closes = 0;
    let total_revenue = 0;

    for (const contact of contacts) {
      if (contact.form_submitted_at) total_leads++;
      if (contact.call_booked_at) total_booked++;
      if (contact.is_qualified === true) total_qualified++;
      if (contact.showed_up_at) total_shows++;
      if (contact.deal_closed_at) {
        total_closes++;
        total_revenue += Number(contact.final_deal_value) || 0;
      }
    }

    const kpis: MarketingKPIs = {
      // Totals
      total_spend,
      total_leads,
      total_booked,
      total_qualified,
      total_shows,
      total_closes,
      total_revenue,
      // Cost metrics
      cost_per_lead: safeDivide(total_spend, total_leads),
      cost_per_booked: safeDivide(total_spend, total_booked),
      cost_per_qualified: safeDivide(total_spend, total_qualified),
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
 * Returns leads, booked, qualified, shows, closes, revenue by date
 */
export async function getDailyContactTrends(
  dateRange?: DateRangeFilter
): Promise<QueryResult<DailyTrendData[]>> {
  try {
    const supabase = getSupabase();

    let query = supabase
      .from("contacts")
      .select(`
        form_submitted_at,
        call_booked_at,
        is_qualified,
        showed_up_at,
        deal_closed_at,
        final_deal_value
      `);

    if (dateRange?.from) {
      query = query.gte("form_submitted_at", formatDateForQuery(dateRange.from, "start"));
    }
    if (dateRange?.to) {
      query = query.lte("form_submitted_at", formatDateForQuery(dateRange.to, "end"));
    }

    const { data: contacts, error } = await query;

    if (error) {
      console.error("Error fetching contacts for trends:", error);
      return { data: null, error: new Error(error.message) };
    }

    if (!contacts || contacts.length === 0) {
      return { data: [], error: null };
    }

    // Group by date
    const dailyMap = new Map<string, {
      leads: number;
      booked: number;
      qualified: number;
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
          shows: 0,
          closes: 0,
          revenue: 0,
        });
      }

      const dayData = dailyMap.get(dateKey)!;

      dayData.leads++;

      if (contact.call_booked_at) dayData.booked++;
      if (contact.is_qualified === true) dayData.qualified++;
      if (contact.showed_up_at) dayData.shows++;
      if (contact.deal_closed_at) {
        dayData.closes++;
        dayData.revenue += Number(contact.final_deal_value) || 0;
      }
    }

    // Convert to array and sort by date
    const trends: DailyTrendData[] = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        ...data,
        booking_rate: toPercentage(data.booked, data.leads),
        show_rate: toPercentage(data.shows, data.booked),
        close_rate: toPercentage(data.closes, data.booked),
      }))
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
