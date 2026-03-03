"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  addPendingMessage,
  getPendingByConversation,
  getPendingByStatus,
  updatePendingStatus,
  deletePendingMessage,
  type PendingMessage,
} from "@/lib/offline-db";

export function usePendingMessages(
  conversationId: string,
  onToast?: (text: string, type: "error" | "info") => void
) {
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);
  const syncingRef = useRef(false);

  // Load pending messages for this conversation
  const loadPending = useCallback(async () => {
    try {
      const msgs = await getPendingByConversation(conversationId);
      msgs.sort((a, b) => a.created_at - b.created_at);
      setPendingMessages(msgs);
    } catch (err) {
      console.warn("Failed to load pending messages:", err);
    }
  }, [conversationId]);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  // Add a new pending message
  const addPending = useCallback(
    async (msg: PendingMessage) => {
      await addPendingMessage(msg);
      setPendingMessages((prev) => [...prev, msg]);
    },
    []
  );

  // Retry a failed message
  const retryMessage = useCallback(
    async (id: string) => {
      await updatePendingStatus(id, "pending");
      setPendingMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: "pending" as const } : m))
      );
      // Trigger sync
      syncPending();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Sync all pending messages to server
  const syncPending = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;

    try {
      const pending = await getPendingByStatus("pending");
      pending.sort((a, b) => a.created_at - b.created_at);

      for (const msg of pending) {
        await updatePendingStatus(msg.id, "sending");
        setPendingMessages((prev) =>
          prev.map((m) =>
            m.id === msg.id ? { ...m, status: "sending" as const } : m
          )
        );

        const { error } = await supabase.from("messages").insert({
          id: msg.id,
          conversation_id: msg.conversation_id,
          author_name: msg.author_name,
          body: msg.body,
        });

        if (error) {
          console.error("Failed to sync message:", error);
          await updatePendingStatus(msg.id, "failed");
          setPendingMessages((prev) =>
            prev.map((m) =>
              m.id === msg.id ? { ...m, status: "failed" as const } : m
            )
          );
        } else {
          await deletePendingMessage(msg.id);
          setPendingMessages((prev) => prev.filter((m) => m.id !== msg.id));
        }
      }

      if (pending.length > 0) {
        onToast?.("offline.syncComplete", "info");
      }
    } finally {
      syncingRef.current = false;
    }
  }, [onToast]);

  // Sync on reconnect
  useEffect(() => {
    const handleOnline = () => {
      syncPending();
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [syncPending]);

  return { pendingMessages, addPending, retryMessage, syncPending };
}
