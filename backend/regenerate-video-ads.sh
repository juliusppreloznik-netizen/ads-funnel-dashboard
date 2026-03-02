#!/bin/bash
# Regenerate all video ads using the Edge Function with force_regenerate

SUPABASE_URL="https://kdvdshszbntysrgzgspp.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkdmRzaHN6Ym50eXNyZ3pnc3BwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODU2MDU2NiwiZXhwIjoyMDg0MTM2NTY2fQ.j4hEIUjz0bZiPT6RzucitvQStRpaX9LzoZMVI9oGNhg"

# All ad_ids from ad_transcripts table
AD_IDS=(
  "120238032102050499"
  "120238032109870499"
  "120237642734370499"
  "120238318240020499"
  "120237907596700499"
  "120238032102040499"
  "120238032109840499"
  "120238032102060499"
  "120238032109830499"
  "120238032109820499"
  "120237642734390499"
)

echo "=== Regenerating ${#AD_IDS[@]} video ads ==="
echo ""

SUCCESS=0
FAILED=0

for AD_ID in "${AD_IDS[@]}"; do
  echo "Processing ad: $AD_ID"

  RESPONSE=$(curl -s -X POST "$SUPABASE_URL/functions/v1/generate-ad-transcript" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $SERVICE_KEY" \
    -d "{\"ad_id\":\"$AD_ID\",\"force_regenerate\":true}")

  # Check if video_url is present in response
  if echo "$RESPONSE" | grep -q '"video_url":' && ! echo "$RESPONSE" | grep -q '"video_url":null'; then
    echo "  ✅ SUCCESS - video_url obtained"
    ((SUCCESS++))
  else
    echo "  ❌ FAILED - no video_url"
    echo "  Response: $RESPONSE"
    ((FAILED++))
  fi

  # Small delay to avoid rate limiting
  sleep 1
done

echo ""
echo "=== COMPLETE ==="
echo "Success: $SUCCESS"
echo "Failed: $FAILED"
