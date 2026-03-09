import type {
  UnitSystem,
  WeatherData,
  WeatherHourly,
  WeatherDaySummary,
} from "@/types";

// --- WMO Weather Code Mapping ---

interface WeatherCondition {
  emoji: string;
  labelKey: string;
}

const WMO_MAP: Record<number, WeatherCondition> = {
  0: { emoji: "☀️", labelKey: "weather.clear" },
  1: { emoji: "☀️", labelKey: "weather.mainlyClear" },
  2: { emoji: "⛅", labelKey: "weather.partlyCloudy" },
  3: { emoji: "☁️", labelKey: "weather.overcast" },
  45: { emoji: "🌫️", labelKey: "weather.fog" },
  48: { emoji: "🌫️", labelKey: "weather.fog" },
  51: { emoji: "🌦️", labelKey: "weather.drizzle" },
  53: { emoji: "🌦️", labelKey: "weather.drizzle" },
  55: { emoji: "🌦️", labelKey: "weather.drizzle" },
  56: { emoji: "🌦️", labelKey: "weather.freezingDrizzle" },
  57: { emoji: "🌦️", labelKey: "weather.freezingDrizzle" },
  61: { emoji: "🌧️", labelKey: "weather.rain" },
  63: { emoji: "🌧️", labelKey: "weather.rain" },
  65: { emoji: "🌧️", labelKey: "weather.heavyRain" },
  66: { emoji: "🌧️", labelKey: "weather.freezingRain" },
  67: { emoji: "🌧️", labelKey: "weather.freezingRain" },
  71: { emoji: "🌨️", labelKey: "weather.snow" },
  73: { emoji: "🌨️", labelKey: "weather.snow" },
  75: { emoji: "❄️", labelKey: "weather.heavySnow" },
  77: { emoji: "🌨️", labelKey: "weather.snowGrains" },
  80: { emoji: "⛈️", labelKey: "weather.rainShowers" },
  81: { emoji: "⛈️", labelKey: "weather.rainShowers" },
  82: { emoji: "⛈️", labelKey: "weather.rainShowers" },
  85: { emoji: "🌨️", labelKey: "weather.snowShowers" },
  86: { emoji: "🌨️", labelKey: "weather.snowShowers" },
  95: { emoji: "⛈️", labelKey: "weather.thunderstorm" },
  96: { emoji: "⛈️", labelKey: "weather.thunderstormHail" },
  99: { emoji: "⛈️", labelKey: "weather.thunderstormHail" },
};

export function getWeatherCondition(code: number): WeatherCondition {
  return WMO_MAP[code] ?? { emoji: "☁️", labelKey: "weather.overcast" };
}

// --- Open-Meteo API Client ---

function getApiUnitParams(unitSystem: UnitSystem): string {
  if (unitSystem === "imperial") {
    return "temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch";
  }
  return "temperature_unit=celsius&wind_speed_unit=kmh&precipitation_unit=mm";
}

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  current: {
    time: string;
    temperature_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    precipitation: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation: number[];
    wind_speed_10m: number[];
    weather_code: number[];
  };
}

export async function fetchWeatherData(
  lat: number,
  lng: number,
  unitSystem: UnitSystem,
  conversationId: string
): Promise<WeatherData> {
  const unitParams = getApiUnitParams(unitSystem);
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lng}` +
    `&past_days=7&forecast_days=4` +
    `&hourly=temperature_2m,precipitation,wind_speed_10m,weather_code` +
    `&current=temperature_2m,weather_code,wind_speed_10m,precipitation` +
    `&timezone=auto&${unitParams}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Weather API error: ${res.status}`);
  }

  const json: OpenMeteoResponse = await res.json();

  const hourly: WeatherHourly[] = json.hourly.time.map((time, i) => ({
    time,
    temperature: json.hourly.temperature_2m[i],
    precipitation: json.hourly.precipitation[i],
    windSpeed: json.hourly.wind_speed_10m[i],
    weatherCode: json.hourly.weather_code[i],
  }));

  return {
    conversationId,
    latitude: json.latitude,
    longitude: json.longitude,
    timezone: json.timezone,
    timezoneAbbreviation: json.timezone_abbreviation,
    utcOffsetSeconds: json.utc_offset_seconds,
    current: {
      temperature: json.current.temperature_2m,
      weatherCode: json.current.weather_code,
      windSpeed: json.current.wind_speed_10m,
      precipitation: json.current.precipitation,
    },
    hourly,
    fetchedAt: new Date().toISOString(),
  };
}

// --- Day Summary Aggregation ---

export function aggregateDaySummaries(
  hourlyData: WeatherHourly[],
  utcOffsetSeconds: number
): WeatherDaySummary[] {
  const dayMap = new Map<string, WeatherHourly[]>();

  for (const h of hourlyData) {
    const date = h.time.split("T")[0];
    const existing = dayMap.get(date) ?? [];
    existing.push(h);
    dayMap.set(date, existing);
  }

  const summaries: WeatherDaySummary[] = [];

  for (const dateStr of Array.from(dayMap.keys())) {
    const hours = dayMap.get(dateStr)!;
    const d = new Date(dateStr + "T12:00:00Z");
    d.setSeconds(d.getSeconds() + utcOffsetSeconds);

    const temps = hours.map((h) => h.temperature);
    const weatherCodes = hours.map((h) => h.weatherCode);

    // Dominant weather code: most frequent non-zero, fallback to most frequent
    const codeFreq = new Map<number, number>();
    for (const code of weatherCodes) {
      codeFreq.set(code, (codeFreq.get(code) ?? 0) + 1);
    }
    let dominantCode = 0;
    let maxFreq = 0;
    for (const code of Array.from(codeFreq.keys())) {
      const freq = codeFreq.get(code)!;
      if (freq > maxFreq || (freq === maxFreq && code > dominantCode)) {
        dominantCode = code;
        maxFreq = freq;
      }
    }

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    summaries.push({
      label: days[d.getUTCDay()],
      date: `${d.getUTCDate()} ${months[d.getUTCMonth()]}`,
      temperatureMin: Math.min(...temps),
      temperatureMax: Math.max(...temps),
      temperatureAvg: temps.reduce((s, t) => s + t, 0) / temps.length,
      weatherCode: dominantCode,
      precipitation: hours.reduce((s, h) => s + h.precipitation, 0),
      windSpeed: Math.max(...hours.map((h) => h.windSpeed)),
    });
  }

  return summaries;
}

// --- Cache Freshness ---

const CACHE_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

export function isCacheFresh(cachedAt: string): boolean {
  return Date.now() - new Date(cachedAt).getTime() < CACHE_MAX_AGE_MS;
}

// --- Historical Average (Archive API) ---

const HISTORICAL_CACHE_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

/** Per-day historical averages keyed by MM-DD */
export type HistoricalAvgMap = Record<string, number>;

function fmtMMDD(dateStr: string): string {
  return dateStr.slice(5); // "2026-03-09" → "03-09"
}

interface ArchiveResponse {
  daily: {
    time: string[];
    temperature_2m_mean: number[];
  };
}

/**
 * Fetch per-day historical averages for the given date range.
 * Calls the Archive API for each of the past 5 years with the same
 * calendar window, then averages per MM-DD.
 */
export async function fetchHistoricalAverages(
  lat: number,
  lng: number,
  dates: string[]
): Promise<HistoricalAvgMap | null> {
  try {
    if (dates.length === 0) return null;

    const currentYear = new Date().getFullYear();
    // Accumulate temps per MM-DD key
    const buckets = new Map<string, number[]>();

    // Determine the calendar window (MM-DD range) from the requested dates
    const mmddSet = new Set(dates.map(fmtMMDD));

    for (let y = currentYear - 5; y < currentYear; y++) {
      // Build start/end for this year using the first/last dates' MM-DD
      const start = `${y}-${dates[0].slice(5)}`;
      const end = `${y}-${dates[dates.length - 1].slice(5)}`;

      const url =
        `https://archive-api.open-meteo.com/v1/archive` +
        `?latitude=${lat}&longitude=${lng}` +
        `&start_date=${start}&end_date=${end}` +
        `&daily=temperature_2m_mean&timezone=auto`;

      const res = await fetch(url);
      if (!res.ok) continue;
      const json: ArchiveResponse = await res.json();

      for (let i = 0; i < json.daily.time.length; i++) {
        const mmdd = fmtMMDD(json.daily.time[i]);
        const temp = json.daily.temperature_2m_mean[i];
        if (temp === null || temp === undefined) continue;
        if (!mmddSet.has(mmdd)) continue;
        const bucket = buckets.get(mmdd) ?? [];
        bucket.push(temp);
        buckets.set(mmdd, bucket);
      }
    }

    if (buckets.size === 0) return null;

    const result: HistoricalAvgMap = {};
    for (const mmdd of Array.from(buckets.keys())) {
      const temps = buckets.get(mmdd)!;
      result[mmdd] = temps.reduce((s, t) => s + t, 0) / temps.length;
    }
    return result;
  } catch {
    return null;
  }
}

/**
 * Extract unique sorted date strings (YYYY-MM-DD) from hourly data.
 */
export function extractTimelineDates(hourly: WeatherHourly[]): string[] {
  const seen = new Set<string>();
  for (const h of hourly) {
    seen.add(h.time.split("T")[0]);
  }
  return Array.from(seen).sort();
}

export function historicalAvgCacheKey(
  lat: number,
  lng: number,
  dates: string[]
): string {
  return `${lat},${lng},${dates[0]},${dates[dates.length - 1]}`;
}

export function isHistoricalCacheFresh(cachedAt: string): boolean {
  return Date.now() - new Date(cachedAt).getTime() < HISTORICAL_CACHE_MAX_AGE_MS;
}

