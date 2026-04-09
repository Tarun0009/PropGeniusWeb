"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthStore } from "@/stores/auth-store";

const NEW_USER_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes
// Captured at module load (not during render) so the compiler treats it as a stable value
const MODULE_LOAD_TIME = Date.now();

export function useOnboarding() {
  const { profile } = useAuthStore();
  const [dismissed, setDismissed] = useState(false);

  // Derive completion state without calling setState inside an effect
  const isComplete = useMemo(() => {
    if (dismissed) return true;
    if (!profile) return true;
    if (typeof window !== "undefined") {
      const storageKey = `propgenius_onboarding_${profile.id}`;
      if (localStorage.getItem(storageKey) === "true") return true;
    }
    const createdAt = new Date(profile.created_at).getTime();
    return MODULE_LOAD_TIME - createdAt >= NEW_USER_THRESHOLD_MS;
  }, [profile, dismissed]);

  // Persist completion to localStorage as a side effect only
  useEffect(() => {
    if (!profile || !isComplete || typeof window === "undefined") return;
    localStorage.setItem(`propgenius_onboarding_${profile.id}`, "true");
  }, [profile, isComplete]);

  const complete = useCallback(() => {
    if (!profile) return;
    localStorage.setItem(`propgenius_onboarding_${profile.id}`, "true");
    setDismissed(true);
  }, [profile]);

  return { isComplete, complete };
}
