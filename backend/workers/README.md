# Transcript Worker

Local worker script that generates transcripts for video ads using **Deepgram API**.

## How It Works

1. **Edge Function** (`generate-ad-transcript`) fetches video URL from Facebook API and stores it in `ad_transcripts` table with `status='pending'`

2. **Local Worker** polls for pending transcripts, downloads videos, sends to Deepgram for transcription, and uploads results

3. **Frontend** displays the transcript in the Ad Preview modal

## Prerequisites

- Node.js 18+ installed
- Deepgram API key (get one at https://console.deepgram.com/)
- Supabase service role key (for database access)

## Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your credentials:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` with your actual values:
   ```
   SUPABASE_URL=https://kdvdshszbntysrgzgspp.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   DEEPGRAM_API_KEY=your-deepgram-api-key
   ```

   - **Supabase**: Find service role key in Dashboard → Settings → API → service_role
   - **Deepgram**: Get API key at https://console.deepgram.com/

## Running the Worker

Start the worker (runs continuously):
```bash
npm run transcript-worker
```

The worker will:
- Poll for pending video transcripts every 30 seconds
- Download each video to a temp folder
- Send to Deepgram Nova-2 API for transcription
- Parse the timestamped response
- Upload the transcript to Supabase
- Delete the temp video file
- Repeat

Press `Ctrl+C` to stop the worker.

## Output

When processing videos, you'll see output like:
```
========================================
  Ad Transcript Worker
  Using: Deepgram Nova-2 API
========================================

Supabase client initialized
Deepgram client initialized
Created temp directory: /var/folders/.../ad-transcripts
Polling interval: 30 seconds

Starting worker loop... (Press Ctrl+C to stop)

Found 2 pending transcript(s)

Processing ad: 120215959633950359
Downloading video from: https://video-ord5-2.xx.fbcdn.net...
Downloaded: 12.45 MB
Transcribing with Deepgram: 120215959633950359.mp4...
Generated transcript: 8 segments, 1234 chars
Saved transcript for ad: 120215959633950359
Cleaned up temp file: /var/folders/.../120215959633950359.mp4
```

## Deepgram Features Used

- **Model**: Nova-2 (latest, most accurate)
- **Smart Format**: Automatically formats numbers, dates, etc.
- **Punctuation**: Adds proper punctuation
- **Paragraphs**: Groups text into paragraphs
- **Utterances**: Provides timestamped segments

## Troubleshooting

### "Missing DEEPGRAM_API_KEY"
Ensure your `.env` file has the `DEEPGRAM_API_KEY` variable set.

### "Missing environment variables"
Check that your `.env` file exists and has all required values:
- `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`)
- `SUPABASE_SERVICE_ROLE_KEY`
- `DEEPGRAM_API_KEY`

### "Failed to download video"
The video URL from Facebook may have expired. Click "Refresh" in the Ad Preview modal to fetch a new URL, then the worker will pick it up.

### "Deepgram API error"
- Check your API key is valid
- Check you have credits remaining at https://console.deepgram.com/
- Check the video file isn't corrupted

### Transcript not appearing in dashboard
1. Check the worker is running
2. Check the `ad_transcripts` table in Supabase for status/error messages
3. Make sure the video was downloaded successfully (check file size in output)

## Deepgram Pricing

Deepgram offers:
- **Pay As You Go**: ~$0.0043/minute for Nova-2
- **Free tier**: $200 credit for new accounts

A typical 60-second ad costs ~$0.26 to transcribe.

## Deployment Options

### Option 1: Run Locally (Recommended for Development)
Run on your local machine when needed:
```bash
npm run transcript-worker
```

### Option 2: Run on a Server
Deploy to a VPS or cloud server:
1. Clone the repo
2. Set up environment variables
3. Run with PM2 or systemd:
   ```bash
   pm2 start "npm run transcript-worker" --name transcript-worker
   ```

### Option 3: Run with Docker
Create a Dockerfile:
```dockerfile
FROM node:20-slim
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/workers ./workers
CMD ["npm", "run", "transcript-worker"]
```

## Technical Details

- **Polling Interval**: 30 seconds (configurable in script)
- **Batch Size**: 5 videos at a time
- **Temp Directory**: System temp folder (`/var/folders/...` on macOS)
- **Transcript Format**: Timestamped segments (e.g., "00:00-00:13 Text...")
- **Deepgram Model**: Nova-2 with smart_format, punctuate, paragraphs, utterances
