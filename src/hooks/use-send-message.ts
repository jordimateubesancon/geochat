import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Message } from "@/types";

interface UseSendMessageParams {
  conversationId: string;
  authorName: string;
  onOptimistic: (message: Message) => void;
  onConfirm: (id: string) => void;
  onFail: (id: string) => void;
  onToast?: (text: string, type: "error" | "info") => void;
}

export function useSendMessage({
  conversationId,
  authorName,
  onOptimistic,
  onConfirm,
  onFail,
  onToast,
}: UseSendMessageParams) {
  const sendMessage = useCallback(
    async (body: string) => {
      const id = crypto.randomUUID();
      const optimisticMessage: Message = {
        id,
        conversation_id: conversationId,
        author_name: authorName,
        body,
        created_at: new Date().toISOString(),
      };

      // Add optimistic message immediately
      onOptimistic(optimisticMessage);

      const { error } = await supabase.from("messages").insert({
        id,
        conversation_id: conversationId,
        author_name: authorName,
        body,
      });

      if (error) {
        console.error("Failed to send message:", error);
        onFail(id);
        onToast?.("Failed to send message. Please try again.", "error");
      } else {
        onConfirm(id);
      }
    },
    [conversationId, authorName, onOptimistic, onConfirm, onFail, onToast]
  );

  return { sendMessage };
}
