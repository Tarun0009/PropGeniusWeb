"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import type { Profile } from "@/features/users/types";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setProfile = useAuthStore((state) => state.setProfile);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setError = useAuthStore((state) => state.setError);
  const reset = useAuthStore((state) => state.reset);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    async function fetchProfile(userId: string) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, organization:organizations(*)")
        .eq("id", userId)
        .single();

      if (!isMounted) return;

      if (error) {
        console.error("Failed to load auth profile:", error);
        setError("Unable to load your profile. Please refresh or sign in again.");
        return;
      }

      setProfile((data as Profile) || null);
    }

    async function loadUser() {
      setLoading(true);
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (error) {
        reset();
        return;
      }

      if (user) {
        await fetchProfile(user.id);
      } else {
        reset();
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setLoading(true);
        fetchProfile(session.user.id);
      } else {
        reset();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [reset, setError, setLoading, setProfile]);

  return <>{children}</>;
}