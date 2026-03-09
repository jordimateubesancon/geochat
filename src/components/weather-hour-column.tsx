"use client";

import { useTranslations } from "next-intl";
import type { WeatherHourly } from "@/types";
import { getWeatherCondition } from "@/lib/weather";

export const HOUR_COL_WIDTH = 52;

interface WeatherHourColumnProps {
  hour: WeatherHourly;
  isNow: boolean;
  isPast: boolean;
  maxPrecipitation: number;
}

export default function WeatherHourColumn({
  hour,
  isNow,
  isPast,
  maxPrecipitation,
}: WeatherHourColumnProps) {
  const t = useTranslations();
  const condition = getWeatherCondition(hour.weatherCode);
  const barHeight =
    maxPrecipitation > 0
      ? Math.max(2, Math.round((hour.precipitation / maxPrecipitation) * 14))
      : 0;

  // Parse hour directly from the time string (location timezone) to avoid browser-timezone mismatch
  const parsedHour = parseInt(hour.time.split("T")[1].split(":")[0], 10);
  const hourLabel = isNow ? t("weather.now") : `${String(parsedHour).padStart(2, "0")}:00`;

  return (
    <div
      className="flex flex-col items-center gap-0.5 px-0.5 py-1.5"
      style={{
        width: HOUR_COL_WIDTH,
        opacity: isPast ? 0.45 : 1,
        background: isNow ? "rgba(234,88,12,0.06)" : "transparent",
        borderLeft: isNow
          ? "1px solid rgba(234,88,12,0.25)"
          : "1px solid rgb(245,245,244)",
        borderRight: isNow
          ? "1px solid rgba(234,88,12,0.25)"
          : "1px solid rgb(245,245,244)",
      }}
    >
      <div
        className={`text-[10px] ${
          isNow
            ? "font-bold text-orange-600"
            : isPast
              ? "text-stone-400"
              : "font-medium text-stone-500"
        }`}
      >
        {hourLabel}
      </div>
      <div className="text-base leading-none">{condition.emoji}</div>
      <div
        className={`text-xs ${
          isNow
            ? "font-bold text-orange-600"
            : isPast
              ? "text-stone-400"
              : "font-medium text-stone-700"
        }`}
      >
        {Math.round(hour.temperature)}°
      </div>
      {/* Precipitation bar */}
      <div
        className="flex items-end justify-center"
        style={{ width: HOUR_COL_WIDTH - 14, height: 14 }}
      >
        {hour.precipitation > 0 && barHeight > 0 && (
          <div
            className={`rounded-t-sm ${isNow ? "bg-orange-500/50" : "bg-blue-400/40"}`}
            style={{ width: "52%", height: barHeight }}
          />
        )}
      </div>
      {/* Wind */}
      <div className="text-[9px] text-stone-300">
        {hour.windSpeed ? `💨${Math.round(hour.windSpeed)}` : ""}
      </div>
    </div>
  );
}
