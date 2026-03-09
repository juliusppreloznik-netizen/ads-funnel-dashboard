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

    // Fetch sales call transcripts (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: transcripts, error: transcriptsError } = await supabase
      .from("zoom_transcripts")
      .select("transcript_text, call_outcome, contact_name, cash_collected, deal_value")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .not("transcript_text", "is", null)
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

    // Fetch top performing ads (by leads and spend)
    const { data: topAds, error: topAdsError } = await supabase
      .from("ads")
      .select("ad_id, ad_name, spend, leads, impressions, clicks, ctr")
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
      avg_ctr: number;
      cpa: number;
    }>();

    for (const ad of topAds || []) {
      if (!adPerformance.has(ad.ad_id)) {
        adPerformance.set(ad.ad_id, {
          ad_name: ad.ad_name || "Unknown",
          total_spend: 0,
          total_leads: 0,
          total_impressions: 0,
          avg_ctr: 0,
          cpa: 0,
        });
      }

      const perf = adPerformance.get(ad.ad_id)!;
      perf.total_spend += ad.spend || 0;
      perf.total_leads += ad.leads || 0;
      perf.total_impressions += ad.impressions || 0;
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

    // Prepare context for Claude
    const salesContext = (transcripts || []).map(t => ({
      outcome: t.call_outcome,
      value: t.cash_collected || t.deal_value || 0,
      excerpt: t.transcript_text?.slice(0, 1500) || "",
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
    }));

    // Build the analysis prompt
    const analysisPrompt = `Analyze the following data and generate creative briefs for new ad concepts:

## Sales Call Transcripts (${salesContext.length} calls)
${salesContext.map((s, i) => `
### Call ${i + 1} - Outcome: ${s.outcome}, Value: $${s.value}
${s.excerpt}
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

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: analysisPrompt }],
    });

    // Parse briefs from response
    let briefs: Brief[] = [];
    const textContent = response.content.find(c => c.type === "text");
    if (textContent && textContent.type === "text") {
      try {
        // Extract JSON from response (may be wrapped in markdown code block)
        let jsonStr = textContent.text;
        const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          jsonStr = jsonMatch[0];
        }
        briefs = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error("Failed to parse briefs JSON:", parseError);
        // Try to extract structured data manually
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

    // Store results in database
    const { data: briefBatch, error: insertError } = await supabase
      .from("ai_creative_briefs")
      .insert({
        briefs: briefs,
        source_data: {
          transcripts_analyzed: salesContext.length,
          ads_analyzed: adContext.length,
          top_performers: performanceContext,
        },
        model_used: "claude-opus-4-6",
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
        source_summary: {
          transcripts_analyzed: salesContext.length,
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
