import React from "react";
import { cn } from "@/lib/utils";

const variantStyles = {
  default: "bg-slate-100 text-slate-600 ring-1 ring-slate-200/60",
  primary: "bg-primary-50 text-primary-700 ring-1 ring-primary-200/60",
  success: "bg-success-50 text-success-700 ring-1 ring-success-200/60",
  warning: "bg-warning-50 text-warning-700 ring-1 ring-warning-200/60",
  danger: "bg-danger-50 text-danger-700 ring-1 ring-danger-200/60",
  info: "bg-info-50 text-info-700 ring-1 ring-info-200/60",
  purple: "bg-purple-50 text-purple-700 ring-1 ring-purple-200/60",
  cyan: "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200/60",
  orange: "bg-orange-50 text-orange-700 ring-1 ring-orange-200/60",
} as const;

const sizeStyles = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
} as const;

export interface BadgeProps {
  variant?: keyof typeof variantStyles;
  size?: "sm" | "md";
  children: React.ReactNode;
  className?: string;
}

function Badge({
  variant = "default",
  size = "sm",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}

export { Badge };
