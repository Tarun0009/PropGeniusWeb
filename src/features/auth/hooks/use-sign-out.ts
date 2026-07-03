"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LOGIN_ROUTE } from "@/features/auth/config";
import { useAuthStore } from "@/features/auth/stores/auth-store";

export function useSignOut() {
  const router = useRouter();
  const resetAuth = useAuthStore((state) => state.reset);

  return async (options?: { global?: boolean }) => {
    const supabase = createClient();
    await supabase.auth.signOut(options?.global ? { scope: "global" } : undefined);
    resetAuth();
    router.replace(LOGIN_ROUTE);
    router.refresh();
  };
}