import { useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import type { Message } from "@/types";
import type { PendingMessage } from "@/lib/offline-db";
import LinkifiedText from "@/components/linkified-text";
import ReactionButtons from "@/components/reaction-buttons";
import PinnedMessages from "@/components/pinned-messages";
import { useAccessibility } from "@/hooks/use-accessibility";
import { usePins } from "@/hooks/use-pins";
import type { UseReactionsReturn } from "@/hooks/use-reactions";

function useFormatRelativeTime() {
  const t = useTranslations();
  return (dateString: string): string => {
    const now = Date.now();
    const then = new Date(dateString).getTime();
    const diffMs = now - then;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return t("time.justNow");
    if (diffMin < 60) return t("time.minutesAgo", { count: diffMin });
    if (diffHour < 24) return t("time.hoursAgo", { count: diffHour });
    return t("time.daysAgo", { count: diffDay });
  };
}

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  loadingOlder: boolean;
  hasOlder: boolean;
  currentAuthor: string;
  conversationId: string;
  onLoadOlder: () => void;
  pendingMessages?: PendingMessage[];
  onRetryMessage?: (id: string) => void;
  reactions?: UseReactionsReturn;
  onToast?: (text: string, type: "error" | "info") => void;
}

export default function MessageList({
  messages,
  loading,
  loadingOlder,
  hasOlder,
  currentAuthor,
  conversationId,
  onLoadOlder,
  pendingMessages = [],
  onRetryMessage,
  reactions,
  onToast,
}: MessageListProps) {
  const t = useTranslations();
  const formatRelativeTime = useFormatRelativeTime();
  const { preferences } = useAccessibility();
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const prevMessageCountRef = useRef(0);
  const isNearBottomRef = useRef(true);

  const { pins, pinMessage, unpinMessage, isPinned, pinCount, cleanupDeletedPins } = usePins(conversationId);

  // Cleanup deleted pins when messages change
  const messageIds = useMemo(() => new Set(messages.map((m) => m.id)), [messages]);
  useEffect(() => {
    if (messages.length > 0) {
      cleanupDeletedPins(conversationId, messageIds);
    }
  }, [conversationId, messageIds, cleanupDeletedPins, messages.length]);

  const scrollToMessage = useCallback(
    (messageId: string) => {
      const el = messageRefs.current.get(messageId);
      if (el) {
        el.scrollIntoView({ behavior: preferences.reducedMotion ? "auto" : "smooth", block: "center" });
        el.classList.add("ring-2", "ring-amber-400");
        setTimeout(() => el.classList.remove("ring-2", "ring-amber-400"), 2000);
      }
    },
    [preferences.reducedMotion]
  );

  const handlePin = useCallback(
    (msg: Message) => {
      if (isPinned(msg.id)) {
        unpinMessage(conversationId, msg.id);
      } else {
        const success = pinMessage(conversationId, msg);
        if (!success) {
          onToast?.(t("pins.maxReached"), "info");
        }
      }
    },
    [conversationId, isPinned, pinMessage, unpinMessage, onToast, t]
  );

  // Track if user is near the bottom of the scroll
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const threshold = 100;
    isNearBottomRef.current =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      threshold;

    // Load older when scrolled to top
    if (container.scrollTop === 0 && hasOlder && !loadingOlder) {
      onLoadOlder();
    }
  }, [hasOlder, loadingOlder, onLoadOlder]);

  // Auto-scroll to bottom on new messages (only if user was near bottom)
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      const addedAtBottom =
        messages.length > 0 &&
        prevMessageCountRef.current > 0 &&
        messages[messages.length - 1]?.id !==
          messages[prevMessageCountRef.current - 1]?.id;

      if (isNearBottomRef.current || addedAtBottom || loading) {
        bottomRef.current?.scrollIntoView({ behavior: preferences.reducedMotion ? "auto" : "smooth" });
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, loading, preferences.reducedMotion]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!loading && messages.length > 0) {
      bottomRef.current?.scrollIntoView();
    }
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-stone-400">
        {t("messageList.loading")}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-stone-400">
        {t("messageList.empty")}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Pinned messages section */}
      <PinnedMessages
        pins={pins}
        pinCount={pinCount}
        onUnpin={(messageId) => unpinMessage(conversationId, messageId)}
        onScrollToMessage={scrollToMessage}
      />

      {/* Scrollable message area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4"
        role="log"
        aria-label={t("messageList.ariaLabel")}
      >
        {loadingOlder && (
          <div className="mb-3 text-center text-xs text-stone-400">
            {t("messageList.loadingOlder")}
          </div>
        )}

        {!hasOlder && messages.length > 0 && (
          <div className="mb-3 text-center text-xs text-stone-400">
            {t("messageList.beginning")}
          </div>
        )}

        <div className="space-y-3">
          {messages.map((msg) => {
            const isOwn = msg.author_name === currentAuthor;
            const reactionData = reactions?.getReactionData(msg.id);
            const pinned = isPinned(msg.id);
            return (
              <div
                key={msg.id}
                ref={(el) => {
                  if (el) messageRefs.current.set(msg.id, el);
                  else messageRefs.current.delete(msg.id);
                }}
                className={`group flex flex-col transition-shadow ${isOwn ? "items-end" : "items-start"}`}
              >
                <div
                  className={`relative max-w-[80%] rounded-lg px-3 py-2 ${
                    isOwn
                      ? "bg-geo-700 text-white"
                      : "bg-stone-100 text-stone-900"
                  }`}
                >
                  {/* Pin button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePin(msg);
                    }}
                    aria-label={pinned ? t("pins.unpin") : t("pins.pin")}
                    className={`absolute -top-1 ${isOwn ? "-left-6" : "-right-6"} rounded p-0.5 transition-opacity ${
                      pinned
                        ? "text-amber-500 opacity-100"
                        : "text-stone-400 opacity-0 hover:text-stone-600 group-hover:opacity-100"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill={pinned ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="12" y1="17" x2="12" y2="22" />
                      <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
                    </svg>
                  </button>

                  {!isOwn && (
                    <div className="mb-0.5 text-xs font-semibold text-stone-600">
                      {msg.author_name}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap break-words text-sm">
                    <LinkifiedText text={msg.body} variant={isOwn ? "own" : "other"} />
                  </div>
                  <div
                    className={`mt-1 text-xs ${
                      isOwn ? "text-geo-200" : "text-stone-500"
                    }`}
                  >
                    {formatRelativeTime(msg.created_at)}
                  </div>
                </div>
                {reactions && reactionData && (
                  <ReactionButtons
                    reactionData={reactionData}
                    onToggle={(type) => reactions.toggleReaction(msg.id, type)}
                    isOwn={isOwn}
                    getReactorNames={(type) => reactions.getReactorNames(msg.id, type)}
                  />
                )}
              </div>
            );
          })}

          {pendingMessages
            .filter((pm) => !messages.some((m) => m.id === pm.id))
            .map((pm) => (
              <div key={pm.id} className="flex justify-end">
                <div className="max-w-[80%] rounded-lg bg-geo-700/60 px-3 py-2 text-white">
                  <div className="whitespace-pre-wrap break-words text-sm">
                    <LinkifiedText text={pm.body} variant="own" />
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-geo-200">
                    {pm.status === "pending" && (
                      <>
                        <span className="inline-block h-3 w-3">&#9201;</span>
                        {t("offline.messagePending")}
                      </>
                    )}
                    {pm.status === "sending" && (
                      <>
                        <span className="inline-block h-3 w-3 animate-spin">&#8635;</span>
                        {t("offline.messagePending")}
                      </>
                    )}
                    {pm.status === "failed" && (
                      <>
                        <span className="text-red-300">{t("offline.messageFailed")}</span>
                        {onRetryMessage && (
                          <button
                            onClick={() => onRetryMessage(pm.id)}
                            className="ml-1 underline text-red-200 hover:text-white"
                          >
                            {t("offline.messageRetry")}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
