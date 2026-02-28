import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ZOOM_ACCOUNT_ID = Deno.env.get('ZOOM_ACCOUNT_ID')!;
const ZOOM_CLIENT_ID = Deno.env.get('ZOOM_CLIENT_ID')!;
const ZOOM_CLIENT_SECRET = Deno.env.get('ZOOM_CLIENT_SECRET')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getZoomToken(): Promise<string> {
  const credentials = btoa(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`);
  const response = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );
  const data = await response.json();
  if (!data.access_token) throw new Error(`Zoom auth failed: ${JSON.stringify(data)}`);
  return data.access_token;
}

interface VTTSegment {
  start: string;
  end: string;
  speaker: string;
  text: string;
}

function parseVTT(vttContent: string): VTTSegment[] {
  const lines = vttContent.split('\n');
  const segments: VTTSegment[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes('-->')) {
      const parts = line.split(' --> ');
      const start = parts[0]?.trim() || '';
      const end = parts[1]?.trim() || '';
      const textLine = (lines[i + 1] || '').trim();
      const colonIdx = textLine.indexOf(':');
      const speaker = colonIdx > -1 ? textLine.substring(0, colonIdx).trim() : 'Unknown';
      const text = colonIdx > -1 ? textLine.substring(colonIdx + 1).trim() : textLine;
      if (text) segments.push({ start, end, speaker, text });
    }
  }
  return segments;
}

interface ZoomRecordingFile {
  file_type: string;
  status: string;
  download_url: string;
}

interface ZoomMeeting {
  id: string;
  uuid: string;
  topic: string;
  host_email: string;
  start_time: string;
  duration: number;
  recording_files?: ZoomRecordingFile[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    console.log('Starting Zoom transcript sync...');
    const token = await getZoomToken();
    console.log('Zoom token obtained successfully');

    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const fromDate = body.from_date || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const toDate = body.to_date || new Date().toISOString().split('T')[0];

    console.log(`Fetching recordings from ${fromDate} to ${toDate}`);

    const recResp = await fetch(
      `https://api.zoom.us/v2/users/me/recordings?from=${fromDate}&to=${toDate}&page_size=100`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (!recResp.ok) {
      const errorText = await recResp.text();
      throw new Error(`Zoom API error: ${recResp.status} - ${errorText}`);
    }

    const recData = await recResp.json();
    const meetings: ZoomMeeting[] = recData.meetings || [];
    console.log(`Found ${meetings.length} meetings with recordings`);

    let synced = 0, skipped = 0, errors = 0;

    for (const meeting of meetings) {
      const transcriptFile = meeting.recording_files?.find(
        (f) => f.file_type === 'TRANSCRIPT' && f.status === 'completed'
      );

      if (!transcriptFile) {
        console.log(`Meeting ${meeting.id}: No transcript available`);
        skipped++;
        continue;
      }

      // Check if already synced
      const { data: existing } = await supabase
        .from('zoom_transcripts')
        .select('id')
        .eq('meeting_id', String(meeting.id))
        .single();

      if (existing) {
        console.log(`Meeting ${meeting.id}: Already synced`);
        skipped++;
        continue;
      }

      try {
        console.log(`Processing meeting ${meeting.id}: ${meeting.topic}`);

        // Download transcript
        const vttResp = await fetch(`${transcriptFile.download_url}?access_token=${token}`);
        if (!vttResp.ok) {
          throw new Error(`Failed to download transcript: ${vttResp.status}`);
        }

        const vttContent = await vttResp.text();
        const parsed = parseVTT(vttContent);
        const plainText = parsed.map(s => `${s.speaker}: ${s.text}`).join('\n');

        // Try to match contact by call scheduled time (within 2 hour window)
        const meetingTime = new Date(meeting.start_time);
        const before = new Date(meetingTime.getTime() - 2 * 60 * 60 * 1000).toISOString();
        const after = new Date(meetingTime.getTime() + 2 * 60 * 60 * 1000).toISOString();

        const { data: contact } = await supabase
          .from('contacts')
          .select('id, first_name, last_name, email, cash_collected, deal_closed_at, is_qualified, showed_up_at')
          .gte('call_scheduled_for', before)
          .lte('call_scheduled_for', after)
          .not('call_scheduled_for', 'is', null)
          .limit(1)
          .single();

        // Determine call outcome
        let callOutcome = 'unknown';
        if (contact) {
          if (contact.deal_closed_at) {
            callOutcome = 'closed';
          } else if (contact.showed_up_at) {
            callOutcome = 'no_close';
          } else {
            callOutcome = 'no_show';
          }
        }

        // Upsert the transcript
        const { error: upsertError } = await supabase.from('zoom_transcripts').upsert({
          meeting_id: String(meeting.id),
          meeting_uuid: meeting.uuid,
          topic: meeting.topic,
          host_email: meeting.host_email,
          start_time: meeting.start_time,
          duration: meeting.duration,
          transcript_raw: vttContent,
          transcript_parsed: parsed,
          transcript_text: plainText,
          download_url: transcriptFile.download_url,
          contact_id: contact?.id || null,
          contact_name: contact ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim() : null,
          contact_email: contact?.email || null,
          call_outcome: callOutcome,
          cash_collected: contact?.cash_collected || 0,
          updated_at: new Date().toISOString()
        }, { onConflict: 'meeting_id' });

        if (upsertError) {
          throw upsertError;
        }

        console.log(`Meeting ${meeting.id}: Synced successfully (outcome: ${callOutcome})`);
        synced++;
      } catch (err) {
        console.error(`Error processing meeting ${meeting.id}:`, err);
        errors++;
      }
    }

    const result = {
      success: true,
      total: meetings.length,
      synced,
      skipped,
      errors,
      date_range: { from: fromDate, to: toDate }
    };

    console.log('Sync complete:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
