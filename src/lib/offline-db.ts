import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Channel, Conversation, Message } from "@/types";

// --- Schema ---

export interface CachedChannel extends Channel {
  conversation_count: number;
  cached_at: number;
}

export interface CachedConversation extends Conversation {
  cached_at: number;
}

export interface CachedMessage extends Message {
  cached_at: number;
}

export interface PendingMessage {
  id: string;
  conversation_id: string;
  author_name: string;
  body: string;
  created_at: number;
  status: "pending" | "sending" | "failed";
}

export interface PendingReaction {
  id: string;
  message_id: string;
  conversation_id: string;
  user_session_id: string;
  user_name: string;
  reaction_type: "thumbs_up" | "thumbs_down" | "remove";
  status: "pending" | "sending" | "failed";
  cached_at: number;
}

interface GeoChatDB extends DBSchema {
  channels: {
    key: string;
    value: CachedChannel;
  };
  conversations: {
    key: string;
    value: CachedConversation;
    indexes: { channel_id: string };
  };
  messages: {
    key: string;
    value: CachedMessage;
    indexes: { conversation_id: string };
  };
  pending_messages: {
    key: string;
    value: PendingMessage;
    indexes: { conversation_id: string; status: string };
  };
  pending_reactions: {
    key: string;
    value: PendingReaction;
    indexes: { conversation_id: string; status: string };
  };
}

// --- Database singleton ---

const DB_NAME = "geochat-offline";
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<GeoChatDB>> | null = null;

function getDB(): Promise<IDBPDatabase<GeoChatDB>> {
  if (!dbPromise) {
    dbPromise = openDB<GeoChatDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore("channels", { keyPath: "id" });

          const convStore = db.createObjectStore("conversations", {
            keyPath: "id",
          });
          convStore.createIndex("channel_id", "channel_id");

          const msgStore = db.createObjectStore("messages", { keyPath: "id" });
          msgStore.createIndex("conversation_id", "conversation_id");

          const pendingStore = db.createObjectStore("pending_messages", {
            keyPath: "id",
          });
          pendingStore.createIndex("conversation_id", "conversation_id");
          pendingStore.createIndex("status", "status");
        }

        if (oldVersion < 2) {
          const prStore = db.createObjectStore("pending_reactions", {
            keyPath: "id",
          });
          prStore.createIndex("conversation_id", "conversation_id");
          prStore.createIndex("status", "status");
        }
      },
    });
  }
  return dbPromise;
}

// --- Channels ---

export async function putChannels(channels: CachedChannel[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("channels", "readwrite");
  await Promise.all([
    ...channels.map((ch) => tx.store.put(ch)),
    tx.done,
  ]);
}

export async function getAllChannels(): Promise<CachedChannel[]> {
  const db = await getDB();
  return db.getAll("channels");
}

// --- Conversations ---

export async function putConversations(
  conversations: CachedConversation[]
): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("conversations", "readwrite");
  await Promise.all([
    ...conversations.map((c) => tx.store.put(c)),
    tx.done,
  ]);
}

export async function getConversationsByChannel(
  channelId: string
): Promise<CachedConversation[]> {
  const db = await getDB();
  return db.getAllFromIndex("conversations", "channel_id", channelId);
}

// --- Messages ---

export async function putMessages(
  messages: CachedMessage[]
): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("messages", "readwrite");
  await Promise.all([
    ...messages.map((m) => tx.store.put(m)),
    tx.done,
  ]);
}

export async function getMessagesByConversation(
  conversationId: string
): Promise<CachedMessage[]> {
  const db = await getDB();
  return db.getAllFromIndex("messages", "conversation_id", conversationId);
}

// --- Pending Messages ---

export async function addPendingMessage(
  msg: PendingMessage
): Promise<void> {
  const db = await getDB();
  await db.put("pending_messages", msg);
}

export async function getPendingByConversation(
  conversationId: string
): Promise<PendingMessage[]> {
  const db = await getDB();
  return db.getAllFromIndex(
    "pending_messages",
    "conversation_id",
    conversationId
  );
}

export async function getPendingByStatus(
  status: PendingMessage["status"]
): Promise<PendingMessage[]> {
  const db = await getDB();
  return db.getAllFromIndex("pending_messages", "status", status);
}

export async function updatePendingStatus(
  id: string,
  status: PendingMessage["status"]
): Promise<void> {
  const db = await getDB();
  const msg = await db.get("pending_messages", id);
  if (msg) {
    msg.status = status;
    await db.put("pending_messages", msg);
  }
}

export async function deletePendingMessage(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("pending_messages", id);
}

// --- Pending Reactions ---

export async function addPendingReaction(
  reaction: PendingReaction
): Promise<void> {
  const db = await getDB();
  await db.put("pending_reactions", reaction);
}

export async function getPendingReactionsByStatus(
  status: PendingReaction["status"]
): Promise<PendingReaction[]> {
  const db = await getDB();
  return db.getAllFromIndex("pending_reactions", "status", status);
}

export async function deletePendingReaction(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("pending_reactions", id);
}

export async function updatePendingReactionStatus(
  id: string,
  status: PendingReaction["status"]
): Promise<void> {
  const db = await getDB();
  const reaction = await db.get("pending_reactions", id);
  if (reaction) {
    reaction.status = status;
    await db.put("pending_reactions", reaction);
  }
}

// --- Cleanup ---

export async function deleteStaleData(maxAgeDays: number = 30): Promise<void> {
  const db = await getDB();
  const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;

  const convTx = db.transaction("conversations", "readwrite");
  let convCursor = await convTx.store.openCursor();
  while (convCursor) {
    if (convCursor.value.cached_at < cutoff) {
      await convCursor.delete();
    }
    convCursor = await convCursor.continue();
  }
  await convTx.done;

  const msgTx = db.transaction("messages", "readwrite");
  let msgCursor = await msgTx.store.openCursor();
  while (msgCursor) {
    if (msgCursor.value.cached_at < cutoff) {
      await msgCursor.delete();
    }
    msgCursor = await msgCursor.continue();
  }
  await msgTx.done;
}
