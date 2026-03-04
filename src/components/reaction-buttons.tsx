"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import ReactionPopover from "@/components/reaction-popover";
import type { MessageReactionData } from "@/hooks/use-reactions";

type ReactionType = "thumbs_up" | "thumbs_down";

interface ReactionButtonsProps {
  reactionData: MessageReactionData;
  onToggle: (type: ReactionType) => void;
  isOwn: boolean;
  getReactorNames?: (type: ReactionType) => string[];
}

export default function ReactionButtons({
  reactionData,
  onToggle,
  isOwn,
  getReactorNames,
}: ReactionButtonsProps) {
  const t = useTranslations();
  const { counts, userReaction } = reactionData;
  const hasAny = counts.thumbs_up > 0 || counts.thumbs_down > 0 || userReaction !== null;
  const [popoverType, setPopoverType] = useState<ReactionType | null>(null);

  const handleCountClick = useCallback(
    (type: ReactionType) => {
      if (!getReactorNames) return;
      setPopoverType((prev) => (prev === type ? null : type));
    },
    [getReactorNames]
  );

  return (
    <div
      className={`relative flex items-center gap-1 ${
        hasAny ? "mt-1" : "mt-0.5 opacity-0 transition-opacity group-hover:opacity-100"
      } ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle("thumbs_up");
        }}
        aria-label={t("reactions.thumbsUp")}
        className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs transition-colors ${
          userReaction === "thumbs_up"
            ? "bg-geo-100 text-geo-600"
            : "bg-stone-100 text-stone-500 hover:bg-stone-200"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill={userReaction === "thumbs_up" ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M7 10v12" />
          <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
        </svg>
        {counts.thumbs_up > 0 && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              handleCountClick("thumbs_up");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.stopPropagation();
                handleCountClick("thumbs_up");
              }
            }}
            className="cursor-pointer"
          >
            {counts.thumbs_up}
          </span>
        )}
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle("thumbs_down");
        }}
        aria-label={t("reactions.thumbsDown")}
        className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs transition-colors ${
          userReaction === "thumbs_down"
            ? "bg-red-100 text-red-600"
            : "bg-stone-100 text-stone-500 hover:bg-stone-200"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill={userReaction === "thumbs_down" ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M17 14V2" />
          <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
        </svg>
        {counts.thumbs_down > 0 && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              handleCountClick("thumbs_down");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.stopPropagation();
                handleCountClick("thumbs_down");
              }
            }}
            className="cursor-pointer"
          >
            {counts.thumbs_down}
          </span>
        )}
      </button>

      {popoverType && getReactorNames && (
        <ReactionPopover
          names={getReactorNames(popoverType)}
          onClose={() => setPopoverType(null)}
        />
      )}
    </div>
  );
}
