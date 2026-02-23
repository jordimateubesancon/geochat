"use client";

import { useCallback, useEffect, useState } from "react";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import "leaflet-defaulticon-compatibility";

import { useMapViewport } from "@/hooks/use-map-viewport";
import { useConversations } from "@/hooks/use-conversations";
import ConversationMarker from "@/components/marker";
import type { Conversation } from "@/types";
import type { Map as LeafletMap } from "leaflet";

const CARTO_DARK_URL =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>';

const DEFAULT_CENTER: [number, number] = [20, 0];
const DEFAULT_ZOOM = 2;

function MapEventHandler({
  onMoveEnd,
}: {
  onMoveEnd: (map: LeafletMap) => void;
}) {
  const map = useMapEvents({
    moveend: () => onMoveEnd(map),
  });

  // Set initial bounds on mount
  useEffect(() => {
    onMoveEnd(map);
  }, [map, onMoveEnd]);

  // Request geolocation on mount
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          map.setView(
            [position.coords.latitude, position.coords.longitude],
            13
          );
        },
        () => {
          // Geolocation denied or unavailable — stay at default world view
        }
      );
    }
  }, [map]);

  return null;
}

export default function MapInner() {
  const { bounds, handleMoveEnd } = useMapViewport();
  const { conversations } = useConversations(bounds);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  const handleMarkerClick = useCallback((conversation: Conversation) => {
    setSelectedConversation(conversation);
  }, []);

  const isPanelOpen = selectedConversation !== null;
  const showHint = conversations.length === 0 && !isPanelOpen;

  return (
    <div className="relative h-screen w-screen">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer url={CARTO_DARK_URL} attribution={CARTO_ATTRIBUTION} />
        <MapEventHandler onMoveEnd={handleMoveEnd} />

        {conversations.map((conv) => (
          <ConversationMarker
            key={conv.id}
            conversation={conv}
            onClick={handleMarkerClick}
          />
        ))}
      </MapContainer>

      {showHint && (
        <div className="pointer-events-none absolute bottom-8 left-0 right-0 z-[1000] text-center">
          <span className="rounded-full bg-neutral-800/80 px-4 py-2 text-sm text-neutral-400">
            Click anywhere on the map to start a conversation
          </span>
        </div>
      )}
    </div>
  );
}
