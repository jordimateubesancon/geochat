export type TextSize = "default" | "large" | "extra-large";

export interface AccessibilityPreferences {
  highContrast: boolean;
  textSize: TextSize;
  reducedMotion: boolean;
}

export const ACCESSIBILITY_STORAGE_KEY = "geochat_accessibility_prefs";

export const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  highContrast: false,
  textSize: "default",
  reducedMotion: false,
};
