"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/auth-store";

const NEW_USER_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes

export function useOnboarding() {
  const { profile } = useAuthStore();
  const [isComplete, setIsComplete] = useState(true); // default hidden until we check

  useEffect(() => {
    if (!profile) return;

    const storageKey = `propgenius_onboarding_${profile.id}`;

    // Already completed on this device
    if (localStorage.getItem(storageKey) === "true") {
      setIsComplete(true);
      return;
    }

    // Only show onboarding if user was created within the last 15 minutes
    const createdAt = new Date(profile.created_at).getTime();
    const isNewUser = Date.now() - createdAt < NEW_USER_THRESHOLD_MS;

    if (isNewUser) {
      setIsComplete(false);
    } else {
      // Existing user — mark complete so it never shows again
      localStorage.setItem(storageKey, "true");
      setIsComplete(true);
    }
  }, [profile]);

  const complete = useCallback(() => {
    if (!profile) return;
    localStorage.setItem(`propgenius_onboarding_${profile.id}`, "true");
    setIsComplete(true);
  }, [profile]);

  return { isComplete, complete };
}
