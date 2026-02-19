#!/usr/bin/env npx tsx
/**
 * Transcript Worker Script
 *
 * This script runs locally to generate transcripts for video ads using Deepgram API.
 * It polls the ad_transcripts table for pending videos, downloads them, generates transcripts,
 * and uploads the results back to Supabase.
 *
 * Usage:
 *   cd backend && npm run transcript-worker
 *   OR
 *   npx tsx workers/transcript-worker.ts
 *
 * Environment Variables (from .env file):
 *   SUPABASE_URL - Your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key for admin access
 *   DEEPGRAM_API_KEY - Your Deepgram API key for transcription
 *
 * The script will:
 * 1. Poll for pending transcripts every 30 seconds
 * 2. Download video to temp folder
 * 3. Send to Deepgram API for transcription
 * 4. Parse output and upload transcript to Supabase
 * 5. Clean up temp files
 */

import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";
import { createClient as createDeepgramClient } from "@deepgram/sdk";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as https from "https";
import * as http from "http";
import { fileURLToPath } from "url";
import { dirname } from "path";

// ES module compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
import * as dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config({ path: path.join(__dirname, "../../.env") });

// Configuration
const POLL_INTERVAL_MS = 30000; // 30 seconds
const TEMP_DIR = path.join(os.tmpdir(), "ad-transcripts");

// Clients
let supabase: SupabaseClient;
let deepgram: ReturnType<typeof createDeepgramClient>;

interface TranscriptSegment {
  start: string;
  end: string;
  text: string;
}

interface PendingTranscript {
  id: string;
  ad_id: string;
  video_url: string;
  duration_seconds: number | null;
}

/**
 * Format seconds to MM:SS timestamp
 */
function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Initialize Supabase client
 */
function initSupabase(): void {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("Missing environment variables:");
    console.error("  SUPABASE_URL:", url ? "set" : "MISSING");
    console.error("  SUPABASE_SERVICE_ROLE_KEY:", key ? "set" : "MISSING");
    console.error("\nPlease create a .env file with these variables.");
    process.exit(1);
  }

  supabase = createSupabaseClient(url, key);
  console.log("Supabase client initialized");
}

/**
 * Initialize Deepgram client
 */
function initDeepgram(): void {
  const apiKey = process.env.DEEPGRAM_API_KEY;

  if (!apiKey) {
    console.error("Missing DEEPGRAM_API_KEY environment variable");
    console.error("\nPlease add DEEPGRAM_API_KEY to your .env file.");
    process.exit(1);
  }

  deepgram = createDeepgramClient(apiKey);
  console.log("Deepgram client initialized");
}

/**
 * Ensure temp directory exists
 */
function ensureTempDir(): void {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
    console.log(`Created temp directory: ${TEMP_DIR}`);
  }
}

/**
 * Download a file from URL to local path
 */
async function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const protocol = url.startsWith("https") ? https : http;

    const request = protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          file.close();
          fs.unlinkSync(destPath);
          downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
          return;
        }
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
    });

    request.on("error", (err) => {
      file.close();
      if (fs.existsSync(destPath)) {
        fs.unlinkSync(destPath);
      }
      reject(err);
    });

    file.on("error", (err) => {
      file.close();
      if (fs.existsSync(destPath)) {
        fs.unlinkSync(destPath);
      }
      reject(err);
    });
  });
}

/**
 * Generate transcript using Deepgram API
 */
async function generateTranscript(videoPath: string): Promise<{ text: string; segments: TranscriptSegment[] }> {
  console.log(`Transcribing with Deepgram: ${path.basename(videoPath)}...`);

  try {
    // Read the video file
    const audioBuffer = fs.readFileSync(videoPath);

    // Call Deepgram API
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
        model: "nova-2",
        smart_format: true,
        punctuate: true,
        paragraphs: true,
        utterances: true,
      }
    );

    if (error) {
      throw new Error(`Deepgram API error: ${error.message}`);
    }

    if (!result || !result.results) {
      throw new Error("No transcription results returned from Deepgram");
    }

    // Extract segments from utterances
    const segments: TranscriptSegment[] = [];
    let fullText = "";

    // Check if utterances are available
    const utterances = result.results.utterances;
    if (utterances && utterances.length > 0) {
      for (const utterance of utterances) {
        segments.push({
          start: formatTimestamp(utterance.start),
          end: formatTimestamp(utterance.end),
          text: utterance.transcript,
        });
        fullText += (fullText ? " " : "") + utterance.transcript;
      }
    } else {
      // Fallback to channels/alternatives if no utterances
      const channels = result.results.channels;
      if (channels && channels.length > 0) {
        const alternatives = channels[0].alternatives;
        if (alternatives && alternatives.length > 0) {
          const alt = alternatives[0];
          fullText = alt.transcript || "";

          // Try to get word-level timestamps and group into segments
          const words = alt.words;
          if (words && words.length > 0) {
            // Group words into ~10 second segments
            let currentSegment: { start: number; end: number; words: string[] } | null = null;
            const SEGMENT_DURATION = 10; // seconds

            for (const word of words) {
              if (!currentSegment) {
                currentSegment = { start: word.start, end: word.end, words: [word.word] };
              } else if (word.start - currentSegment.start > SEGMENT_DURATION) {
                // Save current segment and start new one
                segments.push({
                  start: formatTimestamp(currentSegment.start),
                  end: formatTimestamp(currentSegment.end),
                  text: currentSegment.words.join(" "),
                });
                currentSegment = { start: word.start, end: word.end, words: [word.word] };
              } else {
                currentSegment.end = word.end;
                currentSegment.words.push(word.word);
              }
            }

            // Don't forget the last segment
            if (currentSegment && currentSegment.words.length > 0) {
              segments.push({
                start: formatTimestamp(currentSegment.start),
                end: formatTimestamp(currentSegment.end),
                text: currentSegment.words.join(" "),
              });
            }
          } else if (fullText) {
            // No word timestamps, create single segment
            segments.push({
              start: "00:00",
              end: "00:00",
              text: fullText,
            });
          }
        }
      }
    }

    console.log(`Generated transcript: ${segments.length} segments, ${fullText.length} chars`);
    return { text: fullText, segments };
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Deepgram error: ${error.message}`);
      throw new Error(`Transcript generation failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Fetch pending transcripts from Supabase
 */
async function fetchPendingTranscripts(): Promise<PendingTranscript[]> {
  const { data, error } = await supabase
    .from("ad_transcripts")
    .select("id, ad_id, video_url, duration_seconds")
    .eq("status", "pending")
    .eq("media_type", "video")
    .not("video_url", "is", null)
    .limit(5); // Process up to 5 at a time

  if (error) {
    console.error("Error fetching pending transcripts:", error);
    return [];
  }

  return data || [];
}

/**
 * Update transcript status to processing
 */
async function setProcessing(adId: string): Promise<void> {
  await supabase
    .from("ad_transcripts")
    .update({ status: "processing", updated_at: new Date().toISOString() })
    .eq("ad_id", adId);
}

/**
 * Save completed transcript to Supabase
 */
async function saveTranscript(
  adId: string,
  transcript: string,
  segments: TranscriptSegment[]
): Promise<void> {
  const { error } = await supabase
    .from("ad_transcripts")
    .update({
      transcript,
      transcript_json: segments,
      status: "completed",
      generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("ad_id", adId);

  if (error) {
    throw new Error(`Failed to save transcript: ${error.message}`);
  }
}

/**
 * Mark transcript as failed
 */
async function setFailed(adId: string, errorMessage: string): Promise<void> {
  await supabase
    .from("ad_transcripts")
    .update({
      status: "failed",
      error_message: errorMessage,
      updated_at: new Date().toISOString(),
    })
    .eq("ad_id", adId);
}

/**
 * Process a single pending transcript
 */
async function processTranscript(item: PendingTranscript): Promise<void> {
  console.log(`\nProcessing ad: ${item.ad_id}`);

  const videoPath = path.join(TEMP_DIR, `${item.ad_id}.mp4`);

  try {
    // Mark as processing
    await setProcessing(item.ad_id);

    // Download video
    console.log(`Downloading video from: ${item.video_url.substring(0, 50)}...`);
    await downloadFile(item.video_url, videoPath);
    const stats = fs.statSync(videoPath);
    console.log(`Downloaded: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

    // Generate transcript using Deepgram
    const { text, segments } = await generateTranscript(videoPath);

    // Save to database
    await saveTranscript(item.ad_id, text, segments);
    console.log(`Saved transcript for ad: ${item.ad_id}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Failed to process ad ${item.ad_id}:`, errorMessage);
    await setFailed(item.ad_id, errorMessage);
  } finally {
    // Clean up temp file
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
      console.log(`Cleaned up temp file: ${videoPath}`);
    }
  }
}

/**
 * Main worker loop
 */
async function runWorker(): Promise<void> {
  console.log("\n========================================");
  console.log("  Ad Transcript Worker");
  console.log("  Using: Deepgram Nova-2 API");
  console.log("========================================\n");

  initSupabase();
  initDeepgram();
  ensureTempDir();

  console.log(`\nPolling interval: ${POLL_INTERVAL_MS / 1000} seconds`);
  console.log(`Temp directory: ${TEMP_DIR}`);
  console.log("\nStarting worker loop... (Press Ctrl+C to stop)\n");

  // Main loop
  while (true) {
    try {
      const pending = await fetchPendingTranscripts();

      if (pending.length > 0) {
        console.log(`Found ${pending.length} pending transcript(s)`);
        for (const item of pending) {
          await processTranscript(item);
        }
      } else {
        process.stdout.write(".");
      }
    } catch (error) {
      console.error("\nWorker loop error:", error);
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\nShutting down worker...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n\nShutting down worker...");
  process.exit(0);
});

// Run the worker
runWorker().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
