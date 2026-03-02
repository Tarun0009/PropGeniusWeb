"use client";

import { useState } from "react";
import { Send, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TemplateSelector } from "./template-selector";
import { useSendMessage } from "@/hooks/use-messages";

interface MessageInputProps {
  leadId: string;
  leadName: string;
  orgName?: string;
}

function MessageInput({ leadId, leadName, orgName }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const sendMutation = useSendMessage();

  const handleSend = async () => {
    const text = content.trim();
    if (!text) return;

    await sendMutation.mutateAsync({
      lead_id: leadId,
      content: text,
      message_type: "text",
    });

    setContent("");
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

  return (
    <>
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
