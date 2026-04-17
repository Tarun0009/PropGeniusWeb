"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ConversationItem } from "./conversation-item";
import type { Conversation } from "@/types/message";

interface ConversationListProps {
  conversations: Conversation[];
  activeLeadId: string | null;
  onSelectConversation: (leadId: string) => void;
  isLoading: boolean;
}

function ConversationList({
  conversations,
  activeLeadId,
  onSelectConversation,
  isLoading,
}: ConversationListProps) {
  const [search, setSearch] = useState("");

  const filtered = search
    ? conversations.filter((c) =>
        c.lead.name.toLowerCase().includes(search.toLowerCase())
      )
    : conversations;

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="border-b border-slate-200 p-3">
        <Input
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm text-slate-400">
              {search ? "No matching conversations" : "No conversations yet"}
            </p>
          </div>
        ) : (
          filtered.map((conversation) => (
            <ConversationItem
              key={conversation.lead.id}
              conversation={conversation}
              isActive={conversation.lead.id === activeLeadId}
              onClick={() => onSelectConversation(conversation.lead.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export { ConversationList };
