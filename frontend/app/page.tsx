// app/page.tsx

"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
interface Event {
  id?: string;
  contact_id: string;
  event_type: string;
  ad_id: string;
  calendar_type: string | null;
  revenue: string | null;
  investment_ability: string | null;
  cash_collected: number | null;
  created_at: string;
}

interface Ad {
  ad_id: string;
  ad_name: string;
  spend: number;
  impressions: number;
  clicks: number;
  date: string;
}

interface AdMetrics {
  ad_id: string;
  ad_name: string;
  total_spend: number;
  total_impressions: number;
  total_clicks: number;
  booked_calls: number;
  qualified_calls: number;
  dq_calls: number;
  shows: number;
  show_rate: number;
  deals_won: number;
  close_rate: number;
  total_revenue: number;
  cost_per_call: number;
  roas: number;
}

interface DailyMetric {
  date: string;
  spend: number;
  leads: number;
  sales: number;
  revenue: number;
  costPerLead: number;
  costPerSale: number;
}

interface Totals {
  total_spend: number;
  booked_calls: number;
  qualified_calls: number;
  dq_calls: number;
  shows: number;
  deals_won: number;
  total_revenue: number;
}

interface DailyAggregation {
  spend: number;
  leads: number;
  sales: number;
  revenue: number;
}

interface AggregatedAdData {
  ad_name: string;
  total_spend: number;
  total_impressions: number;
  total_clicks: number;
}

interface AggregatedEventData {
  booked_calls: number;
  qualified_calls: number;
  dq_calls: number;
  shows: number;
  deals_won: number;
  total_revenue: number;
}

// Marketing-specific types
interface MarketingMetrics {
  costPerBooked: number;
  qualifiedPercentage: number;
  abr: number;
  totalSpend: number;
  totalBookedCalls: number;
  totalQualifiedCalls: number;
  totalClicks: number;
}

interface AdMarketingMetrics {
  ad_id: string;
  ad_name: string;
  total_spend: number;
  total_clicks: number;
  booked_calls: number;
  qualified_calls: number;
  cost_per_booked: number;
  cost_per_qualified: number;
  abr: number;
}

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isMarketingExpanded, setIsMarketingExpanded] = useState(false);

  // Date range state - default to last 7 days
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Fetch data with date range filter
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const fromDate = dateRange?.from
        ? format(startOfDay(dateRange.from), "yyyy-MM-dd'T'HH:mm:ss")
        : undefined;
      const toDate = dateRange?.to
        ? format(endOfDay(dateRange.to), "yyyy-MM-dd'T'HH:mm:ss")
        : undefined;

      // Fetch events with date filter
      let eventsQuery = supabase.from("events").select("*");
      if (fromDate) eventsQuery = eventsQuery.gte("created_at", fromDate);
      if (toDate) eventsQuery = eventsQuery.lte("created_at", toDate);

      const { data: eventsData, error: eventsError } = await eventsQuery;
      if (eventsError) throw eventsError;

      // Fetch ads with date filter
      let adsQuery = supabase.from("ads").select("*");
      if (dateRange?.from)
        adsQuery = adsQuery.gte("date", format(dateRange.from, "yyyy-MM-dd"));
      if (dateRange?.to)
        adsQuery = adsQuery.lte("date", format(dateRange.to, "yyyy-MM-dd"));

      const { data: adsData, error: adsError } = await adsQuery;
      if (adsError) throw adsError;

      setEvents(eventsData || []);
      setAds(adsData || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Fetch data when date range changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscriptions
  useEffect(() => {
    const eventsChannel: RealtimeChannel = supabase
      .channel("events-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        (payload) => {
          console.log("Events change received:", payload);
          setLastUpdated(new Date());
          fetchData();
        }
      )
      .subscribe();

    const adsChannel: RealtimeChannel = supabase
      .channel("ads-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ads" },
        (payload) => {
          console.log("Ads change received:", payload);
          setLastUpdated(new Date());
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(eventsChannel);
      supabase.removeChannel(adsChannel);
    };
  }, [fetchData]);

  // Calculate Marketing Metrics
  const marketingMetrics: MarketingMetrics = useMemo(() => {
    // Calculate total spend from ads
    const totalSpend = ads.reduce((sum, ad) => sum + (Number(ad.spend) || 0), 0);

    // Calculate total clicks from ads
    const totalClicks = ads.reduce(
      (sum, ad) => sum + (Number(ad.clicks) || 0),
      0
    );

    // Count booked calls from events
    const totalBookedCalls = events.filter(
      (event) => event.event_type === "booked_call"
    ).length;

    // Count qualified calls from events
    const totalQualifiedCalls = events.filter(
      (event) =>
        event.event_type === "booked_call" &&
        event.calendar_type === "Qualified"
    ).length;

    // Calculate metrics with division by zero protection
    // Cost per Booked Appointment = total_spend / booked_calls
    const costPerBooked =
      totalBookedCalls > 0 ? totalSpend / totalBookedCalls : 0;

    // % of Qualified Appointments = (qualified_calls / booked_calls) * 100
    const qualifiedPercentage =
      totalBookedCalls > 0 ? (totalQualifiedCalls / totalBookedCalls) * 100 : 0;

    // ABR (Appointment Booking Rate) = (booked_calls / total_clicks) * 100
    const abr = totalClicks > 0 ? (totalBookedCalls / totalClicks) * 100 : 0;

    return {
      costPerBooked,
      qualifiedPercentage,
      abr,
      totalSpend,
      totalBookedCalls,
      totalQualifiedCalls,
      totalClicks,
    };
  }, [ads, events]);

  // Calculate per-ad marketing metrics for ranking tables
  const adMarketingMetrics: AdMarketingMetrics[] = useMemo(() => {
    // Group ads by ad_id
    const adsMap = new Map<string, { ad_name: string; spend: number; clicks: number }>();

    ads.forEach((ad) => {
      const existing = adsMap.get(ad.ad_id);
      if (existing) {
        existing.spend += Number(ad.spend) || 0;
        existing.clicks += Number(ad.clicks) || 0;
      } else {
        adsMap.set(ad.ad_id, {
          ad_name: ad.ad_name,
          spend: Number(ad.spend) || 0,
          clicks: Number(ad.clicks) || 0,
        });
      }
    });

    // Group events by ad_id
    const eventsMap = new Map<string, { booked_calls: number; qualified_calls: number }>();

    events.forEach((event) => {
      if (!event.ad_id) return;

      const existing = eventsMap.get(event.ad_id) || {
        booked_calls: 0,
        qualified_calls: 0,
      };

      if (event.event_type === "booked_call") {
        existing.booked_calls += 1;
        if (event.calendar_type === "Qualified") {
          existing.qualified_calls += 1;
        }
      }

      eventsMap.set(event.ad_id, existing);
    });

    // Combine and calculate metrics
    const allAdIds = new Set([...adsMap.keys(), ...eventsMap.keys()]);

    return Array.from(allAdIds).map((adId) => {
      const adData = adsMap.get(adId) || { ad_name: "Unknown Ad", spend: 0, clicks: 0 };
      const eventData = eventsMap.get(adId) || { booked_calls: 0, qualified_calls: 0 };

      return {
        ad_id: adId,
        ad_name: adData.ad_name,
        total_spend: adData.spend,
        total_clicks: adData.clicks,
        booked_calls: eventData.booked_calls,
        qualified_calls: eventData.qualified_calls,
        // Cost per Booked = spend / booked_calls
        cost_per_booked:
          eventData.booked_calls > 0 ? adData.spend / eventData.booked_calls : Infinity,
        // Cost per Qualified = spend / qualified_calls
        cost_per_qualified:
          eventData.qualified_calls > 0
            ? adData.spend / eventData.qualified_calls
            : Infinity,
        // ABR = (booked_calls / clicks) * 100
        abr: adData.clicks > 0 ? (eventData.booked_calls / adData.clicks) * 100 : 0,
      };
    });
  }, [ads, events]);

  // Calculate daily metrics for charts
  const dailyMetrics: DailyMetric[] = useMemo(() => {
    const dailyMap = new Map<string, DailyAggregation>();

    // Process ads data
    ads.forEach((ad) => {
      const date = ad.date;
      const existing = dailyMap.get(date) || {
        spend: 0,
        leads: 0,
        sales: 0,
        revenue: 0,
      };
      existing.spend += Number(ad.spend) || 0;
      dailyMap.set(date, existing);
    });

    // Process events data
    events.forEach((event) => {
      const date = format(new Date(event.created_at), "yyyy-MM-dd");
      const existing = dailyMap.get(date) || {
        spend: 0,
        leads: 0,
        sales: 0,
        revenue: 0,
      };

      if (event.event_type === "booked_call") {
        existing.leads += 1;
      } else if (event.event_type === "deal_won") {
        existing.sales += 1;
        existing.revenue += Number(event.cash_collected) || 0;
      }
      dailyMap.set(date, existing);
    });

    // Convert to array and calculate derived metrics
    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date: format(new Date(date), "MMM dd"),
        spend: data.spend,
        leads: data.leads,
        sales: data.sales,
        revenue: data.revenue,
        costPerLead: data.leads > 0 ? data.spend / data.leads : 0,
        costPerSale: data.sales > 0 ? data.spend / data.sales : 0,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [ads, events]);

  // Calculate ad metrics
  const adMetrics: AdMetrics[] = useMemo(() => {
    const adsMap = new Map<string, AggregatedAdData>();

    ads.forEach((ad) => {
      const existing = adsMap.get(ad.ad_id);
      if (existing) {
        existing.total_spend += Number(ad.spend) || 0;
        existing.total_impressions += Number(ad.impressions) || 0;
        existing.total_clicks += Number(ad.clicks) || 0;
      } else {
        adsMap.set(ad.ad_id, {
          ad_name: ad.ad_name,
          total_spend: Number(ad.spend) || 0,
          total_impressions: Number(ad.impressions) || 0,
          total_clicks: Number(ad.clicks) || 0,
        });
      }
    });

    const eventsMap = new Map<string, AggregatedEventData>();

    events.forEach((event) => {
      if (!event.ad_id) return;

      const existing = eventsMap.get(event.ad_id) || {
        booked_calls: 0,
        qualified_calls: 0,
        dq_calls: 0,
        shows: 0,
        deals_won: 0,
        total_revenue: 0,
      };

      if (event.event_type === "booked_call") {
        existing.booked_calls += 1;
        if (event.calendar_type === "Qualified") {
          existing.qualified_calls += 1;
        } else if (event.calendar_type === "DQ") {
          existing.dq_calls += 1;
        }
      } else if (event.event_type === "showed_up") {
        existing.shows += 1;
      } else if (event.event_type === "deal_won") {
        existing.deals_won += 1;
        existing.total_revenue += Number(event.cash_collected) || 0;
      }

      eventsMap.set(event.ad_id, existing);
    });

    const allAdIds = new Set([...adsMap.keys(), ...eventsMap.keys()]);

    const metrics: AdMetrics[] = Array.from(allAdIds).map((adId) => {
      const adData = adsMap.get(adId) || {
        ad_name: "Unknown Ad",
        total_spend: 0,
        total_impressions: 0,
        total_clicks: 0,
      };

      const eventData = eventsMap.get(adId) || {
        booked_calls: 0,
        qualified_calls: 0,
        dq_calls: 0,
        shows: 0,
        deals_won: 0,
        total_revenue: 0,
      };

      const showRate =
        eventData.booked_calls > 0
          ? (eventData.shows / eventData.booked_calls) * 100
          : 0;
      const closeRate =
        eventData.booked_calls > 0
          ? (eventData.deals_won / eventData.booked_calls) * 100
          : 0;
      const costPerCall =
        eventData.booked_calls > 0
          ? adData.total_spend / eventData.booked_calls
          : 0;
      const roas =
        adData.total_spend > 0
          ? eventData.total_revenue / adData.total_spend
          : 0;

      return {
        ad_id: adId,
        ad_name: adData.ad_name,
        total_spend: adData.total_spend,
        total_impressions: adData.total_impressions,
        total_clicks: adData.total_clicks,
        booked_calls: eventData.booked_calls,
        qualified_calls: eventData.qualified_calls,
        dq_calls: eventData.dq_calls,
        shows: eventData.shows,
        show_rate: showRate,
        deals_won: eventData.deals_won,
        close_rate: closeRate,
        total_revenue: eventData.total_revenue,
        cost_per_call: costPerCall,
        roas: roas,
      };
    });

    return metrics.sort((a, b) => b.total_revenue - a.total_spend);
  }, [ads, events]);

  // Calculate totals
  const totals: Totals = useMemo(() => {
    return adMetrics.reduce(
      (acc, metric) => ({
        total_spend: acc.total_spend + metric.total_spend,
        booked_calls: acc.booked_calls + metric.booked_calls,
        qualified_calls: acc.qualified_calls + metric.qualified_calls,
        dq_calls: acc.dq_calls + metric.dq_calls,
        shows: acc.shows + metric.shows,
        deals_won: acc.deals_won + metric.deals_won,
        total_revenue: acc.total_revenue + metric.total_revenue,
      }),
      {
        total_spend: 0,
        booked_calls: 0,
        qualified_calls: 0,
        dq_calls: 0,
        shows: 0,
        deals_won: 0,
        total_revenue: 0,
      }
    );
  }, [adMetrics]);

  // Format helpers
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;
  const formatRoas = (value: number) => `${value.toFixed(2)}x`;

  // Quick date range presets
  const setQuickRange = (days: number) => {
    setDateRange({
      from: subDays(new Date(), days),
      to: new Date(),
    });
    setShowDatePicker(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Ad Performance Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  Real-time metrics and analytics
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Live Indicator */}
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live
              </div>

              {/* Date Range Picker */}
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">
                    {dateRange?.from && dateRange?.to
                      ? `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`
                      : "Select date range"}
                  </span>
                </button>

                {showDatePicker && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
                    {/* Quick Presets */}
                    <div className="flex gap-2 mb-4 pb-4 border-b border-gray-200">
                      <button
                        onClick={() => setQuickRange(7)}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        Last 7 days
                      </button>
                      <button
                        onClick={() => setQuickRange(14)}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        Last 14 days
                      </button>
                      <button
                        onClick={() => setQuickRange(30)}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        Last 30 days
                      </button>
                    </div>

                    <DayPicker
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) => {
                        setDateRange(range);
                        if (range?.from && range?.to) {
                          setShowDatePicker(false);
                        }
                      }}
                      numberOfMonths={2}
                      className="text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Marketing Performance Card - NEW */}
        <div className="mb-6">
          <MarketingCard
            metrics={marketingMetrics}
            formatCurrency={formatCurrency}
            formatPercent={formatPercent}
            onExpand={() => setIsMarketingExpanded(true)}
          />
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Cost Analysis Widget */}
          <CostAnalysisWidget
            totals={totals}
            dailyMetrics={dailyMetrics}
            formatCurrency={formatCurrency}
          />

          {/* Revenue Analysis Widget */}
          <RevenueAnalysisWidget
            totals={totals}
            dailyMetrics={dailyMetrics}
            formatCurrency={formatCurrency}
          />
        </div>

        {/* Best Performing Ads Widget */}
        <BestPerformingAdsWidget
          adMetrics={adMetrics}
          totals={totals}
          formatCurrency={formatCurrency}
          formatPercent={formatPercent}
          formatRoas={formatRoas}
        />

        {/* Footer */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>
            Last updated: {lastUpdated.toLocaleTimeString()} • Data syncs
            automatically
          </p>
        </div>
      </main>

      {/* Click outside to close date picker */}
      {showDatePicker && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDatePicker(false)}
        />
      )}

      {/* Marketing Expanded View Modal */}
      {isMarketingExpanded && (
        <MarketingExpandedView
          adMetrics={adMarketingMetrics}
          formatCurrency={formatCurrency}
          formatPercent={formatPercent}
          onClose={() => setIsMarketingExpanded(false)}
        />
      )}
    </div>
  );
}

// Marketing Card Component
function MarketingCard({
  metrics,
  formatCurrency,
  formatPercent,
  onExpand,
}: {
  metrics: MarketingMetrics;
  formatCurrency: (value: number) => string;
  formatPercent: (value: number) => string;
  onExpand: () => void;
}) {
  // Color helper functions
  const getCostPerBookedColor = (value: number) => {
    if (value < 50) return "text-green-600";
    if (value <= 100) return "text-yellow-600";
    return "text-red-600";
  };

  const getCostPerBookedBg = (value: number) => {
    if (value < 50) return "bg-green-50 border-green-200";
    if (value <= 100) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const getQualifiedColor = (value: number) => {
    if (value > 70) return "text-green-600";
    if (value >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getQualifiedBg = (value: number) => {
    if (value > 70) return "bg-green-50 border-green-200";
    if (value >= 50) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const getAbrColor = (value: number) => {
    if (value > 10) return "text-green-600";
    if (value >= 5) return "text-yellow-600";
    return "text-red-600";
  };

  const getAbrBg = (value: number) => {
    if (value > 10) return "bg-green-50 border-green-200";
    if (value >= 5) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Marketing Performance
            </h2>
            <p className="text-sm text-gray-500">
              Key acquisition metrics at a glance
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Cost per Booked Appointment */}
        <div
          className={`rounded-lg border p-4 ${getCostPerBookedBg(metrics.costPerBooked)}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Cost per Booked
            </span>
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p
            className={`text-3xl font-bold ${getCostPerBookedColor(metrics.costPerBooked)}`}
          >
            {formatCurrency(metrics.costPerBooked)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {metrics.totalBookedCalls} booked from {formatCurrency(metrics.totalSpend)} spend
          </p>
        </div>

        {/* % of Qualified Appointments */}
        <div
          className={`rounded-lg border p-4 ${getQualifiedBg(metrics.qualifiedPercentage)}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Qualified Rate
            </span>
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p
            className={`text-3xl font-bold ${getQualifiedColor(metrics.qualifiedPercentage)}`}
          >
            {formatPercent(metrics.qualifiedPercentage)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {metrics.totalQualifiedCalls} qualified of {metrics.totalBookedCalls} booked
          </p>
        </div>

        {/* ABR (Appointment Booking Rate) */}
        <div className={`rounded-lg border p-4 ${getAbrBg(metrics.abr)}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Booking Rate (ABR)
            </span>
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
          <p className={`text-3xl font-bold ${getAbrColor(metrics.abr)}`}>
            {formatPercent(metrics.abr)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {metrics.totalBookedCalls} booked from {metrics.totalClicks.toLocaleString()} clicks
          </p>
        </div>
      </div>

      {/* Expand Button */}
      <div className="flex justify-end">
        <button
          onClick={onExpand}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
        >
          <span>View Rankings</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Marketing Expanded View Modal
function MarketingExpandedView({
  adMetrics,
  formatCurrency,
  formatPercent,
  onClose,
}: {
  adMetrics: AdMarketingMetrics[];
  formatCurrency: (value: number) => string;
  formatPercent: (value: number) => string;
  onClose: () => void;
}) {
  // Prepare ranked data for each table

  // Table 1: Best by Cost per Booked (lowest first, exclude ads with 0 booked calls)
  const bestByCostPerBooked = useMemo(() => {
    return adMetrics
      .filter((ad) => ad.booked_calls > 0)
      .sort((a, b) => a.cost_per_booked - b.cost_per_booked)
      .slice(0, 10);
  }, [adMetrics]);

  // Table 2: Best by Cost per Qualified (lowest first, exclude ads with 0 qualified calls)
  const bestByCostPerQualified = useMemo(() => {
    return adMetrics
      .filter((ad) => ad.qualified_calls > 0)
      .sort((a, b) => a.cost_per_qualified - b.cost_per_qualified)
      .slice(0, 10);
  }, [adMetrics]);

  // Table 3: Best by ABR (highest first, exclude ads with 0 clicks)
  const bestByAbr = useMemo(() => {
    return adMetrics
      .filter((ad) => ad.total_clicks > 0)
      .sort((a, b) => b.abr - a.abr)
      .slice(0, 10);
  }, [adMetrics]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-start justify-center p-4 pt-10">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Marketing Performance Rankings
                </h2>
                <p className="text-sm text-gray-500">
                  Top 10 ads by key marketing metrics
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Table 1: Best by Cost per Booked */}
              <RankingTable
                title="Best Ads by Cost per Booked"
                subtitle="Lowest cost per booked appointment"
                icon={
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
                iconBg="bg-green-100"
                data={bestByCostPerBooked}
                columns={[
                  { key: "rank", label: "#", align: "center" },
                  { key: "ad_name", label: "Ad Name", align: "left" },
                  { key: "cost_per_booked", label: "Cost/Booked", align: "right" },
                  { key: "booked_calls", label: "Booked", align: "right" },
                  { key: "total_spend", label: "Spend", align: "right" },
                ]}
                formatters={{
                  cost_per_booked: formatCurrency,
                  total_spend: formatCurrency,
                }}
              />

              {/* Table 2: Best by Cost per Qualified */}
              <RankingTable
                title="Best Ads by Cost per Qualified"
                subtitle="Lowest cost per qualified appointment"
                icon={
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
                iconBg="bg-blue-100"
                data={bestByCostPerQualified}
                columns={[
                  { key: "rank", label: "#", align: "center" },
                  { key: "ad_name", label: "Ad Name", align: "left" },
                  { key: "cost_per_qualified", label: "Cost/Qualified", align: "right" },
                  { key: "qualified_calls", label: "Qualified", align: "right" },
                  { key: "total_spend", label: "Spend", align: "right" },
                ]}
                formatters={{
                  cost_per_qualified: formatCurrency,
                  total_spend: formatCurrency,
                }}
              />

              {/* Table 3: Best by ABR */}
              <RankingTable
                title="Best Ads by Booking Rate"
                subtitle="Highest appointment booking rate"
                icon={
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                }
                iconBg="bg-purple-100"
                data={bestByAbr}
                columns={[
                  { key: "rank", label: "#", align: "center" },
                  { key: "ad_name", label: "Ad Name", align: "left" },
                  { key: "abr", label: "ABR", align: "right" },
                  { key: "booked_calls", label: "Booked", align: "right" },
                  { key: "total_clicks", label: "Clicks", align: "right" },
                ]}
                formatters={{
                  abr: formatPercent,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Ranking Table Component
function RankingTable({
  title,
  subtitle,
  icon,
  iconBg,
  data,
  columns,
  formatters = {},
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  data: AdMarketingMetrics[];
  columns: Array<{
    key: string;
    label: string;
    align: "left" | "center" | "right";
  }>;
  formatters?: Record<string, (value: number) => string>;
}) {
  const getAlignment = (align: string) => {
    switch (align) {
      case "left":
        return "text-left";
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  const getValue = (item: AdMarketingMetrics, key: string, index: number) => {
    if (key === "rank") return index + 1;
    const value = item[key as keyof AdMarketingMetrics];
    if (formatters[key] && typeof value === "number") {
      return formatters[key](value);
    }
    if (typeof value === "number") {
      return value.toLocaleString();
    }
    return value;
  };

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center`}
          >
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider ${getAlignment(col.align)}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-4 text-center text-gray-500 text-sm"
                >
                  No data available
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={item.ad_id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-3 py-2 text-sm ${getAlignment(col.align)} ${
                        col.key === "rank"
                          ? "font-bold text-purple-600 bg-purple-50"
                          : col.key === "ad_name"
                            ? "font-medium text-gray-900 max-w-[150px] truncate"
                            : "text-gray-700"
                      }`}
                    >
                      {getValue(item, col.key, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// KPI Card Component
function KpiCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string;
  icon?: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">{title}</span>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {trend && (
          <span
            className={`text-sm ${trend.isPositive ? "text-green-500" : "text-red-500"}`}
          >
            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </div>
  );
}

// Cost Analysis Widget
function CostAnalysisWidget({
  totals,
  dailyMetrics,
  formatCurrency,
}: {
  totals: Totals;
  dailyMetrics: DailyMetric[];
  formatCurrency: (value: number) => string;
}) {
  const costPerLead =
    totals.booked_calls > 0 ? totals.total_spend / totals.booked_calls : 0;
  const costPerSale =
    totals.deals_won > 0 ? totals.total_spend / totals.deals_won : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
          <svg
            className="w-5 h-5 text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Cost Analysis</h2>
          <p className="text-sm text-gray-500">Track your acquisition costs</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <KpiCard title="Total Spend" value={formatCurrency(totals.total_spend)} />
        <KpiCard title="Cost Per Lead" value={formatCurrency(costPerLead)} />
        <KpiCard title="Cost Per Sale" value={formatCurrency(costPerSale)} />
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dailyMetrics}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "#6B7280" }}
              tickLine={false}
              axisLine={{ stroke: "#E5E7EB" }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#6B7280" }}
              tickLine={false}
              axisLine={{ stroke: "#E5E7EB" }}
              tickFormatter={(value) => {
                const numValue = typeof value === "number" ? value : 0;
                return `$${numValue}`;
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFF",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value, name) => {
                const numValue = typeof value === "number" ? value : 0;
                return [`$${numValue.toFixed(2)}`, String(name)];
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="costPerLead"
              name="Cost/Lead"
              stroke="#F97316"
              strokeWidth={2}
              dot={{ fill: "#F97316", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="costPerSale"
              name="Cost/Sale"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Revenue Analysis Widget
function RevenueAnalysisWidget({
  totals,
  dailyMetrics,
  formatCurrency,
}: {
  totals: Totals;
  dailyMetrics: DailyMetric[];
  formatCurrency: (value: number) => string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <svg
            className="w-5 h-5 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Revenue Analysis
          </h2>
          <p className="text-sm text-gray-500">Track your sales performance</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <KpiCard title="Total Sales" value={totals.deals_won.toString()} />
        <KpiCard
          title="Total Revenue"
          value={formatCurrency(totals.total_revenue)}
        />
        <KpiCard
          title="ROAS"
          value={
            totals.total_spend > 0
              ? `${(totals.total_revenue / totals.total_spend).toFixed(2)}x`
              : "0.00x"
          }
        />
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dailyMetrics}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "#6B7280" }}
              tickLine={false}
              axisLine={{ stroke: "#E5E7EB" }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12, fill: "#6B7280" }}
              tickLine={false}
              axisLine={{ stroke: "#E5E7EB" }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12, fill: "#6B7280" }}
              tickLine={false}
              axisLine={{ stroke: "#E5E7EB" }}
              tickFormatter={(value) => {
                const numValue = typeof value === "number" ? value : 0;
                return `$${numValue}`;
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFF",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value, name) => {
                const numValue = typeof value === "number" ? value : 0;
                const label = String(name);
                return [
                  label === "Revenue"
                    ? `$${numValue.toFixed(2)}`
                    : numValue.toString(),
                  label,
                ];
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="sales"
              name="Sales"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Best Performing Ads Widget
function BestPerformingAdsWidget({
  adMetrics,
  totals,
  formatCurrency,
  formatPercent,
  formatRoas,
}: {
  adMetrics: AdMetrics[];
  totals: Totals;
  formatCurrency: (value: number) => string;
  formatPercent: (value: number) => string;
  formatRoas: (value: number) => string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg
            className="w-5 h-5 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Best Performing Ads
          </h2>
          <p className="text-sm text-gray-500">
            Detailed performance by individual ad
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Ad Name
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Spend
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Leads
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Qualified
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                DQ
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Shows
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Show Rate
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Sales
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Close Rate
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Cost/Lead
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                ROAS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {adMetrics.length === 0 ? (
              <tr>
                <td
                  colSpan={12}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No data available for the selected date range.
                </td>
              </tr>
            ) : (
              adMetrics.map((metric, index) => (
                <tr
                  key={metric.ad_id}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 truncate max-w-xs">
                        {metric.ad_name}
                      </span>
                      <span className="text-xs text-gray-400 truncate">
                        {metric.ad_id}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {formatCurrency(metric.total_spend)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      {metric.booked_calls}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {metric.qualified_calls}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      {metric.dq_calls}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {metric.shows}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-medium ${
                        metric.show_rate >= 70
                          ? "text-green-600"
                          : metric.show_rate >= 50
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {formatPercent(metric.show_rate)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                      {metric.deals_won}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-medium ${
                        metric.close_rate >= 30
                          ? "text-green-600"
                          : metric.close_rate >= 15
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {formatPercent(metric.close_rate)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-emerald-600">
                    {formatCurrency(metric.total_revenue)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {formatCurrency(metric.cost_per_call)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-semibold ${
                        metric.roas >= 3
                          ? "text-green-600"
                          : metric.roas >= 1
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {formatRoas(metric.roas)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {/* Totals Row */}
          {adMetrics.length > 0 && (
            <tfoot>
              <tr className="bg-gray-100 font-semibold border-t-2 border-gray-300">
                <td className="px-4 py-3 text-gray-900">TOTAL</td>
                <td className="px-4 py-3 text-right text-gray-900">
                  {formatCurrency(totals.total_spend)}
                </td>
                <td className="px-4 py-3 text-right text-gray-900">
                  {totals.booked_calls}
                </td>
                <td className="px-4 py-3 text-right text-gray-900">
                  {totals.qualified_calls}
                </td>
                <td className="px-4 py-3 text-right text-gray-900">
                  {totals.dq_calls}
                </td>
                <td className="px-4 py-3 text-right text-gray-900">
                  {totals.shows}
                </td>
                <td className="px-4 py-3 text-right text-gray-900">
                  {formatPercent(
                    totals.booked_calls > 0
                      ? (totals.shows / totals.booked_calls) * 100
                      : 0
                  )}
                </td>
                <td className="px-4 py-3 text-right text-gray-900">
                  {totals.deals_won}
                </td>
                <td className="px-4 py-3 text-right text-gray-900">
                  {formatPercent(
                    totals.booked_calls > 0
                      ? (totals.deals_won / totals.booked_calls) * 100
                      : 0
                  )}
                </td>
                <td className="px-4 py-3 text-right text-emerald-600">
                  {formatCurrency(totals.total_revenue)}
                </td>
                <td className="px-4 py-3 text-right text-gray-900">
                  {formatCurrency(
                    totals.booked_calls > 0
                      ? totals.total_spend / totals.booked_calls
                      : 0
                  )}
                </td>
                <td className="px-4 py-3 text-right text-gray-900">
                  {formatRoas(
                    totals.total_spend > 0
                      ? totals.total_revenue / totals.total_spend
                      : 0
                  )}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}