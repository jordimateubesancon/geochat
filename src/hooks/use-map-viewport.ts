import { useCallback, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import type { MapBounds } from "@/types";

export function useMapViewport() {
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMoveEnd = useCallback((map: LeafletMap) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      const b = map.getBounds();
      setBounds({
        min_lng: b.getWest(),
        min_lat: b.getSouth(),
        max_lng: b.getEast(),
        max_lat: b.getNorth(),
      });
    }, 300);
  }, []);

  const refreshBounds = useCallback((map: LeafletMap) => {
    const b = map.getBounds();
    setBounds({
      min_lng: b.getWest(),
      min_lat: b.getSouth(),
      max_lng: b.getEast(),
      max_lat: b.getNorth(),
    });
  }, []);

  return { bounds, handleMoveEnd, refreshBounds };
}
