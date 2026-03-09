"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { WeatherData } from "@/types";
import type { HistoricalAvgMap } from "@/lib/weather";
import {
  fetchWeatherData,
  isCacheFresh,
  fetchHistoricalAverages,
  extractTimelineDates,
  historicalAvgCacheKey,
  isHistoricalCacheFresh,
} from "@/lib/weather";
import {
  getCachedWeather,
  putCachedWeather,
  getCachedHistoricalAvg,
  putCachedHistoricalAvg,
} from "@/lib/offline-db";
import { useWeatherUnits } from "@/hooks/use-weather-units";

export interface UseWeatherResult {
  weather: WeatherData | null;
  historicalAvg: HistoricalAvgMap | null;
  loading: boolean;
  error: string | null;
  isStale: boolean;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

export function useWeather(
  conversationId: string,
  latitude: number,
  longitude: number
): UseWeatherResult {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [historicalAvg, setHistoricalAvg] = useState<HistoricalAvgMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { unitSystem } = useWeatherUnits();
  const mountedRef = useRef(true);

  const loadWeather = useCallback(
    async (forceRefresh: boolean) => {
      if (!forceRefresh) setLoading(true);
      setError(null);

      try {
        // Check cache first
        if (!forceRefresh) {
          const cached = await getCachedWeather(conversationId);
          if (cached && isCacheFresh(cached.cachedAt)) {
            if (!mountedRef.current) return;
            setWeather(cached.data);
            setLastUpdated(new Date(cached.cachedAt));
            setIsStale(false);
            setLoading(false);
            return;
          }
        }

        // Check if online
        if (typeof navigator !== "undefined" && !navigator.onLine) {
          const cached = await getCachedWeather(conversationId);
          if (cached) {
            if (!mountedRef.current) return;
            setWeather(cached.data);
            setLastUpdated(new Date(cached.cachedAt));
            setIsStale(true);
            setLoading(false);
            return;
          }
          throw new Error("offline");
        }

        // Fetch fresh data
        const data = await fetchWeatherData(
          latitude,
          longitude,
          unitSystem,
          conversationId
        );

        if (!mountedRef.current) return;

        const now = new Date().toISOString();
        await putCachedWeather({
          conversationId,
          data,
          cachedAt: now,
        });

        setWeather(data);
        setLastUpdated(new Date(now));
        setIsStale(false);
        setError(null);
      } catch (err) {
        if (!mountedRef.current) return;

        // Try to serve stale cache on error
        try {
          const cached = await getCachedWeather(conversationId);
          if (cached) {
            setWeather(cached.data);
            setLastUpdated(new Date(cached.cachedAt));
            setIsStale(true);
            setError(null);
            setLoading(false);
            return;
          }
        } catch {
          // Cache also failed
        }

        setError(
          err instanceof Error ? err.message : "Failed to load weather"
        );
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [conversationId, latitude, longitude, unitSystem]
  );

  // Load historical averages non-blocking (after main weather data)
  const loadHistoricalAvg = useCallback(async () => {
    if (!weather) return;
    try {
      const dates = extractTimelineDates(weather.hourly);
      const key = historicalAvgCacheKey(latitude, longitude, dates);
      const cached = await getCachedHistoricalAvg(key);
      // Validate cache shape (old format had temperatureAvg instead of averages)
      if (cached && cached.averages && typeof cached.averages === "object" && isHistoricalCacheFresh(cached.cachedAt)) {
        if (mountedRef.current) setHistoricalAvg(cached.averages);
        return;
      }
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        if (cached?.averages && typeof cached.averages === "object" && mountedRef.current) {
          setHistoricalAvg(cached.averages);
        }
        return;
      }
      const avgs = await fetchHistoricalAverages(latitude, longitude, dates);
      if (!mountedRef.current) return;
      if (avgs !== null) {
        await putCachedHistoricalAvg(key, avgs);
        setHistoricalAvg(avgs);
      }
    } catch {
      // Silently ignore — reference line is optional
    }
  }, [latitude, longitude, weather]);

  useEffect(() => {
    mountedRef.current = true;
    loadWeather(false);
    return () => {
      mountedRef.current = false;
    };
  }, [loadWeather]);

  // Trigger historical avg fetch once main weather is available
  useEffect(() => {
    if (weather) {
      loadHistoricalAvg();
    }
  }, [weather, loadHistoricalAvg]);

  const refresh = useCallback(async () => {
    await loadWeather(true);
  }, [loadWeather]);

  return {
    weather,
    historicalAvg,
    loading,
    error,
    isStale,
    lastUpdated,
    refresh,
  };
}
