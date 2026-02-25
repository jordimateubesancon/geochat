"use client";

import { useChannels } from "@/hooks/use-channels";
import ChannelCard from "@/components/channel-card";

export default function ChannelGrid() {
  const { channels, loading, error } = useChannels();

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-center text-sm text-red-600">
        {error}. Please try refreshing the page.
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="rounded-lg bg-neutral-50 p-8 text-center text-sm text-neutral-500">
        No channels available yet. Check back soon!
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
