"use client";

import type { WeatherDaySummary } from "@/types";
import { getWeatherCondition } from "@/lib/weather";

export const DAY_COL_WIDTH = 72;

interface WeatherDayColumnProps {
  day: WeatherDaySummary;
  isPast: boolean;
  maxPrecipitation: number;
}

export default function WeatherDayColumn({
  day,
  isPast,
  maxPrecipitation,
}: WeatherDayColumnProps) {
  const condition = getWeatherCondition(day.weatherCode);
  const barHeight =
    maxPrecipitation > 0
      ? Math.max(2, Math.round((day.precipitation / maxPrecipitation) * 14))
      : 0;

  return (
    <div
      className="flex flex-col items-center gap-0.5 border-r border-stone-100 px-1 py-1.5"
      style={{
        width: DAY_COL_WIDTH,
        opacity: isPast ? 0.55 : 1,
      }}
    >
      <div
        className={`text-[10px] font-semibold ${isPast ? "text-stone-400" : "text-stone-500"}`}
      >
        {day.label}
      </div>
      <div className="text-[9px] text-stone-300">{day.date}</div>
      <div className="text-lg leading-none">{condition.emoji}</div>
      <div
        className={`text-[11px] font-semibold ${isPast ? "text-stone-400" : "text-stone-700"}`}
      >
        {Math.round(day.temperatureMax)}°
        <span className="ml-0.5 font-normal text-stone-300">
          {Math.round(day.temperatureMin)}°
        </span>
      </div>
      {/* Precipitation bar */}
      <div
        className="flex items-end justify-center"
        style={{ width: DAY_COL_WIDTH - 20, height: 14 }}
      >
        {day.precipitation > 0 && barHeight > 0 && (
          <div
            className="rounded-t-sm bg-blue-400/45"
            style={{ width: "42%", height: barHeight }}
          />
        )}
      </div>
      {/* Wind */}
      <div className="text-[9px] text-stone-300">
        💨{Math.round(day.windSpeed)}
      </div>
    </div>
  );
}
