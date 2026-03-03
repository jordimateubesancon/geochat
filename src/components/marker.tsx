import { Marker as LeafletMarker, Tooltip } from "react-leaflet";
import { useTranslations } from "next-intl";
import type { Conversation } from "@/types";

function useFormatRelativeTime() {
  const t = useTranslations();
  return (dateString: string | null): string => {
    if (!dateString) return t("marker.noMessages");

    const now = Date.now();
    const then = new Date(dateString).getTime();
    const diffMs = now - then;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);

    if (diffSec < 60) return t("time.justNow");
    if (diffMin < 60) return t("time.minAgo", { count: diffMin });
    if (diffHour < 24) return t("time.hoursAgo", { count: diffHour });
    if (diffDay < 7) return t("time.daysAgo", { count: diffDay });
    return t("time.weeksAgo", { count: diffWeek });
  };
}

interface ConversationMarkerProps {
  conversation: Conversation;
  onClick: (conversation: Conversation) => void;
}

export default function ConversationMarker({
  conversation,
  onClick,
}: ConversationMarkerProps) {
  const t = useTranslations();
  const formatRelativeTime = useFormatRelativeTime();
  return (
    <LeafletMarker
      position={[conversation.latitude, conversation.longitude]}
      eventHandlers={{
        click: () => onClick(conversation),
      }}
    >
      <Tooltip direction="top" offset={[0, -10]} permanent={false}>
        <div className="text-sm">
          <div className="font-semibold">{conversation.title}</div>
          <div className="text-xs text-neutral-500">
            {t("marker.messages", { count: conversation.message_count })} ·{" "}
            {formatRelativeTime(conversation.last_message_at)}
          </div>
        </div>
      </Tooltip>
    </LeafletMarker>
  );
}
