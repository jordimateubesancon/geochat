import { useCallback, useEffect, useRef } from "react";
import { useMessages } from "@/hooks/use-messages";
import { useSendMessage } from "@/hooks/use-send-message";
import MessageList from "@/components/message-list";
import MessageInput from "@/components/message-input";
import type { Conversation } from "@/types";

function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return `${diffDay}d ago`;
}

interface ConversationPanelProps {
  conversation: Conversation;
  currentAuthor: string;
  onClose: () => void;
  onToast?: (text: string, type: "error" | "info") => void;
}

export default function ConversationPanel({
  conversation,
  currentAuthor,
  onClose,
  onToast,
}: ConversationPanelProps) {
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

  const { sendMessage } = useSendMessage({
    conversationId: conversation.id,
    authorName: currentAuthor,
    onOptimistic: addOptimisticMessage,
    onConfirm: confirmMessage,
    onFail: failMessage,
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
      aria-label="Conversation panel backdrop"
    >
      <div
        ref={panelRef}
        className="absolute bottom-0 right-0 top-0 flex w-full flex-col bg-white shadow-2xl md:max-w-md md:border-l md:border-neutral-200"
        role="dialog"
        aria-modal="true"
        aria-label={`Conversation: ${conversation.title}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-200 p-4">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold text-neutral-900">
              {conversation.title}
            </h2>
            <div className="mt-1 text-xs text-neutral-400">
              {conversation.latitude.toFixed(4)},{" "}
              {conversation.longitude.toFixed(4)}
            </div>
            <div className="mt-0.5 text-xs text-neutral-400">
              Started by {conversation.creator_name} ·{" "}
              {formatRelativeTime(conversation.created_at)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-2 rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
            aria-label="Close conversation panel"
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

        {/* Messages */}
        <MessageList
          messages={messages}
          loading={loading}
          loadingOlder={loadingOlder}
          hasOlder={hasOlder}
          currentAuthor={currentAuthor}
          onLoadOlder={loadOlderMessages}
        />

        {/* Input */}
        <MessageInput onSend={sendMessage} />
      </div>
    </div>
  );
}
