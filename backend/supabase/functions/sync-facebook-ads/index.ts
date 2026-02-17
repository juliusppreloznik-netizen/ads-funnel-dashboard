// @deno-types="https://deno.land/x/deno@v1.37.0/cli/dts/lib.deno.d.ts"
// supabase/functions/sync-facebook-ads/index.ts
// Syncs daily ad performance data from Facebook Ads API

// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

declare const Deno: any;

const FACEBOOK_API_VERSION = "v19.0";
const FACEBOOK_GRAPH_URL = `https://graph.facebook.com/${FACEBOOK_API_VERSION}`;

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
  date_start: string;
  date_stop: string;
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
  spend: number;
  impressions: number;
  clicks: number;
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
    const adRecords: AdRecord[] = insights.map((insight) => ({
      ad_id: insight.ad_id,
      ad_name: insight.ad_name,
      campaign_id: insight.campaign_id,
      campaign_name: insight.campaign_name,
      adset_id: insight.adset_id || "",
      adset_name: insight.adset_name || "",
      date: insight.date_start,
      spend: parseFloat(insight.spend) || 0,
      impressions: parseInt(insight.impressions) || 0,
      clicks: parseInt(insight.clicks) || 0,
    }));

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

    console.log(`Successfully synced ${adRecords.length} ad records`);

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
        data: data,
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
    const response = await fetch(nextUrl);
    const data: FacebookApiResponse = await response.json();

    if (data.error) {
      throw new Error(`Facebook API error: ${data.error.message}`);
    }

    if (data.data && data.data.length > 0) {
      allInsights.push(...data.data);
    }

    // Check for next page
    nextUrl = data.paging?.next || null;
  }

  return allInsights;
}

// Build initial Facebook API URL
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
    "ad_id",
    "ad_name",
    "campaign_id",
    "campaign_name",
    "adset_id",
    "adset_name",
    "spend",
    "impressions",
    "clicks",
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
