"use client";

import { useCallback, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useAccessibility } from "@/hooks/use-accessibility";
import { SettingsContext } from "@/hooks/use-settings";
import { useToasts, ToastContainer } from "@/components/toast";
import AccessibilitySettingsPanel from "@/components/accessibility-settings-panel";

export default function AccessibilityInit({ children }: { children: ReactNode }) {
  const t = useTranslations();
  const { toasts, addToast, dismissToast } = useToasts();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const toggleSettings = useCallback(() => {
    setSettingsOpen((prev) => !prev);
  }, []);

  const handleStorageError = useCallback(() => {
    addToast(t("errors.sendFailed"), "error");
  }, [addToast, t]);

  useAccessibility(handleStorageError);

  return (
    <SettingsContext.Provider value={{ settingsOpen, toggleSettings }}>
      <AccessibilitySettingsPanel
        open={settingsOpen}
        onClose={toggleSettings}
        onStorageError={handleStorageError}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      {children}
    </SettingsContext.Provider>
  );
}
