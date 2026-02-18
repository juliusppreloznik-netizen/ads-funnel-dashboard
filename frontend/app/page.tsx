// app/page.tsx
// Cometly-style Ad Performance Dashboard with Contact-Level Data

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { subDays, startOfDay, endOfDay } from "date-fns";

// Import ChartJS with all components pre-registered (for Dashboard view)
import { ChartJS } from "@/lib/chart-setup";

// Import Tremor components
import {
  Card,
  BarChart,
  DonutChart as TremorDonutChart,
  AreaChart,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableHeaderCell,
} from "@tremor/react";

// Import custom DateRangePicker
import { CustomDateRangePicker, DateRangeValue } from "./DateRangePicker";

// Import contact-level query functions
import {
  getMarketingKPIsFromContacts,
  getDailyContactTrends,
  getSourceKPIs,
  getLeadsBreakdownData,
  diagnoseDatabaseState,
  type MarketingKPIs,
  type DailyTrendData,
  type DateRangeFilter,
  type SourceKPIs,
  type BreakdownLevel,
  type LeadsBreakdownData,
  type SourceQuality,
  type RevenueTrendPoint,
  type InvestmentHeatmapRow,
  type RevenueFunnelStage,
  type InvestmentBreakdown,
} from "../lib/contact-queries";

// Import Debug Panel
import { DebugPanel } from "./DebugPanel";

// Import dnd-kit for drag-and-drop
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ============================================================================
// TYPES
// ============================================================================

type ViewType = "Dashboard" | "Leads Breakdown" | "Ads Manager" | "Report Builder" | "Contacts" | "Events Manager" | "Integrations";

interface NavItem {
  name: ViewType;
  icon: React.ReactNode;
}

interface DashboardData {
  kpis: MarketingKPIs | null;
  previousKpis: MarketingKPIs | null;
  trends: DailyTrendData[] | null;
  sourceKPIs: SourceKPIs[] | null;
}

// ============================================================================
// ICONS
// ============================================================================

const Icons = {
  Dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  ),
  AdsManager: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
  ),
  ReportBuilder: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Contacts: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  EventsManager: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Integrations: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
    </svg>
  ),
  ChevronLeft: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  ChevronRight: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  Calendar: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  TrendUp: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  TrendDown: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
  ),
  LeadsBreakdown: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

// Navigation items configuration
const navItems: NavItem[] = [
  { name: "Dashboard", icon: Icons.Dashboard },
  { name: "Leads Breakdown", icon: Icons.LeadsBreakdown },
  { name: "Ads Manager", icon: Icons.AdsManager },
  { name: "Report Builder", icon: Icons.ReportBuilder },
  { name: "Contacts", icon: Icons.Contacts },
  { name: "Events Manager", icon: Icons.EventsManager },
  { name: "Integrations", icon: Icons.Integrations },
];

// ============================================================================
// FORMAT HELPERS
// ============================================================================

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const formatCurrencyCompact = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

const formatNumberCompact = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
};

const formatDateLabel = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatPercentageChange = (current: number, previous: number): string => {
  if (previous === 0) return current > 0 ? "+100.00%" : "0.00%";
  const change = ((current - previous) / previous) * 100;
  return `${change > 0 ? "+" : ""}${change.toFixed(2)}%`;
};

// ============================================================================
// CUSTOM HOOK: useDashboardData
// ============================================================================

/**
 * Calculate previous period date range based on current range
 */
function getPreviousPeriod(dateRange: DateRangeValue): DateRangeFilter | undefined {
  if (!dateRange?.from || !dateRange?.to) return undefined;

  const periodLength = Math.ceil(
    (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)
  );

  const previousTo = new Date(dateRange.from);
  previousTo.setDate(previousTo.getDate() - 1);

  const previousFrom = new Date(previousTo);
  previousFrom.setDate(previousFrom.getDate() - periodLength + 1);

  return { from: previousFrom, to: previousTo };
}

function useDashboardData(dateRange: DateRangeValue, breakdownLevel: BreakdownLevel = "campaign") {
  const [data, setData] = useState<DashboardData>({
    kpis: null,
    previousKpis: null,
    trends: null,
    sourceKPIs: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    console.log("🚀 [useDashboardData] Starting data fetch...");
    console.log("📅 [useDashboardData] Date range:", {
      from: dateRange?.from?.toISOString(),
      to: dateRange?.to?.toISOString(),
      selectValue: dateRange?.selectValue,
    });

    // Validation: Ensure we have a valid date range
    if (!dateRange?.from || !dateRange?.to) {
      console.error("❌ [useDashboardData] Invalid date range - from or to is undefined:", dateRange);
      setError("Invalid date range selected. Please select a valid date range.");
      setLoading(false);
      return;
    }

    // Run diagnostic on first load to check raw data state
    await diagnoseDatabaseState();

    try {
      // Now we know both from and to are valid Date objects
      const filter: DateRangeFilter = {
        from: dateRange.from,
        to: dateRange.to,
      };

      console.log("🔍 [useDashboardData] Filter being passed to queries:", {
        from: filter.from?.toISOString(),
        to: filter.to?.toISOString(),
      });

      const previousFilter = getPreviousPeriod(dateRange);
      console.log("🔍 [useDashboardData] Previous period filter:", previousFilter);

      const [kpiResult, previousKpiResult, trendResult, sourceResult] = await Promise.all([
        getMarketingKPIsFromContacts(filter),
        previousFilter ? getMarketingKPIsFromContacts(previousFilter) : Promise.resolve({ data: null, error: null }),
        getDailyContactTrends(filter),
        getSourceKPIs(filter, breakdownLevel),
      ]);

      console.log("✅ [useDashboardData] KPI Result:", kpiResult.data);
      console.log("✅ [useDashboardData] Previous KPI Result:", previousKpiResult.data);
      console.log("✅ [useDashboardData] Trends Result:", trendResult.data?.length, "records");
      console.log("✅ [useDashboardData] Source KPIs Result:", sourceResult.data?.length, "sources");

      if (kpiResult.error) {
        console.error("❌ KPI Error:", kpiResult.error);
      }
      if (previousKpiResult.error) {
        console.error("❌ Previous KPI Error:", previousKpiResult.error);
      }
      if (trendResult.error) {
        console.error("❌ Trend Error:", trendResult.error);
      }
      if (sourceResult.error) {
        console.error("❌ Source KPI Error:", sourceResult.error);
      }

      setData({
        kpis: kpiResult.data,
        previousKpis: previousKpiResult.data,
        trends: trendResult.data,
        sourceKPIs: sourceResult.data,
      });

      console.log("🏁 [useDashboardData] Data fetch complete");
    } catch (err) {
      console.error("❌ [useDashboardData] Error fetching dashboard data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [dateRange, breakdownLevel]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================================================
// SIDEBAR COMPONENT
// ============================================================================

function Sidebar({
  currentView,
  setView,
  isCollapsed,
  setIsCollapsed,
}: {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}) {
  return (
    <aside
      className={`${
        isCollapsed ? "w-16" : "w-64"
      } bg-gray-900 text-white flex flex-col transition-all duration-300 ease-in-out`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-lg">Catalyst</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
        >
          {isCollapsed ? Icons.ChevronRight : Icons.ChevronLeft}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = currentView === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setView(item.name)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className={isActive ? "text-white" : ""}>{item.icon}</span>
              {!isCollapsed && (
                <span className="font-medium text-sm">{item.name}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm font-medium">
              CM
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Catalyst Marketing</p>
              <p className="text-xs text-gray-500 truncate">Pro Plan</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

// ============================================================================
// HEADER COMPONENT
// ============================================================================

function Header({
  title,
  dateRange,
  setDateRange,
}: {
  title: string;
  dateRange: DateRangeValue;
  setDateRange: (range: DateRangeValue) => void;
}) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 relative z-50">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500">Contact-level attribution analytics</p>
      </div>

      <div className="flex items-center gap-4 relative z-50">
        {/* Live Indicator */}
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-gray-600 font-medium">Live</span>
        </div>

        {/* Custom Date Range Picker */}
        <CustomDateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />
      </div>
    </header>
  );
}

// ============================================================================
// KPI CARD COMPONENT (Cometly Style with Chart.js)
// ============================================================================

interface TrendDataPoint {
  date: string;
  value: number;
}

interface MetricCardProps {
  title: string;
  mainValue: string;
  previousValue: string;
  subtitle: string;
  percentageChange: string;
  isPositiveChange: boolean;
  trendData: TrendDataPoint[];
  chartType: "line" | "bar";
  chartColor: string;
  headlineColor: string;
  valueType: "currency" | "number";
}

/**
 * Calculate percentage change between current and previous values
 */
function calculatePercentageChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return ((current - previous) / previous) * 100;
}

/**
 * Cometly-style KPI Card with Chart.js implementation
 */
function MetricCard({
  title,
  mainValue,
  previousValue,
  subtitle,
  percentageChange,
  isPositiveChange,
  trendData,
  chartType,
  chartColor,
  headlineColor,
  valueType,
}: MetricCardProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart if it exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const labels = trendData.map((d) => formatDateLabel(d.date));
    const data = trendData.map((d) => d.value);

    const formatValueFn = (value: number) => {
      if (valueType === "currency") {
        return formatCurrencyCompact(value);
      }
      return formatNumberCompact(value);
    };

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "#fff",
          bodyColor: "#fff",
          padding: 12,
          displayColors: false,
          callbacks: {
            title: (context: { label: string }[]) => context[0].label,
            label: (context: { parsed: { y: number } }) => {
              const val = context.parsed.y;
              return `${subtitle}: ${valueType === "currency" ? formatCurrency(val) : formatNumber(val)}`;
            },
          },
        },
        datalabels: {
          display: (context: { dataIndex: number; dataset: { data: number[] } }) => {
            // Only show labels if there are few data points or for every nth point
            const dataLength = context.dataset.data.length;
            if (dataLength <= 7) return true;
            // Show every 3rd label for larger datasets
            return context.dataIndex % Math.ceil(dataLength / 7) === 0;
          },
          align: "top" as const,
          anchor: "end" as const,
          color: "#374151",
          font: {
            size: 9,
            weight: "bold" as const,
          },
          formatter: (value: number) => (value > 0 ? formatValueFn(value) : ""),
          offset: 4,
        },
      },
      scales: {
        x: {
          display: true,
          grid: {
            display: chartType === "line",
            color: "rgba(0, 0, 0, 0.04)",
          },
          ticks: {
            color: "#9CA3AF",
            font: {
              size: 9,
            },
            maxRotation: 45,
            minRotation: 45,
            callback: function(value: string | number) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const self = this as any;
              const label = self.getLabelForValue(value as number);
              // Show fewer labels for larger datasets
              const index = typeof value === "number" ? value : parseInt(value as string);
              if (labels.length <= 7) return label;
              if (index % Math.ceil(labels.length / 7) === 0) return label;
              return "";
            },
          },
        },
        y: {
          display: true,
          grid: {
            display: true,
            color: "rgba(0, 0, 0, 0.04)",
          },
          ticks: {
            color: "#9CA3AF",
            font: {
              size: 9,
            },
            callback: function(value: string | number) {
              const numValue = typeof value === "string" ? parseFloat(value) : value;
              return formatValueFn(numValue);
            },
            maxTicksLimit: 5,
          },
          beginAtZero: true,
        },
      },
    };

    if (chartType === "line") {
      chartInstanceRef.current = new ChartJS(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              data,
              borderColor: chartColor,
              backgroundColor: chartColor,
              borderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 5,
              pointBackgroundColor: chartColor,
              pointBorderColor: "#fff",
              pointBorderWidth: 1,
              tension: 0.3,
              fill: false,
            },
          ],
        },
        options: commonOptions as never,
      });
    } else {
      chartInstanceRef.current = new ChartJS(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              data,
              backgroundColor: chartColor,
              borderRadius: 4,
              barPercentage: 0.8,
              categoryPercentage: 0.9,
            },
          ],
        },
        options: {
          ...commonOptions,
          plugins: {
            ...commonOptions.plugins,
            datalabels: {
              ...commonOptions.plugins.datalabels,
              align: "end" as const,
              anchor: "end" as const,
            },
          },
        } as never,
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [trendData, chartType, chartColor, subtitle, valueType]);

  return (
    <div className="bg-white px-4 pt-3 pb-5 border border-solid border-gray-200 rounded-lg shadow-sm w-full relative h-full min-h-[280px]">
      {/* Header */}
      <div className="flex flex-row items-center justify-between h-10">
        <span className="text-sm font-semibold text-gray-800">{title}</span>
      </div>

      {/* Values Section */}
      <div className="flex flex-row gap-4 items-center justify-start my-3">
        <div>
          {/* Main Value and Previous Value */}
          <div className="flex flex-row items-baseline gap-x-2">
            <div
              className="font-semibold cursor-pointer leading-tight text-2xl"
              style={{ color: headlineColor }}
            >
              {mainValue}
            </div>
            <div className="font-normal cursor-default leading-tight text-gray-400 text-sm">
              {previousValue}
            </div>
          </div>

          {/* Subtitle and Percentage Change */}
          <div className="font-medium text-gray-500 flex gap-x-2 items-center text-xs mt-1">
            {subtitle}
            <div
              className={`border border-solid rounded-full py-0.5 px-1.5 flex flex-row items-center gap-x-0.5 ${
                isPositiveChange
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <span
                className={`font-medium text-xs ${
                  isPositiveChange ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {percentageChange}
              </span>
              {isPositiveChange ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className="text-emerald-600"
                >
                  <path
                    d="M6.35355 2.14645C6.15829 1.95118 5.84171 1.95118 5.64645 2.14645L2.14645 5.64645C1.95118 5.84171 1.95118 6.15829 2.14645 6.35355C2.34171 6.54882 2.65829 6.54882 2.85355 6.35355L5.5 3.70711L5.5 9.5C5.5 9.77614 5.72386 10 6 10C6.27614 10 6.5 9.77614 6.5 9.5L6.5 3.70711L9.14645 6.35355C9.34171 6.54882 9.65829 6.54882 9.85355 6.35355C10.0488 6.15829 10.0488 5.84171 9.85355 5.64645L6.35355 2.14645Z"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className="text-red-600"
                >
                  <path
                    d="M6.35355 9.85355C6.15829 10.0488 5.84171 10.0488 5.64645 9.85355L2.14645 6.35355C1.95118 6.15829 1.95118 5.84171 2.14645 5.64645C2.34171 5.45118 2.65829 5.45118 2.85355 5.64645L5.5 8.29289L5.5 2.5C5.5 2.22386 5.72386 2 6 2C6.27614 2 6.5 2.22386 6.5 2.5L6.5 8.29289L9.14645 5.64645C9.34171 5.45118 9.65829 5.45118 9.85355 5.64645C10.0488 5.84171 10.0488 6.15829 9.85355 6.35355L6.35355 9.85355Z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="relative w-full" style={{ height: "150px" }}>
        {trendData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-300 text-xs">
            No data available
          </div>
        ) : (
          <canvas ref={chartRef} />
        )}
      </div>
    </div>
  );
}


// ============================================================================
// KPI PER SOURCE TABLE COMPONENT
// ============================================================================

// ============================================================================
// KPI PER SOURCE TABLE - ENHANCED VERSION WITH DRAG-AND-DROP
// ============================================================================

// Column definition for the KPI table
interface ColumnDef {
  id: string;
  label: string;
  shortLabel?: string;
  align: "left" | "center" | "right";
  width?: string;
  render: (row: SourceKPIs, totals: SourceKPITotals) => React.ReactNode;
  getValue: (row: SourceKPIs) => number | string;
  renderTotal?: (totals: SourceKPITotals) => React.ReactNode;
}

interface SourceKPITotals {
  applications: number;
  qualified: number;
  dq: number;
  shown: number;
  closes: number;
  spend: number;
  revenue: number;
  cashCollected: number;
  dealValue: number;
  showRate: number;
  closeRate: number;
  costPerLead: number;
  roas: number;
}

// Badge components for styled numbers
const PurpleBadge = ({ value }: { value: number }) => (
  <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 min-w-[32px]">
    {value}
  </span>
);

const GreenBadge = ({ value }: { value: number }) => (
  <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 min-w-[32px]">
    {value}
  </span>
);

const RedBadge = ({ value }: { value: number }) => (
  <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 min-w-[32px]">
    {value}
  </span>
);

const PercentageText = ({ value }: { value: number }) => (
  <span className={`text-sm font-medium ${value === 0 ? "text-red-500" : "text-gray-700"}`}>
    {value.toFixed(1)}%
  </span>
);

const RoasText = ({ value }: { value: number }) => (
  <span className={`text-sm font-semibold ${value === 0 ? "text-red-500" : "text-gray-700"}`}>
    {value.toFixed(2)}x
  </span>
);

const RevenueText = ({ value }: { value: number }) => (
  <span className="text-sm font-semibold text-emerald-600">
    ${formatNumber(Math.round(value))}
  </span>
);

// Default column order
const DEFAULT_COLUMN_ORDER = [
  "source",
  "spend",
  "applications",
  "qualified",
  "dq",
  "shown",
  "showRate",
  "closes",
  "closeRate",
  "revenue",
  "cashCollected",
  "dealValue",
  "costPerLead",
  "roas",
];

// Column definitions
const createColumnDefs = (): Record<string, ColumnDef> => ({
  source: {
    id: "source",
    label: "AD NAME",
    align: "left",
    width: "200px",
    render: (row) => (
      <div className="min-w-[180px]">
        <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]" title={row.source}>
          {row.source}
        </div>
        {row.sourceId && (
          <div className="text-xs text-gray-400 truncate max-w-[200px]" title={row.sourceId}>
            {row.sourceId}
          </div>
        )}
      </div>
    ),
    getValue: (row) => row.source,
    renderTotal: () => (
      <div className="text-sm font-semibold text-gray-900">All Sources</div>
    ),
  },
  spend: {
    id: "spend",
    label: "SPEND",
    align: "right",
    render: (row) => (
      <span className="text-sm text-gray-700">${formatNumber(Math.round(row.spend))}</span>
    ),
    getValue: (row) => row.spend,
    renderTotal: (totals) => (
      <span className="text-sm font-semibold text-gray-900">${formatNumber(Math.round(totals.spend))}</span>
    ),
  },
  applications: {
    id: "applications",
    label: "APPLICATIONS",
    shortLabel: "APPS",
    align: "center",
    render: (row) => <PurpleBadge value={row.applications} />,
    getValue: (row) => row.applications,
    renderTotal: (totals) => <PurpleBadge value={totals.applications} />,
  },
  qualified: {
    id: "qualified",
    label: "QUALIFIED",
    shortLabel: "QUAL",
    align: "center",
    render: (row) => <GreenBadge value={row.qualified} />,
    getValue: (row) => row.qualified,
    renderTotal: (totals) => <GreenBadge value={totals.qualified} />,
  },
  dq: {
    id: "dq",
    label: "DQ",
    align: "center",
    render: (row) => <RedBadge value={row.dq} />,
    getValue: (row) => row.dq,
    renderTotal: (totals) => <RedBadge value={totals.dq} />,
  },
  shown: {
    id: "shown",
    label: "SHOWS",
    align: "center",
    render: (row) => <span className="text-sm text-gray-700">{row.shown}</span>,
    getValue: (row) => row.shown,
    renderTotal: (totals) => <span className="text-sm font-semibold text-gray-900">{totals.shown}</span>,
  },
  showRate: {
    id: "showRate",
    label: "SHOW RATE",
    align: "center",
    render: (row) => <PercentageText value={row.showRate} />,
    getValue: (row) => row.showRate,
    renderTotal: (totals) => <PercentageText value={totals.showRate} />,
  },
  closes: {
    id: "closes",
    label: "SALES",
    align: "center",
    render: (row) => <GreenBadge value={row.closes} />,
    getValue: (row) => row.closes,
    renderTotal: (totals) => <GreenBadge value={totals.closes} />,
  },
  closeRate: {
    id: "closeRate",
    label: "CLOSE RATE",
    align: "center",
    render: (row) => <PercentageText value={row.closeRate} />,
    getValue: (row) => row.closeRate,
    renderTotal: (totals) => <PercentageText value={totals.closeRate} />,
  },
  revenue: {
    id: "revenue",
    label: "REVENUE",
    align: "right",
    render: (row) => <RevenueText value={row.revenue} />,
    getValue: (row) => row.revenue,
    renderTotal: (totals) => <RevenueText value={totals.revenue} />,
  },
  cashCollected: {
    id: "cashCollected",
    label: "CASH COLLECTED",
    shortLabel: "CASH",
    align: "right",
    render: (row) => (
      <span className="text-sm font-semibold text-emerald-600">
        ${formatNumber(Math.round(row.cashCollected))}
      </span>
    ),
    getValue: (row) => row.cashCollected,
    renderTotal: (totals) => (
      <span className="text-sm font-semibold text-emerald-600">
        ${formatNumber(Math.round(totals.cashCollected))}
      </span>
    ),
  },
  dealValue: {
    id: "dealValue",
    label: "DEAL VALUE",
    shortLabel: "DEAL",
    align: "right",
    render: (row) => (
      <span className="text-sm font-semibold text-purple-600">
        ${formatNumber(Math.round(row.dealValue))}
      </span>
    ),
    getValue: (row) => row.dealValue,
    renderTotal: (totals) => (
      <span className="text-sm font-semibold text-purple-600">
        ${formatNumber(Math.round(totals.dealValue))}
      </span>
    ),
  },
  costPerLead: {
    id: "costPerLead",
    label: "COST/LEAD",
    align: "right",
    render: (row) => (
      <span className="text-sm text-gray-700">${row.costPerLead.toFixed(2)}</span>
    ),
    getValue: (row) => row.costPerLead,
    renderTotal: (totals) => (
      <span className="text-sm font-semibold text-gray-900">${totals.costPerLead.toFixed(2)}</span>
    ),
  },
  roas: {
    id: "roas",
    label: "ROAS",
    align: "center",
    render: (row) => <RoasText value={row.roas} />,
    getValue: (row) => row.roas,
    renderTotal: (totals) => <RoasText value={totals.roas} />,
  },
});

// Sortable header cell component
function SortableHeaderCell({
  column,
  sortField,
  sortDirection,
  onSort,
}: {
  column: ColumnDef;
  sortField: string;
  sortDirection: "asc" | "desc";
  onSort: (field: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isActive = sortField === column.id;

  return (
    <th
      ref={setNodeRef}
      style={style}
      className={`px-3 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap select-none
        ${column.align === "left" ? "text-left" : column.align === "right" ? "text-right" : "text-center"}
        ${isDragging ? "bg-orange-100 z-20" : "bg-gray-50"}
      `}
    >
      <div className={`flex items-center gap-1.5 ${column.align === "right" ? "justify-end" : column.align === "center" ? "justify-center" : "justify-start"}`}>
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
          title="Drag to reorder"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
          </svg>
        </button>

        {/* Sort button */}
        <button
          onClick={() => onSort(column.id)}
          className="flex items-center gap-1 hover:text-gray-900 transition-colors"
        >
          <span>{column.shortLabel || column.label}</span>
          {isActive ? (
            sortDirection === "asc" ? (
              <svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )
          ) : (
            <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          )}
        </button>
      </div>
    </th>
  );
}

type SortField = string;
type SortDirection = "asc" | "desc";

interface KpiPerSourceTableProps {
  data: SourceKPIs[] | null;
  breakdownLevel: BreakdownLevel;
  onBreakdownChange: (level: BreakdownLevel) => void;
}

function KpiPerSourceTable({ data, breakdownLevel, onBreakdownChange }: KpiPerSourceTableProps) {
  const [sortField, setSortField] = useState<SortField>("spend");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("kpiTableColumnOrder");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return DEFAULT_COLUMN_ORDER;
        }
      }
    }
    return DEFAULT_COLUMN_ORDER;
  });

  const columnDefs = createColumnDefs();

  // Save column order to localStorage
  useEffect(() => {
    localStorage.setItem("kpiTableColumnOrder", JSON.stringify(columnOrder));
  }, [columnOrder]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setColumnOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Sort data
  const sortedData = [...(data || [])].sort((a, b) => {
    const col = columnDefs[sortField];
    if (!col) return 0;

    const aVal = col.getValue(a);
    const bVal = col.getValue(b);

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    const aNum = Number(aVal) || 0;
    const bNum = Number(bVal) || 0;
    return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
  });

  // Calculate totals
  const totals: SourceKPITotals = (data || []).reduce(
    (acc, row) => ({
      applications: acc.applications + row.applications,
      qualified: acc.qualified + row.qualified,
      dq: acc.dq + row.dq,
      shown: acc.shown + row.shown,
      closes: acc.closes + row.closes,
      spend: acc.spend + row.spend,
      revenue: acc.revenue + row.revenue,
      cashCollected: acc.cashCollected + row.cashCollected,
      dealValue: acc.dealValue + row.dealValue,
      showRate: 0,
      closeRate: 0,
      costPerLead: 0,
      roas: 0,
    }),
    { applications: 0, qualified: 0, dq: 0, shown: 0, closes: 0, spend: 0, revenue: 0, cashCollected: 0, dealValue: 0, showRate: 0, closeRate: 0, costPerLead: 0, roas: 0 }
  );

  // Calculate derived totals
  const totalBooked = totals.qualified + totals.dq;
  totals.showRate = totalBooked > 0 ? (totals.shown / totalBooked) * 100 : 0;
  totals.closeRate = totals.shown > 0 ? (totals.closes / totals.shown) * 100 : 0;
  totals.costPerLead = totals.applications > 0 ? totals.spend / totals.applications : 0;
  totals.roas = totals.spend > 0 ? totals.revenue / totals.spend : 0;

  const breakdownOptions: { value: BreakdownLevel; label: string }[] = [
    { value: "campaign", label: "Campaign" },
    { value: "adset", label: "Ad Set" },
    { value: "ad", label: "Ad" },
  ];

  // Get ordered columns
  const orderedColumns = columnOrder
    .map((id) => columnDefs[id])
    .filter(Boolean);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-4">
          <h3 className="text-base font-semibold text-gray-900">KPI per Source</h3>

          {/* Redesigned Breakdown Dropdown */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-sm text-gray-600 font-medium">Breakdown by:</span>
            <select
              value={breakdownLevel}
              onChange={(e) => onBreakdownChange(e.target.value as BreakdownLevel)}
              className="text-sm font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer pr-6 -mr-2"
            >
              {breakdownOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Drag column headers to reorder
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="w-full min-w-[1000px]">
            <thead>
              <SortableContext
                items={columnOrder}
                strategy={horizontalListSortingStrategy}
              >
                <tr className="border-b border-gray-200">
                  {orderedColumns.map((column) => (
                    <SortableHeaderCell
                      key={column.id}
                      column={column}
                      sortField={sortField}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    />
                  ))}
                </tr>
              </SortableContext>
            </thead>
            <tbody>
              {/* Summary Row */}
              <tr className="bg-orange-50/70 border-b border-orange-100">
                {orderedColumns.map((column) => (
                  <td
                    key={column.id}
                    className={`px-3 py-3 ${
                      column.align === "left" ? "text-left" : column.align === "right" ? "text-right" : "text-center"
                    }`}
                  >
                    {column.renderTotal ? column.renderTotal(totals) : null}
                  </td>
                ))}
              </tr>

              {/* Data Rows */}
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={orderedColumns.length} className="px-4 py-12 text-center text-sm text-gray-400">
                    No data available for the selected date range.
                  </td>
                </tr>
              ) : (
                sortedData.map((row, index) => (
                  <tr
                    key={`${row.source}-${index}`}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    }`}
                  >
                    {orderedColumns.map((column) => (
                      <td
                        key={column.id}
                        className={`px-3 py-3 ${
                          column.align === "left" ? "text-left" : column.align === "right" ? "text-right" : "text-center"
                        }`}
                      >
                        {column.render(row, totals)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </DndContext>
      </div>
    </div>
  );
}

// ============================================================================
// CHART COLORS (Cometly Design Spec)
// ============================================================================

const CHART_COLORS = {
  dailySpend: "rgb(222, 48, 22)",      // Red
  dailyClicks: "rgb(59, 130, 246)",    // Blue
  dailyImpressions: "rgb(249, 115, 22)", // Orange
  applications: "rgb(139, 92, 246)",   // Purple
  qualifiedCalls: "rgb(16, 185, 129)", // Green
  totalCalls: "rgb(59, 130, 246)",      // Blue (for Total Calls)
  closedClients: "rgb(20, 184, 166)",  // Teal
  costPerQualified: "rgb(99, 102, 241)", // Indigo
  costPerCall: "rgb(236, 72, 153)",    // Pink (for Cost per Call)
  costPerShow: "rgb(234, 179, 8)",     // Yellow
} as const;

// ============================================================================
// DASHBOARD VIEW COMPONENT (10 Cometly-Style Cards)
// ============================================================================

interface DashboardViewProps {
  data: DashboardData;
  loading: boolean;
  breakdownLevel: BreakdownLevel;
  onBreakdownChange: (level: BreakdownLevel) => void;
}

function DashboardView({ data, loading, breakdownLevel, onBreakdownChange }: DashboardViewProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const { kpis, previousKpis, trends, sourceKPIs } = data;

  if (!kpis) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500">No data available for the selected date range.</p>
          <p className="text-sm text-gray-400 mt-2">Try selecting a different date range or check your data source.</p>
        </div>
      </div>
    );
  }

  // Prepare trend data for charts
  const trendData = trends || [];

  // Helper to create trend data array for a specific metric
  const createTrendData = (key: keyof DailyTrendData): TrendDataPoint[] =>
    trendData.map((t) => ({ date: t.date, value: Number(t[key]) || 0 }));

  // Helper to get percentage change info
  const getChangeInfo = (current: number, previous: number | undefined) => {
    const prev = previous ?? 0;
    const change = calculatePercentageChange(current, prev);
    // For cost metrics, lower is better (negative change is positive)
    return {
      percentageStr: formatPercentageChange(current, prev),
      isPositive: change !== null ? change >= 0 : true,
      previousStr: prev > 0 ? (current > 1000 ? formatCurrencyCompact(prev) : formatNumber(prev)) : "-",
    };
  };

  // Calculate all change info
  const spendInfo = getChangeInfo(kpis.total_spend, previousKpis?.total_spend);
  const clicksInfo = getChangeInfo(kpis.total_clicks, previousKpis?.total_clicks);
  const impressionsInfo = getChangeInfo(kpis.total_impressions, previousKpis?.total_impressions);
  const leadsInfo = getChangeInfo(kpis.total_leads, previousKpis?.total_leads);
  const qualifiedInfo = getChangeInfo(kpis.total_qualified, previousKpis?.total_qualified);
  const bookedInfo = getChangeInfo(kpis.total_booked, previousKpis?.total_booked);
  const closesInfo = getChangeInfo(kpis.total_closes, previousKpis?.total_closes);
  const costPerQualifiedInfo = getChangeInfo(kpis.cost_per_qualified, previousKpis?.cost_per_qualified);
  const costPerCallInfo = getChangeInfo(kpis.cost_per_booked, previousKpis?.cost_per_booked);
  const costPerShowInfo = getChangeInfo(kpis.cost_per_show, previousKpis?.cost_per_show);
  const cashCollectedInfo = getChangeInfo(kpis.total_cash_collected, previousKpis?.total_cash_collected);
  const dealValueInfo = getChangeInfo(kpis.total_deal_value, previousKpis?.total_deal_value);

  // Calculate Cash ROAS
  const cashRoas = kpis.total_spend > 0 ? kpis.total_cash_collected / kpis.total_spend : 0;
  const previousCashRoas = previousKpis && previousKpis.total_spend > 0
    ? previousKpis.total_cash_collected / previousKpis.total_spend
    : 0;
  const cashRoasInfo = getChangeInfo(cashRoas, previousCashRoas);
  const formatCashRoas = (value: number) => kpis.total_spend > 0 ? `${value.toFixed(1)}x` : "N/A";

  return (
    <div className="space-y-6">
      {/* Row 1: Ad Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Daily Spend Card */}
        <MetricCard
          title="Daily Spend"
          mainValue={formatCurrency(kpis.total_spend)}
          previousValue={previousKpis ? formatCurrencyCompact(previousKpis.total_spend) : "-"}
          subtitle="Amount Spent"
          percentageChange={spendInfo.percentageStr}
          isPositiveChange={spendInfo.isPositive}
          trendData={createTrendData("spend")}
          chartType="line"
          chartColor={CHART_COLORS.dailySpend}
          headlineColor={CHART_COLORS.dailySpend}
          valueType="currency"
        />

        {/* 2. Daily Clicks Card */}
        <MetricCard
          title="Daily Clicks"
          mainValue={formatNumber(kpis.total_clicks)}
          previousValue={previousKpis ? formatNumberCompact(previousKpis.total_clicks) : "-"}
          subtitle="Clicks (All)"
          percentageChange={clicksInfo.percentageStr}
          isPositiveChange={clicksInfo.isPositive}
          trendData={createTrendData("clicks")}
          chartType="bar"
          chartColor={CHART_COLORS.dailyClicks}
          headlineColor={CHART_COLORS.dailyClicks}
          valueType="number"
        />

        {/* 3. Daily Impressions Card */}
        <MetricCard
          title="Daily Impressions"
          mainValue={formatNumber(kpis.total_impressions)}
          previousValue={previousKpis ? formatNumberCompact(previousKpis.total_impressions) : "-"}
          subtitle="Impressions"
          percentageChange={impressionsInfo.percentageStr}
          isPositiveChange={impressionsInfo.isPositive}
          trendData={createTrendData("impressions")}
          chartType="line"
          chartColor={CHART_COLORS.dailyImpressions}
          headlineColor={CHART_COLORS.dailyImpressions}
          valueType="number"
        />
      </div>

      {/* KPI per Source Table */}
      <KpiPerSourceTable
        data={sourceKPIs}
        breakdownLevel={breakdownLevel}
        onBreakdownChange={onBreakdownChange}
      />

      {/* Row 2: Funnel Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 4. Applications Card */}
        <MetricCard
          title="Applications"
          mainValue={formatNumber(kpis.total_leads)}
          previousValue={previousKpis ? formatNumber(previousKpis.total_leads) : "-"}
          subtitle="Application"
          percentageChange={leadsInfo.percentageStr}
          isPositiveChange={leadsInfo.isPositive}
          trendData={createTrendData("leads")}
          chartType="bar"
          chartColor={CHART_COLORS.applications}
          headlineColor={CHART_COLORS.applications}
          valueType="number"
        />

        {/* 5. Qualified Calls Card */}
        <MetricCard
          title="Qualified Calls"
          mainValue={formatNumber(kpis.total_qualified)}
          previousValue={previousKpis ? formatNumber(previousKpis.total_qualified) : "-"}
          subtitle="Qualified Call"
          percentageChange={qualifiedInfo.percentageStr}
          isPositiveChange={qualifiedInfo.isPositive}
          trendData={createTrendData("qualified")}
          chartType="bar"
          chartColor={CHART_COLORS.qualifiedCalls}
          headlineColor={CHART_COLORS.qualifiedCalls}
          valueType="number"
        />

        {/* 6. Total Calls Card */}
        <MetricCard
          title="Total Calls"
          mainValue={formatNumber(kpis.total_booked)}
          previousValue={previousKpis ? formatNumber(previousKpis.total_booked) : "-"}
          subtitle="Booked Call"
          percentageChange={bookedInfo.percentageStr}
          isPositiveChange={bookedInfo.isPositive}
          trendData={createTrendData("booked")}
          chartType="bar"
          chartColor={CHART_COLORS.totalCalls}
          headlineColor={CHART_COLORS.totalCalls}
          valueType="number"
        />

        {/* 7. Closed Clients Card */}
        <MetricCard
          title="Closed Clients"
          mainValue={formatNumber(kpis.total_closes)}
          previousValue={previousKpis ? formatNumber(previousKpis.total_closes) : "-"}
          subtitle="Closed Client"
          percentageChange={closesInfo.percentageStr}
          isPositiveChange={closesInfo.isPositive}
          trendData={createTrendData("closes")}
          chartType="line"
          chartColor={CHART_COLORS.closedClients}
          headlineColor={CHART_COLORS.closedClients}
          valueType="number"
        />
      </div>

      {/* Row 3: Cost Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 8. Cost per Qualified Call Card */}
        <MetricCard
          title="Cost per Qualified Call"
          mainValue={formatCurrency(kpis.cost_per_qualified)}
          previousValue={previousKpis ? formatCurrencyCompact(previousKpis.cost_per_qualified) : "-"}
          subtitle="Cost / Qualified"
          percentageChange={costPerQualifiedInfo.percentageStr}
          isPositiveChange={!costPerQualifiedInfo.isPositive} // Lower cost is better
          trendData={createTrendData("cost_per_qualified")}
          chartType="line"
          chartColor={CHART_COLORS.costPerQualified}
          headlineColor={CHART_COLORS.costPerQualified}
          valueType="currency"
        />

        {/* 9. Cost per Call Card */}
        <MetricCard
          title="Cost per Call"
          mainValue={formatCurrency(kpis.cost_per_booked)}
          previousValue={previousKpis ? formatCurrencyCompact(previousKpis.cost_per_booked) : "-"}
          subtitle="Cost / Call"
          percentageChange={costPerCallInfo.percentageStr}
          isPositiveChange={!costPerCallInfo.isPositive} // Lower cost is better
          trendData={createTrendData("cost_per_booked")}
          chartType="line"
          chartColor={CHART_COLORS.costPerCall}
          headlineColor={CHART_COLORS.costPerCall}
          valueType="currency"
        />

        {/* 10. Cost per Shown Call Card */}
        <MetricCard
          title="Cost per Shown Call"
          mainValue={formatCurrency(kpis.cost_per_show)}
          previousValue={previousKpis ? formatCurrencyCompact(previousKpis.cost_per_show) : "-"}
          subtitle="Cost / Show"
          percentageChange={costPerShowInfo.percentageStr}
          isPositiveChange={!costPerShowInfo.isPositive} // Lower cost is better
          trendData={createTrendData("cost_per_show")}
          chartType="line"
          chartColor={CHART_COLORS.costPerShow}
          headlineColor={CHART_COLORS.costPerShow}
          valueType="currency"
        />
      </div>

      {/* Row 4: Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 11. Total Deal Value Card */}
        <MetricCard
          title="Total Deal Value"
          mainValue={formatCurrency(kpis.total_deal_value)}
          previousValue={previousKpis ? formatCurrencyCompact(previousKpis.total_deal_value) : "-"}
          subtitle="Contract Value"
          percentageChange={dealValueInfo.percentageStr}
          isPositiveChange={dealValueInfo.isPositive}
          trendData={createTrendData("revenue")}
          chartType="bar"
          chartColor="#8B5CF6"
          headlineColor="#8B5CF6"
          valueType="currency"
        />

        {/* 12. Cash ROAS Card */}
        <MetricCard
          title="Cash ROAS"
          mainValue={formatCashRoas(cashRoas)}
          previousValue={previousKpis && previousKpis.total_spend > 0 ? `${previousCashRoas.toFixed(1)}x` : "-"}
          subtitle="Cash / Ad Spend"
          percentageChange={cashRoasInfo.percentageStr}
          isPositiveChange={cashRoasInfo.isPositive}
          trendData={createTrendData("revenue")}
          chartType="bar"
          chartColor="#059669"
          headlineColor="#059669"
          valueType="number"
        />

        {/* 13. Total Cash Collected Card */}
        <MetricCard
          title="Total Cash Collected"
          mainValue={formatCurrency(kpis.total_cash_collected)}
          previousValue={previousKpis ? formatCurrencyCompact(previousKpis.total_cash_collected) : "-"}
          subtitle="Cash In"
          percentageChange={cashCollectedInfo.percentageStr}
          isPositiveChange={cashCollectedInfo.isPositive}
          trendData={createTrendData("revenue")}
          chartType="bar"
          chartColor="#10B981"
          headlineColor="#10B981"
          valueType="currency"
        />
      </div>
    </div>
  );
}

// ============================================================================
// LEADS BREAKDOWN VIEW COMPONENTS
// ============================================================================

/** Cometly-style color variants for KPI cards */
type KpiColor = "blue" | "green" | "purple" | "orange" | "red" | "teal" | "indigo" | "pink";

/** Tailwind color class mapping for KPI cards */
const KPI_TEXT_COLORS: Record<KpiColor, string> = {
  blue: "text-blue-600",
  green: "text-emerald-600",
  purple: "text-purple-600",
  orange: "text-orange-500",
  red: "text-red-600",
  teal: "text-teal-600",
  indigo: "text-indigo-600",
  pink: "text-pink-600",
};

/**
 * Tremor-based Lead Quality KPI Card with Dashboard-matching styling
 */
function TremorKpiCard({
  title,
  value,
  format: formatType,
  color = "blue",
}: {
  title: string;
  value: number;
  format: "currency" | "percentage";
  color?: KpiColor;
}) {
  const formattedValue =
    formatType === "currency"
      ? `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
      : `${value.toFixed(1)}%`;

  return (
    <Card className="p-5 shadow-sm border border-gray-200 rounded-xl">
      <p className="text-sm font-semibold text-gray-700">{title}</p>
      <p className={`text-3xl font-bold mt-2 ${KPI_TEXT_COLORS[color]}`}>
        {formattedValue}
      </p>
    </Card>
  );
}

/**
 * Tremor-based Revenue Distribution Chart
 */
function TremorRevenueDistributionChart({ data }: { data: { stage: string; min: number; q1: number; median: number; q3: number; max: number; count: number }[] }) {
  // Placeholder data for when real data is empty
  const placeholderData = [
    { stage: "Applications", Min: 0, Q1: 0, Median: 0, Q3: 0, Max: 0 },
    { stage: "Qualified", Min: 0, Q1: 0, Median: 0, Q3: 0, Max: 0 },
    { stage: "Shown", Min: 0, Q1: 0, Median: 0, Q3: 0, Max: 0 },
    { stage: "Closed", Min: 0, Q1: 0, Median: 0, Q3: 0, Max: 0 },
  ];

  // Transform data for Tremor BarChart
  const realChartData = data.map((d) => ({
    stage: d.stage,
    Min: d.min,
    Q1: d.q1,
    Median: d.median,
    Q3: d.q3,
    Max: d.max,
  }));

  // Use real data if available, otherwise use placeholder
  const hasData = data && data.length > 0 && data.some(item => item.min > 0 || item.median > 0 || item.max > 0);
  const chartData = hasData ? realChartData : placeholderData;

  return (
    <Card className="p-6 shadow-sm border border-gray-200 rounded-xl">
      <h3 className="text-lg font-semibold text-gray-900">Revenue Distribution by Funnel Stage</h3>
      <p className="text-sm text-gray-500 mt-1">Shows the min, median, and max monthly revenue of leads at each stage.</p>

      <BarChart
        data={chartData}
        index="stage"
        categories={["Min", "Q1", "Median", "Q3", "Max"]}
        colors={["blue", "cyan", "indigo", "violet", "purple"]}
        valueFormatter={(value) => `$${Intl.NumberFormat("en-US").format(value)}`}
        yAxisWidth={80}
        className="h-72 mt-6"
      />
    </Card>
  );
}

/**
 * Tremor-based Investment Donut Chart
 */
function TremorInvestmentDonut({ data, stageTitle }: { data: { label: string; count: number; percentage: number }[]; stageTitle: string }) {
  // Placeholder data for empty state
  const placeholderTiers = [
    { label: "Cash Ready ($5k+)", count: 0, percentage: 0 },
    { label: "Needs Financing", count: 0, percentage: 0 },
    { label: "Unknown", count: 0, percentage: 100 },
  ];

  // Use real data if available, otherwise placeholder
  const hasData = data && data.length > 0 && data.some(d => d.count > 0);
  const displayData = hasData ? data : placeholderTiers;

  // Transform data for Tremor DonutChart
  const chartData = displayData.map((d) => ({
    name: d.label,
    value: d.percentage,
  }));

  const legendColors = ["rgb(16, 185, 129)", "rgb(249, 115, 22)", "rgb(156, 163, 175)"];

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-gray-900 text-center mb-3">{stageTitle}</h4>
      <TremorDonutChart
        data={chartData}
        category="value"
        index="name"
        colors={["emerald", "orange", "gray"]}
        valueFormatter={(value) => `${value.toFixed(1)}%`}
        className="h-36"
        showLabel={false}
      />
      <div className="mt-4 space-y-2">
        {displayData.map((tier, i) => (
          <div key={i} className="flex justify-between text-xs px-1">
            <span className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: legendColors[i] || "#9CA3AF" }}
              />
              <span className="text-gray-700 font-medium">{tier.label}</span>
            </span>
            <span className="font-bold text-gray-900">{tier.percentage.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Tremor-based Investment Ability Chart (Multiple Donut Charts)
 */
function TremorInvestmentAbilityChart({ data }: { data: InvestmentBreakdown[] }) {
  // Placeholder data for empty state
  const placeholderData: InvestmentBreakdown[] = [
    { stage: "Applications", tiers: [{ label: "Cash Ready ($5k+)", count: 0, percentage: 0 }, { label: "Needs Financing", count: 0, percentage: 0 }, { label: "Unknown", count: 0, percentage: 100 }] },
    { stage: "Qualified", tiers: [{ label: "Cash Ready ($5k+)", count: 0, percentage: 0 }, { label: "Needs Financing", count: 0, percentage: 0 }, { label: "Unknown", count: 0, percentage: 100 }] },
    { stage: "Shown", tiers: [{ label: "Cash Ready ($5k+)", count: 0, percentage: 0 }, { label: "Needs Financing", count: 0, percentage: 0 }, { label: "Unknown", count: 0, percentage: 100 }] },
    { stage: "Closed", tiers: [{ label: "Cash Ready ($5k+)", count: 0, percentage: 0 }, { label: "Needs Financing", count: 0, percentage: 0 }, { label: "Unknown", count: 0, percentage: 100 }] },
  ];

  const hasData = data && data.length > 0;
  const displayData = hasData ? data : placeholderData;

  return (
    <Card className="p-6 shadow-sm border border-gray-200 rounded-xl">
      <h3 className="text-lg font-semibold text-gray-900">Investment Ability Breakdown</h3>
      <p className="text-sm text-gray-500 mt-1">Breakdown of investment readiness for leads at each funnel stage.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {displayData.map((stage) => (
          <TremorInvestmentDonut key={stage.stage} data={stage.tiers} stageTitle={stage.stage} />
        ))}
      </div>
    </Card>
  );
}

/** Funnel stage colors (Cometly-style gradients) */
const FUNNEL_COLORS = [
  { from: "rgb(139, 92, 246)", to: "rgb(124, 58, 237)" }, // Purple - Applications
  { from: "rgb(16, 185, 129)", to: "rgb(5, 150, 105)" },  // Green - Qualified
  { from: "rgb(59, 130, 246)", to: "rgb(37, 99, 235)" },  // Blue - Shown
  { from: "rgb(20, 184, 166)", to: "rgb(13, 148, 136)" }, // Teal - Closed
];

/**
 * Tremor-wrapped Revenue Funnel Chart
 */
function TremorRevenueFunnelChart({ data }: { data: RevenueFunnelStage[] }) {
  // Placeholder data for empty state
  const placeholderData: RevenueFunnelStage[] = [
    { stage: "Applications", count: 0, totalRevenue: 0, avgRevenue: 0 },
    { stage: "Qualified", count: 0, totalRevenue: 0, avgRevenue: 0 },
    { stage: "Shown", count: 0, totalRevenue: 0, avgRevenue: 0 },
    { stage: "Closed", count: 0, totalRevenue: 0, avgRevenue: 0 },
  ];

  const hasData = data && data.length > 0 && data.some(d => d.count > 0 || d.totalRevenue > 0);
  const displayData = hasData ? data : placeholderData;
  const maxRevenue = displayData.length > 0 ? Math.max(...displayData.map((d) => d.totalRevenue), 1) : 1;

  return (
    <Card className="p-6 shadow-sm border border-gray-200 rounded-xl">
      <h3 className="text-lg font-semibold text-gray-900">Revenue Funnel</h3>
      <p className="text-sm text-gray-500 mt-1">Visualizes the revenue potential and drop-off at each stage of the funnel.</p>

      <div className="space-y-5 mt-6">
        {displayData.map((stage, index) => {
          const prevStage = index > 0 ? displayData[index - 1] : null;
          const dropRate =
            prevStage && prevStage.totalRevenue > 0
              ? ((prevStage.totalRevenue - stage.totalRevenue) / prevStage.totalRevenue) * 100
              : 0;

          const widthPercent = maxRevenue > 0 ? (stage.totalRevenue / maxRevenue) * 100 : 0;
          const colors = FUNNEL_COLORS[index % FUNNEL_COLORS.length];

          return (
            <div key={stage.stage}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-bold text-gray-900">{stage.stage}</div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-800">{stage.count}</span> leads &bull;{" "}
                  <span className="font-bold" style={{ color: colors.from }}>
                    ${stage.totalRevenue.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="relative h-14 bg-gray-100 rounded-lg overflow-hidden shadow-inner">
                <div
                  className="absolute h-full transition-all duration-500 rounded-lg shadow-sm"
                  style={{
                    width: `${Math.max(widthPercent, hasData ? 5 : 0)}%`,
                    background: `linear-gradient(90deg, ${colors.from}, ${colors.to})`,
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-500 drop-shadow-md">
                  {hasData ? (
                    <span className="text-white">Avg: ${stage.avgRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  ) : (
                    <span>$0</span>
                  )}
                </div>
              </div>
              {index < displayData.length - 1 && dropRate > 0 && (
                <div className="flex items-center justify-center gap-1 text-xs font-semibold text-red-600 mt-2">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  {dropRate.toFixed(1)}% drop
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/**
 * Tremor-based Lead Source Quality Table
 */
function TremorLeadSourceQualityTable({ data }: { data: SourceQuality[] }) {
  const [sortColumn, setSortColumn] = useState<keyof SourceQuality>("totalRevenue");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (column: keyof SourceQuality) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    const aNum = Number(aValue) || 0;
    const bNum = Number(bValue) || 0;
    return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
  });

  const renderSortIndicator = (column: keyof SourceQuality) => {
    if (sortColumn !== column) return null;
    return sortDirection === "asc" ? " ↑" : " ↓";
  };

  return (
    <Card className="p-6 shadow-sm border border-gray-200 rounded-xl">
      <h3 className="text-lg font-semibold text-gray-900">Lead Source Quality</h3>
      <p className="text-sm text-gray-500 mt-1 mb-4">Compares the performance of different lead sources.</p>

      <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
        <Table>
          <TableHead>
            <TableRow className="bg-gray-50">
              <TableHeaderCell
                className="cursor-pointer hover:bg-gray-100 font-semibold text-gray-700"
                onClick={() => handleSort("source")}
              >
                Source{renderSortIndicator("source")}
              </TableHeaderCell>
              <TableHeaderCell
                className="text-center cursor-pointer hover:bg-gray-100 font-semibold text-gray-700"
                onClick={() => handleSort("avgRevenue")}
              >
                Avg Revenue{renderSortIndicator("avgRevenue")}
              </TableHeaderCell>
              <TableHeaderCell
                className="text-center cursor-pointer hover:bg-gray-100 font-semibold text-gray-700"
                onClick={() => handleSort("qualRate")}
              >
                Qual Rate{renderSortIndicator("qualRate")}
              </TableHeaderCell>
              <TableHeaderCell
                className="text-center cursor-pointer hover:bg-gray-100 font-semibold text-gray-700"
                onClick={() => handleSort("showRate")}
              >
                Show Rate{renderSortIndicator("showRate")}
              </TableHeaderCell>
              <TableHeaderCell
                className="text-center cursor-pointer hover:bg-gray-100 font-semibold text-gray-700"
                onClick={() => handleSort("closeRate")}
              >
                Close Rate{renderSortIndicator("closeRate")}
              </TableHeaderCell>
              <TableHeaderCell
                className="text-center cursor-pointer hover:bg-gray-100 font-semibold text-gray-700"
                onClick={() => handleSort("totalRevenue")}
              >
                Total Revenue{renderSortIndicator("totalRevenue")}
              </TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                  No lead sources found for this period
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell className="max-w-[200px] truncate font-medium text-gray-900" title={row.source}>
                    {row.source}
                  </TableCell>
                  <TableCell className="text-center text-gray-700">
                    ${row.avgRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell className="text-center text-gray-700">{row.qualRate.toFixed(1)}%</TableCell>
                  <TableCell className="text-center text-gray-700">{row.showRate.toFixed(1)}%</TableCell>
                  <TableCell className="text-center text-gray-700">{row.closeRate.toFixed(1)}%</TableCell>
                  <TableCell className="text-center font-semibold text-gray-900">
                    ${row.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

/**
 * Tremor-based Revenue Trends Chart
 */
function TremorRevenueTrendsChart({ data, dateRange }: { data: RevenueTrendPoint[]; dateRange?: { from?: Date; to?: Date } }) {
  // Generate placeholder data with dates spanning the range
  const generatePlaceholderData = () => {
    const placeholderDates: { date: string; "Avg Revenue - Qualified": number; "Avg Revenue - Shown": number }[] = [];
    const today = new Date();
    const startDate = dateRange?.from || new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateRange?.to || today;

    // Generate weekly points for placeholder
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      placeholderDates.push({
        date: currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        "Avg Revenue - Qualified": 0,
        "Avg Revenue - Shown": 0,
      });
      currentDate.setDate(currentDate.getDate() + 7);
    }
    return placeholderDates.length > 0 ? placeholderDates : [
      { date: "Week 1", "Avg Revenue - Qualified": 0, "Avg Revenue - Shown": 0 },
      { date: "Week 2", "Avg Revenue - Qualified": 0, "Avg Revenue - Shown": 0 },
      { date: "Week 3", "Avg Revenue - Qualified": 0, "Avg Revenue - Shown": 0 },
      { date: "Week 4", "Avg Revenue - Qualified": 0, "Avg Revenue - Shown": 0 },
    ];
  };

  // Transform data for Tremor AreaChart
  const realChartData = data.map((d) => {
    const date = new Date(d.date);
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      "Avg Revenue - Qualified": d.avgRevenueQualified,
      "Avg Revenue - Shown": d.avgRevenueShown,
    };
  });

  const hasData = data && data.length > 0 && data.some(d => d.avgRevenueQualified > 0 || d.avgRevenueShown > 0);
  const chartData = hasData ? realChartData : generatePlaceholderData();

  return (
    <Card className="p-6 shadow-sm border border-gray-200 rounded-xl">
      <h3 className="text-lg font-semibold text-gray-900">Revenue Trends Over Time</h3>
      <p className="text-sm text-gray-500 mt-1">Tracks average revenue potential over the selected date range.</p>

      <AreaChart
        data={chartData}
        index="date"
        categories={["Avg Revenue - Qualified", "Avg Revenue - Shown"]}
        colors={["blue", "emerald"]}
        valueFormatter={(value) => `$${Intl.NumberFormat("en-US").format(value)}`}
        yAxisWidth={80}
        className="h-72 mt-6"
        showLegend={true}
      />
    </Card>
  );
}

/** Heatmap column colors (Cometly-style) */
const HEATMAP_COLORS = {
  qualified: { base: "139, 92, 246" },  // Purple
  shown: { base: "16, 185, 129" },      // Green
  closed: { base: "20, 184, 166" },     // Teal
};

/**
 * Tremor-wrapped Investment Heatmap
 */
function TremorInvestmentHeatmap({ data }: { data: InvestmentHeatmapRow[] }) {
  // Placeholder data for empty state
  const placeholderData: InvestmentHeatmapRow[] = [
    { tier: "Under $5k/month", qualified: 0, shown: 0, closed: 0 },
    { tier: "$5k-$10k/month", qualified: 0, shown: 0, closed: 0 },
    { tier: "$10k-$25k/month", qualified: 0, shown: 0, closed: 0 },
    { tier: "$25k+/month", qualified: 0, shown: 0, closed: 0 },
  ];

  const hasData = data && data.length > 0 && data.some(d => d.qualified > 0 || d.shown > 0 || d.closed > 0);
  const displayData = hasData ? data : placeholderData;

  const maxValues = {
    qualified: Math.max(...displayData.map((d) => d.qualified), 1),
    shown: Math.max(...displayData.map((d) => d.shown), 1),
    closed: Math.max(...displayData.map((d) => d.closed), 1),
  };

  const getColor = (value: number, column: "qualified" | "shown" | "closed") => {
    if (!hasData) return `rgba(${HEATMAP_COLORS[column].base}, 0.1)`;
    const intensity = value / maxValues[column];
    return `rgba(${HEATMAP_COLORS[column].base}, ${Math.max(0.15, intensity * 0.9)})`;
  };

  const getTextColor = (value: number, column: "qualified" | "shown" | "closed") => {
    if (!hasData) return "#9CA3AF";
    const intensity = value / maxValues[column];
    return intensity > 0.4 ? "white" : "#1f2937";
  };

  return (
    <Card className="p-6 shadow-sm border border-gray-200 rounded-xl">
      <h3 className="text-lg font-semibold text-gray-900">Revenue Tier Heatmap</h3>
      <p className="text-sm text-gray-500 mt-1">Shows lead distribution by revenue tier across funnel stages.</p>

      <div className="overflow-x-auto mt-6">
        <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
          <thead>
            <tr>
              <th className="px-6 py-4 bg-gray-100 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Revenue Tier
              </th>
              <th className="px-6 py-4 bg-purple-100 text-center text-xs font-bold uppercase tracking-wider" style={{ color: `rgb(${HEATMAP_COLORS.qualified.base})` }}>
                Qualified
              </th>
              <th className="px-6 py-4 bg-emerald-100 text-center text-xs font-bold uppercase tracking-wider" style={{ color: `rgb(${HEATMAP_COLORS.shown.base})` }}>
                Shown
              </th>
              <th className="px-6 py-4 bg-teal-100 text-center text-xs font-bold uppercase tracking-wider" style={{ color: `rgb(${HEATMAP_COLORS.closed.base})` }}>
                Closed
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayData.map((row, index) => (
              <tr key={row.tier} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-6 py-4 font-semibold text-sm text-gray-900">
                  {row.tier}
                </td>
                <td
                  className="px-6 py-4 text-center text-sm font-bold transition-colors"
                  style={{ backgroundColor: getColor(row.qualified, "qualified"), color: getTextColor(row.qualified, "qualified") }}
                >
                  {row.qualified}
                </td>
                <td
                  className="px-6 py-4 text-center text-sm font-bold transition-colors"
                  style={{ backgroundColor: getColor(row.shown, "shown"), color: getTextColor(row.shown, "shown") }}
                >
                  {row.shown}
                </td>
                <td
                  className="px-6 py-4 text-center text-sm font-bold transition-colors"
                  style={{ backgroundColor: getColor(row.closed, "closed"), color: getTextColor(row.closed, "closed") }}
                >
                  {row.closed}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/**
 * Main Leads Breakdown View Component
 */
function LeadsBreakdownView({ dateRange }: { dateRange: DateRangeValue }) {
  const [leadsData, setLeadsData] = useState<LeadsBreakdownData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      const filter: DateRangeFilter | undefined = dateRange?.from
        ? { from: dateRange.from, to: dateRange.to }
        : undefined;

      const result = await getLeadsBreakdownData(filter);

      if (result.error) {
        setError(result.error.message);
        setLeadsData(null);
      } else {
        setLeadsData(result.data);
      }

      setLoading(false);
    }

    fetchData();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-500">Loading leads breakdown data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!leadsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500">No data available for the selected date range.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Row 1: Lead Quality KPI Cards (Tremor-based) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <TremorKpiCard
          title="Avg Revenue - Qualified"
          value={leadsData.avgRevenueQualified}
          format="currency"
          color="purple"
        />
        <TremorKpiCard
          title="Avg Revenue - Shown"
          value={leadsData.avgRevenueShown}
          format="currency"
          color="green"
        />
        <TremorKpiCard
          title="Avg Revenue - Closed"
          value={leadsData.avgRevenueClosed}
          format="currency"
          color="teal"
        />
        <TremorKpiCard
          title="Qualification Rate"
          value={leadsData.qualificationRate}
          format="percentage"
          color="blue"
        />
        <TremorKpiCard
          title="Show Rate"
          value={leadsData.showRate}
          format="percentage"
          color="orange"
        />
        <TremorKpiCard
          title="Close Rate"
          value={leadsData.closeRate}
          format="percentage"
          color="red"
        />
      </div>

      {/* Row 2: Revenue Distribution Charts (Tremor-based) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TremorRevenueDistributionChart data={leadsData.revenueByStage} />
        <TremorInvestmentAbilityChart data={leadsData.investmentBreakdown} />
      </div>

      {/* Row 3: Revenue Funnel */}
      <TremorRevenueFunnelChart data={leadsData.revenueFunnel} />

      {/* Row 4: Lead Source Quality Table (Tremor-based) */}
      <TremorLeadSourceQualityTable data={leadsData.sourceQuality} />

      {/* Row 5: Revenue Trends Over Time (Tremor-based) */}
      <TremorRevenueTrendsChart data={leadsData.revenueTrends} dateRange={dateRange ? { from: dateRange.from, to: dateRange.to } : undefined} />

      {/* Row 6: Investment Ability Heatmap */}
      <TremorInvestmentHeatmap data={leadsData.investmentHeatmap} />
    </div>
  );
}

// ============================================================================
// PLACEHOLDER VIEW COMPONENT
// ============================================================================

function PlaceholderView({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">This feature is coming soon.</p>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState<ViewType>("Dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    from: startOfDay(subDays(new Date(), 30)),
    to: endOfDay(new Date()),
    selectValue: "last30",
  });
  const [breakdownLevel, setBreakdownLevel] = useState<BreakdownLevel>("campaign");

  // Wrapper function to ensure dateRange is always valid
  const handleDateRangeChange = useCallback((range: DateRangeValue) => {
    console.log("📅 [handleDateRangeChange] Received range:", range);

    if (range?.from) {
      // Ensure both from and to are valid Date objects
      const from = startOfDay(range.from);
      // If `to` is undefined or null, default to the same day as `from`
      const to = range.to ? endOfDay(range.to) : endOfDay(range.from);

      const validRange: DateRangeValue = {
        from,
        to,
        selectValue: range.selectValue,
      };

      console.log("✅ [handleDateRangeChange] Setting valid range:", validRange);
      setDateRange(validRange);
    } else {
      // If range is completely cleared, default back to today
      console.log("⚠️ [handleDateRangeChange] Range cleared, defaulting to today");
      setDateRange({
        from: startOfDay(new Date()),
        to: endOfDay(new Date()),
        selectValue: "today",
      });
    }
  }, []);

  const { data, loading, error, refetch } = useDashboardData(dateRange, breakdownLevel);

  if (error) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        setView={setCurrentView}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          title={currentView}
          dateRange={dateRange}
          setDateRange={handleDateRangeChange}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {currentView === "Dashboard" && (
            <DashboardView
              data={data}
              loading={loading}
              breakdownLevel={breakdownLevel}
              onBreakdownChange={setBreakdownLevel}
            />
          )}
          {currentView === "Leads Breakdown" && (
            <LeadsBreakdownView dateRange={dateRange} />
          )}
          {currentView === "Ads Manager" && (
            <PlaceholderView title="Ads Manager" />
          )}
          {currentView === "Report Builder" && (
            <PlaceholderView title="Report Builder" />
          )}
          {currentView === "Contacts" && (
            <PlaceholderView title="Contacts" />
          )}
          {currentView === "Events Manager" && (
            <PlaceholderView title="Events Manager" />
          )}
          {currentView === "Integrations" && (
            <PlaceholderView title="Integrations" />
          )}
        </main>
      </div>

      {/* Debug Panel - Shows raw database data */}
      <DebugPanel />
    </div>
  );
}
