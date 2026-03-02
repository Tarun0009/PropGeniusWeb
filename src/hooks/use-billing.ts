"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useNotificationStore } from "@/stores/notification-store";
import type { Subscription } from "@/types/subscription";
import type { CheckoutFormData, CancelSubscriptionData, VerifyPaymentData } from "@/lib/validations";

const BILLING_KEY = ["billing"];

export function useSubscription() {
  const supabase = createClient();

  return useQuery({
    queryKey: [...BILLING_KEY, "subscription"],
    queryFn: async (): Promise<Subscription | null> => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.user.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Subscription | null;
    },
  });
}

export function useCreateCheckout() {
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create checkout");
      }

      return response.json() as Promise<{
        subscription_id: string;
        key_id: string;
        amount: number;
        currency: string;
        name: string;
        description: string;
      }>;
    },
    onError: (error) => {
      addToast({ type: "error", title: "Checkout failed", description: error.message });
    },
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (data: VerifyPaymentData) => {
      const response = await fetch("/api/billing/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Payment verification failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLING_KEY });
      addToast({ type: "success", title: "Subscription activated!" });
    },
    onError: (error) => {
      addToast({ type: "error", title: "Payment verification failed", description: error.message });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (data: CancelSubscriptionData) => {
      const response = await fetch("/api/billing/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to cancel subscription");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLING_KEY });
      addToast({ type: "success", title: "Subscription cancelled" });
    },
    onError: (error) => {
      addToast({ type: "error", title: "Cancellation failed", description: error.message });
    },
  });
}

export function usePaymentHistory() {
  const supabase = createClient();

  return useQuery({
    queryKey: [...BILLING_KEY, "history"],
    queryFn: async (): Promise<Subscription[]> => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.user.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Subscription[];
    },
  });
}
