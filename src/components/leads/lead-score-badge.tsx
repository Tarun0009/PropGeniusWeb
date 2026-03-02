"use client";

import { cn } from "@/lib/utils";

interface LeadScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  reason?: string | null;
}

function getScoreColor(score: number) {
  if (score >= 70) return { bg: "bg-success-50", text: "text-success-700", ring: "ring-success-200" };
  if (score >= 40) return { bg: "bg-warning-50", text: "text-warning-700", ring: "ring-warning-200" };
  return { bg: "bg-danger-50", text: "text-danger-700", ring: "ring-danger-200" };
}

function getScoreLabel(score: number) {
  if (score >= 70) return "Hot";
  if (score >= 40) return "Warm";
  return "Cold";
}

const sizeStyles = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-11 w-11 text-base",
};

function LeadScoreBadge({ score, size = "md", showLabel = false, reason }: LeadScoreBadgeProps) {
  const colors = getScoreColor(score);
  const label = getScoreLabel(score);

  return (
    <div className="flex items-center gap-2" title={reason || undefined}>
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full font-bold ring-2",
          colors.bg,
          colors.text,
          colors.ring,
          sizeStyles[size]
        )}
      >
        {score}
      </span>
      {showLabel && (
        <span className={cn("text-xs font-medium", colors.text)}>
          {label}
        </span>
      )}
    </div>
  );
}

export { LeadScoreBadge };
