"use client";

import { useTranslations } from "next-intl";
import ChannelGrid from "@/components/channel-grid";

export default function Home() {
  const t = useTranslations();
  return (
    <main className="min-h-screen bg-neutral-50">
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
