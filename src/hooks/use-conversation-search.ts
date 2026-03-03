"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Conversation } from "@/types";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;
const RESULT_LIMIT = 10;

export function useConversationSearch(channelId?: string) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Conversation[]>([]);
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
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        let queryBuilder = supabase
          .from("conversations")
          .select("*")
          .ilike("title", `%${query}%`)
          .limit(RESULT_LIMIT)
          .order("created_at", { ascending: false });

        if (channelId) {
          queryBuilder = queryBuilder.eq("channel_id", channelId);
        }

        const { data, error: supabaseError } = await queryBuilder
          .abortSignal(controller.signal);

        if (supabaseError) {
          setError("errors.searchUnavailable");
          setResults([]);
          setLoading(false);
          return;
        }

        setResults(data ?? []);
        setError(null);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
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
  }, [query, channelId]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return { query, setQuery, results, loading, error };
}
