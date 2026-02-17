// @deno-types="https://deno.land/x/deno@v1.37.0/cli/dts/lib.deno.d.ts"
// supabase/functions/sync-facebook-ads/index.ts
// Syncs daily ad performance data from Facebook Ads API with advanced metrics

// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

declare const Deno: any;

const FACEBOOK_API_VERSION = "v19.0";
const FACEBOOK_GRAPH_URL = `https://graph.facebook.com/${FACEBOOK_API_VERSION}`;

// Facebook API action stats structure
interface ActionStat {
  action_type: string;
  value: string;
}

// Facebook API video action stats structure
interface VideoActionStat {
  action_type: string;
  value: string;
}

interface FacebookAdInsight {
  ad_id: string;
  ad_name: string;
  campaign_id: string;
  campaign_name: string;
  adset_id: string;
  adset_name: string;
  spend: string;
  impressions: string;
  clicks: string;
  reach: string;
  frequency: string;
  cpm: string;
  cpc: string;
  ctr: string;
  cpp: string;
  date_start: string;
  date_stop: string;
  // Outbound clicks
  outbound_clicks?: ActionStat[];
  outbound_clicks_ctr?: ActionStat[];
  cost_per_outbound_click?: ActionStat[];
  // Video metrics
  video_play_actions?: VideoActionStat[];
  video_thruplay_watched_actions?: VideoActionStat[];
  video_p25_watched_actions?: VideoActionStat[];
  video_p50_watched_actions?: VideoActionStat[];
  video_p75_watched_actions?: VideoActionStat[];
  video_p95_watched_actions?: VideoActionStat[];
  video_p100_watched_actions?: VideoActionStat[];
  video_avg_time_watched_actions?: VideoActionStat[];
  // Conversions
  actions?: ActionStat[];
}

interface FacebookApiResponse {
  data: FacebookAdInsight[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
  error?: {
    message: string;
    type: string;
    code: number;
  };
}

interface AdRecord {
  ad_id: string;
  ad_name: string;
  campaign_id: string;
  campaign_name: string;
  adset_id: string;
  adset_name: string;
  date: string;
  // Core metrics
  spend: number;
  impressions: number;
  clicks: number;
  reach: number;
  frequency: number;
  // Cost metrics
  cpm: number;
  cpc: number;
  ctr: number;
  cpp: number;
  // Outbound metrics
  outbound_clicks: number;
  outbound_ctr: number;
  cost_per_outbound_click: number;
  // Video metrics
  video_plays: number;
  video_thru_plays: number;
  video_p25_watched: number;
  video_p50_watched: number;
  video_p75_watched: number;
  video_p95_watched: number;
  video_p100_watched: number;
  video_avg_watch_time: number;
  // Calculated rates
  hook_rate: number;
  hold_rate: number;
  // Conversions
  leads: number;
  purchases: number;
}

// Helper to extract value from action stats array
function getActionValue(actions: ActionStat[] | VideoActionStat[] | undefined, actionType: string): number {
  if (!actions || !Array.isArray(actions)) return 0;
  const action = actions.find((a) => a.action_type === actionType);
  return action ? parseFloat(action.value) || 0 : 0;
}

// Helper to extract outbound click value (action_type is "outbound_click")
function getOutboundClickValue(actions: ActionStat[] | undefined): number {
  if (!actions || !Array.isArray(actions)) return 0;
  const action = actions.find((a) => a.action_type === "outbound_click");
  return action ? parseFloat(action.value) || 0 : 0;
}

// Helper to extract video view value (action_type is "video_view")
function getVideoValue(actions: VideoActionStat[] | undefined): number {
  if (!actions || !Array.isArray(actions)) return 0;
  const action = actions.find((a) => a.action_type === "video_view");
  return action ? parseFloat(action.value) || 0 : 0;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // Declare these outside try block so they're accessible in catch
  let logId: number | null = null;
  let supabase: ReturnType<typeof createClient> | null = null;

  try {
    // Get environment variables
    const facebookAccessToken = Deno.env.get("FACEBOOK_ACCESS_TOKEN");
    const facebookAdAccountId = Deno.env.get("FACEBOOK_AD_ACCOUNT_ID");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!facebookAccessToken) {
      throw new Error("Missing FACEBOOK_ACCESS_TOKEN environment variable");
    }
    if (!facebookAdAccountId) {
      throw new Error("Missing FACEBOOK_AD_ACCOUNT_ID environment variable");
    }
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    // Parse request body for optional date range and log_id
    let startDate: string;
    let endDate: string;

    if (req.method === "POST") {
      try {
        const body = await req.json();
        startDate = body.start_date || getDefaultStartDate();
        endDate = body.end_date || getDefaultEndDate();
        logId = body.log_id ? parseInt(body.log_id) : null;
      } catch {
        startDate = getDefaultStartDate();
        endDate = getDefaultEndDate();
      }
    } else {
      // GET request - use URL params or defaults
      const url = new URL(req.url);
      startDate = url.searchParams.get("start_date") || getDefaultStartDate();
      endDate = url.searchParams.get("end_date") || getDefaultEndDate();
      const logIdParam = url.searchParams.get("log_id");
      logId = logIdParam ? parseInt(logIdParam) : null;
    }

    console.log(`Syncing Facebook ads from ${startDate} to ${endDate} (log_id: ${logId})`);

    // Initialize Supabase client with service role key for admin access
    supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch ad insights from Facebook
    const insights = await fetchAllAdInsights(
      facebookAdAccountId,
      facebookAccessToken,
      startDate,
      endDate
    );

    console.log(`Fetched ${insights.length} ad insights from Facebook`);

    if (insights.length === 0) {
      // Update sync log if log_id was provided
      if (logId) {
        const { error: logError } = await supabase
          .from("facebook_ads_sync_log")
          .update({
            status: "success",
            sync_completed_at: new Date().toISOString(),
            records_synced: 0,
          })
          .eq("id", logId);

        if (logError) {
          console.error("Failed to update sync log:", logError);
        } else {
          console.log(`Updated sync log ${logId} to completed (0 records)`);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "No ad data found for the specified date range",
          synced_count: 0,
          log_id: logId,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Transform and upsert ad records
    const adRecords: AdRecord[] = insights.map((insight) => {
      // Extract video metrics
      const videoPlays = getVideoValue(insight.video_play_actions);
      const videoThruPlays = getVideoValue(insight.video_thruplay_watched_actions);
      const videoP25 = getVideoValue(insight.video_p25_watched_actions);
      const videoP50 = getVideoValue(insight.video_p50_watched_actions);
      const videoP75 = getVideoValue(insight.video_p75_watched_actions);
      const videoP95 = getVideoValue(insight.video_p95_watched_actions);
      const videoP100 = getVideoValue(insight.video_p100_watched_actions);
      const videoAvgTime = getVideoValue(insight.video_avg_time_watched_actions);

      // Calculate hook rate and hold rate
      const hookRate = videoPlays > 0 ? (videoP25 / videoPlays) * 100 : 0;
      const holdRate = videoPlays > 0 ? (videoThruPlays / videoPlays) * 100 : 0;

      // Extract outbound click metrics
      const outboundClicks = getOutboundClickValue(insight.outbound_clicks);
      const outboundCtr = getOutboundClickValue(insight.outbound_clicks_ctr);
      const costPerOutboundClick = getOutboundClickValue(insight.cost_per_outbound_click);

      // Extract conversion metrics
      const leads = getActionValue(insight.actions, "lead");
      const purchases = getActionValue(insight.actions, "purchase") ||
                        getActionValue(insight.actions, "omni_purchase");

      return {
        ad_id: insight.ad_id,
        ad_name: insight.ad_name,
        campaign_id: insight.campaign_id,
        campaign_name: insight.campaign_name,
        adset_id: insight.adset_id || "",
        adset_name: insight.adset_name || "",
        date: insight.date_start,
        // Core metrics
        spend: parseFloat(insight.spend) || 0,
        impressions: parseInt(insight.impressions) || 0,
        clicks: parseInt(insight.clicks) || 0,
        reach: parseInt(insight.reach) || 0,
        frequency: parseFloat(insight.frequency) || 0,
        // Cost metrics
        cpm: parseFloat(insight.cpm) || 0,
        cpc: parseFloat(insight.cpc) || 0,
        ctr: parseFloat(insight.ctr) || 0,
        cpp: parseFloat(insight.cpp) || 0,
        // Outbound metrics
        outbound_clicks: outboundClicks,
        outbound_ctr: outboundCtr,
        cost_per_outbound_click: costPerOutboundClick,
        // Video metrics
        video_plays: videoPlays,
        video_thru_plays: videoThruPlays,
        video_p25_watched: videoP25,
        video_p50_watched: videoP50,
        video_p75_watched: videoP75,
        video_p95_watched: videoP95,
        video_p100_watched: videoP100,
        video_avg_watch_time: videoAvgTime,
        // Calculated rates
        hook_rate: hookRate,
        hold_rate: holdRate,
        // Conversions
        leads: leads,
        purchases: purchases,
      };
    });

    // Upsert records (update if exists based on ad_id + date, insert if not)
    const { data, error } = await supabase
      .from("ads")
      .upsert(adRecords, {
        onConflict: "ad_id,date",
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      console.error("Supabase upsert error:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log(`Successfully synced ${adRecords.length} ad records with advanced metrics`);

    // Update sync log if log_id was provided
    if (logId) {
      const { error: logError } = await supabase
        .from("facebook_ads_sync_log")
        .update({
          status: "success",
          sync_completed_at: new Date().toISOString(),
          records_synced: adRecords.length,
        })
        .eq("id", logId);

      if (logError) {
        console.error("Failed to update sync log:", logError);
        // Don't throw - the sync itself was successful
      } else {
        console.log(`Updated sync log ${logId} to completed (${adRecords.length} records)`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        synced_count: adRecords.length,
        date_range: { start: startDate, end: endDate },
        log_id: logId,
        metrics_synced: [
          "spend", "impressions", "clicks", "reach", "frequency",
          "cpm", "cpc", "ctr", "cpp",
          "outbound_clicks", "outbound_ctr", "cost_per_outbound_click",
          "video_plays", "video_thru_plays", "video_p25-p100",
          "hook_rate", "hold_rate", "leads", "purchases"
        ],
        sample: adRecords.slice(0, 2), // Return first 2 records as sample
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Sync error:", error);

    // Update sync log if log_id was provided and supabase is available
    if (logId && supabase) {
      try {
        await supabase
          .from("facebook_ads_sync_log")
          .update({
            status: "failed",
            sync_completed_at: new Date().toISOString(),
            error_message: error instanceof Error ? error.message : "Unknown error",
          })
          .eq("id", logId);

        console.log(`Updated sync log ${logId} to failed`);
      } catch (logError) {
        console.error("Failed to update sync log:", logError);
      }
    }

    return new Response(
      JSON.stringify({
        error: "Sync failed",
        details: error instanceof Error ? error.message : "Unknown error",
        log_id: logId,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});

// Fetch all ad insights with pagination
async function fetchAllAdInsights(
  adAccountId: string,
  accessToken: string,
  startDate: string,
  endDate: string
): Promise<FacebookAdInsight[]> {
  const allInsights: FacebookAdInsight[] = [];
  let nextUrl: string | null = buildInitialUrl(
    adAccountId,
    accessToken,
    startDate,
    endDate
  );

  while (nextUrl) {
    console.log(`Fetching from Facebook API...`);
    const response = await fetch(nextUrl);
    const data: FacebookApiResponse = await response.json();

    if (data.error) {
      console.error("Facebook API error:", data.error);
      throw new Error(`Facebook API error: ${data.error.message}`);
    }

    if (data.data && data.data.length > 0) {
      console.log(`Received ${data.data.length} records from this page`);
      allInsights.push(...data.data);
    }

    // Check for next page
    nextUrl = data.paging?.next || null;

    // Add small delay to avoid rate limiting
    if (nextUrl) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return allInsights;
}

// Build initial Facebook API URL with all advanced metrics fields
function buildInitialUrl(
  adAccountId: string,
  accessToken: string,
  startDate: string,
  endDate: string
): string {
  // Ensure ad account ID has the 'act_' prefix
  const accountId = adAccountId.startsWith("act_")
    ? adAccountId
    : `act_${adAccountId}`;

  const fields = [
    // Identity fields
    "ad_id",
    "ad_name",
    "campaign_id",
    "campaign_name",
    "adset_id",
    "adset_name",
    // Core metrics
    "spend",
    "impressions",
    "clicks",
    "reach",
    "frequency",
    // Cost metrics
    "cpm",
    "cpc",
    "ctr",
    "cpp",
    // Outbound click metrics
    "outbound_clicks",
    "outbound_clicks_ctr",
    "cost_per_outbound_click",
    // Video metrics
    "video_play_actions",
    "video_thruplay_watched_actions",
    "video_p25_watched_actions",
    "video_p50_watched_actions",
    "video_p75_watched_actions",
    "video_p95_watched_actions",
    "video_p100_watched_actions",
    "video_avg_time_watched_actions",
    // Conversion actions (includes leads, purchases, etc.)
    "actions",
  ].join(",");

  const params = new URLSearchParams({
    access_token: accessToken,
    fields: fields,
    level: "ad",
    time_range: JSON.stringify({ since: startDate, until: endDate }),
    time_increment: "1", // Daily breakdown
    limit: "500",
  });

  return `${FACEBOOK_GRAPH_URL}/${accountId}/insights?${params.toString()}`;
}

// Get default start date (7 days ago)
function getDefaultStartDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date.toISOString().split("T")[0];
}

// Get default end date (today)
function getDefaultEndDate(): string {
  return new Date().toISOString().split("T")[0];
}
