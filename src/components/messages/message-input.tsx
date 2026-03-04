"use client";

import { useState } from "react";
import { Send, FileText, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { TemplateSelector } from "./template-selector";
import { useSendMessage, useSmartReply } from "@/hooks/use-messages";
import type { Lead } from "@/types/lead";
import type { WhatsAppMessage } from "@/types/message";
import { formatPrice } from "@/lib/utils";

interface MessageInputProps {
  leadId: string;
  leadName: string;
  orgName?: string;
  lead?: Lead;
  recentMessages?: WhatsAppMessage[];
}

function MessageInput({ leadId, leadName, orgName, lead, recentMessages }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const sendMutation = useSendMessage();
  const smartReplyMutation = useSmartReply();

  const handleSend = async () => {
    const text = content.trim();
    if (!text) return;

    await sendMutation.mutateAsync({
      lead_id: leadId,
      content: text,
      message_type: "text",
    });

    setContent("");
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTemplateSelect = (template: { name: string; content: string }) => {
    setContent(template.content);
  };

  const handleSmartReply = async () => {
    const budgetParts = [];
    if (lead?.budget_min) budgetParts.push(formatPrice(lead.budget_min));
    if (lead?.budget_max) budgetParts.push(formatPrice(lead.budget_max));
    const budgetStr = budgetParts.length > 0 ? budgetParts.join(" – ") : undefined;

    const prefParts = [];
    if (lead?.preferred_location) prefParts.push(lead.preferred_location);
    if (lead?.preferred_property_type) prefParts.push(lead.preferred_property_type);
    if (lead?.interested_in) prefParts.push(lead.interested_in);

    const recent = (recentMessages || []).slice(-6).map((m) => ({
      direction: m.direction,
      content: m.content || "",
    }));

    const result = await smartReplyMutation.mutateAsync({
      lead_name: leadName,
      lead_status: lead?.status || "new",
      lead_budget: budgetStr,
      lead_preferences: prefParts.length > 0 ? prefParts.join(", ") : undefined,
      recent_messages: recent,
    });

    setSuggestions(result.suggestions);
  };

  return (
    <>
      {/* AI Suggestion Chips */}
      {suggestions.length > 0 && (
        <div className="border-t border-slate-200 bg-blue-50/50 px-4 py-2">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs font-medium text-primary-600">
              <Sparkles className="h-3 w-3" /> AI Suggestions
            </span>
            <button
              onClick={() => setSuggestions([])}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  setContent(s);
                  setSuggestions([]);
                }}
                className="rounded-md border border-primary-200 bg-white px-3 py-1.5 text-left text-xs text-slate-700 transition-colors hover:border-primary-400 hover:bg-primary-50"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-end gap-2 border-t border-slate-200 bg-white px-4 py-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowTemplates(true)}
          title="Use template"
        >
          <FileText className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleSmartReply}
          disabled={smartReplyMutation.isPending}
          title="AI suggest reply"
        >
          {smartReplyMutation.isPending ? (
            <Spinner size="sm" />
          ) : (
            <Sparkles className="h-4 w-4 text-primary-500" />
          )}
        </Button>

        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
          />
        </div>

        <Button
          size="sm"
          onClick={handleSend}
          disabled={!content.trim() || sendMutation.isPending}
          isLoading={sendMutation.isPending}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <TemplateSelector
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelect={handleTemplateSelect}
        leadName={leadName}
        orgName={orgName}
      />
    </>
  );
}

export { MessageInput };
