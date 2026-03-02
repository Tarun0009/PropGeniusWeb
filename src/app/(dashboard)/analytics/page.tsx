"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Building2, Users, Flame, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { StatCard } from "@/components/analytics/stat-card";
import {
  useDashboardStats,
  useLeadsByStatus,
  useLeadsBySource,
  useListingsByType,
  useLeadsOverTime,
} from "@/hooks/use-analytics";

const ChartSkeleton = () => (
  <div className="flex h-80 items-center justify-center rounded-lg border border-slate-200 bg-white">
    <Spinner />
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

const PERIOD_TABS = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "60d", label: "60 Days" },
  { value: "90d", label: "90 Days" },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30d");
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: funnelData = [], isLoading: funnelLoading } = useLeadsByStatus();
  const { data: sourceData = [], isLoading: sourceLoading } = useLeadsBySource();
  const { data: typeData = [], isLoading: typeLoading } = useListingsByType();
  const { data: timeData = [], isLoading: timeLoading } = useLeadsOverTime(period);

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
          <div className="col-span-4 flex items-center justify-center py-8">
            <Spinner />
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

      {/* Charts Grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <LeadsOverTimeChart data={timeData} isLoading={timeLoading} />
        <LeadSourceChart data={sourceData} isLoading={sourceLoading} />
        <ListingsByTypeChart data={typeData} isLoading={typeLoading} />
        <ConversionFunnel data={funnelData} isLoading={funnelLoading} />
      </div>
    </div>
  );
}
