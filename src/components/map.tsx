"use client";

import dynamic from "next/dynamic";

const MapInner = dynamic(() => import("./map-inner"), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen bg-neutral-100 animate-pulse" />
  ),
});

interface MapProps {
  channelId: string;
  channelName: string;
  channelSlug: string;
}

export default function Map({ channelId, channelName, channelSlug }: MapProps) {
  return <MapInner channelId={channelId} channelName={channelName} channelSlug={channelSlug} />;
}
