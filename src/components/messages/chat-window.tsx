"use client";

import { useEffect, useRef } from "react";
import { Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";
import { useMessages, useMarkAsRead } from "@/hooks/use-messages";
import { LEAD_STATUSES } from "@/lib/constants";
import type { Lead } from "@/types/lead";

const statusVariant: Record<string, "primary" | "purple" | "warning" | "cyan" | "orange" | "success" | "danger"> = {
  new: "primary",
  contacted: "purple",
  interested: "warning",
  site_visit: "cyan",
  negotiation: "orange",
  converted: "success",
  lost: "danger",
};

interface ChatWindowProps {
  lead: Lead;
  orgName?: string;
}

function ChatWindow({ lead, orgName }: ChatWindowProps) {
  const { data: messages = [], isLoading } = useMessages(lead.id);
  const markAsRead = useMarkAsRead();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mark messages as read when opening conversation
  useEffect(() => {
    markAsRead.mutate(lead.id);
  }, [lead.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const statusLabel = LEAD_STATUSES.find((s) => s.value === lead.status)?.label || lead.status;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{lead.name}</h3>
          <div className="mt-0.5 flex items-center gap-2">
            {lead.whatsapp_number && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Phone className="h-3 w-3" />
                {lead.whatsapp_number}
              </span>
            )}
            <Badge variant={statusVariant[lead.status] || "default"} size="sm">
              {statusLabel}
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-sm text-slate-400">
              No messages yet. Start a conversation with {lead.name}.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <MessageInput leadId={lead.id} leadName={lead.name} orgName={orgName} />
    </div>
  );
}

export { ChatWindow };
