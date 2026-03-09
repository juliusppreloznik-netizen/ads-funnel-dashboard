"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChartJS } from "@/lib/chart-setup";
import {
  Card,
  BarChart,
  AreaChart,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableHeaderCell,
} from "@tremor/react";
import { DateRangeValue } from "../DateRangePicker";
import {
  getSalesKPIs,
  getDailySalesTrends,
  getAdSalesAttribution,
  getZoomTranscripts,
  getWeeklyCashCollected,
  getWeeklyShowsCloses,
  syncZoomTranscripts,
  type SalesKPIs,
  type DailySalesMetrics,
  type AdSalesAttribution,
  type ZoomTranscript,
  type WeeklyCashData,
  type WeeklyShowsClosesData,
} from "@/lib/sales-queries";

// ============================================================================
// TYPES
// ============================================================================

interface SalesViewProps {
  dateRange: DateRangeValue;
}

interface TrendDataPoint {
  date: string;
  value: number;
}

// ============================================================================
// ICONS
// ============================================================================

const SalesIcons = {
  CalendarCheck: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
    </svg>
  ),
  UserCheck: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11l2 2 4-4" />
    </svg>
  ),
  PhoneCall: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  PhoneIncoming: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 3l-6 6m0 0V4m0 5h5M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  Trophy: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  DollarSign: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  TrendingUp: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Users: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Target: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Award: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  XCircle: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Coins: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Search: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Refresh: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Phone: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  Close: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

// ============================================================================
// FORMAT HELPERS
// ============================================================================

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
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
  new Intl.NumberFormat("en-US").format(Math.round(value));

const formatNumberCompact = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return Math.round(value).toString();
};

const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

const formatDateLabel = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatWeekLabel = (dateString: string): string => {
  const date = new Date(dateString);
  return `Week of ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
};

// ============================================================================
// METRIC CARD COMPONENT (matching existing design)
// ============================================================================

interface SalesMetricCardProps {
  title: string;
  icon: React.ReactNode;
  mainValue: string;
  previousValue: string;
  percentageChange: string;
  isPositiveChange: boolean;
  trendData: TrendDataPoint[];
  chartColor: string;
  valueType: "currency" | "number" | "percentage";
  tooltip?: string;
}

function SalesMetricCard({
  title,
  icon,
  mainValue,
  previousValue,
  percentageChange,
  isPositiveChange,
  trendData,
  chartColor,
  valueType,
  tooltip,
}: SalesMetricCardProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const labels = trendData.map((d) => formatDateLabel(d.date));
    const data = trendData.map((d) => d.value);

    const formatValueFn = (value: number) => {
      if (valueType === "currency") return formatCurrencyCompact(value);
      if (valueType === "percentage") return `${value.toFixed(1)}%`;
      return formatNumberCompact(value);
    };

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
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
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
                return `${title}: ${formatValueFn(val)}`;
              },
            },
          },
          datalabels: {
            display: (context: { dataIndex: number; dataset: { data: number[] } }) => {
              const dataLength = context.dataset.data.length;
              if (dataLength <= 7) return true;
              return context.dataIndex % Math.ceil(dataLength / 7) === 0;
            },
            align: "top" as const,
            anchor: "end" as const,
            color: "#374151",
            font: { size: 9, weight: "bold" as const },
            formatter: (value: number) => (value > 0 ? formatValueFn(value) : ""),
            offset: 4,
          },
        },
        scales: {
          x: {
            display: true,
            grid: { display: true, color: "rgba(0, 0, 0, 0.04)" },
            ticks: {
              color: "#9CA3AF",
              font: { size: 9 },
              maxRotation: 45,
              minRotation: 45,
              callback: function (value: string | number) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const self = this as any;
                const label = self.getLabelForValue(value as number);
                const index = typeof value === "number" ? value : parseInt(value as string);
                if (labels.length <= 7) return label;
                if (index % Math.ceil(labels.length / 7) === 0) return label;
                return "";
              },
            },
          },
          y: {
            display: true,
            grid: { display: true, color: "rgba(0, 0, 0, 0.04)" },
            ticks: {
              color: "#9CA3AF",
              font: { size: 9 },
              callback: function (value: string | number) {
                const numValue = typeof value === "string" ? parseFloat(value) : value;
                return formatValueFn(numValue);
              },
              maxTicksLimit: 5,
            },
            beginAtZero: true,
          },
        },
      } as never,
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [trendData, chartColor, title, valueType]);

  return (
    <div className="bg-vui-page px-4 pt-3 pb-5 border border-solid border-vui-border/30 rounded-vui shadow-lg shadow-black/20 w-full relative h-full min-h-[280px]" title={tooltip}>
      {/* Header */}
      <div className="flex flex-row items-center justify-between h-10">
        <div className="flex items-center gap-2">
          <span className="text-vui-brand">{icon}</span>
          <span className="text-sm font-semibold text-vui-text-white">{title}</span>
        </div>
      </div>

      {/* Values Section */}
      <div className="flex flex-row gap-4 items-center justify-start my-3">
        <div>
          <div className="flex flex-row items-baseline gap-x-2">
            <div className="font-semibold cursor-pointer leading-tight text-2xl text-vui-text-white">
              {mainValue}
            </div>
            <div className="font-normal cursor-default leading-tight text-vui-text text-sm">
              {previousValue}
            </div>
          </div>

          <div className="font-medium text-vui-text flex gap-x-2 items-center text-xs mt-1">
            vs previous period
            <div
              className={`border border-solid rounded-full py-0.5 px-1.5 flex flex-row items-center gap-x-0.5 ${
                isPositiveChange
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <span
                className={`font-medium text-xs ${
                  isPositiveChange ? "text-[#01b574]" : "text-[#e31a1a]"
                }`}
              >
                {percentageChange}
              </span>
              {isPositiveChange ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-vui-success">
                  <path d="M6.35355 2.14645C6.15829 1.95118 5.84171 1.95118 5.64645 2.14645L2.14645 5.64645C1.95118 5.84171 1.95118 6.15829 2.14645 6.35355C2.34171 6.54882 2.65829 6.54882 2.85355 6.35355L5.5 3.70711L5.5 9.5C5.5 9.77614 5.72386 10 6 10C6.27614 10 6.5 9.77614 6.5 9.5L6.5 3.70711L9.14645 6.35355C9.34171 6.54882 9.65829 6.54882 9.85355 6.35355C10.0488 6.15829 10.0488 5.84171 9.85355 5.64645L6.35355 2.14645Z" fill="currentColor" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-red-600">
                  <path d="M6.35355 9.85355C6.15829 10.0488 5.84171 10.0488 5.64645 9.85355L2.14645 6.35355C1.95118 6.15829 1.95118 5.84171 2.14645 5.64645C2.34171 5.45118 2.65829 5.45118 2.85355 5.64645L5.5 8.29289L5.5 2.5C5.5 2.22386 5.72386 2 6 2C6.27614 2 6.5 2.22386 6.5 2.5L6.5 8.29289L9.14645 5.64645C9.34171 5.45118 9.65829 5.45118 9.85355 5.64645C10.0488 5.84171 10.0488 6.15829 9.85355 6.35355L6.35355 9.85355Z" fill="currentColor" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="relative w-full" style={{ height: "150px" }}>
        {trendData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-vui-text text-xs">
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
// TRANSCRIPT MODAL COMPONENT
// ============================================================================

interface TranscriptModalProps {
  transcript: ZoomTranscript;
  onClose: () => void;
}

function TranscriptModal({ transcript, onClose }: TranscriptModalProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} min`;
  };

  const getOutcomeBadge = (outcome: string, cash: number) => {
    switch (outcome) {
      case 'closed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-vui-success/15 text-emerald-800">
            Closed {formatCurrency(cash)}
          </span>
        );
      case 'no_close':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-vui-brand/15 text-orange-800">
            No Close
          </span>
        );
      case 'no_show':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-vui-error/15 text-red-800">
            No Show
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-vui-sidenav-btn text-vui-text-white">
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-vui-page rounded-vui-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-vui-border/30 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-vui-text-white">
              {transcript.contact_name || transcript.topic}
            </h3>
            <p className="text-sm text-vui-text">
              {new Date(transcript.start_time).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-vui-sidenav-btn rounded-full transition-colors"
          >
            {SalesIcons.Close}
          </button>
        </div>

        {/* Meta info */}
        <div className="px-6 py-3 bg-vui-body border-b border-vui-border/30 flex items-center gap-4 text-sm">
          <span className="text-vui-text">
            Duration: <span className="font-medium">{formatDuration(transcript.duration)}</span>
          </span>
          <span className="text-vui-text">|</span>
          {getOutcomeBadge(transcript.call_outcome, transcript.cash_collected)}
          {transcript.contact_email && (
            <>
              <span className="text-vui-text">|</span>
              <span className="text-vui-text">{transcript.contact_email}</span>
            </>
          )}
        </div>

        {/* Transcript content */}
        <div className="flex-1 overflow-y-auto p-6">
          {transcript.transcript_parsed && transcript.transcript_parsed.length > 0 ? (
            <div className="space-y-3">
              {transcript.transcript_parsed.map((segment, idx) => (
                <div key={idx} className="flex gap-3">
                  <span className="text-xs text-vui-text w-16 flex-shrink-0 font-mono">
                    {segment.start}
                  </span>
                  <div>
                    <span className="font-semibold text-vui-text">{segment.speaker}:</span>
                    <span className="text-vui-text ml-1">{segment.text}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-vui-text text-center py-8">
              No transcript segments available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SALES VIEW COMPONENT
// ============================================================================

export default function SalesView({ dateRange }: SalesViewProps) {
  const [activeTab, setActiveTab] = useState<"metrics" | "transcripts">("metrics");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Sales data
  const [kpis, setKpis] = useState<SalesKPIs | null>(null);
  const [previousKpis, setPreviousKpis] = useState<SalesKPIs | null>(null);
  const [dailyTrends, setDailyTrends] = useState<DailySalesMetrics[]>([]);
  const [adAttribution, setAdAttribution] = useState<AdSalesAttribution[]>([]);
  const [weeklyCash, setWeeklyCash] = useState<WeeklyCashData[]>([]);
  const [weeklyShowsCloses, setWeeklyShowsCloses] = useState<WeeklyShowsClosesData[]>([]);
  const [transcripts, setTranscripts] = useState<ZoomTranscript[]>([]);
  const [selectedTranscript, setSelectedTranscript] = useState<ZoomTranscript | null>(null);

  // Filters
  const [transcriptSearch, setTranscriptSearch] = useState("");
  const [transcriptOutcomeFilter, setTranscriptOutcomeFilter] = useState<string>("all");
  const [adSearch, setAdSearch] = useState("");

  // Calculate previous period
  const getPreviousPeriod = useCallback(() => {
    if (!dateRange?.from || !dateRange?.to) return null;
    const periodLength = Math.ceil(
      (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)
    );
    const previousTo = new Date(dateRange.from);
    previousTo.setDate(previousTo.getDate() - 1);
    const previousFrom = new Date(previousTo);
    previousFrom.setDate(previousFrom.getDate() - periodLength + 1);
    return { from: previousFrom, to: previousTo };
  }, [dateRange]);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filter = dateRange?.from && dateRange?.to
        ? { from: dateRange.from, to: dateRange.to }
        : undefined;
      const previousFilter = getPreviousPeriod();

      const [
        kpisResult,
        previousKpisResult,
        trendsResult,
        attributionResult,
        weeklyCashResult,
        weeklyShowsClosesResult,
        transcriptsResult,
      ] = await Promise.all([
        getSalesKPIs(filter),
        previousFilter ? getSalesKPIs(previousFilter) : Promise.resolve({ data: null, error: null }),
        getDailySalesTrends(filter),
        getAdSalesAttribution(filter),
        getWeeklyCashCollected(filter),
        getWeeklyShowsCloses(filter),
        getZoomTranscripts(),
      ]);

      setKpis(kpisResult.data);
      setPreviousKpis(previousKpisResult.data);
      setDailyTrends(trendsResult.data || []);
      setAdAttribution(attributionResult.data || []);
      setWeeklyCash(weeklyCashResult.data || []);
      setWeeklyShowsCloses(weeklyShowsClosesResult.data || []);
      setTranscripts(transcriptsResult.data || []);
    } catch (err) {
      console.error("Error fetching sales data:", err);
    } finally {
      setLoading(false);
    }
  }, [dateRange, getPreviousPeriod]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sync transcripts
  const handleSyncTranscripts = async () => {
    setSyncing(true);
    try {
      const result = await syncZoomTranscripts();
      if (result.success) {
        // Refresh transcripts
        const transcriptsResult = await getZoomTranscripts();
        setTranscripts(transcriptsResult.data || []);
      } else {
        console.error("Sync failed:", result.message);
      }
    } catch (err) {
      console.error("Error syncing transcripts:", err);
    } finally {
      setSyncing(false);
    }
  };

  // Calculate percentage change
  const calcChange = (current: number, previous: number | undefined): { percentageChange: string; isPositiveChange: boolean } => {
    if (previous === undefined || previous === 0) {
      return { percentageChange: current > 0 ? "+100%" : "0%", isPositiveChange: current >= 0 };
    }
    const change = ((current - previous) / previous) * 100;
    return {
      percentageChange: `${change > 0 ? "+" : ""}${change.toFixed(1)}%`,
      isPositiveChange: change >= 0,
    };
  };

  // Format previous value
  const formatPrevious = (value: number | undefined, type: "number" | "currency" | "percentage") => {
    if (value === undefined) return "—";
    if (type === "currency") return formatCurrencyCompact(value);
    if (type === "percentage") return `${value.toFixed(1)}%`;
    return formatNumber(value);
  };

  // Build trend data for each metric
  const buildTrendData = (metric: keyof DailySalesMetrics): TrendDataPoint[] => {
    return dailyTrends.map((d) => ({
      date: d.date,
      value: d[metric] as number,
    }));
  };

  // Filter transcripts
  const filteredTranscripts = transcripts.filter((t) => {
    const matchesSearch =
      !transcriptSearch ||
      t.contact_name?.toLowerCase().includes(transcriptSearch.toLowerCase()) ||
      t.topic?.toLowerCase().includes(transcriptSearch.toLowerCase()) ||
      t.contact_email?.toLowerCase().includes(transcriptSearch.toLowerCase());
    const matchesOutcome =
      transcriptOutcomeFilter === "all" || t.call_outcome === transcriptOutcomeFilter;
    return matchesSearch && matchesOutcome;
  });

  // Filter ads
  const filteredAds = adAttribution.filter((a) =>
    !adSearch || a.ad_name.toLowerCase().includes(adSearch.toLowerCase())
  );

  // Chart colors (matching existing dashboard)
  const chartColors = {
    blue: "rgb(59, 130, 246)",
    green: "rgb(16, 185, 129)",
    purple: "rgb(139, 92, 246)",
    orange: "rgb(249, 115, 22)",
    red: "rgb(239, 68, 68)",
    indigo: "rgb(99, 102, 241)",
    pink: "rgb(236, 72, 153)",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-vui-border/30">
        <button
          onClick={() => setActiveTab("metrics")}
          className={`pb-3 px-1 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "metrics"
              ? "border-orange-500 text-vui-brand"
              : "border-transparent text-vui-text hover:text-vui-text"
          }`}
        >
          Sales Metrics
        </button>
        <button
          onClick={() => setActiveTab("transcripts")}
          className={`pb-3 px-1 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "transcripts"
              ? "border-orange-500 text-vui-brand"
              : "border-transparent text-vui-text hover:text-vui-text"
          }`}
        >
          Call Transcripts
        </button>
      </div>

      {/* Sales Metrics Tab */}
      {activeTab === "metrics" && (
        <div className="space-y-8">
          {/* Volume Metrics - Row 1 (4 cards) */}
          <div>
            <h3 className="text-sm font-semibold text-vui-text uppercase tracking-wide mb-4">Volume Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <SalesMetricCard
                title="Total Calls Booked"
                icon={SalesIcons.CalendarCheck}
                mainValue={formatNumber(kpis?.totalCallsBooked || 0)}
                previousValue={formatPrevious(previousKpis?.totalCallsBooked, "number")}
                {...calcChange(kpis?.totalCallsBooked || 0, previousKpis?.totalCallsBooked)}
                trendData={buildTrendData("callsBooked")}
                chartColor={chartColors.blue}
                valueType="number"
              />
              <SalesMetricCard
                title="Qualified Calls Booked"
                icon={SalesIcons.UserCheck}
                mainValue={formatNumber(kpis?.qualifiedCallsBooked || 0)}
                previousValue={formatPrevious(previousKpis?.qualifiedCallsBooked, "number")}
                {...calcChange(kpis?.qualifiedCallsBooked || 0, previousKpis?.qualifiedCallsBooked)}
                trendData={buildTrendData("qualifiedCallsBooked")}
                chartColor={chartColors.green}
                valueType="number"
              />
              <SalesMetricCard
                title="Total Calls Taken"
                icon={SalesIcons.PhoneCall}
                mainValue={formatNumber(kpis?.totalCallsTaken || 0)}
                previousValue={formatPrevious(previousKpis?.totalCallsTaken, "number")}
                {...calcChange(kpis?.totalCallsTaken || 0, previousKpis?.totalCallsTaken)}
                trendData={buildTrendData("callsTaken")}
                chartColor={chartColors.purple}
                valueType="number"
              />
              <SalesMetricCard
                title="Qualified Calls Taken"
                icon={SalesIcons.PhoneIncoming}
                mainValue={formatNumber(kpis?.qualifiedCallsTaken || 0)}
                previousValue={formatPrevious(previousKpis?.qualifiedCallsTaken, "number")}
                {...calcChange(kpis?.qualifiedCallsTaken || 0, previousKpis?.qualifiedCallsTaken)}
                trendData={buildTrendData("qualifiedCallsTaken")}
                chartColor={chartColors.indigo}
                valueType="number"
              />
            </div>
          </div>

          {/* Volume Metrics - Row 2 (3 cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SalesMetricCard
              title="Total Closes"
              icon={SalesIcons.Trophy}
              mainValue={formatNumber(kpis?.totalCloses || 0)}
              previousValue={formatPrevious(previousKpis?.totalCloses, "number")}
              {...calcChange(kpis?.totalCloses || 0, previousKpis?.totalCloses)}
              trendData={buildTrendData("closes")}
              chartColor={chartColors.orange}
              valueType="number"
            />
            <SalesMetricCard
              title="Cash Collected"
              icon={SalesIcons.DollarSign}
              mainValue={formatCurrency(kpis?.cashCollected || 0)}
              previousValue={formatPrevious(previousKpis?.cashCollected, "currency")}
              {...calcChange(kpis?.cashCollected || 0, previousKpis?.cashCollected)}
              trendData={buildTrendData("cashCollected")}
              chartColor={chartColors.green}
              valueType="currency"
            />
            <SalesMetricCard
              title="Avg ACV"
              icon={SalesIcons.TrendingUp}
              mainValue={formatCurrency(kpis?.avgACV || 0)}
              previousValue={formatPrevious(previousKpis?.avgACV, "currency")}
              {...calcChange(kpis?.avgACV || 0, previousKpis?.avgACV)}
              trendData={dailyTrends.map((d) => ({
                date: d.date,
                value: d.closes > 0 ? d.cashCollected / d.closes : 0,
              }))}
              chartColor={chartColors.purple}
              valueType="currency"
            />
          </div>

          {/* Rate Metrics */}
          <div>
            <h3 className="text-sm font-semibold text-vui-text uppercase tracking-wide mb-4">Rate Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SalesMetricCard
                title="Total Show Rate"
                icon={SalesIcons.Users}
                mainValue={formatPercentage(kpis?.totalShowRate || 0)}
                previousValue={formatPrevious(previousKpis?.totalShowRate, "percentage")}
                {...calcChange(kpis?.totalShowRate || 0, previousKpis?.totalShowRate)}
                trendData={buildTrendData("showRate")}
                chartColor={chartColors.blue}
                valueType="percentage"
              />
              <SalesMetricCard
                title="Qualified Show Rate"
                icon={SalesIcons.UserCheck}
                mainValue={formatPercentage(kpis?.qualifiedShowRate || 0)}
                previousValue={formatPrevious(previousKpis?.qualifiedShowRate, "percentage")}
                {...calcChange(kpis?.qualifiedShowRate || 0, previousKpis?.qualifiedShowRate)}
                trendData={buildTrendData("qualifiedShowRate")}
                chartColor={chartColors.green}
                valueType="percentage"
              />
              <SalesMetricCard
                title="Total Close Rate"
                icon={SalesIcons.Target}
                mainValue={formatPercentage(kpis?.totalCloseRate || 0)}
                previousValue={formatPrevious(previousKpis?.totalCloseRate, "percentage")}
                {...calcChange(kpis?.totalCloseRate || 0, previousKpis?.totalCloseRate)}
                trendData={buildTrendData("closeRate")}
                chartColor={chartColors.purple}
                valueType="percentage"
              />
              <SalesMetricCard
                title="Qualified Close Rate"
                icon={SalesIcons.Award}
                mainValue={formatPercentage(kpis?.qualifiedCloseRate || 0)}
                previousValue={formatPrevious(previousKpis?.qualifiedCloseRate, "percentage")}
                {...calcChange(kpis?.qualifiedCloseRate || 0, previousKpis?.qualifiedCloseRate)}
                trendData={buildTrendData("qualifiedCloseRate")}
                chartColor={chartColors.indigo}
                valueType="percentage"
                tooltip="Close rate = Closes / Shows. Some closes may not have a corresponding show event recorded."
              />
              <SalesMetricCard
                title="DQ Close Rate"
                icon={SalesIcons.XCircle}
                mainValue={formatPercentage(Math.min(kpis?.dqCloseRate || 0, 100))}
                previousValue={formatPrevious(previousKpis?.dqCloseRate ? Math.min(previousKpis.dqCloseRate, 100) : undefined, "percentage")}
                {...calcChange(Math.min(kpis?.dqCloseRate || 0, 100), previousKpis?.dqCloseRate ? Math.min(previousKpis.dqCloseRate, 100) : undefined)}
                trendData={buildTrendData("dqCloseRate").map(d => ({ ...d, value: Math.min(d.value, 100) }))}
                chartColor={chartColors.red}
                valueType="percentage"
                tooltip="Close rate = Closes / Shows. Some closes may not have a corresponding show event recorded."
              />
              <SalesMetricCard
                title="Avg Cash / Call Taken"
                icon={SalesIcons.Coins}
                mainValue={formatCurrency(kpis?.avgCashPerCallTaken || 0)}
                previousValue={formatPrevious(previousKpis?.avgCashPerCallTaken, "currency")}
                {...calcChange(kpis?.avgCashPerCallTaken || 0, previousKpis?.avgCashPerCallTaken)}
                trendData={dailyTrends.map((d) => ({
                  date: d.date,
                  value: d.callsTaken > 0 ? d.cashCollected / d.callsTaken : 0,
                }))}
                chartColor={chartColors.orange}
                valueType="currency"
              />
            </div>
          </div>

          {/* Trend Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cash Collected Over Time */}
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-vui-text-white mb-4">Cash Collected Over Time</h3>
              {weeklyCash.length > 0 ? (
                <BarChart
                  data={weeklyCash.map(w => ({ week: formatWeekLabel(w.week), Cash: w.cash }))}
                  index="week"
                  categories={["Cash"]}
                  colors={["emerald"]}
                  valueFormatter={(value) => formatCurrency(value)}
                  className="h-64"
                />
              ) : (
                <div className="h-64 flex items-center justify-center text-vui-text">
                  No data available
                </div>
              )}
            </Card>

            {/* Shows vs Closes */}
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-vui-text-white mb-4">Shows vs Closes</h3>
              {weeklyShowsCloses.length > 0 ? (
                <AreaChart
                  data={weeklyShowsCloses.map(w => ({
                    week: formatWeekLabel(w.week),
                    Shows: w.shows,
                    Closes: w.closes,
                  }))}
                  index="week"
                  categories={["Shows", "Closes"]}
                  colors={["blue", "orange"]}
                  valueFormatter={(value) => formatNumber(value)}
                  className="h-64"
                />
              ) : (
                <div className="h-64 flex items-center justify-center text-vui-text">
                  No data available
                </div>
              )}
            </Card>
          </div>

          {/* Ad Attribution Table */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-vui-text-white">Ad Attribution</h3>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-vui-text">
                  {SalesIcons.Search}
                </span>
                <input
                  type="text"
                  placeholder="Search ads..."
                  value={adSearch}
                  onChange={(e) => setAdSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-vui-border/30 rounded-vui text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Ad Name</TableHeaderCell>
                  <TableHeaderCell className="text-right">Leads</TableHeaderCell>
                  <TableHeaderCell className="text-right">Booked</TableHeaderCell>
                  <TableHeaderCell className="text-right">Qual. Booked</TableHeaderCell>
                  <TableHeaderCell className="text-right">Shows</TableHeaderCell>
                  <TableHeaderCell className="text-right">Closes</TableHeaderCell>
                  <TableHeaderCell className="text-right">Cash</TableHeaderCell>
                  <TableHeaderCell className="text-right">Close Rate</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-vui-text py-8">
                      No ad data available
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAds.map((ad) => (
                    <TableRow key={ad.ad_id}>
                      <TableCell className="font-medium">{ad.ad_name}</TableCell>
                      <TableCell className="text-right">{ad.leads}</TableCell>
                      <TableCell className="text-right">{ad.booked}</TableCell>
                      <TableCell className="text-right">{ad.qualifiedBooked}</TableCell>
                      <TableCell className="text-right">{ad.shows}</TableCell>
                      <TableCell className="text-right">{ad.closes}</TableCell>
                      <TableCell className="text-right font-medium text-vui-success">
                        {formatCurrency(ad.cash)}
                      </TableCell>
                      <TableCell className="text-right">{formatPercentage(ad.closeRate)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Call Transcripts Tab */}
      {activeTab === "transcripts" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-vui-text">
                {SalesIcons.Search}
              </span>
              <input
                type="text"
                placeholder="Search transcripts..."
                value={transcriptSearch}
                onChange={(e) => setTranscriptSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-vui-border/30 rounded-vui text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <select
              value={transcriptOutcomeFilter}
              onChange={(e) => setTranscriptOutcomeFilter(e.target.value)}
              className="px-4 py-2 border border-vui-border/30 rounded-vui text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Outcomes</option>
              <option value="closed">Closed</option>
              <option value="no_close">No Close</option>
              <option value="no_show">No Show</option>
              <option value="unknown">Unknown</option>
            </select>
            <button
              onClick={handleSyncTranscripts}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-vui-brand/100 text-vui-text-white rounded-vui text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {syncing ? (
                <>
                  <span className="animate-spin">{SalesIcons.Refresh}</span>
                  Syncing...
                </>
              ) : (
                <>
                  {SalesIcons.Refresh}
                  Sync Now
                </>
              )}
            </button>
          </div>

          {/* Transcript List */}
          {filteredTranscripts.length === 0 ? (
            <div className="bg-vui-page rounded-vui-xl border border-vui-border/30 p-12 text-center">
              <div className="w-16 h-16 bg-vui-sidenav-btn rounded-full flex items-center justify-center mx-auto mb-4">
                {SalesIcons.Phone}
              </div>
              <h3 className="text-lg font-semibold text-vui-text-white mb-2">No call transcripts yet</h3>
              <p className="text-vui-text text-sm max-w-md mx-auto mb-6">
                Cloud Recording with audio transcription has been enabled.
                Your next sales call recorded to the cloud will appear here within 30-60 minutes after the call ends.
              </p>
              <button
                onClick={handleSyncTranscripts}
                disabled={syncing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-vui-brand/100 text-vui-text-white rounded-vui text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {syncing ? "Syncing..." : "Sync Now"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTranscripts.map((transcript) => (
                <div
                  key={transcript.id}
                  className="bg-vui-page rounded-vui border border-vui-border/30 p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-vui-sidenav-btn rounded-full flex items-center justify-center text-vui-text">
                      {SalesIcons.PhoneCall}
                    </div>
                    <div>
                      <h4 className="font-medium text-vui-text-white">
                        {transcript.contact_name || transcript.topic || "Unknown Contact"}
                      </h4>
                      <p className="text-sm text-vui-text">
                        {new Date(transcript.start_time).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {" • "}
                        {transcript.duration} min
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Outcome badge */}
                    {transcript.call_outcome === "closed" && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-vui-success/15 text-emerald-800">
                        Closed {formatCurrency(transcript.cash_collected)}
                      </span>
                    )}
                    {transcript.call_outcome === "no_close" && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-vui-brand/15 text-orange-800">
                        No Close
                      </span>
                    )}
                    {transcript.call_outcome === "no_show" && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-vui-error/15 text-red-800">
                        No Show
                      </span>
                    )}
                    {transcript.call_outcome === "unknown" && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-vui-sidenav-btn text-vui-text-white">
                        Unknown
                      </span>
                    )}
                    <button
                      onClick={() => setSelectedTranscript(transcript)}
                      className="text-vui-brand hover:text-vui-brand text-sm font-medium"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Transcript Modal */}
      {selectedTranscript && (
        <TranscriptModal
          transcript={selectedTranscript}
          onClose={() => setSelectedTranscript(null)}
        />
      )}
    </div>
  );
}
