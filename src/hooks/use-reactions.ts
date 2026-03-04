"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  addPendingReaction,
  getPendingReactionsByStatus,
  deletePendingReaction,
  updatePendingReactionStatus,
} from "@/lib/offline-db";
import type { Reaction } from "@/types";
import type { RealtimeChannel } from "@supabase/supabase-js";

type ReactionType = "thumbs_up" | "thumbs_down";

export interface ReactionCounts {
  thumbs_up: number;
  thumbs_down: number;
}

export interface MessageReactionData {
  counts: ReactionCounts;
  userReaction: ReactionType | null;
}

export interface UseReactionsReturn {
  getReactionData: (messageId: string) => MessageReactionData;
  toggleReaction: (messageId: string, type: ReactionType) => void;
  getReactorNames: (messageId: string, type: ReactionType) => string[];
}

const EMPTY_DATA: MessageReactionData = {
  counts: { thumbs_up: 0, thumbs_down: 0 },
  userReaction: null,
};

export function useReactions(
  conversationId: string,
  sessionId: string,
  displayName: string
): UseReactionsReturn {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Fetch all reactions for this conversation
  const fetchReactions = useCallback(async () => {
    if (!conversationId) return;

    const { data, error } = await supabase
      .from("message_reactions")
      .select("*")
      .eq("conversation_id", conversationId);

    if (error) {
      console.error("Failed to fetch reactions:", error);
      return;
    }

    setReactions((data as Reaction[]) ?? []);
  }, [conversationId]);

  useEffect(() => {
    fetchReactions();
  }, [fetchReactions]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`reactions-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_reactions",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newReaction = payload.new as Reaction;
            setReactions((prev) => {
              if (prev.some((r) => r.id === newReaction.id)) return prev;
              return [...prev, newReaction];
            });
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as Reaction;
            setReactions((prev) =>
              prev.map((r) => (r.id === updated.id ? updated : r))
            );
          } else if (payload.eventType === "DELETE") {
            const deleted = payload.old as { id: string };
            setReactions((prev) => prev.filter((r) => r.id !== deleted.id));
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          fetchReactions();
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [conversationId, fetchReactions]);

  // Sync pending reactions on reconnect
  useEffect(() => {
    const syncPending = async () => {
      const pending = await getPendingReactionsByStatus("pending");
      for (const pr of pending) {
        if (pr.conversation_id !== conversationId) continue;
        await updatePendingReactionStatus(pr.id, "sending");

        if (pr.reaction_type === "remove") {
          const { error } = await supabase
            .from("message_reactions")
            .delete()
            .eq("message_id", pr.message_id)
            .eq("user_session_id", pr.user_session_id);

          if (error) {
            await updatePendingReactionStatus(pr.id, "failed");
          } else {
            await deletePendingReaction(pr.id);
          }
        } else {
          const { error } = await supabase.from("message_reactions").upsert(
            {
              message_id: pr.message_id,
              conversation_id: pr.conversation_id,
              user_session_id: pr.user_session_id,
              user_name: pr.user_name,
              reaction_type: pr.reaction_type,
            },
            { onConflict: "message_id,user_session_id" }
          );

          if (error) {
            await updatePendingReactionStatus(pr.id, "failed");
          } else {
            await deletePendingReaction(pr.id);
          }
        }
      }
    };

    const handleOnline = () => {
      syncPending();
    };

    window.addEventListener("online", handleOnline);
    if (navigator.onLine) syncPending();

    return () => window.removeEventListener("online", handleOnline);
  }, [conversationId]);

  const getReactionData = useCallback(
    (messageId: string): MessageReactionData => {
      const msgReactions = reactions.filter(
        (r) => r.message_id === messageId
      );
      if (msgReactions.length === 0) return EMPTY_DATA;

      const counts: ReactionCounts = { thumbs_up: 0, thumbs_down: 0 };
      let userReaction: ReactionType | null = null;

      for (const r of msgReactions) {
        counts[r.reaction_type]++;
        if (r.user_session_id === sessionId) {
          userReaction = r.reaction_type;
        }
      }

      return { counts, userReaction };
    },
    [reactions, sessionId]
  );

  const getReactorNames = useCallback(
    (messageId: string, type: ReactionType): string[] => {
      return reactions
        .filter((r) => r.message_id === messageId && r.reaction_type === type)
        .map((r) => r.user_name);
    },
    [reactions]
  );

  const toggleReaction = useCallback(
    (messageId: string, type: ReactionType) => {
      const existing = reactions.find(
        (r) => r.message_id === messageId && r.user_session_id === sessionId
      );

      if (existing && existing.reaction_type === type) {
        // Toggle off — remove reaction
        setReactions((prev) => prev.filter((r) => r.id !== existing.id));

        if (!navigator.onLine) {
          addPendingReaction({
            id: `${messageId}_${sessionId}`,
            message_id: messageId,
            conversation_id: conversationId,
            user_session_id: sessionId,
            user_name: displayName,
            reaction_type: "remove",
            status: "pending",
            cached_at: Date.now(),
          });
          return;
        }

        supabase
          .from("message_reactions")
          .delete()
          .eq("message_id", messageId)
          .eq("user_session_id", sessionId)
          .then(({ error }) => {
            if (error) {
              console.error("Failed to remove reaction:", error);
              // Re-add on failure
              setReactions((prev) => [...prev, existing]);
            }
          });
      } else if (existing) {
        // Switch reaction type
        const updated = { ...existing, reaction_type: type };
        setReactions((prev) =>
          prev.map((r) => (r.id === existing.id ? updated : r))
        );

        if (!navigator.onLine) {
          addPendingReaction({
            id: `${messageId}_${sessionId}`,
            message_id: messageId,
            conversation_id: conversationId,
            user_session_id: sessionId,
            user_name: displayName,
            reaction_type: type,
            status: "pending",
            cached_at: Date.now(),
          });
          return;
        }

        supabase
          .from("message_reactions")
          .update({ reaction_type: type })
          .eq("message_id", messageId)
          .eq("user_session_id", sessionId)
          .then(({ error }) => {
            if (error) {
              console.error("Failed to switch reaction:", error);
              setReactions((prev) =>
                prev.map((r) => (r.id === existing.id ? existing : r))
              );
            }
          });
      } else {
        // New reaction
        const optimistic: Reaction = {
          id: crypto.randomUUID(),
          message_id: messageId,
          conversation_id: conversationId,
          user_session_id: sessionId,
          user_name: displayName,
          reaction_type: type,
          created_at: new Date().toISOString(),
        };
        setReactions((prev) => [...prev, optimistic]);

        if (!navigator.onLine) {
          addPendingReaction({
            id: `${messageId}_${sessionId}`,
            message_id: messageId,
            conversation_id: conversationId,
            user_session_id: sessionId,
            user_name: displayName,
            reaction_type: type,
            status: "pending",
            cached_at: Date.now(),
          });
          return;
        }

        supabase
          .from("message_reactions")
          .upsert(
            {
              message_id: messageId,
              conversation_id: conversationId,
              user_session_id: sessionId,
              user_name: displayName,
              reaction_type: type,
            },
            { onConflict: "message_id,user_session_id" }
          )
          .then(({ error }) => {
            if (error) {
              console.error("Failed to add reaction:", error);
              setReactions((prev) =>
                prev.filter((r) => r.id !== optimistic.id)
              );
            }
          });
      }
    },
    [reactions, conversationId, sessionId, displayName]
  );

  return { getReactionData, toggleReaction, getReactorNames };
}
