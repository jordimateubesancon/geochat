import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { addPendingMessage, type PendingMessage } from "@/lib/offline-db";
import type { Message } from "@/types";

interface UseSendMessageParams {
  conversationId: string;
  authorName: string;
  onOptimistic: (message: Message) => void;
  onConfirm: (id: string) => void;
  onFail: (id: string) => void;
  onPending?: (msg: PendingMessage) => void;
  onToast?: (text: string, type: "error" | "info") => void;
}

export function useSendMessage({
  conversationId,
  authorName,
  onOptimistic,
  onConfirm,
  onFail,
  onPending,
  onToast,
}: UseSendMessageParams) {
  const sendMessage = useCallback(
    async (body: string) => {
      const id = crypto.randomUUID();
      const now = Date.now();
      const optimisticMessage: Message = {
        id,
        conversation_id: conversationId,
        author_name: authorName,
        body,
        created_at: new Date(now).toISOString(),
      };

      // Add optimistic message immediately
      onOptimistic(optimisticMessage);

      // If offline, queue the message
      if (!navigator.onLine) {
        const pending: PendingMessage = {
          id,
          conversation_id: conversationId,
          author_name: authorName,
          body,
          created_at: now,
          status: "pending",
        };
        await addPendingMessage(pending);
        onPending?.(pending);
        onToast?.("offline.messagePending", "info");
        return;
      }

      const { error } = await supabase.from("messages").insert({
        id,
        conversation_id: conversationId,
        author_name: authorName,
        body,
      });

      if (error) {
        console.error("Failed to send message:", error);
        // Network error — fall back to pending queue
        if (error.message?.includes("fetch") || error.message?.includes("network")) {
          const pending: PendingMessage = {
            id,
            conversation_id: conversationId,
            author_name: authorName,
            body,
            created_at: now,
            status: "pending",
          };
          await addPendingMessage(pending);
          onPending?.(pending);
          onToast?.("offline.messagePending", "info");
        } else {
          onFail(id);
          onToast?.("errors.sendFailed", "error");
        }
      } else {
        onConfirm(id);
      }
    },
    [conversationId, authorName, onOptimistic, onConfirm, onFail, onPending, onToast]
  );

  return { sendMessage };
}
