"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

interface ReactionPopoverProps {
  names: string[];
  onClose: () => void;
}

export default function ReactionPopover({ names, onClose }: ReactionPopoverProps) {
  const t = useTranslations();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const visible = names.slice(0, 10);
  const remaining = names.length - visible.length;

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 z-10 mb-1 rounded-lg bg-white px-3 py-2 text-xs shadow-lg ring-1 ring-neutral-200"
      role="tooltip"
    >
      <div className="mb-1 font-semibold text-neutral-700">
        {t("reactions.reactorsTitle")}
      </div>
      <div className="space-y-0.5">
        {visible.map((name) => (
          <div key={name} className="text-neutral-600">
            {name}
          </div>
        ))}
        {remaining > 0 && (
          <div className="text-neutral-400">
            {t("reactions.andMore", { count: remaining })}
          </div>
        )}
      </div>
    </div>
  );
}
