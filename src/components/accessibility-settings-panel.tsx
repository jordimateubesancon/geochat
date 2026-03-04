"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useAccessibility } from "@/hooks/use-accessibility";
import type { TextSize } from "@/lib/accessibility";

interface AccessibilitySettingsPanelProps {
  open: boolean;
  onClose: () => void;
  onStorageError?: () => void;
}

const TEXT_SIZE_OPTIONS: TextSize[] = ["default", "large", "extra-large"];

export default function AccessibilitySettingsPanel({
  open,
  onClose,
  onStorageError,
}: AccessibilitySettingsPanelProps) {
  const t = useTranslations();
  const panelRef = useRef<HTMLDivElement>(null);
  const { preferences, setHighContrast, setTextSize, setReducedMotion, resetToDefaults } =
    useAccessibility(onStorageError);

  const textSizeLabels: Record<TextSize, string> = {
    default: t("settings.textSizeDefault"),
    large: t("settings.textSizeLarge"),
    "extra-large": t("settings.textSizeExtraLarge"),
  };

  // Focus trap + Escape to close
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, input, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Focus first element when opening
  useEffect(() => {
    if (open && panelRef.current) {
      const firstFocusable = panelRef.current.querySelector<HTMLElement>("button");
      firstFocusable?.focus();
    }
  }, [open]);

  // Click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[1800] ${open ? "pointer-events-auto" : ""}`}
      onClick={open ? handleBackdropClick : undefined}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("settings.ariaLabel")}
        className={`absolute left-0 top-0 bottom-0 w-dvw bg-white shadow-lg transition-transform duration-200 ease-in-out sm:w-80 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto px-5 pt-5 pb-5">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-base font-semibold text-stone-900">{t("settings.title")}</h2>
            <button
              onClick={onClose}
              aria-label={t("settings.closeAriaLabel")}
              className="rounded-md p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* High Contrast Toggle */}
          <div className="mb-5">
            <button
              onClick={() => setHighContrast(!preferences.highContrast)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-3 transition-colors hover:bg-stone-50"
              role="switch"
              aria-checked={preferences.highContrast}
            >
              <div className="text-left">
                <div className="text-sm font-medium text-stone-900">
                  {t("settings.highContrast")}
                </div>
                <div className="text-xs text-stone-500">
                  {t("settings.highContrastDescription")}
                </div>
              </div>
              <div
                className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
                  preferences.highContrast ? "bg-geo-500" : "bg-stone-300"
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    preferences.highContrast ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Text Size Selector */}
          <div className="mb-5">
            <div className="mb-2 px-3 text-sm font-medium text-stone-900">
              {t("settings.textSize")}
            </div>
            <div className="flex gap-2 px-3">
              {TEXT_SIZE_OPTIONS.map((size) => (
                <button
                  key={size}
                  onClick={() => setTextSize(size)}
                  className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    preferences.textSize === size
                      ? "bg-geo-500 text-white"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                  aria-pressed={preferences.textSize === size}
                >
                  {textSizeLabels[size]}
                </button>
              ))}
            </div>
          </div>

          {/* Reduced Motion Toggle */}
          <div className="mb-5">
            <button
              onClick={() => setReducedMotion(!preferences.reducedMotion)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-3 transition-colors hover:bg-stone-50"
              role="switch"
              aria-checked={preferences.reducedMotion}
            >
              <div className="text-left">
                <div className="text-sm font-medium text-stone-900">
                  {t("settings.reducedMotion")}
                </div>
                <div className="text-xs text-stone-500">
                  {t("settings.reducedMotionDescription")}
                </div>
              </div>
              <div
                className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
                  preferences.reducedMotion ? "bg-geo-500" : "bg-stone-300"
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    preferences.reducedMotion ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Reset Button */}
          <div className="mt-auto px-3">
            <button
              onClick={resetToDefaults}
              className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
            >
              {t("settings.reset")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
