import { useCallback, useEffect, useState } from "react";

export interface ToastMessage {
  id: string;
  text: string;
  type: "error" | "info";
}

const TOAST_DURATION = 5000;

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div
      className="pointer-events-none fixed bottom-16 left-0 right-0 z-[3000] flex flex-col items-center gap-2 px-4"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm shadow-lg ${
            toast.type === "error"
              ? "border border-red-200 bg-red-50/90 text-red-800"
              : "border border-neutral-200 bg-white/90 text-neutral-800"
          }`}
          role="alert"
        >
          <span>{toast.text}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="ml-1 text-xs opacity-60 transition-opacity hover:opacity-100"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

export function useToasts() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string, type: "error" | "info" = "info") => {
    const id = crypto.randomUUID();
    setToasts((prev) => {
      // Deduplicate: don't add if same text is already showing
      if (prev.some((t) => t.text === text)) return prev;
      return [...prev, { id, text, type }];
    });
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Auto-dismiss after TOAST_DURATION
  useEffect(() => {
    if (toasts.length === 0) return;

    const oldest = toasts[0];
    const timer = setTimeout(() => {
      dismissToast(oldest.id);
    }, TOAST_DURATION);

    return () => clearTimeout(timer);
  }, [toasts, dismissToast]);

  return { toasts, addToast, dismissToast };
}
