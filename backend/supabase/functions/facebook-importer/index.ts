// @deno-types="https://deno.land/x/deno@v1.37.0/cli/dts/lib.deno.d.ts"
// supabase/functions/facebook-importer/index.ts
// Imports historical ad data from Facebook Ads API with extended metrics

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
  reach?: string;
  cpm?: string;
  cpc?: string;
  ctr?: string;
  actions?: Array<{ action_type: string; value: string }>;
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
    error_subcode?: number;
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
  reach?: number;
  cpm?: number;
  cpc?: number;
  ctr?: number;
  leads?: number;
  purchases?: number;
}

interface ImportRequest {
  start_date: string;
  end_date: string;
  campaign_ids?: string[];
  include_inactive?: boolean;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // Only allow POST requests for import
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST for imports." }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

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

    // Parse request body
    const body: ImportRequest = await req.json();

    if (!body.start_date || !body.end_date) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: start_date and end_date",
          example: {
            start_date: "2024-01-01",
            end_date: "2024-01-31",
            campaign_ids: ["optional_campaign_id"],
            include_inactive: false,
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate date format
    if (!isValidDate(body.start_date) || !isValidDate(body.end_date)) {
      return new Response(
        JSON.stringify({ error: "Invalid date format. Use YYYY-MM-DD." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check date range isn't too large (Facebook API limit ~37 months)
    const startDate = new Date(body.start_date);
    const endDate = new Date(body.end_date);
    const daysDiff = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff > 365) {
      return new Response(
        JSON.stringify({
          error: "Date range too large. Maximum 365 days per import.",
          suggestion: "Split your import into smaller date ranges.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log(
      `Starting Facebook ads import from ${body.start_date} to ${body.end_date}`
    );

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch ad insights from Facebook with extended metrics
    const insights = await fetchAdInsightsWithRetry(
      facebookAdAccountId,
      facebookAccessToken,
      body.start_date,
      body.end_date,
      body.campaign_ids,
      body.include_inactive
    );

    console.log(`Fetched ${insights.length} ad insights from Facebook`);

    if (insights.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No ad data found for the specified date range and filters",
          imported_count: 0,
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

    // Transform insights to ad records
    const adRecords: AdRecord[] = insights.map((insight) =>
      transformInsightToRecord(insight)
    );

    // Batch upsert in chunks to avoid timeout
    const BATCH_SIZE = 100;
    let totalUpserted = 0;
    const errors: string[] = [];

    for (let i = 0; i < adRecords.length; i += BATCH_SIZE) {
      const batch = adRecords.slice(i, i + BATCH_SIZE);

      const { error } = await supabase
        .from("ads")
        .upsert(batch, {
          onConflict: "ad_id,date",
          ignoreDuplicates: false,
        });

      if (error) {
        console.error(`Batch ${i / BATCH_SIZE + 1} error:`, error);
        errors.push(`Batch ${i / BATCH_SIZE + 1}: ${error.message}`);
      } else {
        totalUpserted += batch.length;
      }
    }

    console.log(`Successfully imported ${totalUpserted} ad records`);

    return new Response(
      JSON.stringify({
        success: errors.length === 0,
        imported_count: totalUpserted,
        total_fetched: insights.length,
        date_range: { start: body.start_date, end: body.end_date },
        errors: errors.length > 0 ? errors : undefined,
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
    console.error("Import error:", error);

    return new Response(
      JSON.stringify({
        error: "Import failed",
        details: error instanceof Error ? error.message : "Unknown error",
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

// Fetch ad insights with retry logic for rate limits
async function fetchAdInsightsWithRetry(
  adAccountId: string,
  accessToken: string,
  startDate: string,
  endDate: string,
  campaignIds?: string[],
  includeInactive?: boolean,
  maxRetries = 3
): Promise<FacebookAdInsight[]> {
  const allInsights: FacebookAdInsight[] = [];
  let nextUrl: string | null = buildImportUrl(
    adAccountId,
    accessToken,
    startDate,
    endDate,
    campaignIds,
    includeInactive
  );

  while (nextUrl) {
    const currentUrl = nextUrl;
    let retries = 0;
    let success = false;

    while (!success && retries < maxRetries) {
      try {
        const response = await fetch(currentUrl);
        const data: FacebookApiResponse = await response.json();

        if (data.error) {
          // Handle rate limiting
          if (data.error.code === 17 || data.error.code === 4) {
            retries++;
            console.log(
              `Rate limited, waiting ${retries * 30} seconds before retry...`
            );
            await sleep(retries * 30000);
            continue;
          }
          throw new Error(`Facebook API error: ${data.error.message}`);
        }

        if (data.data && data.data.length > 0) {
          allInsights.push(...data.data);
        }

        nextUrl = data.paging?.next || null;
        success = true;
      } catch (error) {
        retries++;
        if (retries >= maxRetries) {
          throw error;
        }
        console.log(`Request failed, retry ${retries}/${maxRetries}...`);
        await sleep(5000);
      }
    }
  }

  return allInsights;
}

// Build Facebook API URL for import with extended fields
function buildImportUrl(
  adAccountId: string,
  accessToken: string,
  startDate: string,
  endDate: string,
  campaignIds?: string[],
  includeInactive?: boolean
): string {
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
    "reach",
    "cpm",
    "cpc",
    "ctr",
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

  // Filter by specific campaigns if provided
  if (campaignIds && campaignIds.length > 0) {
    params.append(
      "filtering",
      JSON.stringify([
        {
          field: "campaign.id",
          operator: "IN",
          value: campaignIds,
        },
      ])
    );
  }

  // Include inactive ads if requested
  if (includeInactive) {
    params.append("date_preset", "maximum");
  }

  return `${FACEBOOK_GRAPH_URL}/${accountId}/insights?${params.toString()}`;
}

// Transform Facebook insight to database record
function transformInsightToRecord(insight: FacebookAdInsight): AdRecord {
  const record: AdRecord = {
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
  };

  // Add optional metrics if available
  if (insight.reach) {
    record.reach = parseInt(insight.reach) || 0;
  }
  if (insight.cpm) {
    record.cpm = parseFloat(insight.cpm) || 0;
  }
  if (insight.cpc) {
    record.cpc = parseFloat(insight.cpc) || 0;
  }
  if (insight.ctr) {
    record.ctr = parseFloat(insight.ctr) || 0;
  }

  // Extract leads and purchases from actions array
  if (insight.actions) {
    const leadAction = insight.actions.find(
      (a) => a.action_type === "lead" || a.action_type === "onsite_conversion.lead_grouped"
    );
    if (leadAction) {
      record.leads = parseInt(leadAction.value) || 0;
    }

    const purchaseAction = insight.actions.find(
      (a) => a.action_type === "purchase" || a.action_type === "omni_purchase"
    );
    if (purchaseAction) {
      record.purchases = parseInt(purchaseAction.value) || 0;
    }
  }

  return record;
}

// Validate date format YYYY-MM-DD
function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

// Sleep utility for rate limiting
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
