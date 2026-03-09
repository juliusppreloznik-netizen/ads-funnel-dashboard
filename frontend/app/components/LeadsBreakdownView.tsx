"use client";

import { useState, useEffect, useCallback } from "react";
import { ChartJS } from "@/lib/chart-setup";
import {
  Card,
  BarChart,
  DonutChart,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableHeaderCell,
  Badge,
} from "@tremor/react";
import { DateRangeValue } from "../DateRangePicker";
import {
  getLeadsBreakdownDataV2,
  type LeadsBreakdownDataV2,
  type RevenueTierData,
  type InvestmentAbilityData,
  type ScalingChallengeData,
  type LeadCardData,
} from "@/lib/contact-queries";
import { format } from "date-fns";

// ============================================================================
// TYPES
// ============================================================================

interface LeadsBreakdownViewProps {
  dateRange: DateRangeValue;
}

// ============================================================================
// ICONS
// ============================================================================

const LeadsIcons = {
  DollarSign: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  CreditCard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  AlertTriangle: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  Users: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  CheckCircle: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Eye: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Trophy: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  TrendingUp: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function KpiCard({
  title,
  value,
  icon,
  trend,
  trendLabel,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
}) {
  const trendColor = trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-zinc-500";

  return (
    <div className="bg-obsidian-800/50 rounded-lg p-4 border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-zinc-500 text-sm">{title}</span>
        <span className="text-blue-400">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {trendLabel && (
        <div className={`text-xs mt-1 ${trendColor}`}>
          {trend === "up" && "↑ "}
          {trend === "down" && "↓ "}
          {trendLabel}
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-blue-400">{icon}</span>
      <h2 className="text-xl font-semibold text-white">{title}</h2>
    </div>
  );
}

function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LeadsBreakdownView({ dateRange }: LeadsBreakdownViewProps) {
  const [data, setData] = useState<LeadsBreakdownDataV2 | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<"overview" | "leads">("overview");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getLeadsBreakdownDataV2({
        from: dateRange?.from,
        to: dateRange?.to,
      });

      if (result.error) {
        setError(result.error.message);
      } else {
        setData(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 text-center">
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-zinc-500 py-12">
        No data available for the selected date range.
      </div>
    );
  }

  // Prepare chart data
  const revenueChartData = data.revenueDistribution.map((item) => ({
    name: item.label,
    Leads: item.count,
    Qualified: item.qualified,
    "Qual Rate": item.qualificationRate,
  }));

  const investmentChartData = data.investmentAbilityDistribution.map((item) => ({
    name: item.value.length > 30 ? item.value.substring(0, 30) + "..." : item.value,
    value: item.count,
  }));

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setSelectedTab("overview")}
          className={`px-4 py-2 rounded-t text-sm font-medium transition-colors ${
            selectedTab === "overview"
              ? "bg-blue-600 text-white"
              : "text-zinc-500 hover:text-white hover:bg-obsidian-700"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setSelectedTab("leads")}
          className={`px-4 py-2 rounded-t text-sm font-medium transition-colors ${
            selectedTab === "leads"
              ? "bg-blue-600 text-white"
              : "text-zinc-500 hover:text-white hover:bg-obsidian-700"
          }`}
        >
          Individual Leads ({data.totalLeads})
        </button>
      </div>

      {selectedTab === "overview" && (
        <>
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard
              title="Total Leads"
              value={data.totalLeads}
              icon={LeadsIcons.Users}
              trendLabel={`${data.allTimeTotal} all time`}
              trend="neutral"
            />
            <KpiCard
              title="Qualified"
              value={`${data.totalQualified} (${formatPercent(data.qualificationRate)})`}
              icon={LeadsIcons.CheckCircle}
            />
            <KpiCard
              title="Shown"
              value={`${data.totalShown} (${formatPercent(data.showRate)})`}
              icon={LeadsIcons.Eye}
            />
            <KpiCard
              title="Closed"
              value={`${data.totalClosed} (${formatPercent(data.closeRate)})`}
              icon={LeadsIcons.Trophy}
            />
          </div>

          {/* Revenue Distribution */}
          <Card className="bg-obsidian-800/50 border-white/10">
            <SectionHeader title="Revenue Distribution" icon={LeadsIcons.DollarSign} />
            <p className="text-zinc-500 text-sm mb-4">
              Monthly revenue breakdown of leads with qualification rates
            </p>
            <BarChart
              className="h-72"
              data={revenueChartData}
              index="name"
              categories={["Leads", "Qualified"]}
              colors={["blue", "green"]}
              yAxisWidth={48}
              showLegend={true}
              valueFormatter={(value) => String(value)}
            />
            {/* Revenue breakdown table */}
            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell className="text-zinc-500">Revenue Tier</TableHeaderCell>
                    <TableHeaderCell className="text-zinc-500 text-right">Leads</TableHeaderCell>
                    <TableHeaderCell className="text-zinc-500 text-right">% of Total</TableHeaderCell>
                    <TableHeaderCell className="text-zinc-500 text-right">Qualified</TableHeaderCell>
                    <TableHeaderCell className="text-zinc-500 text-right">Qual Rate</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.revenueDistribution.map((item) => (
                    <TableRow key={item.label}>
                      <TableCell className="text-white font-medium">{item.label}</TableCell>
                      <TableCell className="text-zinc-500 text-right">{item.count}</TableCell>
                      <TableCell className="text-zinc-500 text-right">{formatPercent(item.percentage)}</TableCell>
                      <TableCell className="text-green-400 text-right">{item.qualified}</TableCell>
                      <TableCell className="text-right">
                        <Badge color={item.qualificationRate >= 50 ? "green" : item.qualificationRate >= 25 ? "yellow" : "red"}>
                          {formatPercent(item.qualificationRate)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Investment Ability Distribution */}
          <Card className="bg-obsidian-800/50 border-white/10">
            <SectionHeader title="Investment Ability Distribution" icon={LeadsIcons.CreditCard} />
            <p className="text-zinc-500 text-sm mb-4">
              How leads are distributed by their stated investment ability
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <DonutChart
                  className="h-60"
                  data={investmentChartData}
                  index="name"
                  category="value"
                  colors={["blue", "cyan", "indigo", "violet", "purple", "fuchsia"]}
                  showLabel={true}
                  valueFormatter={(value) => String(value)}
                />
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell className="text-zinc-500">Investment Ability</TableHeaderCell>
                      <TableHeaderCell className="text-zinc-500 text-right">Count</TableHeaderCell>
                      <TableHeaderCell className="text-zinc-500 text-right">Qual Rate</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.investmentAbilityDistribution.slice(0, 10).map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-white font-medium max-w-[200px] truncate" title={item.value}>
                          {item.value}
                        </TableCell>
                        <TableCell className="text-zinc-500 text-right">{item.count}</TableCell>
                        <TableCell className="text-right">
                          <Badge color={item.qualificationRate >= 50 ? "green" : item.qualificationRate >= 25 ? "yellow" : "red"}>
                            {formatPercent(item.qualificationRate)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>

          {/* Top Scaling Challenges */}
          <Card className="bg-obsidian-800/50 border-white/10">
            <SectionHeader title="Top Scaling Challenges" icon={LeadsIcons.AlertTriangle} />
            <p className="text-zinc-500 text-sm mb-4">
              Most common challenges leads face, ranked by frequency
            </p>
            {data.scalingChallenges.length === 0 ? (
              <div className="text-center text-zinc-500 py-8">
                No scaling challenge data available. This field will populate once leads provide their challenges.
              </div>
            ) : (
              <div className="space-y-3">
                {data.scalingChallenges.slice(0, 10).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-3 bg-obsidian-900/50 rounded-lg border border-white/10"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="text-white font-medium truncate" title={item.challenge}>
                        {item.challenge}
                      </div>
                      <div className="text-zinc-500 text-sm">
                        {item.count} leads ({formatPercent(item.percentage)})
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <Badge color={item.qualificationRate >= 50 ? "green" : item.qualificationRate >= 25 ? "yellow" : "gray"}>
                        {formatPercent(item.qualificationRate)} qual
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {selectedTab === "leads" && (
        <LeadsTable leads={data.leads} />
      )}
    </div>
  );
}

// ============================================================================
// LEADS TABLE COMPONENT
// ============================================================================

function LeadsTable({ leads }: { leads: LeadCardData[] }) {
  const [search, setSearch] = useState("");
  const [filterQualified, setFilterQualified] = useState<"all" | "qualified" | "dq">("all");

  const filteredLeads = leads.filter((lead) => {
    // Search filter
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      lead.name.toLowerCase().includes(searchLower) ||
      lead.email?.toLowerCase().includes(searchLower) ||
      lead.phone?.includes(search) ||
      lead.ad_name?.toLowerCase().includes(searchLower) ||
      lead.scaling_challenge?.toLowerCase().includes(searchLower);

    // Qualification filter
    const matchesQualified =
      filterQualified === "all" ||
      (filterQualified === "qualified" && lead.is_qualified === true) ||
      (filterQualified === "dq" && lead.is_qualified === false);

    return matchesSearch && matchesQualified;
  });

  return (
    <Card className="bg-obsidian-800/50 border-white/10">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 bg-obsidian-900 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterQualified("all")}
            className={`px-4 py-2 rounded text-sm ${
              filterQualified === "all"
                ? "bg-blue-600 text-white"
                : "bg-obsidian-700 text-zinc-500 hover:bg-obsidian-600"
            }`}
          >
            All ({leads.length})
          </button>
          <button
            onClick={() => setFilterQualified("qualified")}
            className={`px-4 py-2 rounded text-sm ${
              filterQualified === "qualified"
                ? "bg-green-600 text-white"
                : "bg-obsidian-700 text-zinc-500 hover:bg-obsidian-600"
            }`}
          >
            Qualified ({leads.filter((l) => l.is_qualified === true).length})
          </button>
          <button
            onClick={() => setFilterQualified("dq")}
            className={`px-4 py-2 rounded text-sm ${
              filterQualified === "dq"
                ? "bg-red-600 text-white"
                : "bg-obsidian-700 text-zinc-500 hover:bg-obsidian-600"
            }`}
          >
            DQ ({leads.filter((l) => l.is_qualified === false).length})
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="text-zinc-500 text-sm mb-4">
        Showing {filteredLeads.length} of {leads.length} leads
      </div>

      {/* Leads list */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {filteredLeads.length === 0 ? (
          <div className="text-center text-zinc-500 py-8">
            No leads match your filters.
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))
        )}
      </div>
    </Card>
  );
}

// ============================================================================
// LEAD CARD COMPONENT
// ============================================================================

function LeadCard({ lead }: { lead: LeadCardData }) {
  const [expanded, setExpanded] = useState(false);

  const statusBadge = lead.closed_deal ? (
    <Badge color="green">Closed</Badge>
  ) : lead.showed_up ? (
    <Badge color="blue">Showed</Badge>
  ) : lead.is_qualified === true ? (
    <Badge color="cyan">Qualified</Badge>
  ) : lead.is_qualified === false ? (
    <Badge color="red">DQ</Badge>
  ) : (
    <Badge color="gray">Lead</Badge>
  );

  return (
    <div
      className={`bg-obsidian-900/50 rounded-lg border border-white/10 overflow-hidden transition-all ${
        expanded ? "ring-2 ring-blue-500" : ""
      }`}
    >
      {/* Header - always visible */}
      <div
        className="p-4 flex items-center gap-4 cursor-pointer hover:bg-obsidian-800/50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium">{lead.name}</span>
            {statusBadge}
          </div>
          <div className="text-zinc-500 text-sm truncate">
            {lead.email || lead.phone || "No contact info"}
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          {lead.revenue !== null && (
            <div className="text-green-400 font-medium">{formatCurrency(lead.revenue)}/mo</div>
          )}
          <div className="text-zinc-500 text-xs">
            {lead.form_submitted_at
              ? format(new Date(lead.form_submitted_at), "MMM d, yyyy")
              : "Unknown date"}
          </div>
        </div>
        <div className="flex-shrink-0 text-zinc-500">
          <svg
            className={`w-5 h-5 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-white/10 p-4 space-y-4">
          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-zinc-500 text-xs uppercase">Email</div>
              <div className="text-white">{lead.email || "-"}</div>
            </div>
            <div>
              <div className="text-zinc-500 text-xs uppercase">Phone</div>
              <div className="text-white">{lead.phone || "-"}</div>
            </div>
          </div>

          {/* Attribution */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-zinc-500 text-xs uppercase">Ad Name</div>
              <div className="text-white truncate" title={lead.ad_name || undefined}>
                {lead.ad_name || "-"}
              </div>
            </div>
            <div>
              <div className="text-zinc-500 text-xs uppercase">Campaign</div>
              <div className="text-white truncate" title={lead.campaign_name || undefined}>
                {lead.campaign_name || "-"}
              </div>
            </div>
          </div>

          {/* Custom Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-zinc-500 text-xs uppercase">Monthly Revenue</div>
              <div className="text-green-400 font-medium">
                {lead.revenue !== null ? formatCurrency(lead.revenue) : "-"}
              </div>
            </div>
            <div>
              <div className="text-zinc-500 text-xs uppercase">Investment Ability</div>
              <div className="text-white">{lead.investment_ability || "-"}</div>
            </div>
          </div>

          {/* Scaling Challenge */}
          {lead.scaling_challenge && (
            <div>
              <div className="text-zinc-500 text-xs uppercase">Scaling Challenge</div>
              <div className="text-white bg-obsidian-800 p-2 rounded mt-1">
                {lead.scaling_challenge}
              </div>
            </div>
          )}

          {/* Pipeline Stage */}
          {lead.current_stage && (
            <div>
              <div className="text-zinc-500 text-xs uppercase">Current Stage</div>
              <div className="text-blue-400">{lead.current_stage}</div>
            </div>
          )}

          {/* Deal Value */}
          {lead.closed_deal && lead.deal_value !== null && (
            <div>
              <div className="text-zinc-500 text-xs uppercase">Deal Value</div>
              <div className="text-green-400 font-bold text-lg">{formatCurrency(lead.deal_value)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
