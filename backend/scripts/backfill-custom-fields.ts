#!/usr/bin/env -S deno run --allow-net --allow-env
/**
 * Backfill script for investment_ability and scaling_challenge fields
 *
 * This script fetches contacts from GoHighLevel API and updates the
 * contacts table in Supabase with the missing custom fields.
 *
 * Usage:
 *   deno run --allow-net --allow-env scripts/backfill-custom-fields.ts
 *
 * Required environment variables:
 *   - GHL_API_KEY: GoHighLevel API key
 *   - GHL_LOCATION_ID: GoHighLevel location ID
 *   - SUPABASE_URL: Supabase project URL
 *   - SUPABASE_SERVICE_ROLE_KEY: Supabase service role key
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Types
interface GHLContact {
  id: string;
  email?: string;
  phone?: string;
  customFields?: Array<{
    id: string;
    key?: string;
    field_key?: string;
    value: string | number | null;
  }>;
  [key: string]: unknown;
}

interface GHLContactsResponse {
  contacts: GHLContact[];
  meta?: {
    total: number;
    nextPageUrl?: string;
    startAfterId?: string;
    startAfter?: number;
  };
}

// Custom field keys/IDs in GoHighLevel
// These need to be configured based on your GHL account
const CUSTOM_FIELD_KEYS = {
  INVESTMENT_ABILITY: [
    "investment_ability",
    "investmentAbility",
    "investment ability",
  ],
  SCALING_CHALLENGE: [
    "whats_holding_back",
    "whatsHoldingBack",
    "scaling_challenge",
    "scalingChallenge",
    "what's holding back",
    "what_is_holding_you_back",
  ],
};

// Get environment variables
const GHL_API_KEY = Deno.env.get("GHL_API_KEY");
const GHL_LOCATION_ID = Deno.env.get("GHL_LOCATION_ID");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!GHL_API_KEY || !GHL_LOCATION_ID || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing required environment variables:");
  console.error("  GHL_API_KEY:", GHL_API_KEY ? "set" : "MISSING");
  console.error("  GHL_LOCATION_ID:", GHL_LOCATION_ID ? "set" : "MISSING");
  console.error("  SUPABASE_URL:", SUPABASE_URL ? "set" : "MISSING");
  console.error("  SUPABASE_SERVICE_ROLE_KEY:", SUPABASE_SERVICE_ROLE_KEY ? "set" : "MISSING");
  Deno.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// GHL API base URL
const GHL_API_BASE = "https://services.leadconnectorhq.com";

/**
 * Extract custom field value by checking multiple possible keys
 */
function extractCustomField(
  customFields: GHLContact["customFields"],
  possibleKeys: string[]
): string | null {
  if (!customFields || !Array.isArray(customFields)) return null;

  for (const field of customFields) {
    const fieldKey = field.key || field.field_key || "";
    const fieldKeyLower = fieldKey.toLowerCase().replace(/[\s_-]/g, "");

    for (const key of possibleKeys) {
      const keyLower = key.toLowerCase().replace(/[\s_-]/g, "");
      if (fieldKeyLower === keyLower || fieldKeyLower.includes(keyLower)) {
        if (field.value !== null && field.value !== undefined && field.value !== "") {
          return String(field.value);
        }
      }
    }
  }

  return null;
}

/**
 * Fetch contacts from GoHighLevel API with pagination
 */
async function fetchGHLContacts(startAfterId?: string): Promise<GHLContactsResponse> {
  const url = new URL(`${GHL_API_BASE}/contacts/`);
  url.searchParams.set("locationId", GHL_LOCATION_ID!);
  url.searchParams.set("limit", "100");
  if (startAfterId) {
    url.searchParams.set("startAfterId", startAfterId);
  }

  console.log(`Fetching contacts from GHL: ${url.toString()}`);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${GHL_API_KEY}`,
      "Version": "2021-07-28",
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GHL API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Get a single contact with full details from GHL
 */
async function fetchGHLContactDetails(contactId: string): Promise<GHLContact | null> {
  const url = `${GHL_API_BASE}/contacts/${contactId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${GHL_API_KEY}`,
      "Version": "2021-07-28",
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    console.error(`Failed to fetch contact ${contactId}: ${response.status}`);
    return null;
  }

  const data = await response.json();
  return data.contact || data;
}

/**
 * Update contact in Supabase with custom fields
 */
async function updateContactInSupabase(
  ghlContactId: string,
  investmentAbility: string | null,
  scalingChallenge: string | null
): Promise<boolean> {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (investmentAbility) {
    updateData.investment_ability = investmentAbility;
  }

  if (scalingChallenge) {
    updateData.scaling_challenge = scalingChallenge;
  }

  // Only update if there's something to update
  if (Object.keys(updateData).length <= 1) {
    return false;
  }

  const { error } = await supabase
    .from("contacts")
    .update(updateData)
    .eq("ghl_contact_id", ghlContactId);

  if (error) {
    console.error(`Failed to update contact ${ghlContactId}:`, error.message);
    return false;
  }

  return true;
}

/**
 * Main backfill function
 */
async function backfillCustomFields() {
  console.log("=" .repeat(60));
  console.log("Starting backfill of investment_ability and scaling_challenge");
  console.log("=" .repeat(60));

  // First, get all contacts from Supabase that are missing these fields
  const { data: contactsToUpdate, error: fetchError } = await supabase
    .from("contacts")
    .select("ghl_contact_id, email, investment_ability, scaling_challenge")
    .or("investment_ability.is.null,scaling_challenge.is.null");

  if (fetchError) {
    console.error("Failed to fetch contacts from Supabase:", fetchError.message);
    Deno.exit(1);
  }

  console.log(`Found ${contactsToUpdate?.length || 0} contacts that may need updating`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const contact of contactsToUpdate || []) {
    const ghlContactId = contact.ghl_contact_id;

    // Skip if both fields already have values
    if (contact.investment_ability && contact.scaling_challenge) {
      skipped++;
      continue;
    }

    // Fetch full contact details from GHL
    const ghlContact = await fetchGHLContactDetails(ghlContactId);

    if (!ghlContact) {
      console.log(`Could not find GHL contact: ${ghlContactId}`);
      failed++;
      continue;
    }

    // Extract custom fields
    const investmentAbility = contact.investment_ability ||
      extractCustomField(ghlContact.customFields, CUSTOM_FIELD_KEYS.INVESTMENT_ABILITY);

    const scalingChallenge = contact.scaling_challenge ||
      extractCustomField(ghlContact.customFields, CUSTOM_FIELD_KEYS.SCALING_CHALLENGE);

    // Update if we found new values
    if (
      (investmentAbility && !contact.investment_ability) ||
      (scalingChallenge && !contact.scaling_challenge)
    ) {
      const success = await updateContactInSupabase(
        ghlContactId,
        investmentAbility,
        scalingChallenge
      );

      if (success) {
        updated++;
        console.log(`✅ Updated ${ghlContactId}: investment_ability=${investmentAbility}, scaling_challenge=${scalingChallenge}`);
      } else {
        failed++;
      }
    } else {
      skipped++;
    }

    // Rate limiting - GHL has rate limits
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log("\n" + "=" .repeat(60));
  console.log("Backfill complete:");
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Failed: ${failed}`);
  console.log("=" .repeat(60));
}

// Run the backfill
backfillCustomFields().catch((error) => {
  console.error("Backfill failed:", error);
  Deno.exit(1);
});
