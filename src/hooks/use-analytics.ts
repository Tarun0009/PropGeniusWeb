"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { DashboardStats, ChartDataPoint, LeadFunnelData, PipelineValue, SourceROI, ListingPerformance } from "@/types/analytics";
import { LEAD_STATUSES, LEAD_SOURCES, PROPERTY_TYPES } from "@/lib/constants";

const ANALYTICS_KEY = ["analytics"];

export function useDashboardStats() {
  const supabase = createClient();

  return useQuery({
    queryKey: [...ANALYTICS_KEY, "stats"],
    queryFn: async (): Promise<DashboardStats> => {
      const [listings, leads] = await Promise.all([
        supabase.from("listings").select("id, status, created_at"),
        supabase.from("leads").select("id, status, ai_score, created_at"),
      ]);

      if (listings.error) throw listings.error;
      if (leads.error) throw leads.error;

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const totalListings = listings.data.length;
      const activeListings = listings.data.filter((l) => l.status === "active").length;
      const totalLeads = leads.data.length;
      const hotLeads = leads.data.filter((l) => l.ai_score > 70).length;
      const convertedLeads = leads.data.filter((l) => l.status === "converted").length;
      const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100 * 10) / 10 : 0;
      const listingsThisMonth = listings.data.filter((l) => l.created_at >= monthStart).length;

      return {
        totalListings,
        activeListings,
        totalLeads,
        hotLeads,
        conversionRate,
        listingsThisMonth,
      };
    },
  });
}

export function useLeadsByStatus() {
  const supabase = createClient();

  return useQuery({
    queryKey: [...ANALYTICS_KEY, "leads-by-status"],
    queryFn: async (): Promise<LeadFunnelData[]> => {
      const { data, error } = await supabase.from("leads").select("status");
      if (error) throw error;

      const total = data.length;
      return LEAD_STATUSES.map((s) => {
        const count = data.filter((l) => l.status === s.value).length;
        return {
          status: s.label,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        };
      });
    },
  });
}

export function useLeadsBySource() {
  const supabase = createClient();

  return useQuery({
    queryKey: [...ANALYTICS_KEY, "leads-by-source"],
    queryFn: async (): Promise<ChartDataPoint[]> => {
      const { data, error } = await supabase.from("leads").select("source");
      if (error) throw error;

      return LEAD_SOURCES.map((s) => ({
        name: s.label,
        value: data.filter((l) => l.source === s.value).length,
      })).filter((d) => d.value > 0);
    },
  });
}

export function useListingsByType() {
  const supabase = createClient();

  return useQuery({
    queryKey: [...ANALYTICS_KEY, "listings-by-type"],
    queryFn: async (): Promise<ChartDataPoint[]> => {
      const { data, error } = await supabase.from("listings").select("property_type");
      if (error) throw error;

      return PROPERTY_TYPES.map((t) => ({
        name: t.label,
        value: data.filter((l) => l.property_type === t.value).length,
      })).filter((d) => d.value > 0);
    },
  });
}

export function useLeadsOverTime(period: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: [...ANALYTICS_KEY, "leads-over-time", period],
    queryFn: async (): Promise<ChartDataPoint[]> => {
      const days = parseInt(period) || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from("leads")
        .select("created_at")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Group by date
      const grouped = new Map<string, number>();
      for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - days + i + 1);
        const key = d.toISOString().slice(0, 10);
        grouped.set(key, 0);
      }

      for (const lead of data) {
        const key = lead.created_at.slice(0, 10);
        if (grouped.has(key)) {
          grouped.set(key, grouped.get(key)! + 1);
        }
      }

      return Array.from(grouped.entries()).map(([date, count]) => ({
        name: new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        value: count,
      }));
    },
  });
}

export function useRecentLeads(limit = 5) {
  const supabase = createClient();

  return useQuery({
    queryKey: [...ANALYTICS_KEY, "recent-leads", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("id, name, status, preferred_location, preferred_property_type, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
}

export function useRecentListings(limit = 5) {
  const supabase = createClient();

  return useQuery({
    queryKey: [...ANALYTICS_KEY, "recent-listings", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("id, title, city, locality, price, status, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
}

export function usePendingFollowUps(limit = 5) {
  const supabase = createClient();

  return useQuery({
    queryKey: [...ANALYTICS_KEY, "pending-followups", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("id, name, phone, status, next_followup_at, followup_notes")
        .not("next_followup_at", "is", null)
        .lte("next_followup_at", new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString())
        .order("next_followup_at", { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
}

export function useSalesFunnel() {
  const supabase = createClient();

  return useQuery({
    queryKey: [...ANALYTICS_KEY, "sales-funnel"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("status");
      if (error) throw error;

      const total = data.length;
      const stages = [
        { status: "new", label: "New", color: "bg-blue-500" },
        { status: "contacted", label: "Contacted", color: "bg-purple-500" },
        { status: "interested", label: "Interested", color: "bg-yellow-500" },
        { status: "site_visit", label: "Site Visit", color: "bg-cyan-500" },
        { status: "negotiation", label: "Negotiation", color: "bg-orange-500" },
        { status: "converted", label: "Converted", color: "bg-green-500" },
      ];

      return stages.map((s) => {
        const count = data.filter((l) => l.status === s.status).length;
        return {
          ...s,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        };
      });
    },
  });
}

export function usePipelineValue() {
  const supabase = createClient();

  return useQuery({
    queryKey: [...ANALYTICS_KEY, "pipeline-value"],
    queryFn: async (): Promise<PipelineValue[]> => {
      const { data, error } = await supabase
        .from("leads")
        .select("status, budget_max");
      if (error) throw error;

      const stages = LEAD_STATUSES.filter((s) => s.value !== "lost");
      return stages.map((s) => {
        const leadsInStage = data.filter((l) => l.status === s.value);
        const totalValue = leadsInStage.reduce((sum, l) => sum + (l.budget_max || 0), 0);
        return {
          status: s.value,
          label: s.label,
          count: leadsInStage.length,
          totalValue,
        };
      });
    },
  });
}

export function useSourceROI() {
  const supabase = createClient();

  return useQuery({
    queryKey: [...ANALYTICS_KEY, "source-roi"],
    queryFn: async (): Promise<SourceROI[]> => {
      const { data, error } = await supabase
        .from("leads")
        .select("source, status");
      if (error) throw error;

      return LEAD_SOURCES.map((s) => {
        const sourceLeads = data.filter((l) => l.source === s.value);
        const converted = sourceLeads.filter((l) => l.status === "converted").length;
        return {
          source: s.label,
          totalLeads: sourceLeads.length,
          convertedLeads: converted,
          conversionRate: sourceLeads.length > 0 ? Math.round((converted / sourceLeads.length) * 100) : 0,
        };
      }).filter((s) => s.totalLeads > 0);
    },
  });
}

export function useListingPerformance() {
  const supabase = createClient();

  return useQuery({
    queryKey: [...ANALYTICS_KEY, "listing-performance"],
    queryFn: async (): Promise<ListingPerformance> => {
      const { data, error } = await supabase
        .from("listings")
        .select("views_count, inquiries_count, created_at, status");
      if (error) throw error;

      const activeListings = data.filter((l) => l.status === "active");
      const count = activeListings.length || 1;
      const totalViews = data.reduce((sum, l) => sum + (l.views_count || 0), 0);
      const totalInquiries = data.reduce((sum, l) => sum + (l.inquiries_count || 0), 0);

      const daysOnMarket = activeListings.map((l) =>
        Math.floor((Date.now() - new Date(l.created_at).getTime()) / (1000 * 60 * 60 * 24))
      );
      const avgDays = daysOnMarket.length > 0 ? Math.round(daysOnMarket.reduce((a, b) => a + b, 0) / daysOnMarket.length) : 0;

      return {
        avgDaysOnMarket: avgDays,
        avgViewsPerListing: Math.round(totalViews / count),
        avgInquiriesPerListing: Math.round((totalInquiries / count) * 10) / 10,
        totalViews,
        totalInquiries,
      };
    },
  });
}
