import React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className
      )}
    >
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-2xl bg-primary-200/40 blur-lg" />
        <div className="relative rounded-2xl border border-primary-100 bg-primary-50 p-4">
          <Icon className="h-7 w-7 text-primary-400" />
        </div>
      </div>
      <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm text-slate-400 leading-relaxed">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export { EmptyState };
