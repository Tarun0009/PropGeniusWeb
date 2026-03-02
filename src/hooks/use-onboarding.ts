"use client";

import { useState, useCallback } from "react";

const STORAGE_KEY = "propgenius_onboarding_completed";

export function useOnboarding() {
  const [isComplete, setIsComplete] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  const complete = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsComplete(true);
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setIsComplete(false);
  }, []);

  return { isComplete, complete, reset };
}
