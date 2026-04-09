"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Building2, Users, Flame, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/analytics/stat-card";
import { AIInsights } from "@/components/analytics/ai-insights";
import {
  useDashboardStats,
  useLeadsByStatus,
  useLeadsBySource,
  useListingsByType,
  useLeadsOverTime,
  usePipelineValue,
  useSourceROI,
  useListingPerformance,
} from "@/hooks/use-analytics";

const ChartSkeleton = () => (
  <div className="rounded-xl border border-slate-200 bg-white p-5">
    <Skeleton className="mb-4 h-5 w-36" />
    <Skeleton className="h-60 w-full" />
  </div>
);

const StatCardSkeleton = () => (
  <div className="rounded-xl border border-slate-200 bg-white p-5">
    <Skeleton className="mb-3 h-3 w-24" />
    <Skeleton className="mb-2 h-8 w-20" />
    <Skeleton className="h-3 w-32" />
  </div>
);

const LeadsOverTimeChart = dynamic(
  () => import("@/components/analytics/leads-over-time-chart").then((m) => ({ default: m.LeadsOverTimeChart })),
  { loading: ChartSkeleton }
);
const LeadSourceChart = dynamic(
  () => import("@/components/analytics/lead-source-chart").then((m) => ({ default: m.LeadSourceChart })),
  { loading: ChartSkeleton }
);
const ListingsByTypeChart = dynamic(
  () => import("@/components/analytics/listings-by-type-chart").then((m) => ({ default: m.ListingsByTypeChart })),
  { loading: ChartSkeleton }
);
const ConversionFunnel = dynamic(
  () => import("@/components/analytics/conversion-funnel").then((m) => ({ default: m.ConversionFunnel })),
  { loading: ChartSkeleton }
);
const PipelineValueChart = dynamic(
  () => import("@/components/analytics/pipeline-value-chart").then((m) => ({ default: m.PipelineValueChart })),
  { loading: ChartSkeleton }
);
const SourceROITable = dynamic(
  () => import("@/components/analytics/source-roi-table").then((m) => ({ default: m.SourceROITable })),
  { loading: ChartSkeleton }
);
const ListingPerformanceCard = dynamic(
  () => import("@/components/analytics/listing-performance-card").then((m) => ({ default: m.ListingPerformanceCard })),
  { loading: ChartSkeleton }
);

const PERIOD_TABS = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "60d", label: "60 Days" },
  { value: "90d", label: "90 Days" },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30d");
  const { data: stats, isLoading: statsLoading, isError: statsError } = useDashboardStats();
  const { data: funnelData = [], isLoading: funnelLoading } = useLeadsByStatus();
  const { data: sourceData = [], isLoading: sourceLoading } = useLeadsBySource();
  const { data: typeData = [], isLoading: typeLoading } = useListingsByType();
  const { data: timeData = [], isLoading: timeLoading } = useLeadsOverTime(period);
  const { data: pipelineData = [], isLoading: pipelineLoading } = usePipelineValue();
  const { data: roiData = [], isLoading: roiLoading } = useSourceROI();
  const { data: listingPerf, isLoading: perfLoading } = useListingPerformance();

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Track your performance and get insights"
      />

      {/* Period Filter */}
      <div className="mt-4">
        <Tabs tabs={PERIOD_TABS} activeTab={period} onTabChange={setPeriod} />
      </div>

      {/* Stat Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : statsError ? (
          <div className="col-span-4 rounded-xl border border-danger-200 bg-danger-50 p-6 text-center">
            <p className="text-sm font-medium text-danger-700">Failed to load analytics data</p>
            <p className="mt-1 text-xs text-danger-500">Please refresh the page to try again.</p>
          </div>
        ) : (
          <>
            <StatCard
              title="Total Listings"
              value={stats?.totalListings ?? 0}
              change={`${stats?.activeListings ?? 0} active`}
              changeType="neutral"
              icon={Building2}
              iconBg="bg-primary-50"
              iconColor="text-primary-600"
            />
            <StatCard
              title="Total Leads"
              value={stats?.totalLeads ?? 0}
              icon={Users}
              iconBg="bg-success-50"
              iconColor="text-success-500"
            />
            <StatCard
              title="Hot Leads"
              value={stats?.hotLeads ?? 0}
              change="AI score > 70"
              changeType="neutral"
              icon={Flame}
              iconBg="bg-warning-50"
              iconColor="text-warning-500"
            />
            <StatCard
              title="Conversion Rate"
              value={`${stats?.conversionRate ?? 0}%`}
              icon={TrendingUp}
              iconBg="bg-info-50"
              iconColor="text-info-500"
            />
          </>
        )}
      </div>

      {/* AI Insights */}
      <div className="mt-6">
        <AIInsights
          stats={stats}
          sourceData={sourceData}
          funnelData={funnelData}
          isLoading={statsLoading || sourceLoading || funnelLoading}
        />
      </div>

      {/* Charts Grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <LeadsOverTimeChart data={timeData} isLoading={timeLoading} />
        <LeadSourceChart data={sourceData} isLoading={sourceLoading} />
        <ListingsByTypeChart data={typeData} isLoading={typeLoading} />
        <ConversionFunnel data={funnelData} isLoading={funnelLoading} />
      </div>

      {/* Advanced Analytics */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <PipelineValueChart data={pipelineData} isLoading={pipelineLoading} />
        <SourceROITable data={roiData} isLoading={roiLoading} />
        <ListingPerformanceCard data={listingPerf} isLoading={perfLoading} />
      </div>
    </div>
  );
}
