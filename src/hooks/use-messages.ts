"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useNotificationStore } from "@/stores/notification-store";
import type { WhatsAppMessage, Conversation } from "@/types/message";
import type { Lead } from "@/types/lead";
import type { SendMessageFormData, SmartReplyRequest, SmartReplyResponse } from "@/lib/validations";

const MESSAGES_KEY = ["messages"];
const CONVERSATIONS_KEY = ["conversations"];

export function useConversations() {
  const supabase = createClient();

  return useQuery({
    queryKey: CONVERSATIONS_KEY,
    queryFn: async () => {
      const { data: messages, error } = await supabase
        .from("whatsapp_messages")
        .select("*, lead:leads(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group by lead_id, pick latest message per lead
      const conversationMap = new Map<string, Conversation>();

      for (const msg of messages as (WhatsAppMessage & { lead: Lead })[]) {
        if (!msg.lead_id || !msg.lead) continue;

        if (!conversationMap.has(msg.lead_id)) {
          conversationMap.set(msg.lead_id, {
            lead: msg.lead,
            lastMessage: msg,
            unreadCount: 0,
          });
        }

        if (msg.direction === "inbound" && msg.status !== "read") {
          const conv = conversationMap.get(msg.lead_id)!;
          conv.unreadCount++;
        }
      }

      return Array.from(conversationMap.values()).sort((a, b) => {
        const aTime = a.lastMessage?.created_at || "";
        const bTime = b.lastMessage?.created_at || "";
        return bTime.localeCompare(aTime);
      });
    },
    refetchInterval: 10000,
  });
}

export function useMessages(leadId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: [...MESSAGES_KEY, leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_messages")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as WhatsAppMessage[];
    },
    enabled: !!leadId,
    refetchInterval: 5000,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (data: SendMessageFormData): Promise<WhatsAppMessage> => {
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send message");
      }

      return response.json();
    },
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: [...MESSAGES_KEY, message.lead_id] });
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    },
    onError: (error) => {
      addToast({ type: "error", title: "Failed to send message", description: error.message });
    },
  });
}

export function useMarkAsRead() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId: string) => {
      const { error } = await supabase
        .from("whatsapp_messages")
        .update({ status: "read" })
        .eq("lead_id", leadId)
        .eq("direction", "inbound")
        .neq("status", "read");

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    },
  });
}

export function useSmartReply() {
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (data: SmartReplyRequest): Promise<SmartReplyResponse> => {
      const response = await fetch("/api/ai/smart-reply", {
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
