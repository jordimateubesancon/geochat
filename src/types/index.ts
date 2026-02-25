export interface Channel {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ChannelWithCount extends Channel {
  conversations: [{ count: number }];
}

export interface Conversation {
  id: string;
  channel_id: string;
  title: string;
  latitude: number;
  longitude: number;
  creator_name: string;
  message_count: number;
  last_message_at: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  author_name: string;
  body: string;
  created_at: string;
}

export interface OptimisticMessage extends Message {
  status: "sending" | "confirmed" | "failed";
}

export interface UserSession {
  displayName: string;
  sessionId: string;
}

export interface MapBounds {
  min_lng: number;
  min_lat: number;
  max_lng: number;
  max_lat: number;
}

export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  boundingbox: [string, string, string, string];
}
