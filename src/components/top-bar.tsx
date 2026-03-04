"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useSettings } from "@/hooks/use-settings";

interface TopBarProps {
  displayName: string;
  onSearchToggle?: () => void;
  searchOpen?: boolean;
  channelName?: string;
  channelSlug?: string;
  hidden?: boolean;
}

export default function TopBar({ displayName, onSearchToggle, searchOpen, channelName, hidden }: TopBarProps) {
  const t = useTranslations();
  const { toggleSettings } = useSettings();

  return (
    <div
      className={`pointer-events-none absolute left-0 top-0 z-[1600] p-3 ${
        hidden ? "hidden md:block" : ""
      }`}
      role="banner"
      aria-label="Application header"
    >
      <div className="pointer-events-auto rounded-lg bg-white/80 shadow-sm backdrop-blur-sm">
        {/* App name + channel */}
        <div className="flex items-center gap-2 px-3 py-2">
          <Link
            href="/"
            className="font-heading text-sm font-extrabold text-stone-900 transition-colors hover:text-stone-600"
          >
            {t("topBar.appName")}
          </Link>
          {channelName && (
            <>
              <span className="text-sm text-stone-400" aria-hidden="true">/</span>
              <span className="text-sm font-medium text-stone-700">
                {channelName}
              </span>
            </>
          )}
        </div>

        {/* Display name */}
        {displayName && (
          <div className="flex items-center gap-1.5 border-t border-stone-200/60 px-3 py-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 text-stone-400"
              aria-hidden="true"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-sm text-stone-500">
              {displayName}
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-1 border-t border-stone-200/60 px-2 py-1.5">
          {onSearchToggle && !searchOpen && (
            <button
              onClick={(e) => { e.stopPropagation(); onSearchToggle?.(); }}
              aria-label={t("topBar.openTools")}
              aria-expanded={false}
              className="rounded-md p-2 transition-colors hover:bg-stone-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-stone-600"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          )}
          <button
            onClick={toggleSettings}
            aria-label={t("settings.ariaLabel")}
            className="rounded-md p-2 transition-colors hover:bg-stone-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-stone-600"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
