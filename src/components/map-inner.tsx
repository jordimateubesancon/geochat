"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMapEvents, ZoomControl } from "react-leaflet";
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
import Toolbox from "@/components/toolbox";
import LocationSearch from "@/components/location-search";
import TopBar from "@/components/top-bar";
import { ToastContainer, useToasts } from "@/components/toast";
import { useUserSession } from "@/hooks/use-user-session";
import type { Conversation } from "@/types";
import type { Map as LeafletMap, LatLngBoundsExpression, LeafletMouseEvent } from "leaflet";

const OPENTOPOMAP_URL =
  "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
const OPENTOPOMAP_ATTRIBUTION =
  'Map data: &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)';

const DEFAULT_CENTER: [number, number] = [20, 0];
const DEFAULT_ZOOM = 2;

function MapEventHandler({
  onMoveEnd,
  onMapClick,
  onMapReady,
}: {
  onMoveEnd: (map: LeafletMap) => void;
  onMapClick: (e: LeafletMouseEvent) => void;
  onMapReady?: (map: LeafletMap) => void;
}) {
  const map = useMapEvents({
    moveend: () => onMoveEnd(map),
    click: (e) => onMapClick(e),
  });

  // Set initial bounds on mount and notify parent of map instance
  useEffect(() => {
    onMoveEnd(map);
    onMapReady?.(map);
  }, [map, onMoveEnd, onMapReady]);

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

interface MapInnerProps {
  channelId: string;
  channelName: string;
  channelSlug: string;
}

export default function MapInner({ channelId, channelName, channelSlug }: MapInnerProps) {
  const { displayName } = useUserSession();
  const { toasts, addToast, dismissToast } = useToasts();
  const { bounds, handleMoveEnd } = useMapViewport();
  const { conversations } = useConversations(bounds, channelId, addToast);
  const {
    loading: createLoading,
    checkProximity,
    createConversation,
    clearNearby,
  } = useCreateConversation(channelId);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [createFlow, setCreateFlow] = useState<CreateFlowState>({
    step: "idle",
  });
  const [toolboxOpen, setToolboxOpen] = useState(false);
  const mapRef = useRef<LeafletMap | null>(null);

  const handleMarkerClick = useCallback((conversation: Conversation) => {
    setSelectedConversation(conversation);
    // On mobile, close toolbox when opening conversation panel
    if (window.innerWidth < 768) {
      setToolboxOpen(false);
    }
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

      const creatorName = displayName || "Anonymous";

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
    [createFlow, createConversation, clearNearby, displayName]
  );

  const handleToolboxToggle = useCallback(() => {
    setToolboxOpen((prev) => !prev);
  }, []);

  const handleLocationSelect = useCallback(
    (
      lat: number,
      lng: number,
      boundingbox: [number, number, number, number]
    ) => {
      const map = mapRef.current;
      if (!map) return;

      const [south, north, west, east] = boundingbox;
      const hasBounds =
        south !== north && west !== east;

      if (hasBounds) {
        const bounds: LatLngBoundsExpression = [
          [south, west],
          [north, east],
        ];
        map.flyToBounds(bounds, { padding: [20, 20] });
      } else {
        map.flyTo([lat, lng], 15);
      }

      // Close toolbox on mobile after selection
      if (window.innerWidth < 768) {
        setToolboxOpen(false);
      }
    },
    []
  );

  const handleConversationSelect = useCallback(
    (conversation: Conversation) => {
      const map = mapRef.current;
      if (map) {
        map.flyTo([conversation.latitude, conversation.longitude], 15);
      }
      setSelectedConversation(conversation);
      // Close toolbox on mobile after selection
      if (window.innerWidth < 768) {
        setToolboxOpen(false);
      }
    },
    []
  );

  // Close toolbox on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && toolboxOpen) {
        setToolboxOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toolboxOpen]);

  const isPanelOpen = selectedConversation !== null;
  const isDialogOpen = createFlow.step !== "idle";
  const showHint =
    conversations.length === 0 && !isPanelOpen && !isDialogOpen;

  return (
    <div className="relative h-screen w-screen">
      <TopBar displayName={displayName} onSearchToggle={handleToolboxToggle} searchOpen={toolboxOpen} channelName={channelName} channelSlug={channelSlug} hidden={isPanelOpen} />
      <Toolbox open={toolboxOpen} onToggle={handleToolboxToggle}>
        <LocationSearch onSelectLocation={handleLocationSelect} onSelectConversation={handleConversationSelect} channelId={channelId} />
      </Toolbox>
      <div
        role="application"
        aria-label="Interactive map showing conversations"
        tabIndex={0}
        className="h-full w-full"
      >
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        zoomControl={false}
        keyboard={true}
      >
        <ZoomControl position="bottomleft" />
        <TileLayer url={OPENTOPOMAP_URL} attribution={OPENTOPOMAP_ATTRIBUTION} maxZoom={17} />
        <MapEventHandler
          onMoveEnd={handleMoveEnd}
          onMapClick={handleMapClick}
          onMapReady={useCallback((map: LeafletMap) => { mapRef.current = map; }, [])}
        />

        {conversations.map((conv) => (
          <ConversationMarker
            key={conv.id}
            conversation={conv}
            onClick={handleMarkerClick}
          />
        ))}
      </MapContainer>
      </div>

      {showHint && (
        <div className="pointer-events-none absolute bottom-20 left-0 right-0 z-[1000] text-center sm:bottom-8">
          <span className="rounded-full bg-white/80 px-4 py-2 text-sm text-neutral-600 shadow-sm backdrop-blur-sm">
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
          currentAuthor={displayName || "Anonymous"}
          onClose={handleClosePanel}
          onToast={addToast}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
