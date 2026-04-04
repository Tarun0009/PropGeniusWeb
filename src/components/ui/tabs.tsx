"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface Tab {
  value: string;
  label: string;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (value: string) => void;
  className?: string;
}

function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <div
      className={cn("border-b border-slate-200/80", className)}
      role="tablist"
    >
      <nav className="-mb-px flex gap-1" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = tab.value === activeTab;
          return (
            <button
              key={tab.value}
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.value)}
              className={cn(
                "whitespace-nowrap border-b-2 px-4 py-2.5 text-[13px] font-semibold transition-all duration-150",
                isActive
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-200"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export { Tabs };
