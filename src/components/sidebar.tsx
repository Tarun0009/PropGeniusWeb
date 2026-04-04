"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Landmark,
  Contact,
  MessageCircleMore,
  TrendingUp,
  SlidersHorizontal,
  ChevronLeft,
  X,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar-store";
import { useAuthStore } from "@/stores/auth-store";
import { Avatar } from "@/components/ui/avatar";

const navItems = [
  { label: "Dashboard",  href: "/dashboard", icon: House },
  { label: "Listings",   href: "/listings",  icon: Landmark },
  { label: "Leads",      href: "/leads",     icon: Contact },
  { label: "Messages",   href: "/messages",  icon: MessageCircleMore },
  { label: "Analytics",  href: "/analytics", icon: TrendingUp },
  { label: "Settings",   href: "/settings",  icon: SlidersHorizontal },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggle, isMobileOpen, closeMobile } = useSidebarStore();
  const profile = useAuthStore((s) => s.profile);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-[#0F0B1E] z-50 flex flex-col transition-all duration-200",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/8 shrink-0">
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 shrink-0">
                <Building2 className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-[15px] font-bold text-white tracking-tight">
                PropGenius
              </span>
            </Link>
          )}
          {isCollapsed && (
            <Link href="/dashboard" className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <Building2 className="h-4.5 w-4.5 text-white" />
            </Link>
          )}

          {/* Close button on mobile */}
          <button
            onClick={closeMobile}
            className="lg:hidden p-1 rounded-md hover:bg-white/8"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2.5 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}
              >
                <Icon className={cn("h-[18px] w-[18px] shrink-0 transition-colors", active ? "text-white" : "text-slate-400")} />
                {!isCollapsed && <span>{item.label}</span>}
                {!isCollapsed && active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User card */}
        {profile && (
          <div className="px-2.5 pb-2 border-t border-white/8 pt-3">
            {isCollapsed ? (
              <div className="flex justify-center">
                <Avatar name={profile.full_name} src={profile.avatar_url} size="sm" />
              </div>
            ) : (
              <div className="flex items-center gap-2.5 rounded-lg bg-white/8 px-3 py-2.5">
                <Avatar name={profile.full_name} src={profile.avatar_url} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-200">{profile.full_name}</p>
                  <p className="text-[10px] truncate text-slate-500">{profile.organization?.name ?? profile.role}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:block p-2.5 border-t border-white/8">
          <button
            onClick={toggle}
            className="flex items-center justify-center w-full p-2 rounded-lg text-slate-500 hover:bg-white/8 hover:text-slate-300 transition-colors"
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isCollapsed && "rotate-180"
              )}
            />
          </button>
        </div>
      </aside>
    </>
  );
}
