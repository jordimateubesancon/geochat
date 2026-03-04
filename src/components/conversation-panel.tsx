import { useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useMessages } from "@/hooks/use-messages";
import { useSendMessage } from "@/hooks/use-send-message";
import { usePendingMessages } from "@/hooks/use-pending-messages";
import { useReactions } from "@/hooks/use-reactions";
import { useUserSession } from "@/hooks/use-user-session";
import MessageList from "@/components/message-list";
import MessageInput from "@/components/message-input";
import ShareButton from "@/components/share-button";
import type { Conversation } from "@/types";

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

interface ConversationPanelProps {
  conversation: Conversation;
  currentAuthor: string;
  channelSlug: string;
  onClose: () => void;
  onToast?: (text: string, type: "error" | "info") => void;
}

export default function ConversationPanel({
  conversation,
  currentAuthor,
  channelSlug,
  onClose,
  onToast,
}: ConversationPanelProps) {
  const t = useTranslations();
  const formatRelativeTime = useFormatRelativeTime();
  const panelRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    loading,
    loadingOlder,
    hasOlder,
    loadOlderMessages,
    addOptimisticMessage,
    confirmMessage,
    failMessage,
  } = useMessages(conversation.id, onToast);

  const { sessionId, displayName } = useUserSession();
  const reactions = useReactions(conversation.id, sessionId, displayName);

  const { pendingMessages, addPending, retryMessage } = usePendingMessages(
    conversation.id,
    onToast
  );

  const { sendMessage } = useSendMessage({
    conversationId: conversation.id,
    authorName: currentAuthor,
    onOptimistic: addOptimisticMessage,
    onConfirm: confirmMessage,
    onFail: failMessage,
    onPending: addPending,
    onToast,
  });

  // Click outside panel to close (FR-017)
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Focus trap + Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, textarea, input, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Focus panel on mount
  useEffect(() => {
    if (panelRef.current) {
      const firstFocusable =
        panelRef.current.querySelector<HTMLElement>("button");
      firstFocusable?.focus();
    }
  }, []);

  return (
    <div
      className="fixed inset-0 z-[1500]"
      onClick={handleBackdropClick}
      aria-label={t("conversationPanel.backdropAriaLabel")}
    >
      <div
        ref={panelRef}
        className="absolute bottom-0 right-0 top-0 flex w-full flex-col bg-white shadow-2xl md:max-w-md md:border-l md:border-stone-200"
        role="dialog"
        aria-modal="true"
        aria-label={t("conversationPanel.ariaLabel", { title: conversation.title })}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-200 p-4">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold text-stone-900">
              {conversation.title}
            </h2>
            <div className="mt-1 text-xs text-stone-400">
              {conversation.latitude.toFixed(4)},{" "}
              {conversation.longitude.toFixed(4)}
            </div>
            <div className="mt-0.5 text-xs text-stone-400">
              {t("conversationPanel.startedBy", { name: conversation.creator_name, time: formatRelativeTime(conversation.created_at) })}
            </div>
          </div>
          <div className="ml-2 flex items-center gap-1">
            <ShareButton
              conversationId={conversation.id}
              title={conversation.title}
              latitude={conversation.latitude}
              longitude={conversation.longitude}
              channelSlug={channelSlug}
              onToast={onToast}
            />
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800"
            aria-label={t("conversationPanel.closeAriaLabel")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          </div>
        </div>

        {/* Messages */}
        <MessageList
          messages={messages}
          loading={loading}
          loadingOlder={loadingOlder}
          hasOlder={hasOlder}
          currentAuthor={currentAuthor}
          conversationId={conversation.id}
          onLoadOlder={loadOlderMessages}
          pendingMessages={pendingMessages}
          onRetryMessage={retryMessage}
          reactions={reactions}
          onToast={onToast}
        />

        {/* Input */}
        <MessageInput onSend={sendMessage} />
      </div>
    </div>
  );
}
