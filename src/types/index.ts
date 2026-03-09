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

export interface Reaction {
  id: string;
  message_id: string;
  conversation_id: string;
  user_session_id: string;
  user_name: string;
  reaction_type: "thumbs_up" | "thumbs_down";
  created_at: string;
}

export interface PinnedMessage {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
  pinned_at: string;
}

export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  boundingbox: [string, string, string, string];
}

// --- Weather Panel (013) ---

export type UnitSystem = "metric" | "imperial";

export interface WeatherUnits {
  temperature: "°C" | "°F";
  windSpeed: "km/h" | "mph";
  precipitation: "mm" | "in";
}

export interface WeatherPreferences {
  unitOverride: UnitSystem | null;
}

export interface WeatherCurrent {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  precipitation: number;
}

export interface WeatherHourly {
  time: string;
  temperature: number;
  precipitation: number;
  windSpeed: number;
  weatherCode: number;
}

export interface WeatherData {
  conversationId: string;
  latitude: number;
  longitude: number;
  timezone: string;
  timezoneAbbreviation: string;
  utcOffsetSeconds: number;
  current: WeatherCurrent;
  hourly: WeatherHourly[];
  fetchedAt: string;
}

export interface WeatherDaySummary {
  label: string;
  date: string;
  temperatureMin: number;
  temperatureMax: number;
  temperatureAvg: number;
  weatherCode: number;
  precipitation: number;
  windSpeed: number;
}

export interface CachedWeatherData {
  conversationId: string;
  data: WeatherData;
  cachedAt: string;
}
