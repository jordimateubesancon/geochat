"use client";

import dynamic from "next/dynamic";

const MapInner = dynamic(() => import("./map-inner"), {
  ssr: false,
  loading: () => (
    <div className="h-dvh w-dvw bg-neutral-100 animate-pulse" />
  ),
});

interface MapProps {
  channelId: string;
  channelName: string;
  channelSlug: string;
  initialConversationId?: string;
}

export default function Map({ channelId, channelName, channelSlug, initialConversationId }: MapProps) {
  return <MapInner channelId={channelId} channelName={channelName} channelSlug={channelSlug} initialConversationId={initialConversationId} />;
}
