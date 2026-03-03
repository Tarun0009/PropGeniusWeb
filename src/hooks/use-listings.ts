"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useNotificationStore } from "@/stores/notification-store";
import type { Listing } from "@/types/listing";
import type { ListingFilters, ListingFormData, AIListingContent, GenerateListingRequest, OptimizeListingRequest, OptimizeListingResponse } from "@/lib/validations";

const LISTINGS_KEY = ["listings"];

export function useListings(filters?: ListingFilters) {
  const supabase = createClient();

  return useQuery({
    queryKey: [...LISTINGS_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.status) query = query.eq("status", filters.status);
      if (filters?.property_type) query = query.eq("property_type", filters.property_type);
      if (filters?.transaction_type) query = query.eq("transaction_type", filters.transaction_type);
      if (filters?.city) query = query.ilike("city", `%${filters.city}%`);
      if (filters?.search) query = query.or(`title.ilike.%${filters.search}%,city.ilike.%${filters.search}%`);

      const { data, error } = await query;
      if (error) throw error;
      return data as Listing[];
    },
  });
}

export function useListing(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: [...LISTINGS_KEY, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Listing;
    },
    enabled: !!id,
  });
}

export function useCreateListing() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (data: ListingFormData) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.user.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      const { data: listing, error } = await supabase
        .from("listings")
        .insert({
          ...data,
          organization_id: profile.organization_id,
          created_by: user.user.id,
          status: "draft",
        })
        .select()
        .single();

      if (error) throw error;
      return listing as Listing;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LISTINGS_KEY });
      addToast({ type: "success", title: "Listing created successfully" });
    },
    onError: (error) => {
      addToast({ type: "error", title: "Failed to create listing", description: error.message });
    },
  });
}

export function useUpdateListing() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ListingFormData> }) => {
      const { data: listing, error } = await supabase
        .from("listings")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return listing as Listing;
    },
    onSuccess: (listing) => {
      queryClient.invalidateQueries({ queryKey: LISTINGS_KEY });
      queryClient.setQueryData([...LISTINGS_KEY, listing.id], listing);
      addToast({ type: "success", title: "Listing updated successfully" });
    },
    onError: (error) => {
      addToast({ type: "error", title: "Failed to update listing", description: error.message });
    },
  });
}

export function useDeleteListing() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("listings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LISTINGS_KEY });
      addToast({ type: "success", title: "Listing deleted" });
    },
    onError: (error) => {
      addToast({ type: "error", title: "Failed to delete listing", description: error.message });
    },
  });
}

export function useGenerateAIContent() {
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (data: GenerateListingRequest): Promise<AIListingContent> => {
      const response = await fetch("/api/ai/generate-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate content");
      }

      return response.json();
    },
    onError: (error) => {
      addToast({ type: "error", title: "AI generation failed", description: error.message });
    },
  });
}

export function useOptimizeListing() {
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (data: OptimizeListingRequest): Promise<OptimizeListingResponse> => {
      const response = await fetch("/api/ai/optimize-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to optimize listing");
      }

      return response.json();
    },
    onError: (error) => {
      addToast({ type: "error", title: "AI optimization failed", description: error.message });
    },
  });
}
