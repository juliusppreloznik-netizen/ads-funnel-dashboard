// @deno-types="https://deno.land/x/deno@v1.37.0/cli/dts/lib.deno.d.ts"
// supabase/functions/generate-ad-transcript/index.ts
// Fetches ad creative from Facebook API and stores video URL for local transcription

// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

declare const Deno: any;

// Use v18.0 as specified
const FACEBOOK_API_VERSION = "v18.0";
const FACEBOOK_GRAPH_URL = `https://graph.facebook.com/${FACEBOOK_API_VERSION}`;

interface AdTranscriptRecord {
  ad_id: string;
  creative_id?: string;
  facebook_video_id?: string;
  video_url?: string;
  thumbnail_url?: string;
  image_url?: string;
  transcript?: string;
  transcript_json?: { start: string; end: string; text: string }[];
  ad_copy?: {
    headline?: string;
    body?: string;
    description?: string;
    cta?: string;
  };
  media_type: "video" | "image" | "carousel";
  duration_seconds?: number;
  status: "pending" | "processing" | "completed" | "failed";
  error_message?: string;
  generated_at?: string;
}

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Get environment variables
    const facebookAccessToken = Deno.env.get("FACEBOOK_ACCESS_TOKEN");
    const facebookPageAccessToken = Deno.env.get("FACEBOOK_PAGE_ACCESS_TOKEN");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!facebookAccessToken) {
      throw new Error("Missing FACEBOOK_ACCESS_TOKEN environment variable");
    }
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    // Parse request body
    let adId: string;
    let forceRegenerate = false;

    if (req.method === "POST") {
      const body = await req.json();
      adId = body.ad_id;
      forceRegenerate = body.force_regenerate || false;
    } else {
      const url = new URL(req.url);
      adId = url.searchParams.get("ad_id") || "";
    }

    if (!adId) {
      return new Response(
        JSON.stringify({ error: "ad_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[generate-ad-transcript] Processing ad: ${adId}`);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if we already have this record (unless force regenerate)
    if (!forceRegenerate) {
      const { data: existing } = await supabase
        .from("ad_transcripts")
        .select("*")
        .eq("ad_id", adId)
        .single();

      // Return cached if completed or pending with video_url
      if (existing && existing.status === "completed") {
        console.log(`[generate-ad-transcript] Returning cached result for ${adId}`);
        return new Response(
          JSON.stringify({ success: true, cached: true, ...existing }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (existing && existing.status === "pending" && existing.video_url) {
        console.log(`[generate-ad-transcript] Returning pending result with video_url for ${adId}`);
        return new Response(
          JSON.stringify({ success: true, cached: true, ...existing }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Create or update record as processing
    await supabase
      .from("ad_transcripts")
      .upsert(
        { ad_id: adId, status: "processing", updated_at: new Date().toISOString() },
        { onConflict: "ad_id" }
      );

    // Step 1: Fetch ad with creative info using Ad Account token
    console.log(`[generate-ad-transcript] Fetching ad creative for ${adId}`);
    const adResponse = await fetch(
      `${FACEBOOK_GRAPH_URL}/${adId}?fields=id,creative{id,video_id,object_story_id,effective_object_story_id,object_story_spec,thumbnail_url,image_url,object_type,asset_feed_spec,source_instagram_media_id}&access_token=${facebookAccessToken}`
    );
    const adData = await adResponse.json();

    if (adData.error) {
      throw new Error(`Facebook API error: ${adData.error.message}`);
    }

    console.log(`[generate-ad-transcript] Ad data:`, JSON.stringify(adData, null, 2));

    const creative = adData.creative;
    if (!creative) {
      throw new Error("No creative found for this ad");
    }

    // Extract video ID from various possible locations
    let videoId = creative.video_id ||
                  creative.object_story_spec?.video_data?.video_id ||
                  creative.asset_feed_spec?.videos?.[0]?.video_id;

    console.log(`[generate-ad-transcript] Initial video_id check: ${videoId || 'none'}`);
    console.log(`[generate-ad-transcript] thumbnail_url: ${creative.thumbnail_url || 'none'}`);
    console.log(`[generate-ad-transcript] object_story_id: ${creative.object_story_id || 'none'}`);
    console.log(`[generate-ad-transcript] effective_object_story_id: ${creative.effective_object_story_id || 'none'}`);

    // Check if thumbnail URL suggests this is a video (Facebook video thumbnails have specific patterns)
    const isVideoThumbnail = creative.thumbnail_url?.includes("t15.5256-10");

    // If no video_id but thumbnail suggests video, try to get video_id from page post
    if (!videoId && isVideoThumbnail) {
      const storyId = creative.effective_object_story_id || creative.object_story_id;
      if (storyId) {
        console.log(`[generate-ad-transcript] Thumbnail suggests video, fetching from page post: ${storyId}`);
        try {
          const postResponse = await fetch(
            `${FACEBOOK_GRAPH_URL}/${storyId}?fields=attachments{media_type,target},source&access_token=${facebookAccessToken}`
          );
          const postData = await postResponse.json();
          console.log(`[generate-ad-transcript] Page post data:`, JSON.stringify(postData, null, 2));

          // Check for video in attachments
          const attachments = postData.attachments?.data || [];
          for (const att of attachments) {
            if (att.media_type === "video" && att.target?.id) {
              videoId = att.target.id;
              console.log(`[generate-ad-transcript] Found video_id from page post: ${videoId}`);
              break;
            }
          }
        } catch (e) {
          console.error(`[generate-ad-transcript] Failed to fetch page post:`, e);
        }
      }
    }

    console.log(`[generate-ad-transcript] Final detected video_id: ${videoId || 'none'}`);

    // Prepare the record
    const record: AdTranscriptRecord = {
      ad_id: adId,
      creative_id: creative.id,
      status: "completed",
      generated_at: new Date().toISOString(),
      media_type: videoId ? "video" : "image",
    };

    if (videoId) {
      // VIDEO AD - fetch the source URL using Page Access Token
      record.media_type = "video";
      record.facebook_video_id = videoId;

      // Use Page Access Token if available, otherwise fall back to Ad Account token
      const tokenForVideo = facebookPageAccessToken || facebookAccessToken;

      console.log(`[generate-ad-transcript] Fetching video source URL for video_id: ${videoId}`);
      console.log(`[generate-ad-transcript] Using ${facebookPageAccessToken ? 'Page Access Token' : 'Ad Account Token'}`);

      try {
        const videoResponse = await fetch(
          `${FACEBOOK_GRAPH_URL}/${videoId}?fields=source,format,length,picture&access_token=${tokenForVideo}`
        );

        if (!videoResponse.ok) {
          const errorData = await videoResponse.json();
          console.error(`[generate-ad-transcript] Failed to fetch video source:`, errorData);
          throw new Error(`Facebook API error: ${JSON.stringify(errorData)}`);
        }

        const videoData = await videoResponse.json();
        console.log(`[generate-ad-transcript] Video API response:`, JSON.stringify(videoData, null, 2));

        // Extract the direct video source URL
        if (videoData.source) {
          record.video_url = videoData.source;
          record.status = "pending"; // Pending transcription
          console.log(`✅ [generate-ad-transcript] Got playable video source: ${videoData.source.substring(0, 100)}...`);
        } else {
          console.warn(`⚠️ [generate-ad-transcript] No source field in video data`);
          record.status = "pending";
          record.error_message = "Video source URL not returned by API";
        }

        // Get duration if available
        if (videoData.length) {
          record.duration_seconds = Math.round(videoData.length);
        }

        // Use picture from video data or creative thumbnail
        record.thumbnail_url = videoData.picture || creative.thumbnail_url;

      } catch (error) {
        console.error(`[generate-ad-transcript] Error fetching video source:`, error);
        record.status = "pending";
        record.error_message = error instanceof Error ? error.message : "Failed to fetch video source";
        record.thumbnail_url = creative.thumbnail_url;
      }

      // Extract ad copy from video_data
      const videoSpec = creative.object_story_spec?.video_data;
      if (videoSpec) {
        record.ad_copy = {
          headline: videoSpec.title,
          body: videoSpec.message,
          cta: videoSpec.call_to_action?.type?.replace(/_/g, " "),
        };
      }

    } else {
      // IMAGE AD
      record.media_type = "image";
      record.status = "completed";

      // Try to get the full-resolution image URL
      let fullResImageUrl = creative.image_url || creative.object_story_spec?.link_data?.picture;

      // If no image_url, try fetching from the creative API with image_url field
      if (!fullResImageUrl && creative.id) {
        try {
          console.log(`[generate-ad-transcript] Fetching full-res image for creative ${creative.id}`);
          const creativeResponse = await fetch(
            `${FACEBOOK_GRAPH_URL}/${creative.id}?fields=image_url,thumbnail_url,object_story_spec&access_token=${facebookAccessToken}`
          );
          const creativeData = await creativeResponse.json();
          if (creativeData.image_url) {
            fullResImageUrl = creativeData.image_url;
            console.log(`[generate-ad-transcript] Got full-res image from creative API: ${fullResImageUrl?.substring(0, 100)}...`);
          }
        } catch (e) {
          console.error(`[generate-ad-transcript] Failed to fetch creative image:`, e);
        }
      }

      // Clean up low-res thumbnail URL if we have to use it as fallback
      const cleanImageUrl = (url: string | undefined): string | undefined => {
        if (!url) return url;
        // Remove the stp parameter that forces low resolution
        let cleaned = url.replace(/[&?]stp=[^&]+/, '');
        // Replace small size constraints with larger ones
        cleaned = cleaned.replace(/p\d+x\d+/, 'p1080x1080');
        return cleaned;
      };

      record.image_url = fullResImageUrl || cleanImageUrl(creative.thumbnail_url);
      record.thumbnail_url = creative.thumbnail_url;

      console.log(`[generate-ad-transcript] Image ad - image_url: ${record.image_url?.substring(0, 100)}...`);

      const linkData = creative.object_story_spec?.link_data;
      if (linkData) {
        record.ad_copy = {
          headline: linkData.name,
          body: linkData.message,
          description: linkData.description,
          cta: linkData.call_to_action?.type?.replace(/_/g, " "),
        };
      }
    }

    // Save to database
    const { data: saved, error: saveError } = await supabase
      .from("ad_transcripts")
      .upsert(
        { ...record, updated_at: new Date().toISOString() },
        { onConflict: "ad_id" }
      )
      .select()
      .single();

    if (saveError) {
      throw new Error(`Failed to save record: ${saveError.message}`);
    }

    console.log(`✅ [generate-ad-transcript] SUCCESS: ${adId} - media_type: ${saved.media_type}, video_url: ${saved.video_url ? 'YES' : 'NO'}`);

    return new Response(
      JSON.stringify({ success: true, cached: false, ...saved }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[generate-ad-transcript] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
