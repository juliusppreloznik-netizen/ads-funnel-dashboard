// Fatigue Monitor Edge Function
// Calculates ad fatigue scores using linear regression on CPA, CPM, CTR trends

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Linear regression to calculate trend slope
function linearRegression(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;

  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    const xDiff = i - xMean;
    const yDiff = values[i] - yMean;
    numerator += xDiff * yDiff;
    denominator += xDiff * xDiff;
  }

  return denominator === 0 ? 0 : numerator / denominator;
}

// Normalize trend to -1 to 1 range
function normalizeTrend(slope: number, values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 0;

  // Slope as percentage of mean, clamped to -1 to 1
  const normalized = slope / mean;
  return Math.max(-1, Math.min(1, normalized * 10));
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
      cpa_trend: number;
      cpm_trend: number;
      ctr_trend: number;
      days_analyzed: number;
      avg_cpa: number;
      avg_cpm: number;
      avg_ctr: number;
      recommendation: string;
    }[] = [];

    for (const [adId, data] of adDataMap.entries()) {
      // Skip ads with too few data points
      if (data.dates.length < 3) continue;

      // Calculate trends using linear regression
      const cpaSlope = linearRegression(data.cpas);
      const cpmSlope = linearRegression(data.cpms);
      const ctrSlope = linearRegression(data.ctrs);

      // Normalize trends
      const cpaTrend = normalizeTrend(cpaSlope, data.cpas);
      const cpmTrend = normalizeTrend(cpmSlope, data.cpms);
      const ctrTrend = normalizeTrend(ctrSlope, data.ctrs);

      // Calculate fatigue score (weighted average)
      // Rising CPA/CPM = bad (positive trend)
      // Falling CTR = bad (negative trend)
      const fatigueScore = (
        (cpaTrend * 0.5) +      // CPA increasing is bad (50% weight)
        (cpmTrend * 0.3) +      // CPM increasing is bad (30% weight)
        (-ctrTrend * 0.2)       // CTR decreasing is bad (20% weight, negated)
      );

      // Clamp to 0-100 scale
      const normalizedScore = Math.max(0, Math.min(100, (fatigueScore + 1) * 50));

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
        cpa_trend: Math.round(cpaTrend * 100) / 100,
        cpm_trend: Math.round(cpmTrend * 100) / 100,
        ctr_trend: Math.round(ctrTrend * 100) / 100,
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
          cpa_trend: result.cpa_trend,
          cpm_trend: result.cpm_trend,
          ctr_trend: result.ctr_trend,
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
