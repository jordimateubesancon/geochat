import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { cacheConversations } from "@/hooks/use-offline-cache";
import { getConversationsByChannel } from "@/lib/offline-db";
import type { Conversation, MapBounds } from "@/types";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function useConversations(
  bounds: MapBounds | null,
  channelId: string,
  onToast?: (text: string, type: "error" | "info") => void
) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const boundsRef = useRef<MapBounds | null>(null);
  const { isOnline } = useOnlineStatus();

  // Keep latest bounds in ref for reconnection refetch
  useEffect(() => {
    boundsRef.current = bounds;
  }, [bounds]);

  // Fetch conversations within the current viewport bounds, filtered by channel
  const fetchConversations = useCallback(async (b: MapBounds) => {
    setLoading(true);

    if (!navigator.onLine) {
      try {
        const cached = await getConversationsByChannel(channelId);
        setConversations(cached);
      } catch (err) {
        console.warn("Failed to read cached conversations:", err);
      }
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.rpc("conversations_in_bounds", {
      min_lng: b.min_lng,
      min_lat: b.min_lat,
      max_lng: b.max_lng,
      max_lat: b.max_lat,
      p_channel_id: channelId,
    });

    if (error) {
      console.error("Failed to fetch conversations:", error);
    } else {
      const convs = data as Conversation[];
      setConversations(convs);
      cacheConversations(convs);
    }
    setLoading(false);
  }, [channelId]);

  // Refetch when bounds change or when coming back online
  useEffect(() => {
    if (bounds) {
      fetchConversations(bounds);
    }
  }, [bounds, fetchConversations, isOnline]);

  // Subscribe to realtime conversation changes (INSERT + UPDATE), filtered by channel
  useEffect(() => {
    const realtimeChannel = supabase
      .channel(`map-conversations-${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversations",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          const newConv = payload.new as Conversation;
          setConversations((prev) => {
            if (prev.some((c) => c.id === newConv.id)) return prev;
            return [...prev, newConv];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          const updated = payload.new as Conversation;
          setConversations((prev) =>
            prev.map((c) => (c.id === updated.id ? updated : c))
          );
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          onToast?.("errors.connectionLost", "error");
        }
        if (status === "SUBSCRIBED") {
          // Refetch data on reconnect to catch up on missed events
          if (boundsRef.current) {
            fetchConversations(boundsRef.current);
          }
        }
      });

    channelRef.current = realtimeChannel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [channelId, fetchConversations, onToast]);

  return { conversations, loading };
}
