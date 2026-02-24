"use client";

import { useCallback, useEffect, useState } from "react";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import "leaflet-defaulticon-compatibility";

import { useMapViewport } from "@/hooks/use-map-viewport";
import { useConversations } from "@/hooks/use-conversations";
import { useCreateConversation } from "@/hooks/use-create-conversation";
import ConversationMarker from "@/components/marker";
import NearbyWarning from "@/components/nearby-warning";
import CreateDialog from "@/components/create-dialog";
import ConversationPanel from "@/components/conversation-panel";
import type { Conversation } from "@/types";
import type { Map as LeafletMap, LeafletMouseEvent } from "leaflet";

const CARTO_DARK_URL =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>';

const DEFAULT_CENTER: [number, number] = [20, 0];
const DEFAULT_ZOOM = 2;

function MapEventHandler({
  onMoveEnd,
  onMapClick,
}: {
  onMoveEnd: (map: LeafletMap) => void;
  onMapClick: (e: LeafletMouseEvent) => void;
}) {
  const map = useMapEvents({
    moveend: () => onMoveEnd(map),
    click: (e) => onMapClick(e),
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

type CreateFlowState =
  | { step: "idle" }
  | { step: "checking"; lat: number; lng: number }
  | {
      step: "nearby-warning";
      lat: number;
      lng: number;
      nearby: Conversation[];
    }
  | { step: "create-dialog"; lat: number; lng: number };

export default function MapInner() {
  const { bounds, handleMoveEnd } = useMapViewport();
  const { conversations } = useConversations(bounds);
  const {
    loading: createLoading,
    checkProximity,
    createConversation,
    clearNearby,
  } = useCreateConversation();
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [createFlow, setCreateFlow] = useState<CreateFlowState>({
    step: "idle",
  });

  const handleMarkerClick = useCallback((conversation: Conversation) => {
    setSelectedConversation(conversation);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedConversation(null);
  }, []);

  const handleMapClick = useCallback(
    async (e: LeafletMouseEvent) => {
      // Don't start create flow if a dialog or panel is already open
      if (createFlow.step !== "idle" || selectedConversation !== null) return;

      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      setCreateFlow({ step: "checking", lat, lng });

      const nearby = await checkProximity(lat, lng);

      if (nearby.length > 0) {
        setCreateFlow({ step: "nearby-warning", lat, lng, nearby });
      } else {
        setCreateFlow({ step: "create-dialog", lat, lng });
      }
    },
    [createFlow.step, selectedConversation, checkProximity]
  );

  const handleCancelCreate = useCallback(() => {
    setCreateFlow({ step: "idle" });
    clearNearby();
  }, [clearNearby]);

  const handleCreateAnyway = useCallback(() => {
    if (
      createFlow.step === "nearby-warning"
    ) {
      setCreateFlow({
        step: "create-dialog",
        lat: createFlow.lat,
        lng: createFlow.lng,
      });
    }
  }, [createFlow]);

  const handleSelectNearbyConversation = useCallback(
    (conversation: Conversation) => {
      setCreateFlow({ step: "idle" });
      clearNearby();
      setSelectedConversation(conversation);
    },
    [clearNearby]
  );

  const handleSubmitCreate = useCallback(
    async (title: string, body: string) => {
      if (createFlow.step !== "create-dialog") return;

      // TODO: use actual display name from user session (Phase 6)
      const creatorName = "Anonymous";

      const conversation = await createConversation({
        lat: createFlow.lat,
        lng: createFlow.lng,
        title,
        body,
        creatorName,
      });

      if (conversation) {
        setCreateFlow({ step: "idle" });
        clearNearby();
        setSelectedConversation(conversation);
      }
    },
    [createFlow, createConversation, clearNearby]
  );

  const isPanelOpen = selectedConversation !== null;
  const isDialogOpen = createFlow.step !== "idle";
  const showHint =
    conversations.length === 0 && !isPanelOpen && !isDialogOpen;

  return (
    <div className="relative h-screen w-screen">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer url={CARTO_DARK_URL} attribution={CARTO_ATTRIBUTION} />
        <MapEventHandler
          onMoveEnd={handleMoveEnd}
          onMapClick={handleMapClick}
        />

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

      {createFlow.step === "nearby-warning" && (
        <NearbyWarning
          conversations={createFlow.nearby}
          clickLat={createFlow.lat}
          clickLng={createFlow.lng}
          onSelectConversation={handleSelectNearbyConversation}
          onCreateAnyway={handleCreateAnyway}
          onCancel={handleCancelCreate}
        />
      )}

      {createFlow.step === "create-dialog" && (
        <CreateDialog
          lat={createFlow.lat}
          lng={createFlow.lng}
          loading={createLoading}
          onSubmit={handleSubmitCreate}
          onCancel={handleCancelCreate}
        />
      )}

      {selectedConversation && (
        <ConversationPanel
          conversation={selectedConversation}
          currentAuthor="Anonymous"
          onClose={handleClosePanel}
        />
      )}
    </div>
  );
}
