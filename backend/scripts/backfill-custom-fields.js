#!/usr/bin/env node
/**
 * Backfill script for investment_ability and scaling_challenge fields
 *
 * This script fetches contacts from GoHighLevel API and updates the
 * contacts table in Supabase with the missing custom fields.
 *
 * Usage:
 *   node scripts/backfill-custom-fields.js
 *
 * Required environment variables (in .env file or exported):
 *   - GHL_API_KEY: GoHighLevel API key
 *   - GHL_LOCATION_ID: GoHighLevel location ID
 *   - SUPABASE_URL: Supabase project URL
 *   - SUPABASE_SERVICE_ROLE_KEY: Supabase service role key
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// GHL Custom Field IDs (from GHL API)
const CUSTOM_FIELD_IDS = {
  INVESTMENT_ABILITY: "ETAW8IMRzdAyiinOFxIJ",
  SCALING_CHALLENGE: "Y9IfkX9MB5dSDErJyJsd",
  REVENUE: "xXg3qy4Ttn477cdFlSJj",
};

// Get environment variables
const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!GHL_API_KEY || !GHL_LOCATION_ID || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing required environment variables:");
  console.error("  GHL_API_KEY:", GHL_API_KEY ? "set" : "MISSING");
  console.error("  GHL_LOCATION_ID:", GHL_LOCATION_ID ? "set" : "MISSING");
  console.error("  SUPABASE_URL:", SUPABASE_URL ? "set" : "MISSING");
  console.error("  SUPABASE_SERVICE_ROLE_KEY:", SUPABASE_SERVICE_ROLE_KEY ? "set" : "MISSING");
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// GHL API base URL
const GHL_API_BASE = "https://services.leadconnectorhq.com";

/**
 * Extract custom field value by field ID
 * GHL returns customFields as an array: [{id: "xxx", value: "123"}, ...]
 */
function extractCustomFieldById(customFields, fieldId) {
  if (!customFields) return null;

  // Handle array format
  if (Array.isArray(customFields)) {
    for (const field of customFields) {
      if (field && field.id === fieldId) {
        if (field.value !== null && field.value !== undefined && field.value !== "") {
          return String(field.value);
        }
      }
    }
  }

  // Handle object format (field ID as key)
  if (typeof customFields === 'object' && !Array.isArray(customFields)) {
    const value = customFields[fieldId];
    if (value !== null && value !== undefined && value !== "") {
      return String(value);
    }
  }

  return null;
}

/**
 * Get a single contact with full details from GHL
 */
async function fetchGHLContactDetails(contactId) {
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
    const errorText = await response.text();
    console.error(`Failed to fetch contact ${contactId}: ${response.status} - ${errorText.substring(0, 100)}`);
    return null;
  }

  const data = await response.json();
  return data.contact || data;
}

/**
 * Update contact in Supabase with custom fields
 */
async function updateContactInSupabase(ghlContactId, investmentAbility, scalingChallenge, revenue) {
  const updateData = {
    updated_at: new Date().toISOString(),
  };

  if (investmentAbility) {
    updateData.investment_ability = investmentAbility;
  }

  if (scalingChallenge) {
    updateData.scaling_challenge = scalingChallenge;
  }

  if (revenue !== null && revenue !== undefined) {
    updateData.revenue = revenue;
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
 * Sleep helper for rate limiting
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main backfill function
 */
async function backfillCustomFields() {
  console.log("=".repeat(60));
  console.log("Starting backfill of investment_ability, scaling_challenge, and revenue");
  console.log("Using GHL Custom Field IDs:");
  console.log(`  investment_ability: ${CUSTOM_FIELD_IDS.INVESTMENT_ABILITY}`);
  console.log(`  scaling_challenge:  ${CUSTOM_FIELD_IDS.SCALING_CHALLENGE}`);
  console.log(`  revenue:            ${CUSTOM_FIELD_IDS.REVENUE}`);
  console.log("=".repeat(60));

  // First, get all contacts from Supabase that are missing these fields
  const { data: contactsToUpdate, error: fetchError } = await supabase
    .from("contacts")
    .select("ghl_contact_id, email, investment_ability, scaling_challenge, revenue")
    .or("investment_ability.is.null,scaling_challenge.is.null,revenue.is.null");

  if (fetchError) {
    console.error("Failed to fetch contacts from Supabase:", fetchError.message);
    process.exit(1);
  }

  console.log(`Found ${contactsToUpdate?.length || 0} contacts that may need updating\n`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;
  let noData = 0;

  for (let i = 0; i < (contactsToUpdate || []).length; i++) {
    const contact = contactsToUpdate[i];
    const ghlContactId = contact.ghl_contact_id;

    // Progress indicator
    if ((i + 1) % 20 === 0) {
      console.log(`Progress: ${i + 1}/${contactsToUpdate.length} contacts processed...`);
    }

    // Skip if all fields already have values
    if (contact.investment_ability && contact.scaling_challenge && contact.revenue !== null) {
      skipped++;
      continue;
    }

    // Fetch full contact details from GHL
    const ghlContact = await fetchGHLContactDetails(ghlContactId);

    if (!ghlContact) {
      failed++;
      continue;
    }

    // Extract custom fields by ID
    const customFields = ghlContact.customFields || ghlContact.customField;

    const investmentAbility = contact.investment_ability ||
      extractCustomFieldById(customFields, CUSTOM_FIELD_IDS.INVESTMENT_ABILITY);

    const scalingChallenge = contact.scaling_challenge ||
      extractCustomFieldById(customFields, CUSTOM_FIELD_IDS.SCALING_CHALLENGE);

    // Extract revenue - convert to number
    let revenue = contact.revenue;
    if (revenue === null || revenue === undefined) {
      const revenueStr = extractCustomFieldById(customFields, CUSTOM_FIELD_IDS.REVENUE);
      if (revenueStr) {
        // Parse revenue string to number (remove $ and commas if present)
        const cleanedRevenue = revenueStr.replace(/[$,]/g, '');
        const parsed = parseFloat(cleanedRevenue);
        if (!isNaN(parsed)) {
          revenue = parsed;
        }
      }
    }

    // Update if we found new values
    if (
      (investmentAbility && !contact.investment_ability) ||
      (scalingChallenge && !contact.scaling_challenge) ||
      (revenue !== null && revenue !== undefined && contact.revenue === null)
    ) {
      const success = await updateContactInSupabase(
        ghlContactId,
        investmentAbility,
        scalingChallenge,
        revenue
      );

      if (success) {
        updated++;
        console.log(`✅ Updated ${ghlContactId}: investment_ability="${investmentAbility || 'null'}", scaling_challenge="${scalingChallenge ? scalingChallenge.substring(0, 50) + '...' : 'null'}", revenue=${revenue !== null ? revenue : 'null'}`);
      } else {
        failed++;
      }
    } else {
      // No data found in GHL for these fields
      noData++;
    }

    // Rate limiting - GHL has rate limits (100 requests per minute)
    await sleep(150);
  }

  console.log("\n" + "=".repeat(60));
  console.log("Backfill complete:");
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped (already had data): ${skipped}`);
  console.log(`  No data in GHL: ${noData}`);
  console.log(`  Failed (API errors): ${failed}`);
  console.log("=".repeat(60));
}

// Run the backfill
backfillCustomFields().catch((error) => {
  console.error("Backfill failed:", error);
  process.exit(1);
});
