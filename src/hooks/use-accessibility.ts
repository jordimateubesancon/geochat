"use client";

import { useCallback, useEffect, useState } from "react";
import type { AccessibilityPreferences, TextSize } from "@/lib/accessibility";
import { ACCESSIBILITY_STORAGE_KEY, DEFAULT_PREFERENCES } from "@/lib/accessibility";

function detectOSPreferences(): Partial<AccessibilityPreferences> {
  if (typeof window === "undefined") return {};
  const prefs: Partial<AccessibilityPreferences> = {};
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    prefs.reducedMotion = true;
  }
  if (window.matchMedia("(prefers-contrast: more)").matches) {
    prefs.highContrast = true;
  }
  return prefs;
}

function readFromStorage(): AccessibilityPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AccessibilityPreferences;
  } catch {
    return null;
  }
}

function writeToStorage(prefs: AccessibilityPreferences): boolean {
  try {
    localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(prefs));
    return true;
  } catch {
    return false;
  }
}

function applyAttributes(prefs: AccessibilityPreferences) {
  const html = document.documentElement;
  if (prefs.highContrast) {
    html.setAttribute("data-contrast", "high");
  } else {
    html.removeAttribute("data-contrast");
  }
  if (prefs.textSize !== "default") {
    html.setAttribute("data-text-size", prefs.textSize);
  } else {
    html.removeAttribute("data-text-size");
  }
  if (prefs.reducedMotion) {
    html.setAttribute("data-motion", "reduced");
  } else {
    html.removeAttribute("data-motion");
  }
}

export function useAccessibility(onStorageError?: () => void) {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const stored = readFromStorage();
    const osPrefs = detectOSPreferences();
    const initial = stored ?? { ...DEFAULT_PREFERENCES, ...osPrefs };
    setPreferences(initial);
    applyAttributes(initial);
  }, []);

  const updatePreferences = useCallback(
    (next: AccessibilityPreferences) => {
      setPreferences(next);
      applyAttributes(next);
      if (!writeToStorage(next)) {
        onStorageError?.();
      }
    },
    [onStorageError]
  );

  const setHighContrast = useCallback(
    (value: boolean) => {
      updatePreferences({ ...preferences, highContrast: value });
    },
    [preferences, updatePreferences]
  );

  const setTextSize = useCallback(
    (value: TextSize) => {
      updatePreferences({ ...preferences, textSize: value });
    },
    [preferences, updatePreferences]
  );

  const setReducedMotion = useCallback(
    (value: boolean) => {
      updatePreferences({ ...preferences, reducedMotion: value });
    },
    [preferences, updatePreferences]
  );

  const resetToDefaults = useCallback(() => {
    updatePreferences(DEFAULT_PREFERENCES);
  }, [updatePreferences]);

  return {
    preferences,
    setHighContrast,
    setTextSize,
    setReducedMotion,
    resetToDefaults,
  };
}
