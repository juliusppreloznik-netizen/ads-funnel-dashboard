"use client";

import { useState, useEffect, useCallback } from "react";
import { DateRangeValue } from "../DateRangePicker";
import { createClient } from "@supabase/supabase-js";
import {
  GlassCard,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  Badge,
} from "./ui";

// ============================================================================
// TYPES
// ============================================================================

type MessagingTab =
  | "ai-strategist"
  | "message-briefs"
  | "winning-hooks"
  | "cross-pollination"
  | "call-insights"
  | "fatigue-monitor"
  | "performance-kpis"
  | "engagement-kpis";

interface MessagingViewProps {
  dateRange: DateRangeValue;
}

interface FatigueScore {
  id: string;
  ad_id: string;
  fatigue_score: number;
  cpa_trend: number;
  cpm_trend: number;
  ctr_trend: number;
  cpa_trend_display?: string;
  cpm_trend_display?: string;
  ctr_trend_display?: string;
  days_analyzed: number;
  avg_cpa: number;
  avg_cpm: number;
  avg_ctr: number;
  recommendation: string;
  calculated_at: string;
}

interface AdWithFatigue extends FatigueScore {
  ad_name: string;
  thumbnail_url?: string;
}

interface WinningHook {
  hook_text: string;
  hook_type: string;
  ad_id: string;
  ad_name: string;
  why_it_works: string;
  performance_score: number;
  hook_rate?: number;
  ctr?: number;
}

interface CrossPollinationRecommendation {
  title: string;
  ad_ids: string[];
  creative_justification: {
    ads_referenced: {
      ad_name: string;
      key_metrics: string;
      what_worked: string;
    }[];
    transcript_reference: string | null;
  };
  sales_call_insights: {
    transcripts_referenced: string[];
    pain_points: string[];
    buying_signals: string[];
    business_objectives: string[];
    perceived_obstacles: string[];
    past_failed_attempts: string[];
  };
  concept_architecture: {
    awareness_level: string;
    persona: string;
    angle: string;
  };
  expected_impact: string;
  // Legacy fields for backwards compatibility
  suggestion?: string;
  source_ads?: string[];
  elements_to_combine?: string | Record<string, string>;
  rationale?: string;
}

interface CreativeBrief {
  id: string;
  briefs: {
    briefs?: BriefItem[];
    insights?: {
      top_pain_points?: string[];
      winning_hooks?: string[];
      content_gaps?: string[];
      audience_insights?: string;
    };
  };
  winning_hooks?: WinningHook[];
  cross_pollination?: CrossPollinationRecommendation[];
  source_data: {
    zoom_transcripts_count: number;
    ad_transcripts_count: number;
    ads_analyzed: number;
  };
  model_used: string;
  status: string;
  created_at: string;
}

interface BriefItem {
  id?: string;
  brief_batch_id?: string;
  title: string;
  hook_type: string;
  target_audience: string;
  key_message: string;
  pain_point: string;
  proof_element: string;
  call_to_action: string;
  visual_direction: string;
  reference_ads: string[];
  priority: number;
  rationale?: string;
  is_completed?: boolean;
  completed_at?: string;
  notes?: string;
}

interface AdPerformanceData {
  ad_id: string;
  ad_name: string;
  campaign_name: string;
  total_spend: number;
  total_impressions: number;
  total_clicks: number;
  total_leads: number;
  calls_booked: number;
  qualified_calls: number;
  opt_in_rate: number;
  booking_rate: number;
  cpc: number;
  cost_per_booked: number;
  cpm: number;
  hook_rate: number;
  hold_rate: number;
  outbound_ctr: number;
}

// ============================================================================
// SUPABASE CLIENT
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// ICONS
// ============================================================================

const MessagingIcons = {
  Brain: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  Document: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Lightning: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Shuffle: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  Phone: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  Alert: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  ChartBar: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Eye: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Refresh: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Check: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  ChevronDown: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  ChevronUp: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  ),
};

// ============================================================================
// TAB CONFIGURATION
// ============================================================================

const tabs: { id: MessagingTab; label: string; icon: React.ReactNode }[] = [
  { id: "ai-strategist", label: "AI Strategist", icon: MessagingIcons.Brain },
  { id: "message-briefs", label: "Message Briefs", icon: MessagingIcons.Document },
  { id: "winning-hooks", label: "Winning Hooks", icon: MessagingIcons.Lightning },
  { id: "cross-pollination", label: "Cross-Pollination", icon: MessagingIcons.Shuffle },
  { id: "call-insights", label: "Call Insights", icon: MessagingIcons.Phone },
  { id: "fatigue-monitor", label: "Fatigue Monitor", icon: MessagingIcons.Alert },
  { id: "performance-kpis", label: "Performance KPIs", icon: MessagingIcons.ChartBar },
  { id: "engagement-kpis", label: "Engagement KPIs", icon: MessagingIcons.Eye },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function getFatigueColor(score: number): "red" | "yellow" | "green" | "gray" {
  if (score >= 70) return "red";
  if (score >= 50) return "yellow";
  if (score >= 30) return "green";
  return "gray";
}

function formatDateOnly(date: Date): string {
  return date.toISOString().split("T")[0];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MessagingView({ dateRange }: MessagingViewProps) {
  const [activeTab, setActiveTab] = useState<MessagingTab>("ai-strategist");

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-[linear-gradient(127.09deg,rgba(6,11,40,0.94)_19.41%,rgba(10,14,35,0.49)_76.65%)] backdrop-blur-[120px] border border-[rgba(255,255,255,0.1)] rounded-[20px] p-1">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-[12px] text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[#0075ff] text-white shadow-lg"
                  : "text-[#a0aec0] hover:bg-[rgba(255,255,255,0.05)]"
              }`}
            >
              <span className={activeTab === tab.id ? "text-white" : "text-[#a0aec0]"}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === "ai-strategist" && <AIStrategistTab />}
        {activeTab === "message-briefs" && <MessageBriefsTab />}
        {activeTab === "winning-hooks" && <WinningHooksTab />}
        {activeTab === "cross-pollination" && <CrossPollinationTab />}
        {activeTab === "call-insights" && <CallInsightsTab />}
        {activeTab === "fatigue-monitor" && <FatigueMonitorTab />}
        {activeTab === "performance-kpis" && <PerformanceKPIsTab dateRange={dateRange} />}
        {activeTab === "engagement-kpis" && <EngagementKPIsTab dateRange={dateRange} />}
      </div>
    </div>
  );
}

// ============================================================================
// AI STRATEGIST TAB
// ============================================================================

function AIStrategistTab() {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [briefs, setBriefs] = useState<CreativeBrief | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestBriefs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("ai_creative_briefs")
        .select("*")
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      setBriefs(data as CreativeBrief | null);
    } catch (err) {
      console.error("Error fetching briefs:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch briefs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatestBriefs();
  }, [fetchLatestBriefs]);

  const generateNewBriefs = async () => {
    setGenerating(true);
    setError(null);
    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/ai-strategist`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.details || "Failed to generate briefs");
      }

      await fetchLatestBriefs();
    } catch (err) {
      console.error("Error generating briefs:", err);
      setError(err instanceof Error ? err.message : "Failed to generate briefs");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0075ff]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0075ff] to-[#7928ca] rounded-[20px] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">AI Creative Strategist</h2>
            <p className="text-white/80 mt-1">
              Analyze sales calls and ad performance to generate data-driven creative briefs
            </p>
          </div>
          <button
            onClick={generateNewBriefs}
            disabled={generating}
            className="flex items-center gap-2 px-6 py-3 bg-white text-[#0075ff] rounded-[12px] font-semibold hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0075ff]"></div>
                Analyzing...
              </>
            ) : (
              <>
                {MessagingIcons.Brain}
                Generate New Briefs
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-[#e31a1a]/10 border border-[#e31a1a]/30 rounded-[15px] p-4 text-[#e31a1a]">
          {error}
        </div>
      )}

      {/* Source Data Summary */}
      {briefs && (
        <div className="grid grid-cols-3 gap-4">
          <GlassCard>
            <div className="text-sm text-[#a0aec0]">Sales Calls Analyzed</div>
            <div className="text-2xl font-bold text-white">
              {briefs.source_data.zoom_transcripts_count}
            </div>
          </GlassCard>
          <GlassCard>
            <div className="text-sm text-[#a0aec0]">Ad Transcripts Analyzed</div>
            <div className="text-2xl font-bold text-white">
              {briefs.source_data.ad_transcripts_count}
            </div>
          </GlassCard>
          <GlassCard>
            <div className="text-sm text-[#a0aec0]">Ads Performance Data</div>
            <div className="text-2xl font-bold text-white">
              {briefs.source_data.ads_analyzed}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Insights Section */}
      {briefs?.briefs?.insights && (
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4">Key Insights</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {briefs.briefs.insights.top_pain_points && (
              <div>
                <h4 className="text-sm font-medium text-[#a0aec0] mb-2">Top Pain Points</h4>
                <div className="flex flex-wrap gap-2">
                  {briefs.briefs.insights.top_pain_points.map((point, idx) => (
                    <Badge key={idx} color="red">{point}</Badge>
                  ))}
                </div>
              </div>
            )}
            {briefs.briefs.insights.winning_hooks && (
              <div>
                <h4 className="text-sm font-medium text-[#a0aec0] mb-2">Winning Hook Types</h4>
                <div className="flex flex-wrap gap-2">
                  {briefs.briefs.insights.winning_hooks.map((hook, idx) => (
                    <Badge key={idx} color="green">{hook}</Badge>
                  ))}
                </div>
              </div>
            )}
            {briefs.briefs.insights.content_gaps && (
              <div>
                <h4 className="text-sm font-medium text-[#a0aec0] mb-2">Content Gaps</h4>
                <div className="flex flex-wrap gap-2">
                  {briefs.briefs.insights.content_gaps.map((gap, idx) => (
                    <Badge key={idx} color="yellow">{gap}</Badge>
                  ))}
                </div>
              </div>
            )}
            {briefs.briefs.insights.audience_insights && (
              <div className="md:col-span-2">
                <h4 className="text-sm font-medium text-[#a0aec0] mb-2">Audience Insights</h4>
                <p className="text-[#a0aec0]">{briefs.briefs.insights.audience_insights}</p>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Creative Briefs */}
      {briefs?.briefs?.briefs && briefs.briefs.briefs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Generated Creative Briefs</h3>
          {briefs.briefs.briefs.map((brief, idx) => (
            <BriefCard key={idx} brief={brief} index={idx} />
          ))}
        </div>
      )}

      {!briefs && !error && (
        <GlassCard className="border-dashed">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[rgba(255,255,255,0.05)] rounded-full flex items-center justify-center mx-auto mb-4 text-[#a0aec0]">
              {MessagingIcons.Brain}
            </div>
            <h3 className="text-lg font-semibold text-white">No briefs generated yet</h3>
            <p className="text-[#a0aec0] mt-1">
              Click &quot;Generate New Briefs&quot; to analyze your sales calls and ad performance
            </p>
          </div>
        </GlassCard>
      )}

      {/* Last Generated */}
      {briefs && (
        <div className="text-sm text-[#a0aec0] text-center">
          Last generated: {new Date(briefs.created_at).toLocaleString()} using {briefs.model_used}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// BRIEF CARD COMPONENT
// ============================================================================

function BriefCard({ brief, index }: { brief: BriefItem; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);

  const priorityColors: Record<number, string> = {
    1: "bg-[#e31a1a]",
    2: "bg-[#ff6b00]",
    3: "bg-[#ffc107]",
    4: "bg-[#0075ff]",
    5: "bg-[#718096]",
  };

  return (
    <GlassCard padding="none" className="overflow-hidden">
      <div
        className="p-6 flex items-start justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
              priorityColors[brief.priority] || priorityColors[5]
            }`}
          >
            {brief.priority}
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white">{brief.title}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge color="blue">{brief.hook_type}</Badge>
              {brief.reference_ads?.length > 0 && (
                <span className="text-xs text-[#a0aec0]">
                  Inspired by: {brief.reference_ads.join(", ")}
                </span>
              )}
            </div>
          </div>
        </div>
        <button className="text-[#a0aec0] hover:text-white">
          {expanded ? MessagingIcons.ChevronUp : MessagingIcons.ChevronDown}
        </button>
      </div>

      {expanded && (
        <div className="p-6 pt-0 border-t border-[rgba(255,255,255,0.05)] mt-4 grid md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-medium text-[#a0aec0]">Target Audience</h5>
            <p className="text-white mt-1">{brief.target_audience}</p>
          </div>
          <div>
            <h5 className="text-sm font-medium text-[#a0aec0]">Key Message</h5>
            <p className="text-white mt-1">{brief.key_message}</p>
          </div>
          <div>
            <h5 className="text-sm font-medium text-[#a0aec0]">Pain Point</h5>
            <p className="text-white mt-1">{brief.pain_point}</p>
          </div>
          <div>
            <h5 className="text-sm font-medium text-[#a0aec0]">Proof Element</h5>
            <p className="text-white mt-1">{brief.proof_element}</p>
          </div>
          <div>
            <h5 className="text-sm font-medium text-[#a0aec0]">Call to Action</h5>
            <p className="text-white mt-1">{brief.call_to_action}</p>
          </div>
          <div>
            <h5 className="text-sm font-medium text-[#a0aec0]">Visual Direction</h5>
            <p className="text-white mt-1">{brief.visual_direction}</p>
          </div>
          {brief.rationale && (
            <div className="md:col-span-2">
              <h5 className="text-sm font-medium text-[#a0aec0]">Rationale</h5>
              <p className="text-white mt-1 bg-[rgba(255,255,255,0.02)] p-3 rounded-[12px]">{brief.rationale}</p>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}

// ============================================================================
// MESSAGE BRIEFS TAB (To-Do List View)
// ============================================================================

function MessageBriefsTab() {
  const [loading, setLoading] = useState(true);
  const [briefItems, setBriefItems] = useState<BriefItem[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const fetchBriefItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("creative_brief_items")
        .select("*")
        .order("priority", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBriefItems(data as BriefItem[]);
    } catch (err) {
      console.error("Error fetching brief items:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBriefItems();
  }, [fetchBriefItems]);

  const toggleComplete = async (item: BriefItem) => {
    const newStatus = !item.is_completed;
    try {
      const { error } = await supabase
        .from("creative_brief_items")
        .update({
          is_completed: newStatus,
          completed_at: newStatus ? new Date().toISOString() : null,
        })
        .eq("id", item.id);

      if (error) throw error;

      setBriefItems((prev) =>
        prev.map((b) =>
          b.id === item.id
            ? { ...b, is_completed: newStatus, completed_at: newStatus ? new Date().toISOString() : undefined }
            : b
        )
      );
    } catch (err) {
      console.error("Error updating brief:", err);
    }
  };

  const filteredItems = briefItems.filter((item) => {
    if (filter === "pending") return !item.is_completed;
    if (filter === "completed") return item.is_completed;
    return true;
  });

  const pendingCount = briefItems.filter((b) => !b.is_completed).length;
  const completedCount = briefItems.filter((b) => b.is_completed).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0075ff]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard onClick={() => setFilter("all")}>
          <div className="text-sm text-[#a0aec0]">Total Briefs</div>
          <div className="text-2xl font-bold text-white">{briefItems.length}</div>
        </GlassCard>
        <GlassCard onClick={() => setFilter("pending")}>
          <div className="text-sm text-[#a0aec0]">Pending</div>
          <div className="text-2xl font-bold text-[#ffc107]">{pendingCount}</div>
        </GlassCard>
        <GlassCard onClick={() => setFilter("completed")}>
          <div className="text-sm text-[#a0aec0]">Completed</div>
          <div className="text-2xl font-bold text-[#01b574]">{completedCount}</div>
        </GlassCard>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["all", "pending", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-[12px] text-sm font-medium ${
              filter === f
                ? "bg-[#0075ff] text-white"
                : "bg-[rgba(255,255,255,0.02)] text-[#a0aec0] hover:bg-[rgba(255,255,255,0.05)]"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Brief Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <GlassCard className="border-dashed">
            <div className="text-center py-8">
              <p className="text-[#a0aec0]">No briefs found. Generate some from the AI Strategist tab.</p>
            </div>
          </GlassCard>
        ) : (
          filteredItems.map((item) => (
            <GlassCard
              key={item.id}
              className={`transition-all ${item.is_completed ? "opacity-60" : ""}`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleComplete(item)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                    item.is_completed
                      ? "bg-[#01b574] border-[#01b574] text-white"
                      : "border-[rgba(255,255,255,0.2)] hover:border-[#0075ff]"
                  }`}
                >
                  {item.is_completed && MessagingIcons.Check}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`font-semibold ${
                        item.is_completed ? "text-[#a0aec0] line-through" : "text-white"
                      }`}
                    >
                      {item.title}
                    </h4>
                    <Badge color={item.priority === 1 ? "red" : item.priority === 2 ? "orange" : "blue"}>
                      P{item.priority}
                    </Badge>
                    <Badge color="gray">{item.hook_type}</Badge>
                  </div>
                  <p className="text-sm text-[#a0aec0] mt-1">{item.key_message}</p>
                  {item.completed_at && (
                    <p className="text-xs text-[#718096] mt-2">
                      Completed: {new Date(item.completed_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}

// ============================================================================
// CALL INSIGHTS TAB
// ============================================================================

interface ZoomTranscript {
  id: string;
  contact_id: string;
  contact_name: string;
  contact_email: string | null;
  call_outcome: string;
  transcript_text: string;
  start_time: string;
  topic: string | null;
  duration: number | null;
  cash_collected: number | null;
  created_at: string;
}

function CallInsightsTab() {
  const [loading, setLoading] = useState(true);
  const [transcripts, setTranscripts] = useState<ZoomTranscript[]>([]);

  useEffect(() => {
    async function fetchTranscripts() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("zoom_transcripts")
          .select("*")
          .not("transcript_text", "is", null)
          .order("start_time", { ascending: false })
          .limit(20);

        if (error) throw error;
        setTranscripts(data || []);
      } catch (err) {
        console.error("Error fetching transcripts:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTranscripts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0075ff]"></div>
      </div>
    );
  }

  const wonCalls = transcripts.filter((t) => t.call_outcome === "won");
  const lostCalls = transcripts.filter((t) => t.call_outcome === "lost");

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <GlassCard>
          <div className="text-sm text-[#a0aec0]">Total Calls</div>
          <div className="text-2xl font-bold text-white">{transcripts.length}</div>
        </GlassCard>
        <GlassCard>
          <div className="text-sm text-[#a0aec0]">Won</div>
          <div className="text-2xl font-bold text-[#01b574]">{wonCalls.length}</div>
        </GlassCard>
        <GlassCard>
          <div className="text-sm text-[#a0aec0]">Lost</div>
          <div className="text-2xl font-bold text-[#e31a1a]">{lostCalls.length}</div>
        </GlassCard>
        <GlassCard>
          <div className="text-sm text-[#a0aec0]">Total Revenue</div>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(wonCalls.reduce((sum, c) => sum + (c.cash_collected || 0), 0))}
          </div>
        </GlassCard>
      </div>

      {/* Calls Table */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-white mb-4">Recent Sales Calls</h3>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Date</TableHeaderCell>
              <TableHeaderCell>Contact</TableHeaderCell>
              <TableHeaderCell>Topic</TableHeaderCell>
              <TableHeaderCell>Duration</TableHeaderCell>
              <TableHeaderCell>Outcome</TableHeaderCell>
              <TableHeaderCell className="text-right">Value</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transcripts.map((call) => (
              <TableRow key={call.id}>
                <TableCell>
                  {call.start_time ? new Date(call.start_time).toLocaleDateString() : "-"}
                </TableCell>
                <TableCell className="text-white">{call.contact_name || call.contact_email || "-"}</TableCell>
                <TableCell className="max-w-[200px] truncate">{call.topic || "-"}</TableCell>
                <TableCell>{call.duration ? `${call.duration} min` : "-"}</TableCell>
                <TableCell>
                  <Badge
                    color={
                      call.call_outcome === "won"
                        ? "green"
                        : call.call_outcome === "lost"
                        ? "red"
                        : "gray"
                    }
                  >
                    {call.call_outcome || "unknown"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {call.cash_collected ? formatCurrency(call.cash_collected) : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </GlassCard>
    </div>
  );
}

// ============================================================================
// FATIGUE MONITOR TAB
// ============================================================================

function FatigueMonitorTab() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fatigueData, setFatigueData] = useState<AdWithFatigue[]>([]);
  const [sortBy, setSortBy] = useState<"fatigue_score" | "cpa_trend" | "cpm_trend" | "ctr_trend">("fatigue_score");

  const fetchFatigueData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: scores, error: scoresError } = await supabase
        .from("ad_fatigue_scores")
        .select("*")
        .order("fatigue_score", { ascending: false });

      if (scoresError) throw scoresError;

      const adIds = scores?.map((s) => s.ad_id) || [];
      const { data: ads, error: adsError } = await supabase
        .from("ads")
        .select("ad_id, ad_name")
        .in("ad_id", adIds);

      if (adsError) throw adsError;

      const { data: transcripts, error: transcriptsError } = await supabase
        .from("ad_transcripts")
        .select("ad_id, thumbnail_url")
        .in("ad_id", adIds);

      if (transcriptsError) throw transcriptsError;

      const adNameMap = new Map(ads?.map((a) => [a.ad_id, a.ad_name]));
      const thumbnailMap = new Map(transcripts?.map((t) => [t.ad_id, t.thumbnail_url]));

      const mergedData: AdWithFatigue[] = (scores || []).map((score) => ({
        ...score,
        ad_name: adNameMap.get(score.ad_id) || "Unknown",
        thumbnail_url: thumbnailMap.get(score.ad_id),
      }));

      setFatigueData(mergedData);
    } catch (err) {
      console.error("Error fetching fatigue data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFatigueData();
  }, [fetchFatigueData]);

  const refreshFatigueScores = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/fatigue-monitor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({ days: 7 }),
        }
      );

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.details || "Failed to refresh scores");
      }

      await fetchFatigueData();
    } catch (err) {
      console.error("Error refreshing fatigue scores:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const sortedData = [...fatigueData].sort((a, b) => {
    if (sortBy === "fatigue_score") return b.fatigue_score - a.fatigue_score;
    if (sortBy === "cpa_trend") return b.cpa_trend - a.cpa_trend;
    if (sortBy === "cpm_trend") return b.cpm_trend - a.cpm_trend;
    if (sortBy === "ctr_trend") return a.ctr_trend - b.ctr_trend;
    return 0;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0075ff]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Ad Fatigue Monitor</h2>
          <p className="text-[#a0aec0]">Track creative fatigue based on CPA, CPM, and CTR trends</p>
        </div>
        <button
          onClick={refreshFatigueScores}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-[#0075ff] text-white rounded-[12px] font-medium hover:bg-[#0066dd] disabled:opacity-50"
        >
          {refreshing ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            MessagingIcons.Refresh
          )}
          Refresh Scores
        </button>
      </div>

      {/* Fatigue Table */}
      <GlassCard>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Ad</TableHeaderCell>
              <TableHeaderCell
                className="cursor-pointer hover:bg-[rgba(255,255,255,0.02)]"
                onClick={() => setSortBy("fatigue_score")}
              >
                Fatigue Score {sortBy === "fatigue_score" && "↓"}
              </TableHeaderCell>
              <TableHeaderCell
                className="cursor-pointer hover:bg-[rgba(255,255,255,0.02)]"
                onClick={() => setSortBy("cpa_trend")}
              >
                CPA Trend {sortBy === "cpa_trend" && "↓"}
              </TableHeaderCell>
              <TableHeaderCell
                className="cursor-pointer hover:bg-[rgba(255,255,255,0.02)]"
                onClick={() => setSortBy("cpm_trend")}
              >
                CPM Trend {sortBy === "cpm_trend" && "↓"}
              </TableHeaderCell>
              <TableHeaderCell
                className="cursor-pointer hover:bg-[rgba(255,255,255,0.02)]"
                onClick={() => setSortBy("ctr_trend")}
              >
                CTR Trend {sortBy === "ctr_trend" && "↑"}
              </TableHeaderCell>
              <TableHeaderCell>Recommendation</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No fatigue data available. Click &quot;Refresh Scores&quot; to analyze your ads.
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((ad) => (
                <TableRow key={ad.ad_id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {ad.thumbnail_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ad.thumbnail_url}
                          alt=""
                          className="w-10 h-10 rounded-[8px] object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium text-white">{ad.ad_name}</div>
                        <div className="text-xs text-[#a0aec0]">{ad.days_analyzed} days analyzed</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge color={getFatigueColor(ad.fatigue_score)}>
                      {ad.fatigue_score.toFixed(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={ad.cpa_trend > 0 ? "text-[#e31a1a]" : ad.cpa_trend < 0 ? "text-[#01b574]" : "text-[#a0aec0]"}>
                      {ad.cpa_trend_display || (ad.cpa_trend === 0 ? "N/A" : `${ad.cpa_trend > 0 ? "+" : ""}${ad.cpa_trend.toFixed(1)}%`)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={ad.cpm_trend > 0 ? "text-[#e31a1a]" : ad.cpm_trend < 0 ? "text-[#01b574]" : "text-[#a0aec0]"}>
                      {ad.cpm_trend_display || (ad.cpm_trend === 0 ? "N/A" : `${ad.cpm_trend > 0 ? "+" : ""}${ad.cpm_trend.toFixed(1)}%`)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={ad.ctr_trend < 0 ? "text-[#e31a1a]" : ad.ctr_trend > 0 ? "text-[#01b574]" : "text-[#a0aec0]"}>
                      {ad.ctr_trend_display || (ad.ctr_trend === 0 ? "N/A" : `${ad.ctr_trend > 0 ? "+" : ""}${ad.ctr_trend.toFixed(1)}%`)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{ad.recommendation}</span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </GlassCard>
    </div>
  );
}

// ============================================================================
// PERFORMANCE KPIs TAB
// ============================================================================

function PerformanceKPIsTab({ dateRange }: { dateRange: DateRangeValue }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AdPerformanceData[]>([]);
  const [sortBy, setSortBy] = useState<"opt_in_rate" | "booking_rate" | "cpc" | "cost_per_booked">("cost_per_booked");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        let adsQuery = supabase
          .from("ads")
          .select("ad_id, ad_name, campaign_name, spend, impressions, clicks, leads");

        if (dateRange?.from) {
          adsQuery = adsQuery.gte("date", formatDateOnly(dateRange.from));
        }
        if (dateRange?.to) {
          adsQuery = adsQuery.lte("date", formatDateOnly(dateRange.to));
        }

        const { data: adsData, error: adsError } = await adsQuery;
        if (adsError) throw adsError;

        let contactsQuery = supabase
          .from("contacts")
          .select("ad_id, call_booked_at, is_qualified");

        if (dateRange?.from) {
          contactsQuery = contactsQuery.gte("form_submitted_at", dateRange.from.toISOString());
        }
        if (dateRange?.to) {
          contactsQuery = contactsQuery.lte("form_submitted_at", dateRange.to.toISOString());
        }

        const { data: contactsData, error: contactsError } = await contactsQuery;
        if (contactsError) throw contactsError;

        const adMap = new Map<string, AdPerformanceData>();

        for (const ad of adsData || []) {
          const existing = adMap.get(ad.ad_id);
          if (existing) {
            existing.total_spend += Number(ad.spend) || 0;
            existing.total_impressions += Number(ad.impressions) || 0;
            existing.total_clicks += Number(ad.clicks) || 0;
            existing.total_leads += Number(ad.leads) || 0;
          } else {
            adMap.set(ad.ad_id, {
              ad_id: ad.ad_id,
              ad_name: ad.ad_name || "Unknown",
              campaign_name: ad.campaign_name || "Unknown",
              total_spend: Number(ad.spend) || 0,
              total_impressions: Number(ad.impressions) || 0,
              total_clicks: Number(ad.clicks) || 0,
              total_leads: Number(ad.leads) || 0,
              calls_booked: 0,
              qualified_calls: 0,
              opt_in_rate: 0,
              booking_rate: 0,
              cpc: 0,
              cost_per_booked: 0,
              cpm: 0,
              hook_rate: 0,
              hold_rate: 0,
              outbound_ctr: 0,
            });
          }
        }

        for (const contact of contactsData || []) {
          if (!contact.ad_id) continue;
          const ad = adMap.get(contact.ad_id);
          if (ad) {
            if (contact.call_booked_at) {
              ad.calls_booked++;
              if (contact.is_qualified) {
                ad.qualified_calls++;
              }
            }
          }
        }

        const result = Array.from(adMap.values()).map((ad) => ({
          ...ad,
          opt_in_rate: ad.total_clicks > 0 ? (ad.total_leads / ad.total_clicks) * 100 : 0,
          booking_rate: ad.total_leads > 0 ? (ad.calls_booked / ad.total_leads) * 100 : 0,
          cpc: ad.total_clicks > 0 ? ad.total_spend / ad.total_clicks : 0,
          cost_per_booked: ad.calls_booked > 0 ? ad.total_spend / ad.calls_booked : 0,
          cpm: ad.total_impressions > 0 ? (ad.total_spend / ad.total_impressions) * 1000 : 0,
        }));

        setData(result);
      } catch (err) {
        console.error("Error fetching performance data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [dateRange]);

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(column);
      setSortAsc(column === "cpc" || column === "cost_per_booked");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0075ff]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Performance KPIs</h2>
        <p className="text-[#a0aec0]">Conversion and cost metrics for each ad</p>
      </div>

      <GlassCard>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Ad Name</TableHeaderCell>
              <TableHeaderCell>Campaign</TableHeaderCell>
              <TableHeaderCell className="text-right">Spend</TableHeaderCell>
              <TableHeaderCell className="text-right">Leads</TableHeaderCell>
              <TableHeaderCell className="text-right">Booked</TableHeaderCell>
              <TableHeaderCell
                className="text-right cursor-pointer hover:bg-[rgba(255,255,255,0.02)]"
                onClick={() => handleSort("opt_in_rate")}
              >
                Opt-in Rate {sortBy === "opt_in_rate" && (sortAsc ? "↑" : "↓")}
              </TableHeaderCell>
              <TableHeaderCell
                className="text-right cursor-pointer hover:bg-[rgba(255,255,255,0.02)]"
                onClick={() => handleSort("booking_rate")}
              >
                Booking Rate {sortBy === "booking_rate" && (sortAsc ? "↑" : "↓")}
              </TableHeaderCell>
              <TableHeaderCell
                className="text-right cursor-pointer hover:bg-[rgba(255,255,255,0.02)]"
                onClick={() => handleSort("cpc")}
              >
                CPC {sortBy === "cpc" && (sortAsc ? "↑" : "↓")}
              </TableHeaderCell>
              <TableHeaderCell
                className="text-right cursor-pointer hover:bg-[rgba(255,255,255,0.02)]"
                onClick={() => handleSort("cost_per_booked")}
              >
                Cost/Booked {sortBy === "cost_per_booked" && (sortAsc ? "↑" : "↓")}
              </TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((ad) => (
              <TableRow key={ad.ad_id}>
                <TableCell className="font-medium text-white">{ad.ad_name}</TableCell>
                <TableCell>{ad.campaign_name}</TableCell>
                <TableCell className="text-right">{formatCurrency(ad.total_spend)}</TableCell>
                <TableCell className="text-right">{ad.total_leads}</TableCell>
                <TableCell className="text-right">{ad.calls_booked}</TableCell>
                <TableCell className="text-right">{formatPercent(ad.opt_in_rate)}</TableCell>
                <TableCell className="text-right">{formatPercent(ad.booking_rate)}</TableCell>
                <TableCell className="text-right">{formatCurrency(ad.cpc)}</TableCell>
                <TableCell className="text-right">
                  {ad.cost_per_booked > 0 ? formatCurrency(ad.cost_per_booked) : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </GlassCard>
    </div>
  );
}

// ============================================================================
// ENGAGEMENT KPIs TAB
// ============================================================================

function EngagementKPIsTab({ dateRange }: { dateRange: DateRangeValue }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AdPerformanceData[]>([]);
  const [sortBy, setSortBy] = useState<"cpm" | "hook_rate" | "hold_rate" | "outbound_ctr">("hook_rate");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        let query = supabase
          .from("ads")
          .select("ad_id, ad_name, campaign_name, spend, impressions, clicks, cpm, hook_rate, hold_rate, outbound_ctr");

        if (dateRange?.from) {
          query = query.gte("date", formatDateOnly(dateRange.from));
        }
        if (dateRange?.to) {
          query = query.lte("date", formatDateOnly(dateRange.to));
        }

        const { data: adsData, error } = await query;
        if (error) throw error;

        const adMap = new Map<string, AdPerformanceData>();

        for (const ad of adsData || []) {
          const existing = adMap.get(ad.ad_id);
          if (existing) {
            existing.total_spend += Number(ad.spend) || 0;
            existing.total_impressions += Number(ad.impressions) || 0;
            existing.total_clicks += Number(ad.clicks) || 0;
          } else {
            adMap.set(ad.ad_id, {
              ad_id: ad.ad_id,
              ad_name: ad.ad_name || "Unknown",
              campaign_name: ad.campaign_name || "Unknown",
              total_spend: Number(ad.spend) || 0,
              total_impressions: Number(ad.impressions) || 0,
              total_clicks: Number(ad.clicks) || 0,
              total_leads: 0,
              calls_booked: 0,
              qualified_calls: 0,
              opt_in_rate: 0,
              booking_rate: 0,
              cpc: 0,
              cost_per_booked: 0,
              cpm: Number(ad.cpm) || 0,
              hook_rate: Number(ad.hook_rate) || 0,
              hold_rate: Number(ad.hold_rate) || 0,
              outbound_ctr: Number(ad.outbound_ctr) || 0,
            });
          }
        }

        const result = Array.from(adMap.values()).map((ad) => ({
          ...ad,
          cpm: ad.total_impressions > 0 ? (ad.total_spend / ad.total_impressions) * 1000 : ad.cpm,
        }));

        setData(result);
      } catch (err) {
        console.error("Error fetching engagement data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [dateRange]);

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(column);
      setSortAsc(column === "cpm");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0075ff]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Engagement KPIs</h2>
        <p className="text-[#a0aec0]">Video engagement and attention metrics for each ad</p>
      </div>

      <GlassCard>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Ad Name</TableHeaderCell>
              <TableHeaderCell>Campaign</TableHeaderCell>
              <TableHeaderCell className="text-right">Impressions</TableHeaderCell>
              <TableHeaderCell
                className="text-right cursor-pointer hover:bg-[rgba(255,255,255,0.02)]"
                onClick={() => handleSort("cpm")}
              >
                CPM {sortBy === "cpm" && (sortAsc ? "↑" : "↓")}
              </TableHeaderCell>
              <TableHeaderCell
                className="text-right cursor-pointer hover:bg-[rgba(255,255,255,0.02)]"
                onClick={() => handleSort("hook_rate")}
              >
                Hook Rate {sortBy === "hook_rate" && (sortAsc ? "↑" : "↓")}
              </TableHeaderCell>
              <TableHeaderCell
                className="text-right cursor-pointer hover:bg-[rgba(255,255,255,0.02)]"
                onClick={() => handleSort("hold_rate")}
              >
                Hold Rate {sortBy === "hold_rate" && (sortAsc ? "↑" : "↓")}
              </TableHeaderCell>
              <TableHeaderCell
                className="text-right cursor-pointer hover:bg-[rgba(255,255,255,0.02)]"
                onClick={() => handleSort("outbound_ctr")}
              >
                Outbound CTR {sortBy === "outbound_ctr" && (sortAsc ? "↑" : "↓")}
              </TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((ad) => (
              <TableRow key={ad.ad_id}>
                <TableCell className="font-medium text-white">{ad.ad_name}</TableCell>
                <TableCell>{ad.campaign_name}</TableCell>
                <TableCell className="text-right">{ad.total_impressions.toLocaleString()}</TableCell>
                <TableCell className="text-right">{formatCurrency(ad.cpm)}</TableCell>
                <TableCell className="text-right">
                  <Badge color={ad.hook_rate >= 30 ? "green" : ad.hook_rate >= 20 ? "yellow" : "red"}>
                    {formatPercent(ad.hook_rate)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Badge color={ad.hold_rate >= 20 ? "green" : ad.hold_rate >= 10 ? "yellow" : "red"}>
                    {formatPercent(ad.hold_rate)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{formatPercent(ad.outbound_ctr)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </GlassCard>
    </div>
  );
}

// ============================================================================
// WINNING HOOKS TAB
// ============================================================================

function WinningHooksTab() {
  const [loading, setLoading] = useState(true);
  const [hooks, setHooks] = useState<WinningHook[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHooks() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from("ai_creative_briefs")
          .select("winning_hooks, created_at")
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          throw fetchError;
        }

        if (data?.winning_hooks && Array.isArray(data.winning_hooks)) {
          setHooks(data.winning_hooks as WinningHook[]);
        }
      } catch (err) {
        console.error("Error fetching winning hooks:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch hooks");
      } finally {
        setLoading(false);
      }
    }
    fetchHooks();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0075ff]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <GlassCard>
        <div className="text-center py-8 text-[#e31a1a]">{error}</div>
      </GlassCard>
    );
  }

  if (hooks.length === 0) {
    return (
      <GlassCard className="border-dashed">
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-[rgba(255,255,255,0.05)] rounded-full flex items-center justify-center mx-auto mb-4">
            {MessagingIcons.Lightning}
          </div>
          <h3 className="text-lg font-semibold text-white">No Winning Hooks Yet</h3>
          <p className="text-[#a0aec0] mt-2 max-w-md mx-auto">
            Run the AI Strategist to analyze your ad transcripts and extract the top-performing hooks.
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-white">Winning Hooks</h2>
        <p className="text-[#a0aec0]">
          Top-performing opening hooks extracted from your best ads
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard>
          <div className="text-sm text-[#a0aec0]">Total Hooks Analyzed</div>
          <div className="text-2xl font-bold text-white">{hooks.length}</div>
        </GlassCard>
        <GlassCard>
          <div className="text-sm text-[#a0aec0]">Avg Performance Score</div>
          <div className="text-2xl font-bold text-[#01b574]">
            {Math.round(hooks.reduce((sum, h) => sum + (h.performance_score || 0), 0) / hooks.length)}
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-sm text-[#a0aec0]">Top Hook Type</div>
          <div className="text-2xl font-bold text-[#0075ff]">
            {(() => {
              const types: Record<string, number> = {};
              hooks.forEach(h => { types[h.hook_type] = (types[h.hook_type] || 0) + 1; });
              return Object.entries(types).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
            })()}
          </div>
        </GlassCard>
      </div>

      {/* Hooks List */}
      <div className="space-y-4">
        {hooks
          .sort((a, b) => (b.performance_score || 0) - (a.performance_score || 0))
          .map((hook, idx) => (
            <GlassCard key={idx}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                  idx === 0 ? "bg-[#ffc107]" : idx === 1 ? "bg-[#a0aec0]" : idx === 2 ? "bg-[#cd7f32]" : "bg-[#718096]"
                }`}>
                  #{idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge color="blue">{hook.hook_type}</Badge>
                    <Badge color={hook.performance_score >= 80 ? "green" : hook.performance_score >= 60 ? "yellow" : "gray"}>
                      Score: {hook.performance_score}
                    </Badge>
                    {hook.hook_rate && hook.hook_rate > 0 && (
                      <span className="text-xs text-[#a0aec0]">
                        Hook Rate: {hook.hook_rate.toFixed(2)}%
                      </span>
                    )}
                  </div>
                  <blockquote className="text-white border-l-4 border-[#0075ff] pl-4 py-2 bg-[rgba(255,255,255,0.02)] rounded-r-[12px]">
                    &ldquo;{hook.hook_text}&rdquo;
                  </blockquote>
                  <div className="mt-3 grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-xs font-medium text-[#a0aec0] uppercase tracking-wider">Source Ad</h5>
                      <p className="text-white text-sm mt-1">{hook.ad_name}</p>
                      <p className="text-[#718096] text-xs">{hook.ad_id}</p>
                    </div>
                    <div>
                      <h5 className="text-xs font-medium text-[#a0aec0] uppercase tracking-wider">Why It Works</h5>
                      <p className="text-white text-sm mt-1">{hook.why_it_works}</p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
      </div>
    </div>
  );
}

// ============================================================================
// CROSS-POLLINATION TAB
// ============================================================================

function CrossPollinationTab() {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<CrossPollinationRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecommendations() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from("ai_creative_briefs")
          .select("cross_pollination, created_at")
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          throw fetchError;
        }

        if (data?.cross_pollination && Array.isArray(data.cross_pollination)) {
          setRecommendations(data.cross_pollination as CrossPollinationRecommendation[]);
        }
      } catch (err) {
        console.error("Error fetching cross-pollination:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch recommendations");
      } finally {
        setLoading(false);
      }
    }
    fetchRecommendations();
  }, []);

  // Helper to get awareness level badge color
  const getAwarenessColor = (level: string): "red" | "orange" | "yellow" | "blue" | "green" | "gray" => {
    const levelLower = level?.toLowerCase() || "";
    if (levelLower.includes("unaware")) return "red";
    if (levelLower.includes("problem")) return "orange";
    if (levelLower.includes("solution")) return "yellow";
    if (levelLower.includes("product")) return "blue";
    if (levelLower.includes("most")) return "green";
    return "gray";
  };

  // Helper to extract awareness level name
  const getAwarenessLevelName = (level: string): string => {
    if (!level) return "Unknown";
    const match = level.match(/(Unaware|Problem Aware|Solution Aware|Product Aware|Most Aware)/i);
    return match ? match[1] : level.split(".")[0].trim();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0075ff]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <GlassCard>
        <div className="text-center py-8 text-[#e31a1a]">{error}</div>
      </GlassCard>
    );
  }

  if (recommendations.length === 0) {
    return (
      <GlassCard className="border-dashed">
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-[rgba(255,255,255,0.05)] rounded-full flex items-center justify-center mx-auto mb-4">
            {MessagingIcons.Shuffle}
          </div>
          <h3 className="text-lg font-semibold text-white">No Cross-Pollination Recommendations Yet</h3>
          <p className="text-[#a0aec0] mt-2 max-w-md mx-auto">
            Run the AI Strategist to analyze your ads and sales calls, generating strategic recommendations.
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#7928ca] to-[#0075ff] rounded-[20px] p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            {MessagingIcons.Shuffle}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Cross-Pollination Strategy</h2>
            <p className="text-white/80 mt-1">
              AI-generated recommendations combining ad performance data with sales call insights
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-6">
        {recommendations.map((rec, idx) => {
          // Check if this is the new format or legacy format
          const isNewFormat = rec.creative_justification || rec.sales_call_insights || rec.concept_architecture;
          const title = rec.title || rec.suggestion || `Recommendation ${idx + 1}`;
          const adIds = rec.ad_ids || rec.source_ads || [];

          return (
            <GlassCard key={idx} padding="none" className="overflow-hidden">
              {/* Card Header */}
              <div className="p-6 border-b border-[rgba(255,255,255,0.05)]">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#7928ca] to-[#0075ff] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {adIds.map((adId, i) => (
                        <Badge key={i} color="blue">{adId}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {isNewFormat ? (
                <>
                  {/* Subsection 1: Creative Intelligence */}
                  {rec.creative_justification && (
                    <div className="p-6 border-b border-[rgba(255,255,255,0.05)]">
                      <h4 className="text-xs font-bold text-[#0075ff] uppercase tracking-wider mb-4">
                        Creative Intelligence
                      </h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Ads Referenced */}
                        <div>
                          <h5 className="text-sm font-medium text-[#a0aec0] mb-3">Ads Referenced</h5>
                          <div className="space-y-3">
                            {rec.creative_justification.ads_referenced?.map((ad, i) => (
                              <div key={i} className="bg-[rgba(255,255,255,0.02)] rounded-[12px] p-3">
                                <div className="text-[#0075ff] font-medium text-sm">{ad.ad_name}</div>
                                <div className="text-xs text-[#a0aec0] mt-1">{ad.key_metrics}</div>
                                <div className="text-white text-sm mt-2">{ad.what_worked}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Transcript Reference */}
                        <div>
                          <h5 className="text-sm font-medium text-[#a0aec0] mb-3">Ad Transcript Reference</h5>
                          {rec.creative_justification.transcript_reference ? (
                            <blockquote className="text-white text-sm border-l-4 border-[#7928ca] pl-4 py-2 bg-[rgba(255,255,255,0.02)] rounded-r-[12px] italic">
                              &ldquo;{rec.creative_justification.transcript_reference}&rdquo;
                            </blockquote>
                          ) : (
                            <p className="text-[#718096] text-sm italic">Not applicable</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Subsection 2: Sales Call Insights */}
                  {rec.sales_call_insights && (
                    <div className="p-6 border-b border-[rgba(255,255,255,0.05)]">
                      <h4 className="text-xs font-bold text-[#01b574] uppercase tracking-wider mb-4">
                        Sales Call Insights
                      </h4>
                      {rec.sales_call_insights.transcripts_referenced?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {rec.sales_call_insights.transcripts_referenced.map((t, i) => (
                            <Badge key={i} color="gray">{t}</Badge>
                          ))}
                        </div>
                      )}
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Pain Points */}
                        {rec.sales_call_insights.pain_points?.length > 0 && (
                          <div>
                            <h5 className="text-xs font-medium text-[#a0aec0] uppercase tracking-wider mb-2">Pain Points</h5>
                            <ul className="space-y-1">
                              {rec.sales_call_insights.pain_points.map((p, i) => (
                                <li key={i} className="text-white text-sm flex items-start gap-2">
                                  <span className="text-[#e31a1a] mt-1">•</span>
                                  <span>{p}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {/* Buying Signals */}
                        {rec.sales_call_insights.buying_signals?.length > 0 && (
                          <div>
                            <h5 className="text-xs font-medium text-[#a0aec0] uppercase tracking-wider mb-2">Buying Signals</h5>
                            <ul className="space-y-1">
                              {rec.sales_call_insights.buying_signals.map((s, i) => (
                                <li key={i} className="text-white text-sm flex items-start gap-2">
                                  <span className="text-[#01b574] mt-1">•</span>
                                  <span>{s}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {/* Business Objectives */}
                        {rec.sales_call_insights.business_objectives?.length > 0 && (
                          <div>
                            <h5 className="text-xs font-medium text-[#a0aec0] uppercase tracking-wider mb-2">Business Objectives</h5>
                            <ul className="space-y-1">
                              {rec.sales_call_insights.business_objectives.map((o, i) => (
                                <li key={i} className="text-white text-sm flex items-start gap-2">
                                  <span className="text-[#0075ff] mt-1">•</span>
                                  <span>{o}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {/* Perceived Obstacles */}
                        {rec.sales_call_insights.perceived_obstacles?.length > 0 && (
                          <div>
                            <h5 className="text-xs font-medium text-[#a0aec0] uppercase tracking-wider mb-2">Perceived Obstacles</h5>
                            <ul className="space-y-1">
                              {rec.sales_call_insights.perceived_obstacles.map((o, i) => (
                                <li key={i} className="text-white text-sm flex items-start gap-2">
                                  <span className="text-[#ffc107] mt-1">•</span>
                                  <span>{o}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {/* Past Failed Attempts */}
                        {rec.sales_call_insights.past_failed_attempts?.length > 0 && (
                          <div className="md:col-span-2">
                            <h5 className="text-xs font-medium text-[#a0aec0] uppercase tracking-wider mb-2">Past Failed Attempts</h5>
                            <ul className="space-y-1">
                              {rec.sales_call_insights.past_failed_attempts.map((a, i) => (
                                <li key={i} className="text-white text-sm flex items-start gap-2">
                                  <span className="text-[#718096] mt-1">•</span>
                                  <span>{a}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Subsection 3: Concept Architecture */}
                  {rec.concept_architecture && (
                    <div className="p-6 border-b border-[rgba(255,255,255,0.05)]">
                      <h4 className="text-xs font-bold text-[#ffc107] uppercase tracking-wider mb-4">
                        Concept Architecture
                      </h4>
                      <div className="space-y-4">
                        {/* Awareness Level */}
                        {rec.concept_architecture.awareness_level && (
                          <div>
                            <h5 className="text-xs font-medium text-[#a0aec0] uppercase tracking-wider mb-2">Awareness Level</h5>
                            <div className="flex items-start gap-3">
                              <Badge color={getAwarenessColor(rec.concept_architecture.awareness_level)}>
                                {getAwarenessLevelName(rec.concept_architecture.awareness_level)}
                              </Badge>
                              <p className="text-white text-sm flex-1">
                                {rec.concept_architecture.awareness_level.replace(/^(Unaware|Problem Aware|Solution Aware|Product Aware|Most Aware)[.\s-]*/i, "")}
                              </p>
                            </div>
                          </div>
                        )}
                        {/* Persona */}
                        {rec.concept_architecture.persona && (
                          <div>
                            <h5 className="text-xs font-medium text-[#a0aec0] uppercase tracking-wider mb-2">Persona</h5>
                            <p className="text-white text-sm bg-[rgba(255,255,255,0.02)] p-4 rounded-[12px]">
                              {rec.concept_architecture.persona}
                            </p>
                          </div>
                        )}
                        {/* Angle */}
                        {rec.concept_architecture.angle && (
                          <div>
                            <h5 className="text-xs font-medium text-[#a0aec0] uppercase tracking-wider mb-2">Angle</h5>
                            <p className="text-white text-sm bg-[rgba(255,255,255,0.02)] p-4 rounded-[12px]">
                              {rec.concept_architecture.angle}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Legacy format fallback */
                <div className="p-6 border-b border-[rgba(255,255,255,0.05)]">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-xs font-medium text-[#a0aec0] uppercase tracking-wider mb-2">
                        Elements to Combine
                      </h5>
                      {typeof rec.elements_to_combine === 'string' ? (
                        <p className="text-white text-sm">{rec.elements_to_combine}</p>
                      ) : (
                        <ul className="text-white text-sm space-y-1">
                          {Object.entries(rec.elements_to_combine || {}).map(([adId, desc]) => (
                            <li key={adId}><span className="text-[#0075ff] font-medium">{adId}:</span> {String(desc)}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {rec.rationale && (
                      <div>
                        <h5 className="text-xs font-medium text-[#a0aec0] uppercase tracking-wider mb-2">
                          Rationale
                        </h5>
                        <p className="text-white text-sm">{rec.rationale}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Subsection 4: Expected Impact */}
              <div className="p-6 bg-[rgba(1,181,116,0.05)]">
                <h4 className="text-xs font-bold text-[#01b574] uppercase tracking-wider mb-2">
                  Expected Impact
                </h4>
                <p className="text-[#01b574] text-base font-medium">
                  {rec.expected_impact}
                </p>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// PLACEHOLDER TAB
// ============================================================================

function PlaceholderTab({ title, description }: { title: string; description: string }) {
  return (
    <GlassCard className="border-dashed">
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-[rgba(255,255,255,0.05)] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#a0aec0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-[#a0aec0] mt-2 max-w-md mx-auto">{description}</p>
      </div>
    </GlassCard>
  );
}
