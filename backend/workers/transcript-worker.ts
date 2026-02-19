#!/usr/bin/env npx tsx
/**
 * Transcript Worker Script
 *
 * This script runs locally to generate transcripts for video ads using manus-speech-to-text.
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
 *
 * The script will:
 * 1. Poll for pending transcripts every 30 seconds
 * 2. Download video to temp folder
 * 3. Run manus-speech-to-text on the video
 * 4. Parse output and upload transcript to Supabase
 * 5. Clean up temp files
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { execSync } from "child_process";
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
const MAX_RETRIES = 3;

// Supabase client
let supabase: SupabaseClient;

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

  supabase = createClient(url, key);
  console.log("Supabase client initialized");
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
 * Run manus-speech-to-text on a video file and parse output
 */
function generateTranscript(videoPath: string): { text: string; segments: TranscriptSegment[] } {
  console.log(`Running manus-speech-to-text on ${videoPath}...`);

  try {
    // Run manus-speech-to-text and capture output
    const output = execSync(`manus-speech-to-text "${videoPath}"`, {
      encoding: "utf-8",
      maxBuffer: 50 * 1024 * 1024, // 50MB buffer for large outputs
    });

    // Parse the output to extract timestamped segments
    // Expected format: "00:00-00:13  Text content here..."
    const segments: TranscriptSegment[] = [];
    const lines = output.split("\n").filter((line) => line.trim());

    let fullText = "";

    for (const line of lines) {
      // Try to match timestamp pattern: "00:00-00:13  Text"
      const match = line.match(/^(\d{2}:\d{2})-(\d{2}:\d{2})\s+(.+)$/);
      if (match) {
        const [, start, end, text] = match;
        segments.push({ start, end, text: text.trim() });
        fullText += (fullText ? " " : "") + text.trim();
      } else if (line.trim() && !line.startsWith("[") && !line.includes("Processing")) {
        // Also capture lines without timestamps as part of the text
        fullText += (fullText ? " " : "") + line.trim();
      }
    }

    // If no segments were parsed, treat the entire output as plain text
    if (segments.length === 0 && fullText) {
      segments.push({
        start: "00:00",
        end: "00:00",
        text: fullText,
      });
    }

    console.log(`Generated transcript: ${segments.length} segments, ${fullText.length} chars`);
    return { text: fullText, segments };
  } catch (error) {
    if (error instanceof Error) {
      console.error(`manus-speech-to-text error: ${error.message}`);
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

    // Generate transcript
    const { text, segments } = generateTranscript(videoPath);

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
  console.log("  Using: manus-speech-to-text");
  console.log("========================================\n");

  initSupabase();
  ensureTempDir();

  // Check if manus-speech-to-text is available
  try {
    execSync("which manus-speech-to-text", { encoding: "utf-8" });
    console.log("manus-speech-to-text: found");
  } catch {
    console.error("ERROR: manus-speech-to-text command not found!");
    console.error("Please ensure manus-speech-to-text is installed and in your PATH.");
    process.exit(1);
  }

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
