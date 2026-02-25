import { Marker as LeafletMarker, Tooltip } from "react-leaflet";
import type { Conversation } from "@/types";

function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return "no messages yet";

  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return `${diffWeek}w ago`;
}

interface ConversationMarkerProps {
  conversation: Conversation;
  onClick: (conversation: Conversation) => void;
}

export default function ConversationMarker({
  conversation,
  onClick,
}: ConversationMarkerProps) {
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
            {conversation.message_count}{" "}
            {conversation.message_count === 1 ? "message" : "messages"} ·{" "}
            {formatRelativeTime(conversation.last_message_at)}
          </div>
        </div>
      </Tooltip>
    </LeafletMarker>
  );
}
