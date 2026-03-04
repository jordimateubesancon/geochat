"use client";

import { useTranslations } from "next-intl";
import { useChannels } from "@/hooks/use-channels";
import ChannelCard from "@/components/channel-card";

export default function ChannelGrid() {
  const t = useTranslations();
  const { channels, loading, error } = useChannels();

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl border border-stone-200 bg-stone-100"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-center text-sm text-red-600">
        {t("channelGrid.error", { error: t(error) })}
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="rounded-lg bg-stone-50 p-8 text-center text-sm text-stone-500">
        {t("channelGrid.empty")}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {channels.map((channel) => (
        <ChannelCard key={channel.id} channel={channel} />
      ))}
    </div>
  );
}
