"use client";

import { useEffect, useRef, useState } from "react";
import type { NominatimResult } from "@/types";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 3;

export function useNominatimSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const timer = setTimeout(async () => {
      // Cancel any in-flight request
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const params = new URLSearchParams({
          q: query,
          format: "jsonv2",
          limit: "5",
        });

        const response = await fetch(`${NOMINATIM_URL}?${params}`, {
          headers: { "User-Agent": "GeoChat/1.0" },
          signal: controller.signal,
        });

        if (!response.ok) {
          setError("errors.searchUnavailable");
          setResults([]);
          setLoading(false);
          return;
        }

        const data: NominatimResult[] = await response.json();
        setResults(data);
        setError(null);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          // Request was cancelled — ignore silently
          return;
        }
        setError("Search is temporarily unavailable");
        setResults([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      abortControllerRef.current?.abort();
    };
  }, [query]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return { query, setQuery, results, loading, error };
}
