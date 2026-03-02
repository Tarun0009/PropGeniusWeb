import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps {
  className?: string;
  variant?: "rectangular" | "circular";
}

function Skeleton({ className, variant = "rectangular" }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-slate-200",
        variant === "circular" ? "rounded-full" : "rounded-md",
        className
      )}
      aria-hidden="true"
    />
  );
}

export { Skeleton };
