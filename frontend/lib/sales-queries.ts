// frontend/lib/sales-queries.ts
// Sales metrics queries for the Sales dashboard

import { getSupabase, type DateRangeFilter, type Contact } from "./contact-queries";
import { format } from "date-fns";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SalesKPIs {
  // Volume metrics
  totalCallsBooked: number;
  qualifiedCallsBooked: number;
  totalCallsTaken: number;
  qualifiedCallsTaken: number;
  totalCloses: number;
  cashCollected: number;
  avgACV: number;

  // Rate metrics
  totalShowRate: number;
  qualifiedShowRate: number;
  totalCloseRate: number;
  qualifiedCloseRate: number;
  dqCloseRate: number;
  avgCashPerCallTaken: number;
}

export interface DailySalesMetrics {
  date: string;
  callsBooked: number;
  qualifiedCallsBooked: number;
  callsTaken: number;
  qualifiedCallsTaken: number;
  closes: number;
  cashCollected: number;
  // Rates
  showRate: number;
  qualifiedShowRate: number;
  closeRate: number;
  qualifiedCloseRate: number;
  dqCloseRate: number;
}

export interface AdSalesAttribution {
  ad_id: string;
  ad_name: string;
  leads: number;
  booked: number;
  qualifiedBooked: number;
  shows: number;
  closes: number;
  cash: number;
  closeRate: number;
}

export interface ZoomTranscript {
  id: string;
  meeting_id: string;
  topic: string;
  host_email: string;
  start_time: string;
  duration: number;
  transcript_text: string;
  transcript_parsed: TranscriptSegment[];
  contact_id: string | null;
  contact_name: string | null;
  contact_email: string | null;
  call_outcome: 'closed' | 'no_close' | 'no_show' | 'unknown';
  cash_collected: number;
  deal_value: number;
}

export interface TranscriptSegment {
  start: string;
  end: string;
  speaker: string;
  text: string;
}

export interface WeeklyCashData {
  week: string;
  cash: number;
}

export interface WeeklyShowsClosesData {
  week: string;
  shows: number;
  closes: number;
}

// ============================================================================
// SALES KPIs QUERY
// ============================================================================

export async function getSalesKPIs(
  dateRange?: DateRangeFilter
): Promise<{ data: SalesKPIs | null; error: string | null }> {
  const supabase = getSupabase();

  try {
    let query = supabase.from("contacts").select("*");

    // Filter by call_booked_at date (primary date dimension)
    if (dateRange?.from) {
      query = query.gte("call_booked_at", dateRange.from.toISOString());
    }
    if (dateRange?.to) {
      query = query.lte("call_booked_at", dateRange.to.toISOString());
    }

    // Only include contacts with call_booked_at
    query = query.not("call_booked_at", "is", null);

    const { data: contacts, error } = await query;

    if (error) {
      console.error("Error fetching contacts for sales KPIs:", error);
      return { data: null, error: error.message };
    }

    if (!contacts || contacts.length === 0) {
      return {
        data: {
          totalCallsBooked: 0,
          qualifiedCallsBooked: 0,
          totalCallsTaken: 0,
          qualifiedCallsTaken: 0,
          totalCloses: 0,
          cashCollected: 0,
          avgACV: 0,
          totalShowRate: 0,
          qualifiedShowRate: 0,
          totalCloseRate: 0,
          qualifiedCloseRate: 0,
          dqCloseRate: 0,
          avgCashPerCallTaken: 0,
        },
        error: null,
      };
    }

    // Calculate metrics
    const totalCallsBooked = contacts.length;
    const qualifiedCallsBooked = contacts.filter(c => c.is_qualified === true).length;
    const dqCallsBooked = contacts.filter(c => c.is_qualified === false).length;

    const totalCallsTaken = contacts.filter(c => c.showed_up_at).length;
    const qualifiedCallsTaken = contacts.filter(c => c.showed_up_at && c.is_qualified === true).length;
    const dqCallsTaken = contacts.filter(c => c.showed_up_at && c.is_qualified === false).length;

    const totalCloses = contacts.filter(c => c.deal_closed_at).length;
    const qualifiedCloses = contacts.filter(c => c.deal_closed_at && c.is_qualified === true).length;
    const dqCloses = contacts.filter(c => c.deal_closed_at && c.is_qualified === false).length;

    const cashCollected = contacts.reduce((sum, c) => sum + (c.cash_collected || 0), 0);
    const closedContacts = contacts.filter(c => c.deal_closed_at && c.cash_collected);
    const avgACV = closedContacts.length > 0
      ? cashCollected / closedContacts.length
      : 0;

    // Rate calculations
    const totalShowRate = totalCallsBooked > 0
      ? (totalCallsTaken / totalCallsBooked) * 100
      : 0;
    const qualifiedShowRate = qualifiedCallsBooked > 0
      ? (qualifiedCallsTaken / qualifiedCallsBooked) * 100
      : 0;
    const totalCloseRate = totalCallsTaken > 0
      ? (totalCloses / totalCallsTaken) * 100
      : 0;
    const qualifiedCloseRate = qualifiedCallsTaken > 0
      ? (qualifiedCloses / qualifiedCallsTaken) * 100
      : 0;
    const dqCloseRate = dqCallsTaken > 0
      ? (dqCloses / dqCallsTaken) * 100
      : 0;
    const avgCashPerCallTaken = totalCallsTaken > 0
      ? cashCollected / totalCallsTaken
      : 0;

    return {
      data: {
        totalCallsBooked,
        qualifiedCallsBooked,
        totalCallsTaken,
        qualifiedCallsTaken,
        totalCloses,
        cashCollected,
        avgACV,
        totalShowRate,
        qualifiedShowRate,
        totalCloseRate,
        qualifiedCloseRate,
        dqCloseRate,
        avgCashPerCallTaken,
      },
      error: null,
    };
  } catch (err) {
    console.error("Exception in getSalesKPIs:", err);
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ============================================================================
// DAILY SALES TRENDS QUERY (for sparklines)
// ============================================================================

export async function getDailySalesTrends(
  dateRange?: DateRangeFilter
): Promise<{ data: DailySalesMetrics[] | null; error: string | null }> {
  const supabase = getSupabase();

  try {
    let query = supabase.from("contacts").select("*");

    if (dateRange?.from) {
      query = query.gte("call_booked_at", dateRange.from.toISOString());
    }
    if (dateRange?.to) {
      query = query.lte("call_booked_at", dateRange.to.toISOString());
    }

    query = query.not("call_booked_at", "is", null);
    query = query.order("call_booked_at", { ascending: true });

    const { data: contacts, error } = await query;

    if (error) {
      console.error("Error fetching contacts for daily trends:", error);
      return { data: null, error: error.message };
    }

    if (!contacts || contacts.length === 0) {
      return { data: [], error: null };
    }

    // Group by date
    const byDate = new Map<string, Contact[]>();
    for (const contact of contacts) {
      const date = format(new Date(contact.call_booked_at!), "yyyy-MM-dd");
      if (!byDate.has(date)) {
        byDate.set(date, []);
      }
      byDate.get(date)!.push(contact as Contact);
    }

    // Calculate metrics per day
    const dailyMetrics: DailySalesMetrics[] = [];
    for (const [date, dayContacts] of byDate) {
      const callsBooked = dayContacts.length;
      const qualifiedCallsBooked = dayContacts.filter(c => c.is_qualified === true).length;
      const callsTaken = dayContacts.filter(c => c.showed_up_at).length;
      const qualifiedCallsTaken = dayContacts.filter(c => c.showed_up_at && c.is_qualified === true).length;
      const dqCallsTaken = dayContacts.filter(c => c.showed_up_at && c.is_qualified === false).length;
      const closes = dayContacts.filter(c => c.deal_closed_at).length;
      const qualifiedCloses = dayContacts.filter(c => c.deal_closed_at && c.is_qualified === true).length;
      const dqCloses = dayContacts.filter(c => c.deal_closed_at && c.is_qualified === false).length;
      const cashCollected = dayContacts.reduce((sum, c) => sum + (c.cash_collected || 0), 0);

      dailyMetrics.push({
        date,
        callsBooked,
        qualifiedCallsBooked,
        callsTaken,
        qualifiedCallsTaken,
        closes,
        cashCollected,
        showRate: callsBooked > 0 ? (callsTaken / callsBooked) * 100 : 0,
        qualifiedShowRate: qualifiedCallsBooked > 0 ? (qualifiedCallsTaken / qualifiedCallsBooked) * 100 : 0,
        closeRate: callsTaken > 0 ? (closes / callsTaken) * 100 : 0,
        qualifiedCloseRate: qualifiedCallsTaken > 0 ? (qualifiedCloses / qualifiedCallsTaken) * 100 : 0,
        dqCloseRate: dqCallsTaken > 0 ? (dqCloses / dqCallsTaken) * 100 : 0,
      });
    }

    return { data: dailyMetrics, error: null };
  } catch (err) {
    console.error("Exception in getDailySalesTrends:", err);
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ============================================================================
// AD ATTRIBUTION QUERY
// ============================================================================

export async function getAdSalesAttribution(
  dateRange?: DateRangeFilter
): Promise<{ data: AdSalesAttribution[] | null; error: string | null }> {
  const supabase = getSupabase();

  try {
    let query = supabase.from("contacts").select("*");

    if (dateRange?.from) {
      query = query.gte("call_booked_at", dateRange.from.toISOString());
    }
    if (dateRange?.to) {
      query = query.lte("call_booked_at", dateRange.to.toISOString());
    }

    // Only include contacts with ad attribution
    query = query.not("ad_id", "is", null);

    const { data: contacts, error } = await query;

    if (error) {
      console.error("Error fetching contacts for ad attribution:", error);
      return { data: null, error: error.message };
    }

    if (!contacts || contacts.length === 0) {
      return { data: [], error: null };
    }

    // Group by ad_id
    const byAd = new Map<string, Contact[]>();
    for (const contact of contacts) {
      const adId = contact.ad_id!;
      if (!byAd.has(adId)) {
        byAd.set(adId, []);
      }
      byAd.get(adId)!.push(contact as Contact);
    }

    // Calculate metrics per ad
    const adMetrics: AdSalesAttribution[] = [];
    for (const [adId, adContacts] of byAd) {
      const leads = adContacts.length;
      const booked = adContacts.filter(c => c.call_booked_at).length;
      const qualifiedBooked = adContacts.filter(c => c.call_booked_at && c.is_qualified === true).length;
      const shows = adContacts.filter(c => c.showed_up_at).length;
      const closes = adContacts.filter(c => c.deal_closed_at).length;
      const cash = adContacts.reduce((sum, c) => sum + (c.cash_collected || 0), 0);
      const closeRate = shows > 0 ? (closes / shows) * 100 : 0;

      adMetrics.push({
        ad_id: adId,
        ad_name: adContacts[0]?.ad_name || adId,
        leads,
        booked,
        qualifiedBooked,
        shows,
        closes,
        cash,
        closeRate,
      });
    }

    // Sort by cash descending
    adMetrics.sort((a, b) => b.cash - a.cash);

    return { data: adMetrics, error: null };
  } catch (err) {
    console.error("Exception in getAdSalesAttribution:", err);
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ============================================================================
// ZOOM TRANSCRIPTS QUERY
// ============================================================================

export async function getZoomTranscripts(): Promise<{ data: ZoomTranscript[] | null; error: string | null }> {
  const supabase = getSupabase();

  try {
    const { data, error } = await supabase
      .from("zoom_transcripts")
      .select("*")
      .order("start_time", { ascending: false });

    if (error) {
      console.error("Error fetching zoom transcripts:", error);
      return { data: null, error: error.message };
    }

    return { data: data as ZoomTranscript[], error: null };
  } catch (err) {
    console.error("Exception in getZoomTranscripts:", err);
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ============================================================================
// WEEKLY CASH COLLECTED (for trend chart)
// ============================================================================

export async function getWeeklyCashCollected(
  dateRange?: DateRangeFilter
): Promise<{ data: WeeklyCashData[] | null; error: string | null }> {
  const supabase = getSupabase();

  try {
    let query = supabase.from("contacts").select("deal_closed_at, cash_collected");

    if (dateRange?.from) {
      query = query.gte("deal_closed_at", dateRange.from.toISOString());
    }
    if (dateRange?.to) {
      query = query.lte("deal_closed_at", dateRange.to.toISOString());
    }

    query = query.not("deal_closed_at", "is", null);

    const { data: contacts, error } = await query;

    if (error) {
      return { data: null, error: error.message };
    }

    if (!contacts || contacts.length === 0) {
      return { data: [], error: null };
    }

    // Group by week
    const byWeek = new Map<string, number>();
    for (const contact of contacts) {
      const date = new Date(contact.deal_closed_at);
      // Get start of week (Sunday)
      const day = date.getDay();
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - day);
      const weekKey = format(weekStart, "yyyy-MM-dd");

      byWeek.set(weekKey, (byWeek.get(weekKey) || 0) + (contact.cash_collected || 0));
    }

    const weeklyData: WeeklyCashData[] = Array.from(byWeek.entries())
      .map(([week, cash]) => ({ week, cash }))
      .sort((a, b) => a.week.localeCompare(b.week));

    return { data: weeklyData, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ============================================================================
// WEEKLY SHOWS vs CLOSES (for multi-line chart)
// ============================================================================

export async function getWeeklyShowsCloses(
  dateRange?: DateRangeFilter
): Promise<{ data: WeeklyShowsClosesData[] | null; error: string | null }> {
  const supabase = getSupabase();

  try {
    let query = supabase.from("contacts").select("call_booked_at, showed_up_at, deal_closed_at");

    if (dateRange?.from) {
      query = query.gte("call_booked_at", dateRange.from.toISOString());
    }
    if (dateRange?.to) {
      query = query.lte("call_booked_at", dateRange.to.toISOString());
    }

    query = query.not("call_booked_at", "is", null);

    const { data: contacts, error } = await query;

    if (error) {
      return { data: null, error: error.message };
    }

    if (!contacts || contacts.length === 0) {
      return { data: [], error: null };
    }

    // Group by week (based on call_booked_at)
    const showsByWeek = new Map<string, number>();
    const closesByWeek = new Map<string, number>();

    for (const contact of contacts) {
      const date = new Date(contact.call_booked_at);
      const day = date.getDay();
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - day);
      const weekKey = format(weekStart, "yyyy-MM-dd");

      if (contact.showed_up_at) {
        showsByWeek.set(weekKey, (showsByWeek.get(weekKey) || 0) + 1);
      }
      if (contact.deal_closed_at) {
        closesByWeek.set(weekKey, (closesByWeek.get(weekKey) || 0) + 1);
      }
    }

    // Combine weeks
    const allWeeks = new Set([...showsByWeek.keys(), ...closesByWeek.keys()]);
    const weeklyData: WeeklyShowsClosesData[] = Array.from(allWeeks)
      .map(week => ({
        week,
        shows: showsByWeek.get(week) || 0,
        closes: closesByWeek.get(week) || 0,
      }))
      .sort((a, b) => a.week.localeCompare(b.week));

    return { data: weeklyData, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ============================================================================
// SYNC ZOOM TRANSCRIPTS (calls Edge Function)
// ============================================================================

export async function syncZoomTranscripts(): Promise<{ success: boolean; message: string; data?: Record<string, unknown> }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const response = await fetch(
      `${supabaseUrl}/functions/v1/sync-zoom-transcripts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({}),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        message: data.error || 'Failed to sync transcripts',
      };
    }

    return {
      success: true,
      message: `Synced ${data.synced} transcripts (${data.skipped} skipped, ${data.errors} errors)`,
      data,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
