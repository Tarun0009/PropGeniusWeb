"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useNotificationStore } from "@/stores/notification-store";
import type { Lead, LeadActivity } from "@/types/lead";
import type {
  LeadFormData, LeadFilters, ScoreLeadRequest, AILeadScore, LeadActivityFormData,
  MatchListingsRequest, MatchListingsResponse, FollowUpRequest, FollowUpResponse,
} from "@/lib/validations";

const LEADS_KEY = ["leads"];
const ACTIVITIES_KEY = ["lead-activities"];

export function useLeads(filters?: LeadFilters) {
  const supabase = createClient();

  return useQuery({
    queryKey: [...LEADS_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.status) query = query.eq("status", filters.status);
      if (filters?.source) query = query.eq("source", filters.source);
      if (filters?.assigned_to) query = query.eq("assigned_to", filters.assigned_to);
      if (filters?.search) query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);

      const { data, error } = await query;
      if (error) throw error;
      return data as Lead[];
    },
  });
}

export function useLead(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: [...LEADS_KEY, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Lead;
    },
    enabled: !!id,
  });
}

export function useCreateLead() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (data: LeadFormData) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.user.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      const { data: lead, error } = await supabase
        .from("leads")
        .insert({
          ...data,
          organization_id: profile.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return lead as Lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_KEY });
      addToast({ type: "success", title: "Lead added successfully" });
    },
    onError: (error) => {
      addToast({ type: "error", title: "Failed to add lead", description: error.message });
    },
  });
}

export function useUpdateLead() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<LeadFormData> }) => {
      const { data: lead, error } = await supabase
        .from("leads")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return lead as Lead;
    },
    onSuccess: (lead) => {
      queryClient.invalidateQueries({ queryKey: LEADS_KEY });
      queryClient.setQueryData([...LEADS_KEY, lead.id], lead);
      addToast({ type: "success", title: "Lead updated" });
    },
    onError: (error) => {
      addToast({ type: "error", title: "Failed to update lead", description: error.message });
    },
  });
}

export function useUpdateLeadStatus() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data: lead, error } = await supabase
        .from("leads")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return lead as Lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_KEY });
    },
  });
}

export function useDeleteLead() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_KEY });
      addToast({ type: "success", title: "Lead deleted" });
    },
    onError: (error) => {
      addToast({ type: "error", title: "Failed to delete lead", description: error.message });
    },
  });
}

export function useScoreLead() {
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (data: ScoreLeadRequest): Promise<AILeadScore> => {
      const response = await fetch("/api/ai/score-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to score lead");
      }

      return response.json();
    },
    onError: (error) => {
      addToast({ type: "error", title: "AI scoring failed", description: error.message });
    },
  });
}

export function useLeadActivities(leadId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: [...ACTIVITIES_KEY, leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_activities")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as LeadActivity[];
    },
    enabled: !!leadId,
  });
}

export function useCreateActivity() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LeadActivityFormData) => {
      const { data: user } = await supabase.auth.getUser();

      const { data: activity, error } = await supabase
        .from("lead_activities")
        .insert({
          ...data,
          performed_by: user.user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return activity as LeadActivity;
    },
    onSuccess: (activity) => {
      queryClient.invalidateQueries({ queryKey: [...ACTIVITIES_KEY, activity.lead_id] });
    },
  });
}

export function useImportLeads() {
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (csv: string) => {
      const response = await fetch("/api/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Import failed");
      }

      return response.json() as Promise<{ imported: number; total: number }>;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: LEADS_KEY });
      addToast({ type: "success", title: `Imported ${result.imported} of ${result.total} leads` });
    },
    onError: (error) => {
      addToast({ type: "error", title: "Import failed", description: error.message });
    },
  });
}

export function useMatchListings() {
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (data: MatchListingsRequest): Promise<MatchListingsResponse> => {
      const response = await fetch("/api/ai/match-listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to match listings");
      }

      return response.json();
    },
    onError: (error) => {
      addToast({ type: "error", title: "AI matching failed", description: error.message });
    },
  });
}

export function useFollowUpSuggestions() {
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (data: FollowUpRequest): Promise<FollowUpResponse> => {
      const response = await fetch("/api/ai/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate suggestions");
      }

      return response.json();
    },
    onError: (error) => {
      addToast({ type: "error", title: "AI suggestion failed", description: error.message });
    },
  });
}
