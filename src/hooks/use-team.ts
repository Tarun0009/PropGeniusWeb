"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useNotificationStore } from "@/stores/notification-store";
import { useAuthStore } from "@/stores/auth-store";
import type { Profile } from "@/types/user";

const TEAM_KEY = ["team"];
const INVITES_KEY = ["team-invites"];

export function useTeamMembers() {
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);

  return useQuery({
    queryKey: TEAM_KEY,
    queryFn: async () => {
      if (!profile) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, role, is_active, avatar_url, created_at")
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Pick<Profile, "id" | "full_name" | "email" | "phone" | "role" | "is_active" | "avatar_url" | "created_at">[];
    },
    enabled: !!profile,
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
      const res = await fetch(`/api/team/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "role", role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update role");
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: TEAM_KEY });
      addToast({ type: "success", title: data.message || "Role updated" });
    },
    onError: (error) => {
      addToast({ type: "error", title: "Failed to update role", description: error.message });
    },
  });
}

export function useToggleMemberStatus() {
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: async ({ memberId, isActive }: { memberId: string; isActive: boolean }) => {
      const res = await fetch(`/api/team/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status", is_active: isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: TEAM_KEY });
      addToast({ type: "success", title: data.message || "Status updated" });
    },
    onError: (error) => {
      addToast({ type: "error", title: "Failed to update member", description: error.message });
    },
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send invite");
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TEAM_KEY });
      queryClient.invalidateQueries({ queryKey: INVITES_KEY });
      addToast({
        type: "success",
        title: "Invite sent",
        description: `${variables.email} will receive an invitation email.`,
      });
    },
    onError: (error) => {
      addToast({ type: "error", title: "Failed to invite", description: error.message });
    },
  });
}

export interface PendingInvite {
  id: string;
  email: string;
  role: string;
  invited_by_name: string;
  invited_at: string;
}

export function usePendingInvites() {
  const profile = useAuthStore((s) => s.profile);
  const { canManage } = useTeamPermissions();

  return useQuery({
    queryKey: INVITES_KEY,
    queryFn: async (): Promise<PendingInvite[]> => {
      const res = await fetch("/api/team/invites");
      if (!res.ok) return [];
      const data = await res.json();
      return data.invites || [];
    },
    enabled: !!profile && canManage,
    staleTime: 30_000,
  });
}

export function useRevokeInvite() {
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/team/invites?userId=${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to revoke invite");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVITES_KEY });
      addToast({ type: "success", title: "Invite revoked" });
    },
    onError: (error) => {
      addToast({ type: "error", title: "Failed to revoke invite", description: error.message });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: async ({
      memberId,
      reassignLeadsTo,
    }: {
      memberId: string;
      reassignLeadsTo?: string;
    }) => {
      const res = await fetch("/api/team/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, reassignLeadsTo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove member");
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: TEAM_KEY });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      addToast({ type: "success", title: data.message || "Member removed" });
    },
    onError: (error) => {
      addToast({ type: "error", title: "Failed to remove member", description: error.message });
    },
  });
}

export function useTransferOwnership() {
  const queryClient = useQueryClient();
  const setProfile = useAuthStore((s) => s.setProfile);
  const profile = useAuthStore((s) => s.profile);
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (newOwnerId: string) => {
      const res = await fetch("/api/team/transfer-ownership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newOwnerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to transfer ownership");
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: TEAM_KEY });
      // Re-fetch full profile from DB so all permission checks use the new role immediately
      if (profile) {
        const supabase = createClient();
        const { data: fresh } = await supabase
          .from("profiles")
          .select("*, organization:organizations(*)")
          .eq("id", profile.id)
          .single();
        setProfile(fresh ? (fresh as typeof profile) : { ...profile, role: "admin" });
      }
      addToast({ type: "success", title: data.message || "Ownership transferred" });
    },
    onError: (error) => {
      addToast({ type: "error", title: "Failed to transfer ownership", description: error.message });
    },
  });
}

// Helper hook to check current user's team permissions
export function useTeamPermissions() {
  const profile = useAuthStore((s) => s.profile);
  const role = profile?.role || "agent";
  return {
    isOwner: role === "owner",
    isAdmin: role === "admin",
    isAgent: role === "agent",
    canManage: role === "owner" || role === "admin",
    canManageBilling: role === "owner",
  };
}
