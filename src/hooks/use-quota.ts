"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { PLAN_LIMITS } from "@/lib/constants";
import type { Plan } from "@/types/user";

interface QuotaInfo {
  listings: { current: number; max: number; canCreate: boolean };
  leads: { current: number; max: number; canCreate: boolean };
  agents: { current: number; max: number; canAdd: boolean };
  plan: Plan;
}

export function useQuota() {
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);
  const plan = (profile?.organization?.plan || "free") as Plan;

  return useQuery({
    queryKey: ["quota", profile?.organization_id],
    queryFn: async (): Promise<QuotaInfo> => {
      if (!profile) {
        return {
          listings: { current: 0, max: 5, canCreate: true },
          leads: { current: 0, max: 50, canCreate: true },
          agents: { current: 0, max: 1, canAdd: true },
          plan,
        };
      }

      const limits = PLAN_LIMITS[plan];

      const [listingsRes, leadsRes, agentsRes] = await Promise.all([
        supabase.from("listings").select("id", { count: "exact", head: true }).eq("organization_id", profile.organization_id),
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("organization_id", profile.organization_id),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("organization_id", profile.organization_id).eq("is_active", true),
      ]);

      const listingCount = listingsRes.count ?? 0;
      const leadCount = leadsRes.count ?? 0;
      const agentCount = agentsRes.count ?? 0;

      return {
        listings: {
          current: listingCount,
          max: limits.maxListings,
          canCreate: limits.maxListings === -1 || listingCount < limits.maxListings,
        },
        leads: {
          current: leadCount,
          max: limits.maxLeads,
          canCreate: limits.maxLeads === -1 || leadCount < limits.maxLeads,
        },
        agents: {
          current: agentCount,
          max: limits.maxAgents,
          canAdd: limits.maxAgents === -1 || agentCount < limits.maxAgents,
        },
        plan,
      };
    },
    enabled: !!profile,
  });
}
