"use client";

import { useEffect, useRef } from "react";

interface ToolboxProps {
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export default function Toolbox({ open, onToggle, children }: ToolboxProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus management: auto-focus first input when opening
  useEffect(() => {
    if (open) {
      const firstInput = panelRef.current?.querySelector<HTMLElement>(
        "input, button, [tabindex]"
      );
      firstInput?.focus();
    }
  }, [open]);

  return (
    <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-[1600]">
      {/* Panel */}
      <div
        ref={panelRef}
        role="region"
        aria-label="Map tools"
        className={`pointer-events-auto absolute left-0 top-0 bottom-0 w-full bg-white/95 shadow-lg backdrop-blur-sm transition-transform duration-200 ease-in-out sm:w-72 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto px-4 pt-4 pb-4">
          {/* Panel header with close button */}
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900">Tools</h2>
            <button
              onClick={onToggle}
              aria-label="Close map tools"
              className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
