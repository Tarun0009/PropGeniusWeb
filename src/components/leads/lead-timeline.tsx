"use client";

import {
  Phone,
  Mail,
  MessageSquare,
  MapPin,
  FileText,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import type { LeadActivity, ActivityType } from "@/types/lead";

const activityConfig: Record<ActivityType, { icon: React.ElementType; color: string }> = {
  call: { icon: Phone, color: "bg-blue-100 text-blue-600" },
  email: { icon: Mail, color: "bg-purple-100 text-purple-600" },
  whatsapp: { icon: MessageSquare, color: "bg-green-100 text-green-600" },
  site_visit: { icon: MapPin, color: "bg-orange-100 text-orange-600" },
  note: { icon: FileText, color: "bg-slate-100 text-slate-600" },
  status_change: { icon: ArrowRight, color: "bg-yellow-100 text-yellow-600" },
  score_update: { icon: Sparkles, color: "bg-indigo-100 text-indigo-600" },
};

interface LeadTimelineProps {
  activities: LeadActivity[];
}

function LeadTimeline({ activities }: LeadTimelineProps) {
  if (activities.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        No activities yet
      </p>
    );
  }

  return (
    <div className="space-y-0">
      {activities.map((activity, index) => {
        const config = activityConfig[activity.type] || activityConfig.note;
        const Icon = config.icon;
        const isLast = index === activities.length - 1;

        return (
          <div key={activity.id} className="relative flex gap-3 pb-6">
            {/* Connector line */}
            {!isLast && (
              <div className="absolute left-[15px] top-8 h-[calc(100%-20px)] w-px bg-slate-200" />
            )}

            {/* Icon */}
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.color}`}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-700">{activity.description}</p>
              {activity.old_value && activity.new_value && (
                <p className="mt-0.5 text-xs text-slate-500">
                  {activity.old_value} → {activity.new_value}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-400">
                {formatRelativeTime(activity.created_at)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { LeadTimeline };
