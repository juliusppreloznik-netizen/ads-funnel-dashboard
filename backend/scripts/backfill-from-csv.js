#!/usr/bin/env node
/**
 * Backfill script for contacts from CSV export
 *
 * This script reads a GHL CSV export and updates the contacts table
 * in Supabase with missing fields.
 *
 * Usage:
 *   node scripts/backfill-from-csv.js
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// Get environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing required environment variables:");
  console.error("  SUPABASE_URL:", SUPABASE_URL ? "set" : "MISSING");
  console.error("  SUPABASE_SERVICE_ROLE_KEY:", SUPABASE_SERVICE_ROLE_KEY ? "set" : "MISSING");
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Revenue text to number mapping
const REVENUE_MAP = {
  "I'm just starting": 0,
  "Under $5k/month": 5,
  "$5k-$10k/month": 10,
  "$10k-$25k/month": 25,
  "$25k+/month": 50,
};

/**
 * Parse CSV file and return records
 */
function parseCSV(filePath) {
  const fileContent = readFileSync(filePath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  return records;
}

/**
 * Map revenue text to number
 */
function mapRevenue(revenueText) {
  if (!revenueText || revenueText.trim() === '') return null;
  const mapped = REVENUE_MAP[revenueText.trim()];
  return mapped !== undefined ? mapped : null;
}

/**
 * Main backfill function
 */
async function backfillFromCSV() {
  const csvPath = '/Users/julius/Downloads/Export_Contacts_undefined_Mar_2026_6_22_AM.csv';

  console.log("=".repeat(60));
  console.log("Backfilling contacts from CSV export");
  console.log(`CSV file: ${csvPath}`);
  console.log("=".repeat(60));

  // Parse CSV
  const csvRecords = parseCSV(csvPath);
  console.log(`Found ${csvRecords.length} records in CSV\n`);

  // Get all contacts from Supabase that need updating
  const { data: contacts, error: fetchError } = await supabase
    .from("contacts")
    .select("ghl_contact_id, revenue, investment_ability, scaling_challenge");

  if (fetchError) {
    console.error("Failed to fetch contacts from Supabase:", fetchError.message);
    process.exit(1);
  }

  // Create a map for quick lookup
  const contactMap = new Map();
  for (const contact of contacts) {
    contactMap.set(contact.ghl_contact_id, contact);
  }

  console.log(`Found ${contacts.length} contacts in Supabase\n`);

  // Track updates
  let revenueUpdated = 0;
  let investmentAbilityUpdated = 0;
  let scalingChallengeUpdated = 0;
  let notFound = 0;
  let noUpdatesNeeded = 0;
  let failed = 0;

  // Process each CSV record
  for (const record of csvRecords) {
    const ghlContactId = record['Contact Id'];
    if (!ghlContactId) continue;

    const supabaseContact = contactMap.get(ghlContactId);
    if (!supabaseContact) {
      notFound++;
      continue;
    }

    // Prepare update data
    const updateData = {};
    let fieldsToUpdate = [];

    // Revenue - only if null in Supabase
    if (supabaseContact.revenue === null) {
      const revenueValue = mapRevenue(record['revenue']);
      if (revenueValue !== null) {
        updateData.revenue = revenueValue;
        fieldsToUpdate.push('revenue');
      }
    }

    // Investment ability - only if null in Supabase
    if (supabaseContact.investment_ability === null) {
      const investmentAbility = record['investment_ability'];
      if (investmentAbility && investmentAbility.trim() !== '') {
        updateData.investment_ability = investmentAbility.trim();
        fieldsToUpdate.push('investment_ability');
      }
    }

    // Scaling challenge - only if null in Supabase
    if (supabaseContact.scaling_challenge === null) {
      const scalingChallenge = record["What's the #1 thing holding you back from scaling your credit repair business to $45k+ per month?"];
      if (scalingChallenge && scalingChallenge.trim() !== '') {
        updateData.scaling_challenge = scalingChallenge.trim();
        fieldsToUpdate.push('scaling_challenge');
      }
    }

    // Skip if nothing to update
    if (Object.keys(updateData).length === 0) {
      noUpdatesNeeded++;
      continue;
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    // Update the contact
    const { error: updateError } = await supabase
      .from("contacts")
      .update(updateData)
      .eq("ghl_contact_id", ghlContactId);

    if (updateError) {
      console.error(`Failed to update ${ghlContactId}:`, updateError.message);
      failed++;
      continue;
    }

    // Track which fields were updated
    if (fieldsToUpdate.includes('revenue')) revenueUpdated++;
    if (fieldsToUpdate.includes('investment_ability')) investmentAbilityUpdated++;
    if (fieldsToUpdate.includes('scaling_challenge')) scalingChallengeUpdated++;

    console.log(`Updated ${ghlContactId}: ${fieldsToUpdate.join(', ')}`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("Backfill complete:");
  console.log(`  Revenue updated: ${revenueUpdated}`);
  console.log(`  Investment ability updated: ${investmentAbilityUpdated}`);
  console.log(`  Scaling challenge updated: ${scalingChallengeUpdated}`);
  console.log(`  No updates needed (already had data): ${noUpdatesNeeded}`);
  console.log(`  Not found in Supabase: ${notFound}`);
  console.log(`  Failed: ${failed}`);
  console.log("=".repeat(60));
}

// Run the backfill
backfillFromCSV().catch((error) => {
  console.error("Backfill failed:", error);
  process.exit(1);
});
