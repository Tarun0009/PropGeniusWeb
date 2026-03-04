"use client";

import Link from "next/link";
import {
  Building2,
  Users,
  TrendingUp,
  Sparkles,
  Clock,
  Plus,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/analytics/stat-card";
import { useDashboardStats, useRecentLeads, useRecentListings, usePendingFollowUps, useSalesFunnel } from "@/hooks/use-analytics";
import { formatRelativeTime, formatPrice } from "@/lib/utils";
import { LEAD_STATUSES } from "@/lib/constants";

const statusVariant: Record<string, "primary" | "purple" | "warning" | "cyan" | "orange" | "success" | "danger"> = {
  new: "primary",
  contacted: "purple",
  interested: "warning",
  site_visit: "cyan",
  negotiation: "orange",
  converted: "success",
  lost: "danger",
};

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentLeads = [], isLoading: leadsLoading } = useRecentLeads();
  const { data: recentListings = [], isLoading: listingsLoading } = useRecentListings();
  const { data: pendingFollowUps = [] } = usePendingFollowUps();
  const { data: funnelData = [] } = useSalesFunnel();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your business."
      />

      {/* Stats Grid */}
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
              change={`${stats?.listingsThisMonth ?? 0} this month`}
              changeType={stats?.listingsThisMonth ? "positive" : "neutral"}
              icon={Building2}
              iconBg="bg-primary-50"
              iconColor="text-primary-600"
            />
            <StatCard
              title="Active Leads"
              value={stats?.totalLeads ?? 0}
              change={`${stats?.hotLeads ?? 0} hot leads`}
              changeType={stats?.hotLeads ? "positive" : "neutral"}
              icon={Users}
              iconBg="bg-success-50"
              iconColor="text-success-500"
            />
            <StatCard
              title="Conversion Rate"
              value={`${stats?.conversionRate ?? 0}%`}
              icon={TrendingUp}
              iconBg="bg-warning-50"
              iconColor="text-warning-500"
            />
            <StatCard
              title="Active Listings"
              value={stats?.activeListings ?? 0}
              icon={Sparkles}
              iconBg="bg-info-50"
              iconColor="text-info-500"
            />
          </>
        )}
      </div>

      {/* Quick Actions + Follow-ups Row */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Link href="/leads/new">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add Lead
              </Button>
            </Link>
            <Link href="/listings/new">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add Listing
              </Button>
            </Link>
            <Link href="/messages">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                Messages
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
                Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Pending Follow-ups */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-warning-500" />
                Pending Follow-ups
              </CardTitle>
              <Link href="/leads" className="text-xs font-medium text-primary-600 hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {pendingFollowUps.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-slate-400">No pending follow-ups</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingFollowUps.map((lead) => {
                  const isPast = new Date(lead.next_followup_at!) < new Date();
                  return (
                    <Link
                      key={lead.id}
                      href={`/leads/${lead.id}`}
                      className="flex items-center justify-between px-5 py-2.5 transition-colors hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{lead.name}</p>
                        {lead.followup_notes && (
                          <p className="truncate text-xs text-slate-500">{lead.followup_notes}</p>
                        )}
                      </div>
                      <span className={`shrink-0 text-xs font-medium ${isPast ? "text-danger-600" : "text-slate-500"}`}>
                        {formatRelativeTime(lead.next_followup_at!)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sales Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sales Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            {funnelData.length === 0 ? (
              <p className="text-center text-sm text-slate-400">No data yet</p>
            ) : (
              <div className="space-y-2.5">
                {funnelData.map((stage) => (
                  <div key={stage.status}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{stage.label}</span>
                      <span className="text-slate-500">{stage.count} ({stage.percentage}%)</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${stage.color} transition-all duration-300`}
                        style={{ width: `${Math.max(stage.percentage, 2)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Leads</CardTitle>
              <Link href="/leads" className="text-xs font-medium text-primary-600 hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {leadsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner />
              </div>
            ) : recentLeads.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-400">No leads yet</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentLeads.map((lead) => {
                  const statusLabel = LEAD_STATUSES.find((s) => s.value === lead.status)?.label || lead.status;
                  return (
                    <Link
                      key={lead.id}
                      href={`/leads/${lead.id}`}
                      className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {lead.name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {lead.preferred_location || lead.preferred_property_type || "—"}
                        </p>
                      </div>
                      <div className="ml-4 shrink-0 text-right">
                        <Badge variant={statusVariant[lead.status] || "default"} size="sm">
                          {statusLabel}
                        </Badge>
                        <p className="mt-1 text-xs text-slate-400">
                          {formatRelativeTime(lead.created_at)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Listings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Listings</CardTitle>
              <Link href="/listings" className="text-xs font-medium text-primary-600 hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {listingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner />
              </div>
            ) : recentListings.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-400">No listings yet</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentListings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/listings/${listing.id}`}
                    className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {listing.title}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {[listing.locality, listing.city].filter(Boolean).join(", ") || "—"}
                      </p>
                    </div>
                    <div className="ml-4 shrink-0 text-right">
                      <p className="text-sm font-semibold text-slate-900">
                        {formatPrice(listing.price)}
                      </p>
                      <Badge
                        variant={listing.status === "active" ? "success" : "default"}
                        size="sm"
                        className="mt-1"
                      >
                        {listing.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
