"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

export interface TeamMemberStats {
  listingsCreated: number;
  leadsAssigned: number;
}

export function useTeamMemberStats() {
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);

  return useQuery({
    queryKey: ["team-stats", profile?.organization_id],
    queryFn: async (): Promise<Map<string, TeamMemberStats>> => {
      if (!profile) return new Map();

      const [listingsRes, leadsRes] = await Promise.all([
        supabase
          .from("listings")
          .select("created_by"),
        supabase
          .from("leads")
          .select("assigned_to"),
      ]);

      if (listingsRes.error) throw listingsRes.error;
      if (leadsRes.error) throw leadsRes.error;

      const statsMap = new Map<string, TeamMemberStats>();

      for (const listing of listingsRes.data) {
        const id = listing.created_by;
        if (!id) continue;
        if (!statsMap.has(id)) {
          statsMap.set(id, { listingsCreated: 0, leadsAssigned: 0 });
        }
        statsMap.get(id)!.listingsCreated++;
      }

      for (const lead of leadsRes.data) {
        const id = lead.assigned_to;
        if (!id) continue;
        if (!statsMap.has(id)) {
          statsMap.set(id, { listingsCreated: 0, leadsAssigned: 0 });
        }
        statsMap.get(id)!.leadsAssigned++;
      }

      return statsMap;
    },
    enabled: !!profile,
  });
}
