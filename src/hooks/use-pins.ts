"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Message } from "@/types";
import type { PinnedMessage } from "@/types";

const STORAGE_KEY = "geochat_pins";
const MAX_PINS = 3;

interface PinsMap {
  [conversationId: string]: {
    [messageId: string]: PinnedMessage;
  };
}

interface UsePinsReturn {
  pins: PinnedMessage[];
  pinMessage: (conversationId: string, message: Message) => boolean;
  unpinMessage: (conversationId: string, messageId: string) => void;
  isPinned: (messageId: string) => boolean;
  pinCount: number;
  cleanupDeletedPins: (conversationId: string, messageIds: Set<string>) => void;
}

function loadPins(): PinsMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PinsMap) : {};
  } catch {
    return {};
  }
}

function savePins(pins: PinsMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pins));
  } catch {
    // localStorage full or unavailable
  }
}

export function usePins(conversationId: string): UsePinsReturn {
  const [allPins, setAllPins] = useState<PinsMap>(loadPins);

  // Reload from storage on mount (in case another tab changed it)
  useEffect(() => {
    setAllPins(loadPins());
  }, [conversationId]);

  const convPins = useMemo(() => allPins[conversationId] ?? {}, [allPins, conversationId]);
  const pins = Object.values(convPins).sort(
    (a, b) => new Date(a.pinned_at).getTime() - new Date(b.pinned_at).getTime()
  );

  const pinMessage = useCallback(
    (convId: string, message: Message): boolean => {
      setAllPins((prev) => {
        const existing = prev[convId] ?? {};
        if (Object.keys(existing).length >= MAX_PINS) return prev;
        if (existing[message.id]) return prev;

        const pinned: PinnedMessage = {
          id: message.id,
          author_name: message.author_name,
          body: message.body.slice(0, 100),
          created_at: message.created_at,
          pinned_at: new Date().toISOString(),
        };

        const updated = {
          ...prev,
          [convId]: { ...existing, [message.id]: pinned },
        };
        savePins(updated);
        return updated;
      });

      // Return false if at limit
      const current = allPins[convId] ?? {};
      return Object.keys(current).length < MAX_PINS;
    },
    [allPins]
  );

  const unpinMessage = useCallback(
    (convId: string, messageId: string) => {
      setAllPins((prev) => {
        const existing = prev[convId];
        if (!existing || !existing[messageId]) return prev;

        const { [messageId]: _, ...rest } = existing;
        void _;
        const updated = { ...prev, [convId]: rest };
        if (Object.keys(rest).length === 0) {
          delete updated[convId];
        }
        savePins(updated);
        return updated;
      });
    },
    []
  );

  const isPinned = useCallback(
    (messageId: string): boolean => {
      return !!convPins[messageId];
    },
    [convPins]
  );

  const cleanupDeletedPins = useCallback(
    (convId: string, messageIds: Set<string>) => {
      setAllPins((prev) => {
        const existing = prev[convId];
        if (!existing) return prev;

        let changed = false;
        const cleaned = { ...existing };
        for (const pinId of Object.keys(cleaned)) {
          if (!messageIds.has(pinId)) {
            delete cleaned[pinId];
            changed = true;
          }
        }

        if (!changed) return prev;
        const updated = { ...prev, [convId]: cleaned };
        savePins(updated);
        return updated;
      });
    },
    []
  );

  return {
    pins,
    pinMessage,
    unpinMessage,
    isPinned,
    pinCount: pins.length,
    cleanupDeletedPins,
  };
}
