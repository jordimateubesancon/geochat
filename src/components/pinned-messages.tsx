"use client";

import { useTranslations } from "next-intl";
import type { PinnedMessage } from "@/types";

interface PinnedMessagesProps {
  pins: PinnedMessage[];
  pinCount: number;
  onUnpin: (messageId: string) => void;
  onScrollToMessage: (messageId: string) => void;
}

export default function PinnedMessages({
  pins,
  pinCount,
  onUnpin,
  onScrollToMessage,
}: PinnedMessagesProps) {
  const t = useTranslations();

  if (pins.length === 0) return null;

  return (
    <div className="border-b border-stone-200 bg-amber-50/50 px-4 py-2">
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="12" y1="17" x2="12" y2="22" />
            <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
          </svg>
          {t("pins.pinnedMessages")}
        </div>
        <span className="text-xs text-amber-600">
          {t("pins.pinnedCount", { count: pinCount })}
        </span>
      </div>
      <div className="space-y-1">
        {pins.map((pin) => (
          <div
            key={pin.id}
            className="group flex items-start gap-2 rounded-md bg-white/60 px-2 py-1.5"
          >
            <button
              onClick={() => onScrollToMessage(pin.id)}
              className="min-w-0 flex-1 text-left"
              aria-label={t("pins.scrollToMessage")}
            >
              <div className="text-xs font-medium text-stone-700">
                {pin.author_name}
              </div>
              <div className="truncate text-xs text-stone-500">
                {pin.body}
              </div>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUnpin(pin.id);
              }}
              aria-label={t("pins.unpin")}
              className="shrink-0 rounded p-0.5 text-stone-400 opacity-0 transition-opacity hover:text-stone-600 group-hover:opacity-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
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
        ))}
      </div>
    </div>
  );
}
