"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ChannelDisplay } from "@/hooks/use-channels";

interface ChannelCardProps {
  channel: ChannelDisplay;
}

export default function ChannelCard({ channel }: ChannelCardProps) {
  const t = useTranslations();
  const tChannels = useTranslations("channels");

  // Use translated name/description if available, fall back to database values
  const name = tChannels.has(`${channel.slug}.name`)
    ? tChannels(`${channel.slug}.name`)
    : channel.name;
  const description = tChannels.has(`${channel.slug}.description`)
    ? tChannels(`${channel.slug}.description`)
    : channel.description;

  return (
    <Link
      href={`/channel/${channel.slug}`}
      className="group flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        {channel.icon && (
          <span className="text-2xl" aria-hidden="true">
            {channel.icon}
          </span>
        )}
        <h2 className="text-base font-semibold text-neutral-900 group-hover:text-blue-700">
          {name}
        </h2>
      </div>
      <p className="text-sm text-neutral-500 line-clamp-2">
        {description}
      </p>
      <div className="mt-auto pt-2 text-xs text-neutral-400">
        {t("channelCard.conversations", { count: channel.conversationCount })}
      </div>
    </Link>
  );
}
