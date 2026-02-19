// @deno-types="https://deno.land/x/deno@v1.37.0/cli/dts/lib.deno.d.ts"
// supabase/functions/generate-ad-transcript/index.ts
// Fetches ad creative from Facebook API and generates transcripts for video ads

// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

declare const Deno: any;

const FACEBOOK_API_VERSION = "v19.0";
const FACEBOOK_GRAPH_URL = `https://graph.facebook.com/${FACEBOOK_API_VERSION}`;

interface AdCreative {
  id: string;
  video_id?: string;
  image_url?: string;
  thumbnail_url?: string;
  object_story_spec?: {
    link_data?: {
      message?: string;
      name?: string;
      description?: string;
      call_to_action?: {
        type: string;
        value?: {
          link?: string;
        };
      };
      image_hash?: string;
      picture?: string;
    };
    video_data?: {
      video_id?: string;
      image_url?: string;
      title?: string;
      message?: string;
      call_to_action?: {
        type: string;
      };
    };
  };
  effective_object_story_id?: string;
}

interface VideoDetails {
  id: string;
  source?: string;
  title?: string;
  description?: string;
  length?: number;
  picture?: string;
}

interface TranscriptSegment {
  start: string;
  end: string;
  text: string;
}

interface AdTranscriptRecord {
  ad_id: string;
  creative_id?: string;
  video_url?: string;
  thumbnail_url?: string;
  image_url?: string;
  transcript?: string;
  transcript_json?: TranscriptSegment[];
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY"); // Optional for transcription

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

    console.log(`Processing ad: ${adId}`);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if we already have this transcript (unless force regenerate)
    if (!forceRegenerate) {
      const { data: existing } = await supabase
        .from("ad_transcripts")
        .select("*")
        .eq("ad_id", adId)
        .single();

      if (existing && existing.status === "completed") {
        console.log(`Returning cached transcript for ad: ${adId}`);
        return new Response(
          JSON.stringify({
            success: true,
            cached: true,
            ...existing,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Create or update record as processing
    const { error: upsertError } = await supabase
      .from("ad_transcripts")
      .upsert(
        { ad_id: adId, status: "processing", updated_at: new Date().toISOString() },
        { onConflict: "ad_id" }
      );

    if (upsertError) {
      console.error("Failed to create processing record:", upsertError);
    }

    // Fetch ad creative from Facebook
    const creative = await fetchAdCreative(adId, facebookAccessToken);
    console.log(`Fetched creative for ad: ${adId}`, JSON.stringify(creative).substring(0, 200));

    // Determine media type and extract data
    const record = await processCreative(creative, adId, facebookAccessToken, openaiApiKey);

    // Save to database
    const { data: saved, error: saveError } = await supabase
      .from("ad_transcripts")
      .upsert(
        {
          ...record,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "ad_id" }
      )
      .select()
      .single();

    if (saveError) {
      throw new Error(`Failed to save transcript: ${saveError.message}`);
    }

    console.log(`Successfully processed ad: ${adId}`);

    return new Response(
      JSON.stringify({
        success: true,
        cached: false,
        ...saved,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error processing ad:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Fetch ad creative from Facebook API
async function fetchAdCreative(adId: string, accessToken: string): Promise<AdCreative> {
  const fields = "creative{id,video_id,image_url,thumbnail_url,object_story_spec,effective_object_story_id}";
  const url = `${FACEBOOK_GRAPH_URL}/${adId}?fields=${fields}&access_token=${accessToken}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.error) {
    throw new Error(`Facebook API error: ${data.error.message}`);
  }

  if (!data.creative) {
    throw new Error("No creative found for this ad");
  }

  return data.creative;
}

// Fetch video details from Facebook API
async function fetchVideoDetails(videoId: string, accessToken: string): Promise<VideoDetails> {
  const fields = "id,source,title,description,length,picture";
  const url = `${FACEBOOK_GRAPH_URL}/${videoId}?fields=${fields}&access_token=${accessToken}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.error) {
    throw new Error(`Facebook API error fetching video: ${data.error.message}`);
  }

  return data;
}

// Process creative and extract relevant data
async function processCreative(
  creative: AdCreative,
  adId: string,
  accessToken: string,
  openaiApiKey?: string
): Promise<AdTranscriptRecord> {
  const record: AdTranscriptRecord = {
    ad_id: adId,
    creative_id: creative.id,
    status: "completed",
    generated_at: new Date().toISOString(),
    media_type: "image", // Default
  };

  // Check for video
  const videoId = creative.video_id || creative.object_story_spec?.video_data?.video_id;

  if (videoId) {
    record.media_type = "video";

    try {
      const videoDetails = await fetchVideoDetails(videoId, accessToken);
      record.video_url = videoDetails.source;
      record.thumbnail_url = videoDetails.picture || creative.thumbnail_url;
      record.duration_seconds = videoDetails.length ? Math.round(videoDetails.length) : undefined;

      // Extract video ad copy
      const videoData = creative.object_story_spec?.video_data;
      if (videoData) {
        record.ad_copy = {
          headline: videoData.title,
          body: videoData.message,
          cta: videoData.call_to_action?.type?.replace(/_/g, " "),
        };
      }

      // Generate transcript if OpenAI key is available
      if (openaiApiKey && record.video_url) {
        try {
          const transcriptResult = await generateTranscript(record.video_url, openaiApiKey);
          record.transcript = transcriptResult.text;
          record.transcript_json = transcriptResult.segments;
        } catch (transcriptError) {
          console.error("Transcript generation failed:", transcriptError);
          // Continue without transcript - video URL is still useful
        }
      }
    } catch (videoError) {
      console.error("Failed to fetch video details:", videoError);
      record.thumbnail_url = creative.thumbnail_url;
    }
  } else {
    // Image ad
    record.media_type = "image";
    record.image_url = creative.image_url || creative.object_story_spec?.link_data?.picture;
    record.thumbnail_url = creative.thumbnail_url;

    // Extract image ad copy
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

  return record;
}

// Generate transcript using OpenAI Whisper API
async function generateTranscript(
  videoUrl: string,
  openaiApiKey: string
): Promise<{ text: string; segments: TranscriptSegment[] }> {
  console.log("Generating transcript for video...");

  // Download video to memory (limited to ~25MB for Whisper API)
  const videoResponse = await fetch(videoUrl);
  if (!videoResponse.ok) {
    throw new Error(`Failed to download video: ${videoResponse.status}`);
  }

  const videoBlob = await videoResponse.blob();

  // Check file size (Whisper has 25MB limit)
  if (videoBlob.size > 25 * 1024 * 1024) {
    throw new Error("Video file too large for transcription (max 25MB)");
  }

  // Create form data for Whisper API
  const formData = new FormData();
  formData.append("file", videoBlob, "video.mp4");
  formData.append("model", "whisper-1");
  formData.append("response_format", "verbose_json");
  formData.append("timestamp_granularities[]", "segment");

  const whisperResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiApiKey}`,
    },
    body: formData,
  });

  if (!whisperResponse.ok) {
    const errorText = await whisperResponse.text();
    throw new Error(`Whisper API error: ${errorText}`);
  }

  const result = await whisperResponse.json();

  // Format segments with timestamps
  const segments: TranscriptSegment[] = (result.segments || []).map((seg: any) => ({
    start: formatTimestamp(seg.start),
    end: formatTimestamp(seg.end),
    text: seg.text.trim(),
  }));

  return {
    text: result.text,
    segments,
  };
}

// Format seconds to MM:SS timestamp
function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
