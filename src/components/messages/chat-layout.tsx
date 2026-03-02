"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConversationList } from "./conversation-list";
import { ChatWindow } from "./chat-window";
import { useConversations } from "@/hooks/use-messages";
import { useAuthStore } from "@/stores/auth-store";

function ChatLayout() {
  const searchParams = useSearchParams();
  const initialLeadId = searchParams.get("lead");
  const [activeLeadId, setActiveLeadId] = useState<string | null>(initialLeadId);
  const { data: conversations = [], isLoading } = useConversations();
  const profile = useAuthStore((s) => s.profile);

  // Update active lead from URL search params
  useEffect(() => {
    if (initialLeadId) {
      setActiveLeadId(initialLeadId);
    }
  }, [initialLeadId]);

  const activeLead = activeLeadId
    ? conversations.find((c) => c.lead.id === activeLeadId)?.lead
    : null;

  return (
    <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white" style={{ height: "calc(100vh - 200px)" }}>
      {/* Left Panel — Conversation List */}
      <div
        className={`w-80 shrink-0 border-r border-slate-200 ${
          activeLeadId ? "hidden lg:flex lg:flex-col" : "flex flex-col"
        }`}
      >
        <ConversationList
          conversations={conversations}
          activeLeadId={activeLeadId}
          onSelectConversation={setActiveLeadId}
          isLoading={isLoading}
        />
      </div>

      {/* Right Panel — Chat Window */}
      <div
        className={`flex-1 ${
          activeLeadId ? "flex flex-col" : "hidden lg:flex lg:flex-col"
        }`}
      >
        {activeLead ? (
          <>
            {/* Mobile back button */}
            <div className="border-b border-slate-200 p-2 lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveLeadId(null)}
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
            </div>
            <ChatWindow
              lead={activeLead}
              orgName={profile?.organization?.name}
            />
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <MessageSquare className="h-12 w-12 text-slate-200" />
            <p className="mt-3 text-sm font-medium text-slate-500">
              Select a conversation
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Choose a lead from the list to start messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export { ChatLayout };
