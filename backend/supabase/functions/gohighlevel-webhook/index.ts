// supabase/functions/gohighlevel-webhook/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define types for the incoming webhook payload
interface GoHighLevelContact {
  id?: string;
  contact_id?: string;
  contactId?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  revenue?: string;
  investment_ability?: string;
  investmentAbility?: string;
  [key: string]: unknown;
}

interface GoHighLevelWebhookPayload {
  contact?: GoHighLevelContact;
  contact_id?: string;
  contactId?: string;
  event?: string;
  event_type?: string;
  eventType?: string;
  workflow_name?: string;
  workflowName?: string;
  ad_id?: string;
  adId?: string;
  cash_collected?: number | string;
  cashCollected?: number | string;
  amount?: number | string;
  calendar_type?: string;
  calendarType?: string;
  revenue?: string;
  investment_ability?: string;
  investmentAbility?: string;
  customData?: Record<string, unknown>;
  custom_data?: Record<string, unknown>;
  [key: string]: unknown;
}

// Define the structure for our events table
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

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Parse the incoming webhook payload
    const payload: GoHighLevelWebhookPayload = await req.json();

    console.log("Received webhook payload:", JSON.stringify(payload, null, 2));

    // Extract contact ID (GHL can send it in different formats)
    const contactId = extractContactId(payload);

    if (!contactId) {
      return new Response(
        JSON.stringify({ error: "Missing contact ID in payload" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Extract event type
    const eventType = extractEventType(payload);

    if (!eventType) {
      return new Response(
        JSON.stringify({ error: "Missing event type in payload" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Extract ad_id (can be in different locations)
    const adId = extractAdId(payload);

    // Extract cash_collected (can be in different formats)
    const cashCollected = extractCashCollected(payload);

    // Extract the three new fields
    const calendarType = extractCalendarType(payload);
    const revenue = extractRevenue(payload);
    const investmentAbility = extractInvestmentAbility(payload);

    // Prepare the event record
    const eventRecord: EventRecord = {
      contact_id: contactId,
      event_type: eventType,
      ad_id: adId,
      cash_collected: cashCollected,
      calendar_type: calendarType,
      revenue: revenue,
      investment_ability: investmentAbility,
      raw_payload: payload as Record<string, unknown>,
      created_at: new Date().toISOString(),
    };

    console.log("Inserting event record:", JSON.stringify(eventRecord, null, 2));

    // Insert into the events table
    const { data, error } = await supabase
      .from("events")
      .insert([eventRecord])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to insert event", details: error.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("Successfully inserted event:", data);

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );

  } catch (error) {
    console.error("Webhook processing error:", error);

    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

// Helper function to extract contact ID from various payload formats
function extractContactId(payload: GoHighLevelWebhookPayload): string | null {
  if (payload.contact?.id) {
    return payload.contact.id;
  }
  if (payload.contact?.contact_id) {
    return payload.contact.contact_id;
  }
  if (payload.contact?.contactId) {
    return payload.contact.contactId;
  }
  if (payload.contact_id) {
    return payload.contact_id;
  }
  if (payload.contactId) {
    return payload.contactId;
  }
  
  return null;
}

// Helper function to extract event type from various payload formats
function extractEventType(payload: GoHighLevelWebhookPayload): string | null {
  if (payload.event) {
    return payload.event;
  }
  if (payload.event_type) {
    return payload.event_type;
  }
  if (payload.eventType) {
    return payload.eventType;
  }
  if (payload.workflow_name) {
    return payload.workflow_name;
  }
  if (payload.workflowName) {
    return payload.workflowName;
  }
  
  return null;
}

// Helper function to extract ad_id from various payload formats
function extractAdId(payload: GoHighLevelWebhookPayload): string | null {
  if (payload.ad_id) {
    return payload.ad_id;
  }
  if (payload.adId) {
    return payload.adId;
  }
  if (payload.contact?.ad_id) {
    return payload.contact.ad_id as string;
  }
  if (payload.customData?.ad_id) {
    return payload.customData.ad_id as string;
  }
  if (payload.custom_data?.ad_id) {
    return payload.custom_data.ad_id as string;
  }
  
  return null;
}

// Helper function to extract cash_collected and convert to number
function extractCashCollected(payload: GoHighLevelWebhookPayload): number | null {
  let value: number | string | undefined;
  
  if (payload.cash_collected !== undefined) {
    value = payload.cash_collected;
  } else if (payload.cashCollected !== undefined) {
    value = payload.cashCollected;
  } else if (payload.amount !== undefined) {
    value = payload.amount;
  } else if (payload.customData?.cash_collected !== undefined) {
    value = payload.customData.cash_collected as number | string;
  } else if (payload.custom_data?.cash_collected !== undefined) {
    value = payload.custom_data.cash_collected as number | string;
  }
  
  if (value === undefined || value === null || value === "") {
    return null;
  }
  
  if (typeof value === "string") {
    const cleanedValue = value.replace(/[$,]/g, "").trim();
    const parsed = parseFloat(cleanedValue);
    return isNaN(parsed) ? null : parsed;
  }
  
  return typeof value === "number" ? value : null;
}

// Helper function to extract calendar_type
function extractCalendarType(payload: GoHighLevelWebhookPayload): string | null {
  // Check direct properties
  if (payload.calendar_type) {
    return payload.calendar_type;
  }
  if (payload.calendarType) {
    return payload.calendarType;
  }
  
  // Check inside contact object
  if (payload.contact?.calendar_type) {
    return payload.contact.calendar_type as string;
  }
  if (payload.contact?.calendarType) {
    return payload.contact.calendarType as string;
  }
  
  // Check inside custom data
  if (payload.customData?.calendar_type) {
    return payload.customData.calendar_type as string;
  }
  if (payload.custom_data?.calendar_type) {
    return payload.custom_data.calendar_type as string;
  }
  
  return null;
}

// Helper function to extract revenue
function extractRevenue(payload: GoHighLevelWebhookPayload): string | null {
  // Check direct properties
  if (payload.revenue) {
    return payload.revenue;
  }
  
  // Check inside contact object
  if (payload.contact?.revenue) {
    return payload.contact.revenue as string;
  }
  
  // Check inside custom data
  if (payload.customData?.revenue) {
    return payload.customData.revenue as string;
  }
  if (payload.custom_data?.revenue) {
    return payload.custom_data.revenue as string;
  }
  
  return null;
}

// Helper function to extract investment_ability
function extractInvestmentAbility(payload: GoHighLevelWebhookPayload): string | null {
  // Check direct properties
  if (payload.investment_ability) {
    return payload.investment_ability;
  }
  if (payload.investmentAbility) {
    return payload.investmentAbility;
  }
  
  // Check inside contact object
  if (payload.contact?.investment_ability) {
    return payload.contact.investment_ability as string;
  }
  if (payload.contact?.investmentAbility) {
    return payload.contact.investmentAbility as string;
  }
  
  // Check inside custom data
  if (payload.customData?.investment_ability) {
    return payload.customData.investment_ability as string;
  }
  if (payload.custom_data?.investment_ability) {
    return payload.custom_data.investment_ability as string;
  }
  if (payload.customData?.investmentAbility) {
    return payload.customData.investmentAbility as string;
  }
  if (payload.custom_data?.investmentAbility) {
    return payload.custom_data.investmentAbility as string;
  }
  
  return null;
}