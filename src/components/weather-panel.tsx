"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useWeather } from "@/hooks/use-weather";
import { useWeatherUnits } from "@/hooks/use-weather-units";
import { getWeatherCondition } from "@/lib/weather";
import WeatherTimeline from "@/components/weather-timeline";

interface WeatherPanelProps {
  conversationId: string;
  latitude: number;
  longitude: number;
}

export default function WeatherPanel({
  conversationId,
  latitude,
  longitude,
}: WeatherPanelProps) {
  const t = useTranslations();
  const { units } = useWeatherUnits();
  const {
    weather,
    historicalAvg,
    loading,
    error,
    isStale,
    lastUpdated,
    refresh,
  } = useWeather(conversationId, latitude, longitude);
  const [open, setOpen] = useState(false);

  const isOnline =
    typeof navigator !== "undefined" ? navigator.onLine : true;

  // Loading skeleton
  if (loading && !weather) {
    return (
      <div className="border-b border-stone-200 px-4 py-3">
        <div className="flex animate-pulse items-center gap-3">
          <div className="h-6 w-6 rounded bg-stone-200" />
          <div className="h-5 w-12 rounded bg-stone-200" />
          <div className="h-4 w-20 flex-1 rounded bg-stone-200" />
        </div>
      </div>
    );
  }

  // Error state (no cached data either)
  if (error && !weather) {
    return (
      <div className="border-b border-stone-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-stone-400">
            {t("weather.unavailable")}
          </span>
          {isOnline && (
            <button
              onClick={refresh}
              className="text-xs text-geo-500 hover:text-geo-700"
              aria-label={t("weather.refresh")}
            >
              ↻
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const condition = getWeatherCondition(weather.current.weatherCode);
  const temp = Math.round(weather.current.temperature);
  const wind = Math.round(weather.current.windSpeed);
  const precip = weather.current.precipitation;

  function formatLastUpdated(): string {
    if (!lastUpdated) return "";
    const diffMin = Math.floor(
      (Date.now() - lastUpdated.getTime()) / 60000
    );
    if (diffMin < 1) return t("weather.lastUpdated", { time: t("time.justNow") });
    if (diffMin < 60)
      return t("weather.lastUpdated", {
        time: t("time.minutesAgo", { count: diffMin }),
      });
    const diffHour = Math.floor(diffMin / 60);
    return t("weather.lastUpdated", {
      time: t("time.hoursAgo", { count: diffHour }),
    });
  }

  return (
    <div className="border-b border-stone-200">
      {/* Summary bar (always visible) */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition-colors hover:bg-stone-50"
        aria-label={t("weather.summaryAriaLabel", {
          temp: `${temp}`,
          condition: t(condition.labelKey),
          wind: `${wind}`,
          precip: `${precip}`,
        })}
        aria-expanded={open}
      >
        <span className="text-lg leading-none">{condition.emoji}</span>
        <span className="text-base font-bold text-stone-900">
          {temp}
          {units.temperature}
        </span>
        <span className="flex-1 text-xs text-stone-500">
          {t(condition.labelKey)}
        </span>
        <span className="flex items-center gap-1 text-[11px] text-stone-400">
          <span>💨</span>
          <span className="font-medium text-stone-500">{wind}</span>
          <span>{units.windSpeed}</span>
        </span>
        <span className="ml-2 flex items-center gap-1 text-[11px] text-stone-400">
          <span>💧</span>
          <span className="font-medium text-stone-500">
            {precip.toFixed(1)}
          </span>
          <span>{units.precipitation}</span>
        </span>
        <span
          className="ml-2 inline-block text-xs text-stone-400 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        >
          ▾
        </span>
      </button>

      {/* Staleness indicator + refresh */}
      {isStale && (
        <div className="flex items-center justify-between border-t border-stone-100 px-4 py-1.5">
          <span className="text-[10px] text-amber-600">
            {formatLastUpdated()}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              refresh();
            }}
            disabled={!isOnline}
            className="text-[10px] text-geo-500 hover:text-geo-700 disabled:cursor-not-allowed disabled:text-stone-300"
            aria-label={t("weather.refresh")}
            title={!isOnline ? t("weather.offlineTooltip") : undefined}
          >
            ↻ {t("weather.refresh")}
          </button>
        </div>
      )}

      {/* Refresh button when not stale (collapsed only) */}
      {!isStale && !open && (
        <div className="flex justify-end border-t border-stone-100 px-4 py-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              refresh();
            }}
            disabled={!isOnline}
            className="text-[10px] text-stone-400 hover:text-geo-500 disabled:cursor-not-allowed disabled:text-stone-300"
            aria-label={t("weather.refresh")}
            title={!isOnline ? t("weather.offlineTooltip") : undefined}
          >
            ↻
          </button>
        </div>
      )}

      {/* Expanded timeline */}
      {open && weather && (
        <WeatherTimeline
          weather={weather}
          historicalAvg={historicalAvg}
        />
      )}
    </div>
  );
}
