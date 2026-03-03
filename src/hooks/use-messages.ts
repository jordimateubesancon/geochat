import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { cacheMessages } from "@/hooks/use-offline-cache";
import { getMessagesByConversation } from "@/lib/offline-db";
import type { Message } from "@/types";
import type { RealtimeChannel } from "@supabase/supabase-js";

const PAGE_SIZE = 50;

interface UseMessagesReturn {
  messages: Message[];
  loading: boolean;
  loadingOlder: boolean;
  hasOlder: boolean;
  loadOlderMessages: () => Promise<void>;
  addOptimisticMessage: (message: Message) => void;
  confirmMessage: (id: string) => void;
  failMessage: (id: string) => void;
}

export function useMessages(
  conversationId: string,
  onToast?: (text: string, type: "error" | "info") => void
): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasOlder, setHasOlder] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const optimisticIdsRef = useRef<Set<string>>(new Set());

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setMessages([]);
    setHasOlder(true);
    optimisticIdsRef.current.clear();

    if (!navigator.onLine) {
      try {
        const cached = await getMessagesByConversation(conversationId);
        cached.sort(
          (a, b) =>
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
        );
        setMessages(cached);
        setHasOlder(false);
      } catch (err) {
        console.warn("Failed to read cached messages:", err);
      }
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.rpc(
      "messages_for_conversation",
      {
        conv_id: conversationId,
        page_size: PAGE_SIZE,
      }
    );

    if (error) {
      console.error("Failed to fetch messages:", error);
    } else {
      const msgs = (data as Message[]) ?? [];
      // RPC returns DESC order, reverse to chronological (oldest first)
      msgs.reverse();
      setMessages(msgs);
      setHasOlder(msgs.length >= PAGE_SIZE);
      cacheMessages(msgs);
    }
    setLoading(false);
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Load older messages (cursor-based pagination)
  const loadOlderMessages = useCallback(async () => {
    if (loadingOlder || !hasOlder || messages.length === 0) return;

    setLoadingOlder(true);

    const oldestMessage = messages[0];
    const { data, error } = await supabase.rpc(
      "messages_for_conversation",
      {
        conv_id: conversationId,
        page_size: PAGE_SIZE,
        before_timestamp: oldestMessage.created_at,
      }
    );

    if (error) {
      console.error("Failed to fetch older messages:", error);
    } else {
      const olderMsgs = (data as Message[]) ?? [];
      olderMsgs.reverse();
      setMessages((prev) => [...olderMsgs, ...prev]);
      setHasOlder(olderMsgs.length >= PAGE_SIZE);
    }

    setLoadingOlder(false);
  }, [conversationId, loadingOlder, hasOlder, messages]);

  // Subscribe to realtime message inserts
  useEffect(() => {
    const channel = supabase
      .channel(`conv-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            // Deduplicate against optimistic messages
            if (optimisticIdsRef.current.has(newMsg.id)) {
              optimisticIdsRef.current.delete(newMsg.id);
              return prev.map((m) => (m.id === newMsg.id ? newMsg : m));
            }
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          onToast?.("errors.messageConnectionLost", "error");
        }
        if (status === "SUBSCRIBED") {
          // Refetch on reconnect to catch up on missed messages
          fetchMessages();
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [conversationId, fetchMessages, onToast]);

  // Add an optimistic message (called by useSendMessage)
  const addOptimisticMessage = useCallback((message: Message) => {
    optimisticIdsRef.current.add(message.id);
    setMessages((prev) => [...prev, message]);
  }, []);

  // Mark optimistic message as confirmed
  const confirmMessage = useCallback((id: string) => {
    optimisticIdsRef.current.delete(id);
  }, []);

  // Mark optimistic message as failed (remove from list)
  const failMessage = useCallback((id: string) => {
    optimisticIdsRef.current.delete(id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return {
    messages,
    loading,
    loadingOlder,
    hasOlder,
    loadOlderMessages,
    addOptimisticMessage,
    confirmMessage,
    failMessage,
  };
}
