"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { DashboardStats, ChartDataPoint, LeadFunnelData } from "@/types/analytics";
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
