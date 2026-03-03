"use client";

import {
  putChannels,
  putConversations,
  putMessages,
  type CachedChannel,
  type CachedConversation,
  type CachedMessage,
} from "@/lib/offline-db";
import type { Channel, Conversation, Message } from "@/types";

const now = () => Date.now();

export function cacheChannels(
  channels: (Channel & { conversationCount: number })[]
): void {
  const cached: CachedChannel[] = channels.map((ch) => ({
    ...ch,
    conversation_count: ch.conversationCount,
    cached_at: now(),
  }));
  putChannels(cached).catch((err) =>
    console.warn("Failed to cache channels:", err)
  );
}

export function cacheConversations(conversations: Conversation[]): void {
  const cached: CachedConversation[] = conversations.map((c) => ({
    ...c,
    cached_at: now(),
  }));
  putConversations(cached).catch((err) =>
    console.warn("Failed to cache conversations:", err)
  );
}

export function cacheMessages(messages: Message[]): void {
  const cached: CachedMessage[] = messages.map((m) => ({
    ...m,
    cached_at: now(),
  }));
  putMessages(cached).catch((err) =>
    console.warn("Failed to cache messages:", err)
  );
}
