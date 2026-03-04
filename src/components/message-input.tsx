import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";

interface MessageInputProps {
  onSend: (body: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const t = useTranslations();
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
    <div className="flex gap-2 border-t border-stone-200 bg-stone-50 p-3">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t("messageInput.placeholder")}
        rows={1}
        className="flex-1 resize-none rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-geo-400 focus:outline-none focus:ring-1 focus:ring-geo-400"
        aria-label="Message input"
        disabled={disabled}
      />
      <button
        onClick={handleSend}
        disabled={!canSend}
        className="rounded-md bg-geo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-geo-600 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Send message"
      >
        {t("common.send")}
      </button>
    </div>
  );
}
