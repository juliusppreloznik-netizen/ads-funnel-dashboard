// supabase/functions/gohighlevel-webhook/index.ts
// Comprehensive GoHighLevel webhook handler for contact-level tracking

import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";
import { parse, isValid } from "npm:date-fns@3.3.1";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// Calendar names for qualification status (matched by name, not ID)
const CALENDAR_NAMES = {
  QUALIFIED: "Scaling Blueprint Call.", // with period at end
  DQ: "Scaling Blueprint Call*", // with asterisk at end
} as const;

// Event types we handle
type EventType =
  | "form_submission"
  | "contact_create"
  | "appointment_booked"
  | "appointment_create"
  | "appointment_update"
  | "appointment_status"
  | "pipeline_stage_changed"
  | "opportunity_stage_update"
  | "deal_closed"
  | "opportunity_status_update";

// GoHighLevel contact object structure
interface GHLContact {
  id?: string;
  contact_id?: string;
  contactId?: string;
  first_name?: string;
  firstName?: string;
  last_name?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  // Custom fields (can be nested in customFields or customField)
  customFields?: Record<string, unknown>;
  customField?: Record<string, unknown>;
  // Attribution fields stored as custom fields
  ad_id?: string;
  ad_name?: string;
  campaign_id?: string;
  campaign_name?: string;
  adset_id?: string;
  adset_name?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  // Custom form fields
  revenue?: string | number;
  investment_ability?: string | number;
  investmentAbility?: string | number;
  deal_value?: string | number;
  dealValue?: string | number;
  scaling_challenge?: string;
  scalingChallenge?: string;
  [key: string]: unknown;
}

// Appointment/Calendar object structure
interface GHLAppointment {
  id?: string;
  appointmentId?: string;
  calendarId?: string;
  calendar_id?: string;
  calendarName?: string;
  calendar_name?: string;
  name?: string; // Calendar name at root level (payload.calendar.name)
  status?: string;
  appointmentStatus?: string;
  startTime?: string;
  start_time?: string;
  selectedTimezone?: string;
  [key: string]: unknown;
}

// Opportunity/Pipeline object structure
interface GHLOpportunity {
  id?: string;
  opportunityId?: string;
  pipelineId?: string;
  pipeline_id?: string;
  pipelineName?: string;
  pipeline_name?: string;
  stageId?: string;
  stage_id?: string;
  stageName?: string;
  stage_name?: string;
  status?: string;
  monetaryValue?: number | string;
  monetary_value?: number | string;
  [key: string]: unknown;
}

// Main webhook payload structure
interface GHLWebhookPayload {
  // Event identification
  type?: string;
  event?: string;
  event_type?: string;
  eventType?: string;
  workflow_name?: string;
  workflowName?: string;

  // Contact data
  contact?: GHLContact;
  contact_id?: string;
  contactId?: string;

  // Appointment data
  appointment?: GHLAppointment;
  calendar?: GHLAppointment;
  calendarId?: string;
  calendar_id?: string;

  // Opportunity/Pipeline data
  opportunity?: GHLOpportunity;
  pipeline?: GHLOpportunity;

  // Direct fields (sometimes sent at root level)
  ad_id?: string;
  adId?: string;
  cash_collected?: number | string;
  cashCollected?: number | string;
  amount?: number | string;
  monetaryValue?: number | string;
  monetary_value?: number | string;

  // Custom data containers
  customData?: Record<string, unknown>;
  custom_data?: Record<string, unknown>;

  // Full payload for logging
  [key: string]: unknown;
}

// Contact record for database
interface ContactRecord {
  ghl_contact_id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  // Attribution
  ad_id?: string | null;
  ad_name?: string | null;
  campaign_id?: string | null;
  campaign_name?: string | null;
  adset_id?: string | null;
  adset_name?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  fbclid?: string | null;
  // Custom fields
  revenue?: number | null;
  investment_ability?: number | null;
  deal_value?: number | null;
  scaling_challenge?: string | null;
  // Pipeline
  current_pipeline?: string | null;
  current_stage?: string | null;
  pipeline_stage_history?: object[];
  // Calendar
  calendar_id?: string | null;
  calendar_name?: string | null;
  is_qualified?: boolean | null;
  // Timestamps
  form_submitted_at?: string | null;
  call_booked_at?: string | null;
  call_scheduled_for?: string | null;
  showed_up_at?: string | null;
  no_show_at?: string | null;
  qualified_at?: string | null;
  disqualified_at?: string | null;
  deal_closed_at?: string | null;
  // Financial
  final_deal_value?: number | null;
  // Metadata
  updated_at?: string;
}

// Event record for backward compatibility
interface EventRecord {
  contact_id: string;
  event_type: string;
  ad_id: string | null;
  cash_collected: number | null;
  calendar_type: string | null;
  revenue: string | null;
  investment_ability: string | null;
  raw_payload: Record<string, unknown>;
  created_at: string;
}

// Pipeline stage history entry
interface PipelineStageEntry {
  pipeline: string;
  stage: string;
  timestamp: string;
}

// ============================================================================
// CORS HEADERS
// ============================================================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey, x-webhook-secret",
};

// ============================================================================
// WEBHOOK SECRET VERIFICATION
// ============================================================================

/**
 * Verify webhook secret from header or query parameter
 * GoHighLevel doesn't send Supabase auth headers, so we use a custom secret
 *
 * NOTE: This function is currently disabled. Uncomment the verification block
 * in the main handler and this function to re-enable webhook authentication.
 */
// function verifyWebhookSecret(req: Request): { valid: boolean; error?: string } {
//   const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
//
//   // If no secret is configured, log warning but allow requests (for development)
//   if (!webhookSecret) {
//     console.warn("[Security] WEBHOOK_SECRET not configured - allowing all requests");
//     return { valid: true };
//   }
//
//   // Check x-webhook-secret header first
//   const headerSecret = req.headers.get("x-webhook-secret");
//   if (headerSecret === webhookSecret) {
//     return { valid: true };
//   }
//
//   // Check query parameter as fallback
//   try {
//     const url = new URL(req.url);
//     const querySecret = url.searchParams.get("secret");
//     if (querySecret === webhookSecret) {
//       return { valid: true };
//     }
//   } catch {
//     // URL parsing failed, continue to reject
//   }
//
//   // No valid secret found
//   console.error("[Security] Invalid or missing webhook secret");
//   return {
//     valid: false,
//     error: "Unauthorized: Invalid or missing webhook secret",
//   };
// }

// ============================================================================
// HELPER FUNCTIONS - Data Sanitization
// ============================================================================

/**
 * Sanitize timestamp values to ensure they're either valid ISO strings or null
 * Converts empty strings, "null", "undefined" to actual null
 */
function sanitizeTimestamp(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined" || trimmed === "") {
    return null;
  }

  return trimmed;
}

/**
 * Sanitize a contact record, ensuring all timestamp fields are valid
 * Also removes undefined values
 */
function sanitizeContactRecord(record: Record<string, unknown>): Record<string, unknown> {
  const timestampFields = [
    "form_submitted_at",
    "call_booked_at",
    "call_scheduled_for",
    "showed_up_at",
    "no_show_at",
    "qualified_at",
    "disqualified_at",
    "deal_closed_at",
    "updated_at",
  ];

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(record)) {
    // Skip undefined values
    if (value === undefined) continue;

    // Sanitize timestamp fields
    if (timestampFields.includes(key)) {
      const sanitizedValue = sanitizeTimestamp(value);
      // Only include if not null (to avoid overwriting existing data with null)
      // Unless we explicitly want to set it (value was a valid timestamp)
      if (sanitizedValue !== null) {
        sanitized[key] = sanitizedValue;
      }
    } else {
      // For non-timestamp fields, just include if not undefined
      sanitized[key] = value;
    }
  }

  return sanitized;
}

// ============================================================================
// HELPER FUNCTIONS - Date Parsing
// ============================================================================

/**
 * Parse human-readable date strings from GoHighLevel to ISO 8601 format
 * Handles formats like:
 * - "Saturday, January 31, 2026 2:00 PM" (from appointment.start_time)
 * - "2026-01-31T11:29:50.606" (ISO format)
 * - "2026-01-31T11:29:50.606Z" (ISO with Z)
 */
function parseHumanReadableDate(dateString: string | null | undefined): string | null {
  if (!dateString) return null;

  try {
    // If it's already in ISO format with Z, return as-is
    if (dateString.includes("T") && dateString.endsWith("Z")) {
      return dateString;
    }

    // If it's already in ISO format without Z, add Z
    if (dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      return dateString.endsWith("Z") ? dateString : `${dateString}Z`;
    }

    // Try to parse human-readable format: "Saturday, January 31, 2026 2:00 PM"
    // Remove day of week if present (e.g., "Saturday, ")
    let cleanedDate = dateString;
    const dayOfWeekMatch = dateString.match(/^[A-Za-z]+,\s*/);
    if (dayOfWeekMatch) {
      cleanedDate = dateString.slice(dayOfWeekMatch[0].length);
    }

    // Try multiple parsing formats
    const formats = [
      "MMMM d, yyyy h:mm a",      // "January 31, 2026 2:00 PM"
      "MMMM d, yyyy h:mm:ss a",   // "January 31, 2026 2:00:00 PM"
      "MMMM dd, yyyy h:mm a",     // "January 31, 2026 2:00 PM" (with leading zero)
      "MMM d, yyyy h:mm a",       // "Jan 31, 2026 2:00 PM"
      "MM/dd/yyyy h:mm a",        // "01/31/2026 2:00 PM"
      "yyyy-MM-dd HH:mm:ss",      // "2026-01-31 14:00:00"
    ];

    for (const formatStr of formats) {
      try {
        const parsedDate = parse(cleanedDate, formatStr, new Date());
        if (isValid(parsedDate)) {
          const isoString = parsedDate.toISOString();
          console.log(`[Date Parsing] Successfully parsed "${dateString}" -> "${isoString}" using format "${formatStr}"`);
          return isoString;
        }
      } catch {
        // Try next format
      }
    }

    // If all parsing attempts fail, try native Date constructor as last resort
    const nativeDate = new Date(dateString);
    if (isValid(nativeDate)) {
      const isoString = nativeDate.toISOString();
      console.log(`[Date Parsing] Parsed "${dateString}" -> "${isoString}" using native Date`);
      return isoString;
    }

    console.error(`[Date Parsing] Failed to parse date: "${dateString}"`);
    return null;
  } catch (error) {
    console.error(`[Date Parsing] Error parsing date "${dateString}":`, error);
    return null;
  }
}

// ============================================================================
// HELPER FUNCTIONS - Data Extraction
// ============================================================================

function extractContactId(payload: GHLWebhookPayload): string | null {
  // Check nested contact object first
  const contact = payload.contact;
  if (contact) {
    if (contact.id) return contact.id;
    if (contact.contact_id) return contact.contact_id;
    if (contact.contactId) return contact.contactId;
  }

  // Check root level
  if (payload.contact_id) return payload.contact_id;
  if (payload.contactId) return payload.contactId;

  return null;
}

function extractEventType(payload: GHLWebhookPayload): string | null {
  // Normalize event type to our standard format
  const rawType =
    payload.type ||
    payload.event ||
    payload.event_type ||
    payload.eventType ||
    payload.workflow_name ||
    payload.workflowName;

  if (!rawType) return null;

  const normalized = rawType.toLowerCase().replace(/[\s-]/g, "_");

  // Map common variations to standard types
  const typeMap: Record<string, EventType> = {
    contactcreate: "contact_create",
    contact_create: "contact_create",
    form_submission: "form_submission",
    formsubmission: "form_submission",
    appointmentcreate: "appointment_booked",
    appointment_create: "appointment_booked",
    appointment_booked: "appointment_booked",
    call_booked: "appointment_booked",
    appointmentupdate: "appointment_update",
    appointment_update: "appointment_update",
    appointment_status: "appointment_status",
    opportunitystageupdate: "pipeline_stage_changed",
    opportunity_stage_update: "pipeline_stage_changed",
    pipeline_stage_changed: "pipeline_stage_changed",
    stage_changed: "pipeline_stage_changed",
    opportunitystatusupdate: "deal_closed",
    opportunity_status_update: "deal_closed",
    deal_closed: "deal_closed",
    deal_won: "deal_closed",
  };

  return typeMap[normalized] || rawType;
}

function extractContactData(payload: GHLWebhookPayload): Partial<ContactRecord> {
  const contact = payload.contact || {};
  const customFields = contact.customFields || contact.customField || {};
  const customData = payload.customData || payload.custom_data || {};

  // Helper to get value from multiple sources
  const getValue = (keys: string[]): string | null => {
    for (const key of keys) {
      const val =
        (contact as Record<string, unknown>)[key] ||
        (customFields as Record<string, unknown>)[key] ||
        (customData as Record<string, unknown>)[key] ||
        (payload as Record<string, unknown>)[key];
      if (val !== undefined && val !== null && val !== "") {
        return String(val);
      }
    }
    return null;
  };

  // Helper to parse numeric values
  const getNumericValue = (keys: string[]): number | null => {
    const val = getValue(keys);
    if (!val) return null;
    const cleaned = val.replace(/[$,]/g, "").trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  };

  return {
    first_name: getValue(["first_name", "firstName"]),
    last_name: getValue(["last_name", "lastName"]),
    email: getValue(["email"]),
    phone: getValue(["phone"]),
    // Attribution
    ad_id: getValue(["ad_id", "adId"]),
    ad_name: getValue(["ad_name", "adName"]),
    campaign_id: getValue(["campaign_id", "campaignId"]),
    campaign_name: getValue(["campaign_name", "campaignName"]),
    adset_id: getValue(["adset_id", "adsetId"]),
    adset_name: getValue(["adset_name", "adsetName"]),
    utm_source: getValue(["utm_source", "utmSource"]),
    utm_medium: getValue(["utm_medium", "utmMedium"]),
    utm_campaign: getValue(["utm_campaign", "utmCampaign"]),
    utm_content: getValue(["utm_content", "utmContent"]),
    utm_term: getValue(["utm_term", "utmTerm"]),
    fbclid: getValue(["fbclid"]),
    // Custom fields
    revenue: getNumericValue(["revenue"]),
    investment_ability: getNumericValue(["investment_ability", "investmentAbility"]),
    deal_value: getNumericValue(["deal_value", "dealValue"]),
    scaling_challenge: getValue(["scaling_challenge", "scalingChallenge"]),
  };
}

function extractAppointmentData(payload: GHLWebhookPayload): {
  calendarId: string | null;
  calendarName: string | null;
  isQualified: boolean | null;
  startTime: string | null;
  status: string | null;
  selectedTimezone: string | null;
} {
  const appointment = payload.appointment || {};
  const calendar = payload.calendar || {};

  const calendarId =
    (calendar as GHLAppointment).calendarId ||
    (calendar as GHLAppointment).calendar_id ||
    (appointment as GHLAppointment).calendarId ||
    (appointment as GHLAppointment).calendar_id ||
    payload.calendarId ||
    payload.calendar_id ||
    null;

  // Extract calendar name - check payload.calendar.name first (GHL's actual structure)
  const calendarName =
    (calendar as GHLAppointment).name || // payload.calendar.name (primary)
    (appointment as GHLAppointment).calendar_name || // fallback
    (appointment as GHLAppointment).calendarName || // fallback
    null;

  // Determine qualification based on calendar NAME (not ID)
  let isQualified: boolean | null = null;
  if (calendarName) {
    if (calendarName === CALENDAR_NAMES.QUALIFIED) {
      isQualified = true;
      console.log(`[Appointment] Calendar "${calendarName}" matched as QUALIFIED`);
    } else if (calendarName === CALENDAR_NAMES.DQ) {
      isQualified = false;
      console.log(`[Appointment] Calendar "${calendarName}" matched as DQ`);
    } else {
      console.log(`[Appointment] Calendar "${calendarName}" did not match known calendars`);
    }
  }

  // Extract start time - this is often in human-readable format from GHL
  const startTime =
    (appointment as GHLAppointment).startTime ||
    (appointment as GHLAppointment).start_time ||
    null;

  const status =
    (appointment as GHLAppointment).status ||
    (appointment as GHLAppointment).appointmentStatus ||
    null;

  const selectedTimezone =
    (appointment as GHLAppointment).selectedTimezone ||
    null;

  console.log(`[Appointment] Extracted start_time: "${startTime}" (timezone: ${selectedTimezone})`);

  return { calendarId, calendarName, isQualified, startTime, status, selectedTimezone };
}

function extractOpportunityData(payload: GHLWebhookPayload): {
  pipelineName: string | null;
  stageName: string | null;
  status: string | null;
  monetaryValue: number | null;
} {
  const opportunity = payload.opportunity || payload.pipeline || {};

  const pipelineName =
    (opportunity as GHLOpportunity).pipelineName ||
    (opportunity as GHLOpportunity).pipeline_name ||
    null;

  const stageName =
    (opportunity as GHLOpportunity).stageName ||
    (opportunity as GHLOpportunity).stage_name ||
    null;

  const status = (opportunity as GHLOpportunity).status || null;

  // Extract monetary value
  let monetaryValue: number | null = null;
  const rawValue =
    (opportunity as GHLOpportunity).monetaryValue ||
    (opportunity as GHLOpportunity).monetary_value ||
    payload.monetaryValue ||
    payload.monetary_value ||
    payload.cash_collected ||
    payload.cashCollected ||
    payload.amount;

  if (rawValue !== undefined && rawValue !== null) {
    if (typeof rawValue === "number") {
      monetaryValue = rawValue;
    } else if (typeof rawValue === "string") {
      const cleaned = rawValue.replace(/[$,]/g, "").trim();
      const parsed = parseFloat(cleaned);
      monetaryValue = isNaN(parsed) ? null : parsed;
    }
  }

  return { pipelineName, stageName, status, monetaryValue };
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

async function handleFormSubmission(
  supabase: SupabaseClient,
  contactId: string,
  payload: GHLWebhookPayload
): Promise<{ contact: ContactRecord | null; error: Error | null }> {
  console.log(`[Form Submission] Processing for contact: ${contactId}`);

  const contactData = extractContactData(payload);
  const now = new Date().toISOString();

  const contactRecord: Record<string, unknown> = {
    ghl_contact_id: contactId,
    ...contactData,
    form_submitted_at: now,
    updated_at: now,
  };

  // Sanitize record: remove undefined values and validate timestamps
  const cleanRecord = sanitizeContactRecord(contactRecord);

  console.log(`[Form Submission] Upserting contact record:`, JSON.stringify(cleanRecord, null, 2));

  const { data, error } = await supabase
    .from("contacts")
    .upsert(cleanRecord, { onConflict: "ghl_contact_id" })
    .select()
    .single();

  if (error) {
    console.error(`[Form Submission] Error upserting contact:`, error);
    return { contact: null, error: new Error(error.message) };
  }

  console.log(`[Form Submission] Successfully upserted contact:`, data?.ghl_contact_id);
  return { contact: data, error: null };
}

async function handleAppointmentBooked(
  supabase: SupabaseClient,
  contactId: string,
  payload: GHLWebhookPayload
): Promise<{ contact: ContactRecord | null; error: Error | null }> {
  console.log(`[Appointment Booked] Processing for contact: ${contactId}`);

  const appointmentData = extractAppointmentData(payload);
  const contactData = extractContactData(payload);
  const now = new Date().toISOString();

  // Parse the human-readable start time to ISO 8601 format
  const callScheduledFor = parseHumanReadableDate(appointmentData.startTime);
  console.log(`[Appointment Booked] Parsed call_scheduled_for: "${callScheduledFor}" (from: "${appointmentData.startTime}")`);

  // Only update appointment-specific fields - DO NOT spread contactData
  // to avoid overwriting UTM attribution data with NULL values
  const updateData: Record<string, unknown> = {
    ghl_contact_id: contactId,
    // Basic contact info (safe to update)
    first_name: contactData.first_name,
    last_name: contactData.last_name,
    email: contactData.email,
    phone: contactData.phone,
    // Appointment-specific fields
    calendar_id: appointmentData.calendarId,
    calendar_name: appointmentData.calendarName,
    is_qualified: appointmentData.isQualified,
    call_booked_at: now,
    call_scheduled_for: callScheduledFor, // Use parsed ISO date
    updated_at: now,
  };

  // Only include UTM/attribution fields if they are present in the payload (not null/undefined)
  // This preserves existing attribution data from form submission
  if (contactData.ad_id) updateData.ad_id = contactData.ad_id;
  if (contactData.ad_name) updateData.ad_name = contactData.ad_name;
  if (contactData.campaign_id) updateData.campaign_id = contactData.campaign_id;
  if (contactData.campaign_name) updateData.campaign_name = contactData.campaign_name;
  if (contactData.adset_id) updateData.adset_id = contactData.adset_id;
  if (contactData.adset_name) updateData.adset_name = contactData.adset_name;
  if (contactData.utm_source) updateData.utm_source = contactData.utm_source;
  if (contactData.utm_medium) updateData.utm_medium = contactData.utm_medium;
  if (contactData.utm_campaign) updateData.utm_campaign = contactData.utm_campaign;
  if (contactData.utm_content) updateData.utm_content = contactData.utm_content;
  if (contactData.utm_term) updateData.utm_term = contactData.utm_term;
  if (contactData.fbclid) updateData.fbclid = contactData.fbclid;

  // Only include custom fields if present
  if (contactData.revenue) updateData.revenue = contactData.revenue;
  if (contactData.investment_ability) updateData.investment_ability = contactData.investment_ability;
  if (contactData.deal_value) updateData.deal_value = contactData.deal_value;
  if (contactData.scaling_challenge) updateData.scaling_challenge = contactData.scaling_challenge;

  // Set qualification timestamp
  if (appointmentData.isQualified === true) {
    updateData.qualified_at = now;
  } else if (appointmentData.isQualified === false) {
    updateData.disqualified_at = now;
  }

  // Sanitize record: remove undefined values and validate timestamps
  const cleanRecord = sanitizeContactRecord(updateData);

  console.log(`[Appointment Booked] Upserting contact:`, JSON.stringify(cleanRecord, null, 2));

  const { data, error } = await supabase
    .from("contacts")
    .upsert(cleanRecord, { onConflict: "ghl_contact_id" })
    .select()
    .single();

  if (error) {
    console.error(`[Appointment Booked] Error upserting contact:`, error);
    return { contact: null, error: new Error(error.message) };
  }

  console.log(`[Appointment Booked] Successfully updated contact:`, data?.ghl_contact_id);
  return { contact: data, error: null };
}

async function handleAppointmentStatusChange(
  supabase: SupabaseClient,
  contactId: string,
  payload: GHLWebhookPayload
): Promise<{ contact: ContactRecord | null; error: Error | null }> {
  console.log(`[Appointment Status] Processing for contact: ${contactId}`);

  const appointmentData = extractAppointmentData(payload);
  const status = appointmentData.status?.toLowerCase();
  const now = new Date().toISOString();

  const updateData: Record<string, unknown> = {
    ghl_contact_id: contactId,
    updated_at: now,
  };

  // Determine showed up vs no-show based on status
  if (status === "showed" || status === "completed" || status === "confirmed") {
    updateData.showed_up_at = now;
    console.log(`[Appointment Status] Marking as showed up`);
  } else if (status === "noshow" || status === "no_show" || status === "no-show" || status === "cancelled") {
    updateData.no_show_at = now;
    console.log(`[Appointment Status] Marking as no-show`);
  } else {
    console.log(`[Appointment Status] Unknown status: ${status}, skipping timestamp update`);
  }

  // Sanitize record: remove undefined values and validate timestamps
  const cleanRecord = sanitizeContactRecord(updateData);

  const { data, error } = await supabase
    .from("contacts")
    .upsert(cleanRecord, { onConflict: "ghl_contact_id" })
    .select()
    .single();

  if (error) {
    console.error(`[Appointment Status] Error updating contact:`, error);
    return { contact: null, error: new Error(error.message) };
  }

  console.log(`[Appointment Status] Successfully updated contact:`, data?.ghl_contact_id);
  return { contact: data, error: null };
}

async function handlePipelineStageChange(
  supabase: SupabaseClient,
  contactId: string,
  payload: GHLWebhookPayload
): Promise<{ contact: ContactRecord | null; error: Error | null }> {
  console.log(`[Pipeline Stage] Processing for contact: ${contactId}`);

  const opportunityData = extractOpportunityData(payload);
  const contactData = extractContactData(payload);
  const now = new Date().toISOString();

  // First, fetch existing contact to check for attribution and get stage history
  const { data: existingContact, error: fetchError } = await supabase
    .from("contacts")
    .select("ghl_contact_id, email, phone, ad_id, pipeline_stage_history")
    .eq("ghl_contact_id", contactId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error(`[Pipeline Stage] Error fetching existing contact:`, fetchError);
  }

  // CRITICAL FIX: If this contact doesn't have ad attribution, try to find
  // a duplicate contact with the same email/phone that DOES have attribution
  let targetContactId = contactId;
  let targetHistory = (existingContact?.pipeline_stage_history as PipelineStageEntry[]) || [];

  if (existingContact && !existingContact.ad_id) {
    const email = existingContact.email || contactData.email;
    const phone = existingContact.phone || contactData.phone;

    console.log(`[Pipeline Stage] Contact ${contactId} has no attribution. Searching for attributed duplicate...`);
    console.log(`[Pipeline Stage] Search criteria - email: ${email}, phone: ${phone}`);

    // Try to find a contact with the same email/phone that HAS ad_id
    let attributedContact = null;

    if (email) {
      const { data: emailMatch } = await supabase
        .from("contacts")
        .select("ghl_contact_id, ad_id, pipeline_stage_history")
        .eq("email", email)
        .not("ad_id", "is", null)
        .neq("ghl_contact_id", contactId)
        .limit(1)
        .single();

      if (emailMatch) {
        attributedContact = emailMatch;
        console.log(`[Pipeline Stage] Found attributed contact by email: ${emailMatch.ghl_contact_id} (ad_id: ${emailMatch.ad_id})`);
      }
    }

    if (!attributedContact && phone) {
      const { data: phoneMatch } = await supabase
        .from("contacts")
        .select("ghl_contact_id, ad_id, pipeline_stage_history")
        .eq("phone", phone)
        .not("ad_id", "is", null)
        .neq("ghl_contact_id", contactId)
        .limit(1)
        .single();

      if (phoneMatch) {
        attributedContact = phoneMatch;
        console.log(`[Pipeline Stage] Found attributed contact by phone: ${phoneMatch.ghl_contact_id} (ad_id: ${phoneMatch.ad_id})`);
      }
    }

    if (attributedContact) {
      // Update the attributed contact instead
      targetContactId = attributedContact.ghl_contact_id;
      targetHistory = (attributedContact.pipeline_stage_history as PipelineStageEntry[]) || [];
      console.log(`[Pipeline Stage] Will update attributed contact ${targetContactId} instead of ${contactId}`);
    } else {
      console.log(`[Pipeline Stage] No attributed duplicate found, updating original contact ${contactId}`);
    }
  }

  // Build stage history entry
  const stageEntry: PipelineStageEntry = {
    pipeline: opportunityData.pipelineName || "Unknown",
    stage: opportunityData.stageName || "Unknown",
    timestamp: now,
  };

  const updatedHistory = [...targetHistory, stageEntry];

  const updateData: Record<string, unknown> = {
    ghl_contact_id: targetContactId,
    current_pipeline: opportunityData.pipelineName,
    current_stage: opportunityData.stageName,
    pipeline_stage_history: updatedHistory,
    updated_at: now,
  };

  // Handle specific stage transitions
  const stageName = opportunityData.stageName?.toLowerCase() || "";

  // No-show stages
  if (stageName === "appointment no-show" || stageName === "appointment no show") {
    updateData.no_show_at = now;
    console.log(`[Pipeline Stage] Stage "${opportunityData.stageName}" - setting no_show_at`);
  }

  // Show stages - these indicate the contact showed up for their appointment
  if (
    stageName === "follow-up high intent" ||
    stageName === "follow up high intent" ||
    stageName === "appointment show" ||
    stageName === "appointment showed" ||
    stageName === "showed up"
  ) {
    updateData.showed_up_at = now;
    console.log(`[Pipeline Stage] Stage "${opportunityData.stageName}" - setting showed_up_at`);
  }

  // Deal closed stage
  if (stageName === "deal closed") {
    updateData.deal_closed_at = now;

    // Get deal value from contact's custom field (not opportunity.monetary_value)
    const dealValue = contactData.deal_value;
    if (dealValue !== null && dealValue !== undefined) {
      updateData.final_deal_value = dealValue;
      console.log(`[Pipeline Stage] Stage "${opportunityData.stageName}" - setting deal_closed_at with value: ${dealValue}`);
    } else {
      console.log(`[Pipeline Stage] Stage "${opportunityData.stageName}" - setting deal_closed_at (no deal_value found)`);
    }
  }

  // Sanitize record: remove undefined values and validate timestamps
  const cleanRecord = sanitizeContactRecord(updateData);

  console.log(`[Pipeline Stage] Upserting contact ${targetContactId} with stage: ${opportunityData.stageName}`);

  const { data, error } = await supabase
    .from("contacts")
    .upsert(cleanRecord, { onConflict: "ghl_contact_id" })
    .select()
    .single();

  if (error) {
    console.error(`[Pipeline Stage] Error updating contact:`, error);
    return { contact: null, error: new Error(error.message) };
  }

  // Also update the original contact (without attribution) with the same stage info
  // to keep both records in sync
  if (targetContactId !== contactId) {
    console.log(`[Pipeline Stage] Also updating original contact ${contactId} with stage info`);
    const originalUpdateData: Record<string, unknown> = {
      ghl_contact_id: contactId,
      current_pipeline: opportunityData.pipelineName,
      current_stage: opportunityData.stageName,
      updated_at: now,
    };

    // Copy the timestamp fields to the original contact too
    if (updateData.no_show_at) originalUpdateData.no_show_at = updateData.no_show_at;
    if (updateData.showed_up_at) originalUpdateData.showed_up_at = updateData.showed_up_at;
    if (updateData.deal_closed_at) originalUpdateData.deal_closed_at = updateData.deal_closed_at;
    if (updateData.final_deal_value) originalUpdateData.final_deal_value = updateData.final_deal_value;

    const cleanOriginalRecord = sanitizeContactRecord(originalUpdateData);
    await supabase.from("contacts").upsert(cleanOriginalRecord, { onConflict: "ghl_contact_id" });
  }

  console.log(`[Pipeline Stage] Successfully updated contact:`, data?.ghl_contact_id);
  return { contact: data, error: null };
}

async function handleDealClosed(
  supabase: SupabaseClient,
  contactId: string,
  payload: GHLWebhookPayload
): Promise<{ contact: ContactRecord | null; error: Error | null }> {
  console.log(`[Deal Closed] Processing for contact: ${contactId}`);

  const opportunityData = extractOpportunityData(payload);
  const now = new Date().toISOString();

  // First, fetch existing contact to get current stage history
  const { data: existingContact, error: fetchError } = await supabase
    .from("contacts")
    .select("pipeline_stage_history")
    .eq("ghl_contact_id", contactId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error(`[Deal Closed] Error fetching existing contact:`, fetchError);
  }

  // Add "Deal Closed" to stage history
  const stageEntry: PipelineStageEntry = {
    pipeline: opportunityData.pipelineName || "Unknown",
    stage: "Deal Closed",
    timestamp: now,
  };

  const existingHistory = (existingContact?.pipeline_stage_history as PipelineStageEntry[]) || [];
  const updatedHistory = [...existingHistory, stageEntry];

  const updateData: Record<string, unknown> = {
    ghl_contact_id: contactId,
    current_pipeline: opportunityData.pipelineName,
    current_stage: "Deal Closed",
    pipeline_stage_history: updatedHistory,
    deal_closed_at: now,
    final_deal_value: opportunityData.monetaryValue,
    updated_at: now,
  };

  // Sanitize record: remove undefined values and validate timestamps
  const cleanRecord = sanitizeContactRecord(updateData);

  console.log(`[Deal Closed] Upserting contact with value: ${opportunityData.monetaryValue}`);

  const { data, error } = await supabase
    .from("contacts")
    .upsert(cleanRecord, { onConflict: "ghl_contact_id" })
    .select()
    .single();

  if (error) {
    console.error(`[Deal Closed] Error updating contact:`, error);
    return { contact: null, error: new Error(error.message) };
  }

  console.log(`[Deal Closed] Successfully updated contact:`, data?.ghl_contact_id);
  return { contact: data, error: null };
}

// ============================================================================
// BACKWARD COMPATIBILITY - Events Table
// ============================================================================

async function insertEventRecord(
  supabase: SupabaseClient,
  contactId: string,
  eventType: string,
  payload: GHLWebhookPayload
): Promise<void> {
  const contactData = extractContactData(payload);
  const opportunityData = extractOpportunityData(payload);
  const appointmentData = extractAppointmentData(payload);

  // Map event types to what the dashboard expects
  // Dashboard looks for: "booked_call", "showed_up", "deal_won"
  let dashboardEventType: string;
  switch (eventType) {
    case "appointment_booked":
    case "appointment_create":
      dashboardEventType = "booked_call";
      break;
    case "appointment_update":
    case "appointment_status":
      // Check if it's a show or no-show
      const status = appointmentData.status?.toLowerCase();
      if (status === "showed" || status === "completed" || status === "confirmed") {
        dashboardEventType = "showed_up";
      } else {
        dashboardEventType = "appointment_status"; // Keep original for tracking
      }
      break;
    case "deal_closed":
    case "opportunity_status_update":
      dashboardEventType = "deal_won";
      break;
    case "form_submission":
    case "contact_create":
      dashboardEventType = "form_submission";
      break;
    default:
      dashboardEventType = eventType;
  }

  // Determine calendar type from appointment data
  // Dashboard expects: "Qualified" or "DQ"
  let calendarType: string | null = null;
  if (appointmentData.isQualified === true) {
    calendarType = "Qualified";
  } else if (appointmentData.isQualified === false) {
    calendarType = "DQ";
  }

  const eventRecord: EventRecord = {
    contact_id: contactId,
    event_type: dashboardEventType,
    ad_id: contactData.ad_id || null,
    cash_collected: opportunityData.monetaryValue,
    calendar_type: calendarType,
    revenue: contactData.revenue?.toString() || null,
    investment_ability: contactData.investment_ability?.toString() || null,
    raw_payload: payload as Record<string, unknown>,
    created_at: new Date().toISOString(),
  };

  console.log(`[Events] Inserting event record:`, {
    contact_id: contactId,
    event_type: dashboardEventType,
    calendar_type: calendarType,
    ad_id: contactData.ad_id,
    cash_collected: opportunityData.monetaryValue,
  });

  const { error } = await supabase.from("events").insert([eventRecord]);

  if (error) {
    console.error(`[Events] Error inserting event record:`, error);
    // Don't throw - this is for backward compatibility, main flow should continue
  } else {
    console.log(`[Events] Successfully inserted event record with type: ${dashboardEventType}`);
  }
}

// ============================================================================
// MAIN REQUEST HANDLER
// ============================================================================

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // NOTE: Webhook secret verification disabled to allow GoHighLevel webhooks
  // without custom header configuration. Re-enable if needed by uncommenting below.
  // const secretVerification = verifyWebhookSecret(req);
  // if (!secretVerification.valid) {
  //   return new Response(
  //     JSON.stringify({ error: secretVerification.error }),
  //     {
  //       status: 401,
  //       headers: { ...corsHeaders, "Content-Type": "application/json" },
  //     }
  //   );
  // }

  try {
    // Initialize Supabase client with service role for admin access
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse payload
    let payload: GHLWebhookPayload;
    try {
      payload = await req.json();
    } catch (parseError) {
      console.error("Failed to parse JSON payload:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("=".repeat(60));
    console.log("Received webhook payload:", JSON.stringify(payload, null, 2));
    console.log("=".repeat(60));

    // Extract contact ID
    const contactId = extractContactId(payload);
    if (!contactId) {
      console.error("Missing contact ID in payload");
      return new Response(
        JSON.stringify({ error: "Missing contact ID in payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract and normalize event type
    const eventType = extractEventType(payload);
    if (!eventType) {
      console.error("Missing event type in payload");
      return new Response(
        JSON.stringify({ error: "Missing event type in payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing event: ${eventType} for contact: ${contactId}`);

    // Route to appropriate handler
    let result: { contact: ContactRecord | null; error: Error | null };

    switch (eventType) {
      case "form_submission":
      case "contact_create":
        result = await handleFormSubmission(supabase, contactId, payload);
        break;

      case "appointment_booked":
      case "appointment_create":
        result = await handleAppointmentBooked(supabase, contactId, payload);
        break;

      case "appointment_update":
      case "appointment_status":
        result = await handleAppointmentStatusChange(supabase, contactId, payload);
        break;

      case "pipeline_stage_changed":
      case "opportunity_stage_update":
        result = await handlePipelineStageChange(supabase, contactId, payload);
        break;

      case "deal_closed":
      case "opportunity_status_update":
        result = await handleDealClosed(supabase, contactId, payload);
        break;

      default:
        console.log(`Unknown event type: ${eventType}, storing in events table only`);
        result = { contact: null, error: null };
    }

    // Always insert into events table for backward compatibility
    await insertEventRecord(supabase, contactId, eventType, payload);

    // Check for errors
    if (result.error) {
      return new Response(
        JSON.stringify({
          error: "Failed to process webhook",
          details: result.error.message,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Success response
    return new Response(
      JSON.stringify({
        success: true,
        event_type: eventType,
        contact_id: contactId,
        contact: result.contact,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook processing error:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
