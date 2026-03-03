import { useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import type { Message } from "@/types";

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
  onLoadOlder: () => void;
}

export default function MessageList({
  messages,
  loading,
  loadingOlder,
  hasOlder,
  currentAuthor,
  onLoadOlder,
}: MessageListProps) {
  const t = useTranslations();
  const formatRelativeTime = useFormatRelativeTime();
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);
  const isNearBottomRef = useRef(true);

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
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, loading]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!loading && messages.length > 0) {
      bottomRef.current?.scrollIntoView();
    }
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-neutral-400">
        {t("messageList.loading")}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-neutral-400">
        {t("messageList.empty")}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4"
      role="log"
      aria-label={t("messageList.ariaLabel")}
    >
      {loadingOlder && (
        <div className="mb-3 text-center text-xs text-neutral-400">
          {t("messageList.loadingOlder")}
        </div>
      )}

      {!hasOlder && messages.length > 0 && (
        <div className="mb-3 text-center text-xs text-neutral-400">
          {t("messageList.beginning")}
        </div>
      )}

      <div className="space-y-3">
        {messages.map((msg) => {
          const isOwn = msg.author_name === currentAuthor;
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  isOwn
                    ? "bg-blue-500 text-white"
                    : "bg-neutral-100 text-neutral-900"
                }`}
              >
                {!isOwn && (
                  <div className="mb-0.5 text-xs font-semibold text-neutral-600">
                    {msg.author_name}
                  </div>
                )}
                <div className="whitespace-pre-wrap break-words text-sm">
                  {msg.body}
                </div>
                <div
                  className={`mt-1 text-xs ${
                    isOwn ? "text-blue-100" : "text-neutral-500"
                  }`}
                >
                  {formatRelativeTime(msg.created_at)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div ref={bottomRef} />
    </div>
  );
}
