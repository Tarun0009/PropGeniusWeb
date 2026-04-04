"use client";

import Link from "next/link";
import {
  Landmark,
  Contact,
  TrendingUp,
  Wand2,
  Clock,
  UserPlus,
  House,
  MessageCircleMore,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { StatCard } from "@/components/analytics/stat-card";
import { useDashboardStats, useRecentLeads, useRecentListings, usePendingFollowUps, useSalesFunnel } from "@/hooks/use-analytics";
import { useAuthStore } from "@/stores/auth-store";
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

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

const QUICK_ACTIONS = [
  {
    label: "New Lead",
    desc: "Add a prospect",
    href: "/leads/new",
    icon: UserPlus,
    color: "bg-primary-50 text-primary-600",
    border: "hover:border-primary-200",
  },
  {
    label: "New Listing",
    desc: "Add a property",
    href: "/listings/new",
    icon: House,
    color: "bg-success-50 text-success-600",
    border: "hover:border-success-200",
  },
  {
    label: "Messages",
    desc: "WhatsApp inbox",
    href: "/messages",
    icon: MessageCircleMore,
    color: "bg-info-50 text-info-600",
    border: "hover:border-info-200",
  },
  {
    label: "Analytics",
    desc: "View reports",
    href: "/analytics",
    icon: TrendingUp,
    color: "bg-warning-50 text-warning-600",
    border: "hover:border-warning-200",
  },
];

const funnelColors: Record<string, string> = {
  new:         "bg-primary-500",
  contacted:   "bg-purple-500",
  interested:  "bg-warning-400",
  site_visit:  "bg-cyan-500",
  negotiation: "bg-orange-500",
  converted:   "bg-success-500",
  lost:        "bg-danger-400",
};

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentLeads = [], isLoading: leadsLoading } = useRecentLeads();
  const { data: recentListings = [], isLoading: listingsLoading } = useRecentListings();
  const { data: pendingFollowUps = [] } = usePendingFollowUps();
  const { data: funnelData = [] } = useSalesFunnel();
  const profile = useAuthStore((s) => s.profile);
  const firstName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <div className="space-y-6">

      {/* ── Hero greeting banner ──────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0F0B1E] px-7 py-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_90%_at_80%_50%,rgba(139,92,246,0.22),transparent)]" />
        <div className="absolute inset-0 bg-grid-dots-light opacity-40" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-primary-400 mb-1">
              {getFormattedDate()}
            </p>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {getGreeting()}, {firstName}!
            </h1>
            <p className="text-[13px] text-slate-400 mt-0.5">
              Here&apos;s what&apos;s happening with your business today.
            </p>
          </div>

          {!statsLoading && stats && (
            <div className="flex items-center gap-5 shrink-0">
              <div className="text-center">
                <p className="text-2xl font-bold text-white tabular-nums">{stats.hotLeads ?? 0}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Hot leads</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white tabular-nums">{stats.conversionRate ?? 0}%</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Conversion</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Stat cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <div className="col-span-4 flex items-center justify-center py-10">
            <Spinner />
          </div>
        ) : (
          <>
            <StatCard
              title="Total Listings"
              value={stats?.totalListings ?? 0}
              change={`${stats?.listingsThisMonth ?? 0} this month`}
              changeType={stats?.listingsThisMonth ? "positive" : "neutral"}
              icon={Landmark}
              accent="violet"
            />
            <StatCard
              title="Active Leads"
              value={stats?.totalLeads ?? 0}
              change={`${stats?.hotLeads ?? 0} hot leads`}
              changeType={stats?.hotLeads ? "positive" : "neutral"}
              icon={Contact}
              accent="emerald"
            />
            <StatCard
              title="Conversion Rate"
              value={`${stats?.conversionRate ?? 0}%`}
              icon={TrendingUp}
              accent="amber"
            />
            <StatCard
              title="Active Listings"
              value={stats?.activeListings ?? 0}
              icon={Wand2}
              accent="sky"
            />
          </>
        )}
      </div>

      {/* ── Quick actions + Follow-ups + Funnel ──────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* Quick Actions — rich tiles */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 mb-3">
            Quick Actions
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {QUICK_ACTIONS.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className={`group flex flex-col gap-2.5 rounded-xl border border-slate-200/80 bg-white p-4 transition-all duration-150 hover:shadow-md ${a.border}`}
              >
                <div className={`w-fit rounded-lg p-2 ${a.color}`}>
                  <a.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
                    {a.label}
                  </p>
                  <p className="text-[11px] text-slate-400">{a.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Pending Follow-ups */}
        <Card>
          <CardHeader className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-warning-500" />
                <CardTitle className="text-[13px] font-semibold text-slate-700">
                  Pending Follow-ups
                </CardTitle>
                {pendingFollowUps.length > 0 && (
                  <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-warning-100 text-[10px] font-bold text-warning-700">
                    {pendingFollowUps.length}
                  </span>
                )}
              </div>
              <Link href="/leads" className="text-[11px] font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {pendingFollowUps.length === 0 ? (
              <p className="px-5 py-8 text-center text-[13px] text-slate-400">
                All caught up — no pending follow-ups
              </p>
            ) : (
              <div className="divide-y divide-slate-100/80">
                {pendingFollowUps.slice(0, 5).map((lead) => {
                  const isPast = new Date(lead.next_followup_at!) < new Date();
                  return (
                    <Link
                      key={lead.id}
                      href={`/leads/${lead.id}`}
                      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50/80"
                    >
                      <Avatar name={lead.name} size="sm" className="h-7 w-7 text-[10px] shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-slate-900">{lead.name}</p>
                        {lead.followup_notes && (
                          <p className="truncate text-[11px] text-slate-400">{lead.followup_notes}</p>
                        )}
                      </div>
                      <span className={`shrink-0 text-[11px] font-medium ${isPast ? "text-danger-600" : "text-slate-400"}`}>
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
          <CardHeader className="px-5 py-4 border-b border-slate-100">
            <CardTitle className="text-[13px] font-semibold text-slate-700">
              Sales Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            {funnelData.length === 0 ? (
              <p className="text-center text-[13px] text-slate-400 py-4">No pipeline data yet</p>
            ) : (
              <div className="space-y-3.5">
                {funnelData.map((stage) => (
                  <div key={stage.status}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[12px] font-medium text-slate-600">{stage.label}</span>
                      <span className="text-[11px] text-slate-400 tabular-nums">
                        {stage.count} · {stage.percentage}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${funnelColors[stage.status] ?? "bg-slate-400"}`}
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

      {/* ── Recent activity ───────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

        {/* Recent Leads */}
        <Card>
          <CardHeader className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[13px] font-semibold text-slate-700">
                Recent Leads
              </CardTitle>
              <Link href="/leads" className="text-[11px] font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {leadsLoading ? (
              <div className="flex items-center justify-center py-10">
                <Spinner />
              </div>
            ) : recentLeads.length === 0 ? (
              <p className="px-5 py-10 text-center text-[13px] text-slate-400">No leads yet</p>
            ) : (
              <div className="divide-y divide-slate-100/80">
                {recentLeads.map((lead) => {
                  const statusLabel = LEAD_STATUSES.find((s) => s.value === lead.status)?.label || lead.status;
                  return (
                    <Link
                      key={lead.id}
                      href={`/leads/${lead.id}`}
                      className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50/80"
                    >
                      <Avatar name={lead.name} size="sm" className="h-8 w-8 text-[11px] shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
                          {lead.name}
                        </p>
                        <p className="truncate text-[11px] text-slate-400">
                          {lead.preferred_location || lead.preferred_property_type || "—"}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <Badge variant={statusVariant[lead.status] || "default"} size="sm">
                          {statusLabel}
                        </Badge>
                        <p className="mt-1 text-[10px] text-slate-400 tabular-nums">
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
          <CardHeader className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[13px] font-semibold text-slate-700">
                Recent Listings
              </CardTitle>
              <Link href="/listings" className="text-[11px] font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {listingsLoading ? (
              <div className="flex items-center justify-center py-10">
                <Spinner />
              </div>
            ) : recentListings.length === 0 ? (
              <p className="px-5 py-10 text-center text-[13px] text-slate-400">No listings yet</p>
            ) : (
              <div className="divide-y divide-slate-100/80">
                {recentListings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/listings/${listing.id}`}
                    className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50/80"
                  >
                    {/* Property type icon tile */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-primary-50 transition-colors">
                      <Landmark className="h-4 w-4 text-slate-400 group-hover:text-primary-500 transition-colors" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
                        {listing.title}
                      </p>
                      <p className="truncate text-[11px] text-slate-400">
                        {[listing.locality, listing.city].filter(Boolean).join(", ") || "—"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[13px] font-bold text-slate-900 tabular-nums">
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
