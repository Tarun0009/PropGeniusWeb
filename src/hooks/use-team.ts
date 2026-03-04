"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useNotificationStore } from "@/stores/notification-store";
import { useAuthStore } from "@/stores/auth-store";
import type { Profile } from "@/types/user";

const TEAM_KEY = ["team"];

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
  const supabase = createClient();
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ role, updated_at: new Date().toISOString() })
        .eq("id", memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_KEY });
      addToast({ type: "success", title: "Role updated" });
    },
    onError: (error) => {
      addToast({ type: "error", title: "Failed to update role", description: error.message });
    },
  });
}

export function useToggleMemberStatus() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: async ({ memberId, isActive }: { memberId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq("id", memberId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TEAM_KEY });
      addToast({
        type: "success",
        title: variables.isActive ? "Member activated" : "Member deactivated",
      });
    },
    onError: (error) => {
      addToast({ type: "error", title: "Failed to update member", description: error.message });
    },
  });
}

export function useInviteMember() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);
  const profile = useAuthStore((s) => s.profile);

  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      // Check if a profile with this email already exists in the org
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .eq("organization_id", profile!.organization_id)
        .single();

      if (existing) throw new Error("A team member with this email already exists");

      // For now, we create an invite record. In production, this would send an email.
      // Since Supabase auth handles user creation, the flow is:
      // 1. User signs up with this email
      // 2. They get associated with the org via middleware/invite code
      // For the MVP, we'll show a toast with the invite info
      return { email, role };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: TEAM_KEY });
      addToast({
        type: "success",
        title: "Invite ready",
        description: `Share the signup link with ${result.email}. They'll join as ${result.role}.`,
      });
    },
    onError: (error) => {
      addToast({ type: "error", title: "Failed to invite", description: error.message });
    },
  });
}
