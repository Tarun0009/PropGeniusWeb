"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useNotificationStore } from "@/stores/notification-store";
import { useAuthStore } from "@/stores/auth-store";

export interface CustomTemplate {
  id: string;
  organization_id: string;
  name: string;
  content: string;
  category: string;
  variables: string[];
  created_by: string;
  created_at: string;
}

const TEMPLATE_KEY = ["custom-templates"];

export function useCustomTemplates() {
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);

  return useQuery({
    queryKey: TEMPLATE_KEY,
    queryFn: async () => {
      if (!profile) return [];
      const { data, error } = await supabase
        .from("whatsapp_templates")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: false });

      if (error) {
        // Table might not exist yet — return empty array
        if (error.code === "42P01" || error.message?.includes("does not exist")) {
          return [];
        }
        throw error;
      }
      return data as CustomTemplate[];
    },
    enabled: !!profile,
  });
}

export function useCreateTemplate() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);
  const profile = useAuthStore((s) => s.profile);

  return useMutation({
    mutationFn: async (input: { name: string; content: string; category: string }) => {
      // Extract variables from content like {{name}}, {{property}}
      const varMatches = input.content.match(/\{\{(\w+)\}\}/g) || [];
      const variables = [...new Set(varMatches.map((v) => v.replace(/\{\{|\}\}/g, "")))];

      const { data, error } = await supabase
        .from("whatsapp_templates")
        .insert({
          organization_id: profile!.organization_id,
          name: input.name,
          content: input.content,
          category: input.category,
          variables,
          created_by: profile!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATE_KEY });
      addToast({ type: "success", title: "Template created" });
    },
    onError: (error) => {
      addToast({ type: "error", title: "Failed to create template", description: error.message });
    },
  });
}

export function useUpdateTemplate() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: async ({ id, ...input }: { id: string; name: string; content: string; category: string }) => {
      const varMatches = input.content.match(/\{\{(\w+)\}\}/g) || [];
      const variables = [...new Set(varMatches.map((v) => v.replace(/\{\{|\}\}/g, "")))];

      const { error } = await supabase
        .from("whatsapp_templates")
        .update({ name: input.name, content: input.content, category: input.category, variables })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATE_KEY });
      addToast({ type: "success", title: "Template updated" });
    },
    onError: (error) => {
      addToast({ type: "error", title: "Failed to update template", description: error.message });
    },
  });
}

export function useDeleteTemplate() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("whatsapp_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATE_KEY });
      addToast({ type: "success", title: "Template deleted" });
    },
    onError: (error) => {
      addToast({ type: "error", title: "Failed to delete template", description: error.message });
    },
  });
}
