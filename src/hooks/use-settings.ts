"use client";

import { createContext, useContext } from "react";

interface SettingsContextValue {
  settingsOpen: boolean;
  toggleSettings: () => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within AccessibilityInit");
  }
  return ctx;
}
