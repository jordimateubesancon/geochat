"use client";

import { useState } from "react";
import { parseLinks } from "@/lib/linkify";
import LinkConfirmationDialog from "@/components/link-confirmation-dialog";

interface LinkifiedTextProps {
  text: string;
  variant: "own" | "other";
}

export default function LinkifiedText({ text, variant }: LinkifiedTextProps) {
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const segments = parseLinks(text);

  const linkClass =
    variant === "own"
      ? "underline text-white hover:text-blue-100"
      : "underline text-blue-600 hover:text-blue-800";

  return (
    <>
      {segments.map((segment, i) =>
        segment.type === "text" ? (
          <span key={i}>{segment.value}</span>
        ) : (
          <button
            key={i}
            type="button"
            className={`${linkClass} max-w-[300px] cursor-pointer truncate align-bottom text-left`}
            style={{ display: "inline-block" }}
            title={segment.value}
            onClick={() => setPendingUrl(segment.value)}
          >
            {segment.value}
          </button>
        )
      )}
      {pendingUrl && (
        <LinkConfirmationDialog
          url={pendingUrl}
          onCancel={() => setPendingUrl(null)}
          onOpen={() => {
            window.open(pendingUrl, "_blank", "noopener,noreferrer");
            setPendingUrl(null);
          }}
        />
      )}
    </>
  );
}
