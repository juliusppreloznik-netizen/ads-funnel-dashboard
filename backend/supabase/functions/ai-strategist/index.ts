// AI Strategist Edge Function
// Analyzes sales call transcripts and ad performance to generate creative briefs

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import Anthropic from "npm:@anthropic-ai/sdk@0.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an expert creative strategist for direct-response advertising. Your job is to analyze sales call transcripts, ad performance data, and existing ad transcripts to generate actionable creative briefs for new ad concepts.

Focus on:
1. Pain points and objections mentioned in sales calls
2. Language and phrases that resonate with prospects
3. Successful hooks and angles from top-performing ads
4. Patterns in what converts vs what doesn't

For each brief, provide:
- Title: A catchy name for the concept
- Hook Type: (Question, Statement, Story, Statistic, Shock, Testimonial)
- Target Audience: Who this ad speaks to
- Key Message: The main value proposition
- Pain Point: The problem being addressed
- Proof Element: Social proof, results, or credibility
- Call to Action: What viewers should do
- Visual Direction: Suggested visuals or style
- Reference Ads: Which existing ads inspired this (if any)

Generate 3-5 briefs per analysis, prioritizing novel angles not currently being used.`;

const WINNING_HOOKS_PROMPT = `Analyze the following ad transcripts and performance data to identify the top performing hooks.

For each hook, extract:
- hook_text: The exact opening hook/first few sentences (verbatim from transcript)
- hook_type: Question, Statement, Story, Statistic, Pattern Interrupt, Testimonial, or Pain Point
- why_it_works: Brief explanation of why this hook is effective
- performance_score: 1-100 score based on the ad's metrics (hook_rate, CTR, leads)

Return ONLY a JSON array of hooks, sorted by performance_score descending. Include 5-10 hooks.`;

const CROSS_POLLINATION_PROMPT = `You are an expert creative strategist analyzing ad performance data and sales call transcripts to generate cross-pollination recommendations.

Your task is to create strategic recommendations for combining successful elements from different ads, informed by real customer insights from sales calls.

For each recommendation, you MUST return a JSON object with this EXACT structure:

{
  "title": "string — a compelling headline for the recommendation",
  "ad_ids": ["array of ad IDs being referenced"],
  "creative_justification": {
    "ads_referenced": [
      {
        "ad_name": "string — the ad name",
        "key_metrics": "string — specific metrics e.g. '15.82% hook rate, 28 leads, $16 CPA'",
        "what_worked": "string — the specific element being borrowed from this ad"
      }
    ],
    "transcript_reference": "string — the specific hook or line from the ad transcript being referenced, or null if not applicable"
  },
  "sales_call_insights": {
    "transcripts_referenced": ["array of call identifiers used, e.g. 'Call 1 - won', 'Call 3 - lost'"],
    "pain_points": ["array of specific frustrations prospects expressed verbatim or paraphrased"],
    "buying_signals": ["array of moments where interest or intent was expressed"],
    "business_objectives": ["array of what prospects said they're trying to achieve"],
    "perceived_obstacles": ["array of what prospects said was stopping them"],
    "past_failed_attempts": ["array of what prospects said they already tried that didn't work"]
  },
  "concept_architecture": {
    "awareness_level": "string — one of: Unaware / Problem Aware / Solution Aware / Product Aware / Most Aware. Include explanation.",
    "persona": "string — highly specific description: demographics, psychographics, exact situation, spoken desires, unspoken desires, perceived roadblocks, and pain points",
    "angle": "string — format: 'Problem: [specific problem] → Utility: [how the product/service solves it]'"
  },
  "expected_impact": "string — projected outcome with specific metrics where possible"
}

IMPORTANT:
- Extract REAL quotes and insights from the sales call transcripts provided
- Reference ACTUAL metrics from the ad performance data
- Be specific, not generic — use real data from the inputs
- Generate 5-7 recommendations, prioritized by expected impact

Return ONLY a JSON array of recommendation objects.`;

interface Brief {
  title: string;
  hook_type: string;
  target_audience: string;
  key_message: string;
  pain_point: string;
  proof_element: string;
  call_to_action: string;
  visual_direction: string;
  reference_ads: string[];
}

interface WinningHook {
  hook_text: string;
  hook_type: string;
  ad_id: string;
  ad_name: string;
  why_it_works: string;
  performance_score: number;
  hook_rate?: number;
  ctr?: number;
}

interface CrossPollinationRecommendation {
  title: string;
  ad_ids: string[];
  creative_justification: {
    ads_referenced: {
      ad_name: string;
      key_metrics: string;
      what_worked: string;
    }[];
    transcript_reference: string | null;
  };
  sales_call_insights: {
    transcripts_referenced: string[];
    pain_points: string[];
    buying_signals: string[];
    business_objectives: string[];
    perceived_obstacles: string[];
    past_failed_attempts: string[];
  };
  concept_architecture: {
    awareness_level: string;
    persona: string;
    angle: string;
  };
  expected_impact: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize clients
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const anthropic = new Anthropic({ apiKey: anthropicKey });

    // Fetch sales call transcripts (last 30 days) with full data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: transcripts, error: transcriptsError } = await supabase
      .from("zoom_transcripts")
      .select("id, meeting_id, topic, contact_name, transcript_text, call_outcome, cash_collected, deal_value, start_time")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .not("transcript_text", "is", null)
      .order("start_time", { ascending: false })
      .limit(20);

    if (transcriptsError) {
      throw new Error(`Failed to fetch transcripts: ${transcriptsError.message}`);
    }

    // Fetch ad transcripts
    const { data: adTranscripts, error: adTranscriptsError } = await supabase
      .from("ad_transcripts")
      .select("ad_id, transcript, ad_copy, media_type")
      .not("transcript", "is", null)
      .limit(30);

    if (adTranscriptsError) {
      throw new Error(`Failed to fetch ad transcripts: ${adTranscriptsError.message}`);
    }

    // Fetch top performing ads (by leads and spend) with hook/hold rates
    const { data: topAds, error: topAdsError } = await supabase
      .from("ads")
      .select("ad_id, ad_name, spend, leads, impressions, clicks, ctr, hook_rate, hold_rate")
      .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
      .gt("spend", 0);

    if (topAdsError) {
      throw new Error(`Failed to fetch top ads: ${topAdsError.message}`);
    }

    // Aggregate ad performance
    const adPerformance = new Map<string, {
      ad_name: string;
      total_spend: number;
      total_leads: number;
      total_impressions: number;
      total_clicks: number;
      avg_ctr: number;
      cpa: number;
      avg_hook_rate: number;
      avg_hold_rate: number;
      hook_rate_count: number;
    }>();

    for (const ad of topAds || []) {
      if (!adPerformance.has(ad.ad_id)) {
        adPerformance.set(ad.ad_id, {
          ad_name: ad.ad_name || "Unknown",
          total_spend: 0,
          total_leads: 0,
          total_impressions: 0,
          total_clicks: 0,
          avg_ctr: 0,
          cpa: 0,
          avg_hook_rate: 0,
          avg_hold_rate: 0,
          hook_rate_count: 0,
        });
      }

      const perf = adPerformance.get(ad.ad_id)!;
      perf.total_spend += ad.spend || 0;
      perf.total_leads += ad.leads || 0;
      perf.total_impressions += ad.impressions || 0;
      perf.total_clicks += ad.clicks || 0;
      if (ad.hook_rate && ad.hook_rate > 0) {
        perf.avg_hook_rate += ad.hook_rate;
        perf.avg_hold_rate += ad.hold_rate || 0;
        perf.hook_rate_count++;
      }
    }

    // Calculate averages for hook/hold rates and CTR
    for (const perf of adPerformance.values()) {
      if (perf.hook_rate_count > 0) {
        perf.avg_hook_rate = perf.avg_hook_rate / perf.hook_rate_count;
        perf.avg_hold_rate = perf.avg_hold_rate / perf.hook_rate_count;
      }
      if (perf.total_impressions > 0) {
        perf.avg_ctr = (perf.total_clicks / perf.total_impressions) * 100;
      }
    }

    // Calculate CPA and identify top performers
    const topPerformers = Array.from(adPerformance.entries())
      .map(([adId, perf]) => ({
        ad_id: adId,
        ...perf,
        cpa: perf.total_leads > 0 ? perf.total_spend / perf.total_leads : 999999,
      }))
      .filter(ad => ad.total_leads > 0)
      .sort((a, b) => a.cpa - b.cpa)
      .slice(0, 10);

    // Prepare context for Claude - Sales Calls with full transcripts
    const salesCallContext = (transcripts || []).map((t, i) => ({
      call_id: `Call ${i + 1}`,
      contact: t.contact_name || t.topic || "Unknown",
      outcome: t.call_outcome,
      value: t.cash_collected || t.deal_value || 0,
      date: t.start_time ? new Date(t.start_time).toLocaleDateString() : "Unknown",
      transcript: t.transcript_text?.slice(0, 3000) || "",
    }));

    const adContext = (adTranscripts || []).map(t => ({
      ad_id: t.ad_id,
      transcript: t.transcript?.slice(0, 500) || "",
      copy: t.ad_copy ? JSON.stringify(t.ad_copy).slice(0, 300) : "",
    }));

    const performanceContext = topPerformers.map(p => ({
      ad_id: p.ad_id,
      ad_name: p.ad_name,
      leads: p.total_leads,
      spend: Math.round(p.total_spend),
      cpa: Math.round(p.cpa),
      hook_rate: Math.round(p.avg_hook_rate * 100) / 100,
      hold_rate: Math.round(p.avg_hold_rate * 100) / 100,
      ctr: Math.round(p.avg_ctr * 100) / 100,
    }));

    // Build the analysis prompt for creative briefs
    const analysisPrompt = `Analyze the following data and generate creative briefs for new ad concepts:

## Sales Call Transcripts (${salesCallContext.length} calls)
${salesCallContext.map(s => `
### ${s.call_id} - ${s.contact} - Outcome: ${s.outcome}, Value: $${s.value}
${s.transcript}
`).join("\n")}

## Current Ad Transcripts (${adContext.length} ads)
${adContext.map((a, i) => `
### Ad ${i + 1}: ${a.ad_id}
Transcript: ${a.transcript}
Copy: ${a.copy}
`).join("\n")}

## Top Performing Ads by CPA
${performanceContext.map(p => `- ${p.ad_name}: ${p.leads} leads, $${p.spend} spend, $${p.cpa} CPA`).join("\n")}

Based on this analysis, generate 3-5 creative briefs in JSON format. Return ONLY a JSON array of briefs.`;

    // Call Claude API for briefs
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: analysisPrompt }],
    });

    // Parse briefs from response
    let briefs: Brief[] = [];
    const textContent = response.content.find(c => c.type === "text");
    if (textContent && textContent.type === "text") {
      try {
        let jsonStr = textContent.text;
        const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          jsonStr = jsonMatch[0];
        }
        briefs = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error("Failed to parse briefs JSON:", parseError);
        briefs = [{
          title: "AI Analysis Complete",
          hook_type: "Statement",
          target_audience: "Business owners",
          key_message: textContent.text.slice(0, 200),
          pain_point: "See full analysis",
          proof_element: "Based on real data",
          call_to_action: "Review and refine",
          visual_direction: "Professional style",
          reference_ads: [],
        }];
      }
    }

    // Generate Winning Hooks analysis
    let winningHooks: WinningHook[] = [];
    const adsWithTranscripts = (adTranscripts || [])
      .filter(t => t.transcript && t.transcript.length > 50)
      .map(t => {
        const perf = adPerformance.get(t.ad_id);
        return {
          ad_id: t.ad_id,
          transcript: t.transcript?.slice(0, 800) || "",
          ad_name: perf?.ad_name || "Unknown",
          hook_rate: perf?.avg_hook_rate || 0,
          ctr: perf?.avg_ctr || 0,
          leads: perf?.total_leads || 0,
          cpa: perf?.cpa || 0,
        };
      })
      .filter(a => a.hook_rate > 0 || a.leads > 0)
      .sort((a, b) => (b.hook_rate + b.leads * 0.5) - (a.hook_rate + a.leads * 0.5))
      .slice(0, 10);

    if (adsWithTranscripts.length > 0) {
      const hooksPrompt = `${WINNING_HOOKS_PROMPT}

## Ad Transcripts with Performance Data
${adsWithTranscripts.map(a => `
### Ad: ${a.ad_name} (${a.ad_id})
Hook Rate: ${a.hook_rate.toFixed(2)}%
CTR: ${a.ctr?.toFixed(2) || 0}%
Leads: ${a.leads}
CPA: $${a.cpa.toFixed(0)}
Transcript (first 800 chars):
${a.transcript}
`).join("\n")}

Return ONLY a JSON array of hooks.`;

      try {
        const hooksResponse = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2048,
          messages: [{ role: "user", content: hooksPrompt }],
        });

        const hooksText = hooksResponse.content.find(c => c.type === "text");
        if (hooksText && hooksText.type === "text") {
          let hooksJson = hooksText.text;
          const hooksMatch = hooksJson.match(/\[[\s\S]*\]/);
          if (hooksMatch) {
            hooksJson = hooksMatch[0];
          }
          const parsedHooks = JSON.parse(hooksJson);
          winningHooks = parsedHooks.map((h: WinningHook) => {
            const adData = adsWithTranscripts.find(a =>
              h.ad_id === a.ad_id || h.hook_text?.includes(a.transcript.slice(0, 50))
            );
            return {
              ...h,
              ad_id: h.ad_id || adData?.ad_id || "unknown",
              ad_name: h.ad_name || adData?.ad_name || "Unknown",
              hook_rate: adData?.hook_rate || 0,
              ctr: adData?.ctr || 0,
            };
          });
        }
      } catch (hooksError) {
        console.error("Failed to generate winning hooks:", hooksError);
      }
    }

    // Generate Cross-Pollination recommendations with FULL sales call insights
    let crossPollination: CrossPollinationRecommendation[] = [];
    if (topPerformers.length >= 2) {
      const crossPrompt = `${CROSS_POLLINATION_PROMPT}

## TOP PERFORMING ADS WITH METRICS
${topPerformers.slice(0, 8).map(p => `
### ${p.ad_name} (${p.ad_id})
- Leads: ${p.total_leads}
- Spend: $${p.total_spend.toFixed(0)}
- CPA: $${p.cpa.toFixed(0)}
- Hook Rate: ${p.avg_hook_rate.toFixed(2)}%
- Hold Rate: ${p.avg_hold_rate.toFixed(2)}%
- CTR: ${p.avg_ctr.toFixed(2)}%
`).join("\n")}

## AD TRANSCRIPT EXCERPTS (for reference)
${adsWithTranscripts.slice(0, 6).map(a => `
### ${a.ad_name} (${a.ad_id})
Hook Rate: ${a.hook_rate.toFixed(2)}% | Leads: ${a.leads} | CPA: $${a.cpa.toFixed(0)}
Transcript:
"${a.transcript.slice(0, 600)}"
`).join("\n")}

## SALES CALL TRANSCRIPTS (extract insights from these)
${salesCallContext.slice(0, 8).map(s => `
### ${s.call_id} - ${s.contact} | Outcome: ${s.outcome} | Value: $${s.value} | Date: ${s.date}
---
${s.transcript}
---
`).join("\n\n")}

Based on the ad performance data and the REAL customer conversations in the sales calls above, generate 5-7 cross-pollination recommendations.

CRITICAL: Extract ACTUAL quotes and insights from the sales call transcripts. Do not make up generic pain points — use the real words and situations from the calls.

Return ONLY a JSON array of recommendation objects following the exact schema provided.`;

      try {
        const crossResponse = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 8192,
          messages: [{ role: "user", content: crossPrompt }],
        });

        const crossText = crossResponse.content.find(c => c.type === "text");
        if (crossText && crossText.type === "text") {
          let crossJson = crossText.text;
          const crossMatch = crossJson.match(/\[[\s\S]*\]/);
          if (crossMatch) {
            crossJson = crossMatch[0];
          }
          crossPollination = JSON.parse(crossJson);
        }
      } catch (crossError) {
        console.error("Failed to generate cross-pollination:", crossError);
      }
    }

    // Store results in database
    const { data: briefBatch, error: insertError } = await supabase
      .from("ai_creative_briefs")
      .insert({
        briefs: briefs,
        winning_hooks: winningHooks,
        cross_pollination: crossPollination,
        source_data: {
          transcripts_analyzed: salesCallContext.length,
          ads_analyzed: adContext.length,
          top_performers: performanceContext,
          sales_calls_analyzed: salesCallContext.map(s => ({
            call_id: s.call_id,
            contact: s.contact,
            outcome: s.outcome,
            value: s.value,
          })),
        },
        model_used: "claude-sonnet-4-20250514",
        tokens_used: response.usage?.input_tokens + response.usage?.output_tokens,
        analysis_type: "full",
        status: "completed",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to store briefs:", insertError.message);
    }

    // Also insert individual brief items
    if (briefBatch) {
      for (let i = 0; i < briefs.length; i++) {
        const brief = briefs[i];
        await supabase.from("creative_brief_items").insert({
          brief_batch_id: briefBatch.id,
          title: brief.title,
          hook_type: brief.hook_type,
          target_audience: brief.target_audience,
          key_message: brief.key_message,
          pain_point: brief.pain_point,
          proof_element: brief.proof_element,
          call_to_action: brief.call_to_action,
          visual_direction: brief.visual_direction,
          reference_ads: brief.reference_ads,
          priority: i + 1,
          is_completed: false,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        batch_id: briefBatch?.id,
        briefs_generated: briefs.length,
        briefs: briefs,
        winning_hooks: winningHooks,
        winning_hooks_count: winningHooks.length,
        cross_pollination: crossPollination,
        cross_pollination_count: crossPollination.length,
        source_summary: {
          transcripts_analyzed: salesCallContext.length,
          ads_analyzed: adContext.length,
          top_performers_count: performanceContext.length,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("AI Strategist error:", errorMessage);

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
