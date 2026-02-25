import { useCallback, useState } from "react";

interface MessageInputProps {
  onSend: (body: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [value, setValue] = useState("");

  const trimmed = value.trim();
  const canSend = trimmed.length > 0 && !disabled;

  const handleSend = useCallback(() => {
    if (!canSend) return;
    onSend(trimmed);
    setValue("");
  }, [canSend, trimmed, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="flex gap-2 border-t border-neutral-200 bg-neutral-50 p-3">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        rows={1}
        className="flex-1 resize-none rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        aria-label="Message input"
        disabled={disabled}
      />
      <button
        onClick={handleSend}
        disabled={!canSend}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Send message"
      >
        Send
      </button>
    </div>
  );
}
