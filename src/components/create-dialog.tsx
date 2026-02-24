import { useCallback, useEffect, useRef, useState } from "react";

const TITLE_MAX = 120;
const BODY_MAX = 2000;

interface CreateDialogProps {
  lat: number;
  lng: number;
  loading: boolean;
  onSubmit: (title: string, body: string) => void;
  onCancel: () => void;
}

export default function CreateDialog({
  lat,
  lng,
  loading,
  onSubmit,
  onCancel,
}: CreateDialogProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const titleTrimmed = title.trim();
  const bodyTrimmed = body.trim();
  const isValid =
    titleTrimmed.length > 0 &&
    titleTrimmed.length <= TITLE_MAX &&
    bodyTrimmed.length > 0 &&
    bodyTrimmed.length <= BODY_MAX;

  const handleSubmit = useCallback(() => {
    if (!isValid || loading) return;
    onSubmit(titleTrimmed, bodyTrimmed);
  }, [isValid, loading, titleTrimmed, bodyTrimmed, onSubmit]);

  // Focus trap + Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'input, textarea, button, [tabindex]:not([tabindex="-1"])'
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
  }, [onCancel]);

  // Auto-focus title input on mount
  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  // Enter in message textarea submits (FR-018)
  const handleBodyKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-label="Create a new conversation"
    >
      <div
        ref={dialogRef}
        className="mx-3 w-full max-w-md rounded-lg bg-neutral-800 p-4 shadow-xl sm:mx-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-neutral-100">
          New Conversation
        </h2>

        <div className="mb-3 rounded-md bg-neutral-700/50 px-3 py-2 text-xs text-neutral-400">
          Location: {lat.toFixed(4)}, {lng.toFixed(4)}
        </div>

        <div className="mb-3">
          <label
            htmlFor="conv-title"
            className="mb-1 block text-sm font-medium text-neutral-300"
          >
            Title
          </label>
          <input
            ref={titleInputRef}
            id="conv-title"
            type="text"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value.slice(0, TITLE_MAX))
            }
            placeholder="What's this conversation about?"
            className="w-full rounded-md border border-neutral-600 bg-neutral-700 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            aria-label="Conversation title"
          />
          <div className="mt-1 text-right text-xs text-neutral-500">
            {title.length}/{TITLE_MAX}
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="conv-body"
            className="mb-1 block text-sm font-medium text-neutral-300"
          >
            First message
          </label>
          <textarea
            id="conv-body"
            value={body}
            onChange={(e) =>
              setBody(e.target.value.slice(0, BODY_MAX))
            }
            onKeyDown={handleBodyKeyDown}
            placeholder="Start the conversation..."
            rows={3}
            className="w-full resize-none rounded-md border border-neutral-600 bg-neutral-700 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            aria-label="First message"
          />
          <div className="mt-1 text-right text-xs text-neutral-500">
            {body.length}/{BODY_MAX}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
          <button
            className="flex-1 rounded-md bg-neutral-700 px-4 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-600"
            onClick={onCancel}
            aria-label="Cancel creating conversation"
          >
            Cancel
          </button>
          <button
            className="flex-1 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleSubmit}
            disabled={!isValid || loading}
            aria-label="Create conversation"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
