// Fatigue Monitor Edge Function
// Calculates ad fatigue scores using percentage change trends on CPA, CPM, CTR

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Calculate percentage change between first half and second half of values
// Returns the percentage change: ((second_half_avg - first_half_avg) / first_half_avg) * 100
// Returns null if first half average is 0 or not enough data
function calculatePercentageChange(values: number[]): number | null {
  const n = values.length;
  if (n < 2) return null;

  const midpoint = Math.floor(n / 2);
  const firstHalf = values.slice(0, midpoint);
  const secondHalf = values.slice(midpoint);

  if (firstHalf.length === 0 || secondHalf.length === 0) return null;

  const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  // Avoid division by zero
  if (firstHalfAvg === 0) return null;

  return ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
}

// Format percentage change for display: "+12.5%" or "-33.3%" or "N/A"
function formatPercentageChange(change: number | null): string {
  if (change === null) return "N/A";
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}

// Calculate CPA (Cost Per Acquisition) from spend and leads
function calculateCPA(spend: number, leads: number): number {
  return leads > 0 ? spend / leads : 0;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body for optional days parameter
    let daysToAnalyze = 7;
    try {
      const body = await req.json();
      if (body.days) daysToAnalyze = Math.min(30, Math.max(3, body.days));
    } catch {
      // Use default 7 days
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToAnalyze);

    // Fetch ad performance data
    const { data: adsData, error: adsError } = await supabase
      .from("ads")
      .select("ad_id, ad_name, date, spend, impressions, clicks, leads, cpm, ctr")
      .gte("date", startDate.toISOString().split("T")[0])
      .lte("date", endDate.toISOString().split("T")[0])
      .order("date", { ascending: true });

    if (adsError) {
      throw new Error(`Failed to fetch ads: ${adsError.message}`);
    }

    // Group data by ad_id
    const adDataMap = new Map<string, {
      ad_name: string;
      dates: string[];
      cpas: number[];
      cpms: number[];
      ctrs: number[];
      totalSpend: number;
      totalLeads: number;
    }>();

    for (const row of adsData || []) {
      if (!adDataMap.has(row.ad_id)) {
        adDataMap.set(row.ad_id, {
          ad_name: row.ad_name || "Unknown",
          dates: [],
          cpas: [],
          cpms: [],
          ctrs: [],
          totalSpend: 0,
          totalLeads: 0,
        });
      }

      const adData = adDataMap.get(row.ad_id)!;
      adData.dates.push(row.date);
      adData.cpas.push(calculateCPA(row.spend || 0, row.leads || 0));
      adData.cpms.push(row.cpm || 0);
      adData.ctrs.push(row.ctr || 0);
      adData.totalSpend += row.spend || 0;
      adData.totalLeads += row.leads || 0;
    }

    // Calculate fatigue scores for each ad
    const fatigueResults: {
      ad_id: string;
      fatigue_score: number;
      cpa_trend: number | null;
      cpm_trend: number | null;
      ctr_trend: number | null;
      cpa_trend_display: string;
      cpm_trend_display: string;
      ctr_trend_display: string;
      days_analyzed: number;
      avg_cpa: number;
      avg_cpm: number;
      avg_ctr: number;
      recommendation: string;
    }[] = [];

    for (const [adId, data] of adDataMap.entries()) {
      // Skip ads with too few data points
      if (data.dates.length < 3) continue;

      // Calculate percentage change trends (comparing first half to second half of period)
      const cpaTrend = calculatePercentageChange(data.cpas);
      const cpmTrend = calculatePercentageChange(data.cpms);
      const ctrTrend = calculatePercentageChange(data.ctrs);

      // Calculate fatigue score based on percentage changes
      // Rising CPA/CPM = bad (positive % change)
      // Falling CTR = bad (negative % change)
      let fatigueScore = 50; // Start at neutral

      // CPA trend contributes 50% to fatigue score
      if (cpaTrend !== null) {
        // +100% CPA increase = +25 points, -100% = -25 points
        fatigueScore += Math.min(25, Math.max(-25, cpaTrend * 0.25));
      }

      // CPM trend contributes 30% to fatigue score
      if (cpmTrend !== null) {
        // +100% CPM increase = +15 points
        fatigueScore += Math.min(15, Math.max(-15, cpmTrend * 0.15));
      }

      // CTR trend contributes 20% to fatigue score (negative CTR change is bad)
      if (ctrTrend !== null) {
        // -100% CTR decrease = +10 points (bad), +100% = -10 points (good)
        fatigueScore += Math.min(10, Math.max(-10, -ctrTrend * 0.10));
      }

      // Clamp to 0-100 scale
      const normalizedScore = Math.max(0, Math.min(100, fatigueScore));

      // Calculate averages
      const avgCpa = data.cpas.reduce((a, b) => a + b, 0) / data.cpas.length;
      const avgCpm = data.cpms.reduce((a, b) => a + b, 0) / data.cpms.length;
      const avgCtr = data.ctrs.reduce((a, b) => a + b, 0) / data.ctrs.length;

      // Generate recommendation
      let recommendation = "";
      if (normalizedScore >= 70) {
        recommendation = "High fatigue detected. Consider pausing or refreshing creative.";
      } else if (normalizedScore >= 50) {
        recommendation = "Moderate fatigue. Monitor closely and prepare new creatives.";
      } else if (normalizedScore >= 30) {
        recommendation = "Low fatigue. Ad performing steadily.";
      } else {
        recommendation = "Healthy performance. Continue running.";
      }

      fatigueResults.push({
        ad_id: adId,
        fatigue_score: Math.round(normalizedScore * 10) / 10,
        cpa_trend: cpaTrend !== null ? Math.round(cpaTrend * 10) / 10 : null,
        cpm_trend: cpmTrend !== null ? Math.round(cpmTrend * 10) / 10 : null,
        ctr_trend: ctrTrend !== null ? Math.round(ctrTrend * 10) / 10 : null,
        cpa_trend_display: formatPercentageChange(cpaTrend),
        cpm_trend_display: formatPercentageChange(cpmTrend),
        ctr_trend_display: formatPercentageChange(ctrTrend),
        days_analyzed: data.dates.length,
        avg_cpa: Math.round(avgCpa * 100) / 100,
        avg_cpm: Math.round(avgCpm * 100) / 100,
        avg_ctr: Math.round(avgCtr * 100) / 100,
        recommendation,
      });
    }

    // Upsert results to ad_fatigue_scores table
    for (const result of fatigueResults) {
      const { error: upsertError } = await supabase
        .from("ad_fatigue_scores")
        .upsert({
          ad_id: result.ad_id,
          fatigue_score: result.fatigue_score,
          cpa_trend: result.cpa_trend ?? 0, // Store 0 for null (DB may not accept null)
          cpm_trend: result.cpm_trend ?? 0,
          ctr_trend: result.ctr_trend ?? 0,
          cpa_trend_display: result.cpa_trend_display,
          cpm_trend_display: result.cpm_trend_display,
          ctr_trend_display: result.ctr_trend_display,
          days_analyzed: result.days_analyzed,
          avg_cpa: result.avg_cpa,
          avg_cpm: result.avg_cpm,
          avg_ctr: result.avg_ctr,
          recommendation: result.recommendation,
          calculated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "ad_id",
        });

      if (upsertError) {
        console.error(`Failed to upsert fatigue score for ${result.ad_id}:`, upsertError.message);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        analyzed: fatigueResults.length,
        results: fatigueResults.sort((a, b) => b.fatigue_score - a.fatigue_score),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Fatigue monitor error:", errorMessage);

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
