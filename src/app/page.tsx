"use client";

import { useTranslations } from "next-intl";
import { useSettings } from "@/hooks/use-settings";
import ChannelGrid from "@/components/channel-grid";

export default function Home() {
  const t = useTranslations();
  const { toggleSettings } = useSettings();
  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Settings gear — top-left */}
      <button
        onClick={toggleSettings}
        aria-label={t("settings.ariaLabel")}
        className="fixed left-3 top-3 z-[1600] rounded-lg bg-white/80 p-2 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
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
          className="text-neutral-600"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
            GeoChat
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            {t("home.subtitle")}
          </p>
        </div>
        <ChannelGrid />
      </div>
    </main>
  );
}
