"use client";

import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { MobileNav } from "@/components/mobile-nav";
import { useSidebarStore } from "@/stores/sidebar-store";
import { cn } from "@/lib/utils";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Topbar />

      <main
        className={cn(
          "pt-16 pb-20 lg:pb-0 transition-all duration-200",
          isCollapsed ? "lg:pl-16" : "lg:pl-64"
        )}
      >
        <div className="max-w-7xl mx-auto p-4 sm:p-6">{children}</div>
      </main>

      <MobileNav />
    </div>
  );
}
