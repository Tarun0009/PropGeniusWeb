"use client";

import { useRouter } from "next/navigation";
import { Menu, Bell, Search, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSidebarStore } from "@/stores/sidebar-store";
import { Avatar } from "@/components/ui/avatar";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";

export function Topbar() {
  const router = useRouter();
  const { isCollapsed, toggleMobile } = useSidebarStore();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 h-16 bg-white border-b border-slate-200 z-30 flex items-center justify-between px-4 sm:px-6 transition-all duration-200",
        isCollapsed ? "lg:left-16" : "lg:left-64",
        "left-0"
      )}
    >
      {/* Left: Hamburger + Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobile}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
        >
          <Menu className="h-5 w-5 text-slate-600" />
        </button>

        <div className="hidden sm:flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 w-64">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search listings, leads..."
            className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none w-full"
          />
        </div>
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-lg hover:bg-slate-100">
          <Bell className="h-5 w-5 text-slate-600" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-danger-500 rounded-full" />
        </button>

        <Dropdown
          trigger={
            <button className="p-1 rounded-lg hover:bg-slate-100">
              <Avatar name="User" size="sm" />
            </button>
          }
          align="right"
        >
          <DropdownItem onClick={() => router.push("/settings")}>
            Profile & Settings
          </DropdownItem>
          <DropdownSeparator />
          <DropdownItem onClick={handleSignOut} destructive>
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}
