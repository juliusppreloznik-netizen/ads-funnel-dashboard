"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AdsManagerAd,
  getAdsManagerData,
  DateRangeFilter,
} from "@/lib/contact-queries";
import AdPreviewModal from "./AdPreviewModal";

interface DateRangeValue {
  from?: Date;
  to?: Date;
}

interface AdsManagerViewProps {
  dateRange: DateRangeValue;
}

export default function AdsManagerView({ dateRange }: AdsManagerViewProps) {
  const [ads, setAds] = useState<AdsManagerAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<keyof AdsManagerAd>("total_spend");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [previewAdId, setPreviewAdId] = useState<string | null>(null);
  const [previewAdName, setPreviewAdName] = useState<string>("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const filter: DateRangeFilter | undefined = dateRange?.from
      ? { from: dateRange.from, to: dateRange.to }
      : undefined;

    const result = await getAdsManagerData(filter);

    if (result.error) {
      setError(result.error.message);
      setAds([]);
    } else {
      setAds(result.data || []);
    }

    setLoading(false);
  }, [dateRange]);

  useEffect(() => {
    // Data fetching is an expected use case for calling setState in effects
    void fetchData();
  }, [fetchData]);

  // Sort ads
  const sortedAds = [...ads].sort((a, b) => {
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    }

    const aStr = String(aVal || "");
    const bStr = String(bVal || "");
    return sortDirection === "asc"
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });

  // Toggle sort
  const handleSort = (column: keyof AdsManagerAd) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  // Open preview modal
  const handlePreview = (ad: AdsManagerAd) => {
    setPreviewAdId(ad.ad_id);
    setPreviewAdName(ad.ad_name);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format number with commas
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(Math.round(value));
  };

  // Format percentage
  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Sort indicator
  const SortIndicator = ({ column }: { column: keyof AdsManagerAd }) => {
    if (sortColumn !== column) {
      return <span className="text-gray-300 ml-1">↕</span>;
    }
    return (
      <span className="text-orange-500 ml-1">
        {sortDirection === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading ads data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Error loading data</h3>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No ads found</h3>
          <p className="text-sm text-gray-500 mt-1">Try adjusting your date range</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Ads"
          value={ads.length.toString()}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />
        <SummaryCard
          title="Total Spend"
          value={formatCurrency(ads.reduce((sum, ad) => sum + ad.total_spend, 0))}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <SummaryCard
          title="Total Leads"
          value={formatNumber(ads.reduce((sum, ad) => sum + ad.total_leads, 0))}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <SummaryCard
          title="Total Revenue"
          value={formatCurrency(ads.reduce((sum, ad) => sum + ad.revenue, 0))}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
      </div>

      {/* Ads Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Ads</h2>
          <p className="text-sm text-gray-500">Click &quot;Preview&quot; to view ad creative and transcript</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort("ad_name")}
                >
                  Ad Name <SortIndicator column="ad_name" />
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort("total_spend")}
                >
                  Spend <SortIndicator column="total_spend" />
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort("total_impressions")}
                >
                  Impr. <SortIndicator column="total_impressions" />
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort("total_clicks")}
                >
                  Clicks <SortIndicator column="total_clicks" />
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort("avg_ctr")}
                >
                  CTR <SortIndicator column="avg_ctr" />
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort("total_leads")}
                >
                  Leads <SortIndicator column="total_leads" />
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort("calls_booked")}
                >
                  Booked <SortIndicator column="calls_booked" />
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort("shows")}
                >
                  Shows <SortIndicator column="shows" />
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort("closes")}
                >
                  Closes <SortIndicator column="closes" />
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort("revenue")}
                >
                  Revenue <SortIndicator column="revenue" />
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedAds.map((ad) => (
                <tr key={ad.ad_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => handlePreview(ad)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Preview
                    </button>
                    {ad.has_transcript && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Has Transcript
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {ad.ad_name}
                      </span>
                      {ad.campaign_name && (
                        <span className="text-xs text-gray-500 truncate max-w-xs">
                          {ad.campaign_name}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 whitespace-nowrap">
                    {formatCurrency(ad.total_spend)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600 whitespace-nowrap">
                    {formatNumber(ad.total_impressions)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600 whitespace-nowrap">
                    {formatNumber(ad.total_clicks)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600 whitespace-nowrap">
                    {formatPercent(ad.avg_ctr)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600 whitespace-nowrap">
                    {ad.total_leads}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600 whitespace-nowrap">
                    {ad.calls_booked}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600 whitespace-nowrap">
                    {ad.shows}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600 whitespace-nowrap">
                    {ad.closes}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-green-600 whitespace-nowrap">
                    {formatCurrency(ad.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {previewAdId && (
        <AdPreviewModal
          isOpen={true}
          onClose={() => {
            setPreviewAdId(null);
            setPreviewAdName("");
          }}
          adId={previewAdId}
          adName={previewAdName}
        />
      )}
    </div>
  );
}

// Summary Card Component
interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

function SummaryCard({ title, value, icon }: SummaryCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
