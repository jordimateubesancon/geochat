import { useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import type { Conversation } from "@/types";

function useFormatDistance() {
  const t = useTranslations();
  return (
    convLat: number,
    convLng: number,
    clickLat: number,
    clickLng: number
  ): string => {
    const R = 6371000;
    const dLat = ((convLat - clickLat) * Math.PI) / 180;
    const dLng = ((convLng - clickLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((clickLat * Math.PI) / 180) *
        Math.cos((convLat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    if (distance < 100) return t("nearbyWarning.metersAway", { distance: Math.round(distance) });
    return t("nearbyWarning.kmAway", { distance: (distance / 1000).toFixed(1) });
  };
}

interface NearbyWarningProps {
  conversations: Conversation[];
  clickLat: number;
  clickLng: number;
  onSelectConversation: (conversation: Conversation) => void;
  onCreateAnyway: () => void;
  onCancel: () => void;
}

export default function NearbyWarning({
  conversations,
  clickLat,
  clickLng,
  onSelectConversation,
  onCreateAnyway,
  onCancel,
}: NearbyWarningProps) {
  const t = useTranslations();
  const formatDistance = useFormatDistance();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus trap + Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [tabindex]:not([tabindex="-1"])'
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
  }, [onCancel]);

  // Auto-focus on mount
  useEffect(() => {
    if (dialogRef.current) {
      const firstButton =
        dialogRef.current.querySelector<HTMLElement>("button");
      firstButton?.focus();
    }
  }, []);

  const handleConversationClick = useCallback(
    (conv: Conversation) => {
      onSelectConversation(conv);
    },
    [onSelectConversation]
  );

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-label={t("nearbyWarning.dialogAriaLabel")}
    >
      <div
        ref={dialogRef}
        className="mx-3 w-full max-w-md rounded-lg bg-white p-4 shadow-xl sm:mx-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-2 text-lg font-semibold text-neutral-900">
          {t("nearbyWarning.title")}
        </h2>
        <p className="mb-4 text-sm text-neutral-500">
          {t("nearbyWarning.description", { count: conversations.length })}
        </p>

        <ul className="mb-4 max-h-48 space-y-2 overflow-y-auto">
          {conversations.map((conv) => (
            <li key={conv.id}>
              <button
                className="min-h-[44px] w-full rounded-md bg-neutral-50 px-3 py-2.5 text-left transition-colors hover:bg-neutral-100"
                onClick={() => handleConversationClick(conv)}
              >
                <div className="font-medium text-neutral-900">
                  {conv.title}
                </div>
                <div className="text-xs text-neutral-500">
                  {formatDistance(
                    conv.latitude,
                    conv.longitude,
                    clickLat,
                    clickLng
                  )}{" "}
                  · {t("nearbyWarning.messages", { count: conv.message_count })}
                </div>
              </button>
            </li>
          ))}
        </ul>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
          <button
            className="flex-1 rounded-md bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200"
            onClick={onCancel}
            aria-label={t("nearbyWarning.cancelAriaLabel")}
          >
            {t("common.cancel")}
          </button>
          <button
            className="flex-1 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            onClick={onCreateAnyway}
            aria-label={t("nearbyWarning.createAriaLabel")}
          >
            {t("nearbyWarning.createAnyway")}
          </button>
        </div>
      </div>
    </div>
  );
}
