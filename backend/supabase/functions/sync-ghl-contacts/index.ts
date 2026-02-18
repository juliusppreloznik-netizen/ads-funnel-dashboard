// supabase/functions/sync-ghl-contacts/index.ts
// Manual sync function to fetch contacts from GoHighLevel and update revenue fields

import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface GHLContact {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  customFields?: Array<{
    id: string;
    key?: string;
    field_key?: string;
    value: string | number | null;
  }>;
  tags?: string[];
  dateAdded?: string;
  dateUpdated?: string;
}

interface GHLContactsResponse {
  contacts: GHLContact[];
  meta?: {
    total: number;
    currentPage: number;
    nextPage: number | null;
    prevPage: number | null;
    startAfter?: number;
    startAfterId?: string;
  };
}

interface SyncResult {
  total_fetched: number;
  total_updated: number;
  contacts_with_cash: number;
  contacts_with_deal_value: number;
  errors: string[];
}

// Custom field IDs for revenue tracking (from GHL account)
const CUSTOM_FIELD_IDS = {
  CASH_COLLECTED: "TNV6O7CmlSXosQekT6r5",
  DEAL_VALUE: "noXrsRQa0wubLdHPqutQ",
} as const;

// ============================================================================
// CORS HEADERS
// ============================================================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
};

// ============================================================================
// GHL API FUNCTIONS
// ============================================================================

async function fetchSingleGHLContact(
  apiKey: string,
  contactId: string
): Promise<GHLContact | null> {
  const url = `https://services.leadconnectorhq.com/contacts/${contactId}`;

  console.log(`[GHL API] Fetching single contact: ${contactId}`);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Version": "2021-07-28",
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[GHL API] Error response: ${response.status} - ${errorText}`);
    throw new Error(`GHL API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log(`[GHL API] Fetched contact:`, JSON.stringify(data.contact || data, null, 2));

  return data.contact || data;
}

async function fetchGHLContacts(
  apiKey: string,
  locationId: string,
  limit: number = 100,
  startAfter?: number,
  startAfterId?: string
): Promise<{ contacts: GHLContact[]; total: number; nextStartAfter?: number; nextStartAfterId?: string }> {
  const url = new URL("https://services.leadconnectorhq.com/contacts/");
  url.searchParams.set("locationId", locationId);
  url.searchParams.set("limit", limit.toString());
  if (startAfter !== undefined && startAfterId) {
    url.searchParams.set("startAfter", startAfter.toString());
    url.searchParams.set("startAfterId", startAfterId);
  }

  console.log(`[GHL API] Fetching contacts: limit=${limit}, startAfter=${startAfter}`);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Version": "2021-07-28",
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[GHL API] Error response: ${response.status} - ${errorText}`);
    throw new Error(`GHL API error: ${response.status} - ${errorText}`);
  }

  const data: GHLContactsResponse = await response.json();
  console.log(`[GHL API] Fetched ${data.contacts?.length || 0} contacts`);

  return {
    contacts: data.contacts || [],
    total: data.meta?.total || data.contacts?.length || 0,
    nextStartAfter: data.meta?.startAfter,
    nextStartAfterId: data.meta?.startAfterId,
  };
}

function extractCustomFieldValue(
  contact: GHLContact,
  fieldId: string
): number | null {
  if (!contact.customFields || !Array.isArray(contact.customFields)) {
    return null;
  }

  for (const field of contact.customFields) {
    // Match by field ID (primary) or key/field_key (fallback)
    const matchesId = field.id === fieldId;
    const key = field.key || field.field_key;
    const matchesKey = key === fieldId;

    if ((matchesId || matchesKey) && field.value !== null && field.value !== undefined) {
      // Parse numeric value
      if (typeof field.value === "number") {
        return field.value;
      }
      if (typeof field.value === "string") {
        const cleaned = field.value.replace(/[$,]/g, "").trim();
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? null : parsed;
      }
    }
  }

  return null;
}

// ============================================================================
// SYNC FUNCTION
// ============================================================================

async function syncContacts(
  supabase: SupabaseClient,
  apiKey: string,
  locationId: string,
  batchSize: number = 100,
  maxContacts: number = 10000
): Promise<SyncResult> {
  const result: SyncResult = {
    total_fetched: 0,
    total_updated: 0,
    contacts_with_cash: 0,
    contacts_with_deal_value: 0,
    errors: [],
  };

  let hasMore = true;
  let startAfter: number | undefined;
  let startAfterId: string | undefined;

  while (hasMore && result.total_fetched < maxContacts) {
    try {
      const fetchResult = await fetchGHLContacts(
        apiKey,
        locationId,
        batchSize,
        startAfter,
        startAfterId
      );
      const { contacts, nextStartAfter, nextStartAfterId } = fetchResult;

      if (contacts.length === 0) {
        hasMore = false;
        break;
      }

      result.total_fetched += contacts.length;

      // Process each contact
      for (const contact of contacts) {
        const cashCollected = extractCustomFieldValue(
          contact,
          CUSTOM_FIELD_IDS.CASH_COLLECTED
        );
        const dealValue = extractCustomFieldValue(
          contact,
          CUSTOM_FIELD_IDS.DEAL_VALUE
        );

        // Only update if we have revenue data
        if (cashCollected !== null || dealValue !== null) {
          const updateData: Record<string, unknown> = {
            ghl_contact_id: contact.id,
            updated_at: new Date().toISOString(),
          };

          // Update basic info
          if (contact.firstName) updateData.first_name = contact.firstName;
          if (contact.lastName) updateData.last_name = contact.lastName;
          if (contact.email) updateData.email = contact.email;
          if (contact.phone) updateData.phone = contact.phone;

          // Update revenue fields
          if (cashCollected !== null) {
            updateData.cash_collected = cashCollected;
            result.contacts_with_cash++;
          }
          if (dealValue !== null) {
            updateData.deal_value = dealValue;
            result.contacts_with_deal_value++;
          }

          // Upsert to database
          const { error } = await supabase
            .from("contacts")
            .upsert(updateData, { onConflict: "ghl_contact_id" });

          if (error) {
            console.error(`[Sync] Error updating contact ${contact.id}:`, error);
            result.errors.push(`Contact ${contact.id}: ${error.message}`);
          } else {
            result.total_updated++;
            console.log(`[Sync] Updated contact ${contact.id}: cash=${cashCollected}, deal=${dealValue}`);
          }
        }
      }

      // Check if there are more contacts
      startAfter = nextStartAfter;
      startAfterId = nextStartAfterId;
      hasMore = contacts.length === batchSize && nextStartAfter !== undefined && nextStartAfterId !== undefined;

      // Rate limiting - wait between batches
      if (hasMore) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    } catch (error) {
      console.error(`[Sync] Batch error:`, error);
      result.errors.push(`Batch error: ${error instanceof Error ? error.message : String(error)}`);
      // Stop on error since we can't continue without pagination info
      hasMore = false;
    }
  }

  return result;
}

// ============================================================================
// MAIN REQUEST HANDLER
// ============================================================================

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Only allow POST and GET
  if (req.method !== "POST" && req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const ghlApiKey = Deno.env.get("GHL_API_KEY");
    const ghlLocationId = Deno.env.get("GHL_LOCATION_ID");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error: Missing Supabase credentials" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!ghlApiKey || !ghlLocationId) {
      console.error("Missing GHL environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error: Missing GHL credentials" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body for options
    let options: { batchSize?: number; maxContacts?: number; contactId?: string; scanRevenue?: boolean } = {};
    if (req.method === "POST") {
      try {
        options = await req.json();
      } catch {
        // Use defaults if no body provided
      }
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // If scanRevenue mode, find all contacts with revenue data and sync them
    if (options.scanRevenue) {
      console.log(`[Sync] Scanning for all contacts with revenue data...`);

      const revenueContacts: Array<{
        id: string;
        name: string;
        cash_collected: number | null;
        deal_value: number | null;
      }> = [];

      const batchSize = 100;
      const maxPages = 30; // Limit to 3000 contacts
      let page = 0;
      let startAfter: number | undefined;
      let startAfterId: string | undefined;

      while (page < maxPages) {
        const result = await fetchGHLContacts(ghlApiKey, ghlLocationId, batchSize, startAfter, startAfterId);
        const { contacts, nextStartAfter, nextStartAfterId } = result;

        if (contacts.length === 0) break;

        for (const contact of contacts) {
          const cashCollected = extractCustomFieldValue(contact, CUSTOM_FIELD_IDS.CASH_COLLECTED);
          const dealValue = extractCustomFieldValue(contact, CUSTOM_FIELD_IDS.DEAL_VALUE);

          if (cashCollected !== null || dealValue !== null) {
            revenueContacts.push({
              id: contact.id,
              name: `${contact.firstName || ""} ${contact.lastName || ""}`.trim(),
              cash_collected: cashCollected,
              deal_value: dealValue,
            });

            // Sync to database
            const updateData: Record<string, unknown> = {
              ghl_contact_id: contact.id,
              updated_at: new Date().toISOString(),
            };
            if (contact.firstName) updateData.first_name = contact.firstName;
            if (contact.lastName) updateData.last_name = contact.lastName;
            if (contact.email) updateData.email = contact.email;
            if (contact.phone) updateData.phone = contact.phone;
            if (cashCollected !== null) updateData.cash_collected = cashCollected;
            if (dealValue !== null) updateData.deal_value = dealValue;

            await supabase.from("contacts").upsert(updateData, { onConflict: "ghl_contact_id" });
          }
        }

        console.log(`[Sync] Page ${page + 1}: Found ${revenueContacts.length} contacts with revenue so far...`);

        // Update pagination for next page
        startAfter = nextStartAfter;
        startAfterId = nextStartAfterId;
        page++;

        if (contacts.length < batchSize || !nextStartAfter || !nextStartAfterId) break;

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      console.log(`[Sync] Scan complete. Found ${revenueContacts.length} contacts with revenue.`);

      return new Response(
        JSON.stringify({
          success: true,
          total_found: revenueContacts.length,
          contacts: revenueContacts,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If contactId is provided, sync just that one contact
    if (options.contactId) {
      console.log(`[Sync] Fetching single contact: ${options.contactId}`);

      const contact = await fetchSingleGHLContact(ghlApiKey, options.contactId);

      if (!contact) {
        return new Response(
          JSON.stringify({ error: "Contact not found", contactId: options.contactId }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const cashCollected = extractCustomFieldValue(contact, CUSTOM_FIELD_IDS.CASH_COLLECTED);
      const dealValue = extractCustomFieldValue(contact, CUSTOM_FIELD_IDS.DEAL_VALUE);

      // Log all custom fields for debugging
      console.log(`[Sync] Contact custom fields:`, JSON.stringify(contact.customFields, null, 2));
      console.log(`[Sync] Extracted cash_collected: ${cashCollected}, deal_value: ${dealValue}`);

      const updateData: Record<string, unknown> = {
        ghl_contact_id: contact.id,
        updated_at: new Date().toISOString(),
      };

      if (contact.firstName) updateData.first_name = contact.firstName;
      if (contact.lastName) updateData.last_name = contact.lastName;
      if (contact.email) updateData.email = contact.email;
      if (contact.phone) updateData.phone = contact.phone;

      if (cashCollected !== null) updateData.cash_collected = cashCollected;
      if (dealValue !== null) updateData.deal_value = dealValue;

      const { error } = await supabase
        .from("contacts")
        .upsert(updateData, { onConflict: "ghl_contact_id" });

      if (error) {
        console.error(`[Sync] Error updating contact:`, error);
        return new Response(
          JSON.stringify({ error: "Failed to update contact", details: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          contact: {
            id: contact.id,
            name: `${contact.firstName || ""} ${contact.lastName || ""}`.trim(),
            email: contact.email,
            phone: contact.phone,
            cash_collected: cashCollected,
            deal_value: dealValue,
            all_custom_fields: contact.customFields,
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Otherwise, run bulk sync
    const batchSize = options.batchSize || 100;
    const maxContacts = options.maxContacts || 10000;

    console.log(`[Sync] Starting sync with batchSize=${batchSize}, maxContacts=${maxContacts}`);

    // Run sync
    const result = await syncContacts(
      supabase,
      ghlApiKey,
      ghlLocationId,
      batchSize,
      maxContacts
    );

    console.log(`[Sync] Complete:`, result);

    return new Response(
      JSON.stringify({
        success: true,
        ...result,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Sync error:", error);

    return new Response(
      JSON.stringify({
        error: "Sync failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
