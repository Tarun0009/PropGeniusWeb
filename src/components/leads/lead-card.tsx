"use client";

import { Phone, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import { LeadScoreBadge } from "./lead-score-badge";
import type { Lead } from "@/types/lead";

interface LeadCardProps {
  lead: Lead;
  onClick?: () => void;
  isDragging?: boolean;
}

function getScoreBorder(score: number) {
  if (score >= 70) return "border-l-success-500";
  if (score >= 40) return "border-l-warning-500";
  return "border-l-danger-400";
}

function LeadCard({ lead, onClick, isDragging }: LeadCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-lg border border-slate-200 border-l-4 bg-white p-3 shadow-sm transition-shadow hover:shadow-md",
        getScoreBorder(lead.ai_score),
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">{lead.name}</p>
          {lead.phone && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
              <Phone className="h-3 w-3" />
              {lead.phone}
            </p>
          )}
        </div>
        {lead.ai_score > 0 && <LeadScoreBadge score={lead.ai_score} size="sm" />}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs capitalize text-slate-600">
          {lead.source}
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <Clock className="h-3 w-3" />
          {formatRelativeTime(lead.created_at)}
        </span>
      </div>
    </div>
  );
}

export { LeadCard };
