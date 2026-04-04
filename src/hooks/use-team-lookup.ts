"use client";

import { useMemo } from "react";
import { useTeamMembers } from "@/hooks/use-team";

export type MemberLookup = Map<string, { name: string; avatar_url: string | null }>;

export function useTeamMemberLookup(): MemberLookup {
  const { data: members = [] } = useTeamMembers();

  return useMemo(() => {
    const map: MemberLookup = new Map();
    for (const m of members) {
      map.set(m.id, { name: m.full_name, avatar_url: m.avatar_url });
    }
    return map;
  }, [members]);
}
