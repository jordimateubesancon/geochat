import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Conversation } from "@/types";

interface CreateConversationParams {
  lat: number;
  lng: number;
  title: string;
  body: string;
  creatorName: string;
}

interface UseCreateConversationReturn {
  nearbyConversations: Conversation[];
  loading: boolean;
  checkProximity: (lat: number, lng: number) => Promise<Conversation[]>;
  createConversation: (
    params: CreateConversationParams
  ) => Promise<Conversation | null>;
  clearNearby: () => void;
}

export function useCreateConversation(): UseCreateConversationReturn {
  const [nearbyConversations, setNearbyConversations] = useState<
    Conversation[]
  >([]);
  const [loading, setLoading] = useState(false);

  const checkProximity = useCallback(
    async (lat: number, lng: number): Promise<Conversation[]> => {
      setLoading(true);
      const { data, error } = await supabase.rpc("conversations_nearby", {
        lng,
        lat,
        radius_meters: 1000,
      });

      setLoading(false);

      if (error) {
        console.error("Failed to check nearby conversations:", error);
        return [];
      }

      const nearby = (data as Conversation[]) ?? [];
      setNearbyConversations(nearby);
      return nearby;
    },
    []
  );

  const createConversation = useCallback(
    async (
      params: CreateConversationParams
    ): Promise<Conversation | null> => {
      setLoading(true);

      const conversationId = crypto.randomUUID();
      const now = new Date().toISOString();

      const { data: convData, error: convError } = await supabase
        .from("conversations")
        .insert({
          id: conversationId,
          title: params.title,
          latitude: params.lat,
          longitude: params.lng,
          creator_name: params.creatorName,
          message_count: 1,
          last_message_at: now,
        })
        .select()
        .single();

      if (convError) {
        console.error("Failed to create conversation:", convError);
        setLoading(false);
        return null;
      }

      const { error: msgError } = await supabase.from("messages").insert({
        id: crypto.randomUUID(),
        conversation_id: conversationId,
        author_name: params.creatorName,
        body: params.body,
      });

      if (msgError) {
        console.error("Failed to create initial message:", msgError);
      }

      setLoading(false);
      return convData as Conversation;
    },
    []
  );

  const clearNearby = useCallback(() => {
    setNearbyConversations([]);
  }, []);

  return {
    nearbyConversations,
    loading,
    checkProximity,
    createConversation,
    clearNearby,
  };
}
