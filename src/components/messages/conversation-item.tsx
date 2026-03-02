"use client";

import { cn } from "@/lib/utils";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Conversation } from "@/types/message";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  const { lead, lastMessage, unreadCount } = conversation;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors hover:bg-slate-50",
        isActive && "border-l-2 border-l-primary-500 bg-primary-50/50 hover:bg-primary-50/50"
      )}
    >
      {/* Avatar */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
        {getInitials(lead.name)}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="truncate text-sm font-medium text-slate-900">{lead.name}</p>
          {lastMessage && (
            <span className="shrink-0 text-xs text-slate-400">
              {formatRelativeTime(lastMessage.created_at)}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center justify-between">
          <p className="truncate text-xs text-slate-500">
            {lastMessage
              ? `${lastMessage.direction === "outbound" ? "You: " : ""}${lastMessage.content || "Media"}`
              : "No messages yet"}
          </p>
          {unreadCount > 0 && (
            <Badge variant="primary" size="sm" className="ml-2 shrink-0">
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}

export { ConversationItem };
