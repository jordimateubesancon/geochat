"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

interface LinkConfirmationDialogProps {
  url: string;
  onCancel: () => void;
  onOpen: () => void;
}

export default function LinkConfirmationDialog({
  url,
  onCancel,
  onOpen,
}: LinkConfirmationDialogProps) {
  const t = useTranslations();
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

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

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-label={t("linkDialog.ariaLabel")}
    >
      <div
        ref={dialogRef}
        className="mx-3 w-full max-w-md rounded-lg bg-white p-4 shadow-xl sm:mx-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-2 text-lg font-semibold text-stone-900">
          {t("linkDialog.title")}
        </h2>

        <p className="mb-3 text-sm text-stone-600">
          {t("linkDialog.description")}
        </p>

        <div className="mb-4 rounded-md bg-stone-100 px-3 py-2">
          <div className="mb-1 text-xs font-medium text-stone-500">
            {t("linkDialog.url")}
          </div>
          <div className="break-all text-sm text-stone-900">{url}</div>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
          <button
            ref={cancelRef}
            className="flex-1 rounded-md bg-stone-100 px-4 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-200"
            onClick={onCancel}
          >
            {t("common.cancel")}
          </button>
          <button
            className="flex-1 rounded-md bg-geo-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-geo-600"
            onClick={onOpen}
          >
            {t("linkDialog.open")}
          </button>
        </div>
      </div>
    </div>
  );
}
