"use client";

import dynamic from "next/dynamic";

const MapInner = dynamic(() => import("./map-inner"), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen bg-neutral-100 animate-pulse" />
  ),
});

export default function Map() {
  return <MapInner />;
}
