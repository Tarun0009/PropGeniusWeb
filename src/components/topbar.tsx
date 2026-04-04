"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlignLeft, BellDot, LogOut, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSidebarStore } from "@/stores/sidebar-store";
import { Avatar } from "@/components/ui/avatar";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown";
import { GlobalSearch } from "@/components/global-search";
import { useAuthStore } from "@/stores/auth-store";
import { cn, formatRelativeTime } from "@/lib/utils";

interface Notification {
  id: string;
  type: "lead" | "listing" | "message";
  title: string;
  description: string;
  time: string;
  read: boolean;
  href: string;
}

export function Topbar() {
  const router = useRouter();
  const { isCollapsed, toggleMobile } = useSidebarStore();
  const profile = useAuthStore((s) => s.profile);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch recent activities as notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      const supabase = createClient();

      const [leadsRes, messagesRes] = await Promise.all([
        supabase
          .from("leads")
          .select("id, name, source, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("whatsapp_messages")
          .select("id, lead_id, content, created_at, direction, is_read")
          .eq("direction", "inbound")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const notifs: Notification[] = [];

      if (leadsRes.data) {
        for (const lead of leadsRes.data) {
          notifs.push({
            id: `lead-${lead.id}`,
            type: "lead",
            title: "New Lead",
            description: `${lead.name} from ${lead.source}`,
            time: lead.created_at,
            read: true,
            href: `/leads/${lead.id}`,
          });
        }
      }

      if (messagesRes.data) {
        for (const msg of messagesRes.data) {
          notifs.push({
            id: `msg-${msg.id}`,
            type: "message",
            title: "New Message",
            description: msg.content?.slice(0, 60) || "New WhatsApp message",
            time: msg.created_at,
            read: msg.is_read,
            href: `/messages?lead=${msg.lead_id}`,
          });
        }
      }

      notifs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setNotifications(notifs.slice(0, 8));
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 z-30 flex items-center justify-between px-4 sm:px-6 transition-all duration-200",
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
          <AlignLeft className="h-5 w-5 text-slate-500" />
        </button>

        <GlobalSearch />
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <div className="relative">
          <button
            className="relative p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <BellDot className="h-5 w-5 text-slate-500" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-1 w-80 rounded-lg border border-slate-200 bg-white shadow-lg z-50">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                <button onClick={() => setShowNotifications(false)}>
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-slate-400">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <button
                      key={notif.id}
                      className={cn(
                        "flex w-full flex-col gap-0.5 px-4 py-3 text-left transition-colors hover:bg-slate-50",
                        !notif.read && "bg-primary-50/50"
                      )}
                      onClick={() => {
                        router.push(notif.href);
                        setShowNotifications(false);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900">{notif.title}</span>
                        <span className="text-[10px] text-slate-400">{formatRelativeTime(notif.time)}</span>
                      </div>
                      <p className="truncate text-xs text-slate-500">{notif.description}</p>
                    </button>
                  ))
                )}
              </div>
              <div className="border-t border-slate-100 px-4 py-2">
                <button
                  className="text-xs font-medium text-primary-600 hover:underline"
                  onClick={() => {
                    router.push("/leads");
                    setShowNotifications(false);
                  }}
                >
                  View all leads
                </button>
              </div>
            </div>
          )}
        </div>

        <Dropdown
          trigger={
            <button className="p-1 rounded-lg hover:bg-slate-100">
              <Avatar name={profile?.full_name || "User"} src={profile?.avatar_url} size="sm" />
            </button>
          }
          align="right"
        >
          <div className="px-3 py-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-slate-900 truncate">{profile?.full_name || "User"}</p>
              {profile?.role && (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium capitalize text-slate-600">
                  {profile.role}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 truncate">{profile?.email}</p>
          </div>
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
