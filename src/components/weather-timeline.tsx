"use client";

import { useRef, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import type { WeatherData } from "@/types";
import type { HistoricalAvgMap } from "@/lib/weather";
import { aggregateDaySummaries } from "@/lib/weather";
import WeatherDayColumn, { DAY_COL_WIDTH } from "@/components/weather-day-column";
import WeatherHourColumn, { HOUR_COL_WIDTH } from "@/components/weather-hour-column";
import WeatherSparkline from "@/components/weather-sparkline";

interface WeatherTimelineProps {
  weather: WeatherData;
  historicalAvg: HistoricalAvgMap | null;
}

export default function WeatherTimeline({
  weather,
  historicalAvg,
}: WeatherTimelineProps) {
  const t = useTranslations();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Compute sections
  const { pastDays, todayHours, futureDays, nowIndex, todayDate } =
    useMemo(() => {
      const allDays = aggregateDaySummaries(
        weather.hourly,
        weather.utcOffsetSeconds
      );

      // Today's date in location timezone
      const nowMs = Date.now() + weather.utcOffsetSeconds * 1000;
      const nowUtc = new Date(nowMs);
      const todayStr = `${nowUtc.getUTCFullYear()}-${String(nowUtc.getUTCMonth() + 1).padStart(2, "0")}-${String(nowUtc.getUTCDate()).padStart(2, "0")}`;

      // Past days: all complete days before today
      const past = allDays.filter((d) => {
        const dStr = dayToDateStr(d, weather);
        return dStr < todayStr;
      });

      // Future days: all complete days after today
      const future = allDays.filter((d) => {
        const dStr = dayToDateStr(d, weather);
        return dStr > todayStr;
      });

      // Today's hourly data (2-hour intervals)
      const todayHourly = weather.hourly.filter((h) =>
        h.time.startsWith(todayStr)
      );
      const filtered = todayHourly.filter((_, i) => i % 2 === 0);

      // Find NOW index in today's hours (parse hour from string to stay in location timezone)
      const nowHour = nowUtc.getUTCHours();
      let ni = 0;
      let minDiff = Infinity;
      for (let i = 0; i < filtered.length; i++) {
        const hHour = parseInt(filtered[i].time.split("T")[1].split(":")[0], 10);
        const diff = Math.abs(hHour - nowHour);
        if (diff < minDiff) {
          minDiff = diff;
          ni = i;
        }
      }

      // Format today date
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];
      const td = `${months[nowUtc.getUTCMonth()]} ${nowUtc.getUTCDate()}`;

      return {
        pastDays: past.slice(-7), // Last 7 days
        todayHours: filtered,
        futureDays: future.slice(0, 4), // Next 4 days
        nowIndex: ni,
        todayDate: td,
      };
    }, [weather]);

  // Compute total width and now position for auto-scroll
  const pastWidth = pastDays.length * DAY_COL_WIDTH;
  const todayWidth = todayHours.length * HOUR_COL_WIDTH;
  const futureWidth = futureDays.length * DAY_COL_WIDTH;
  const totalWidth = pastWidth + todayWidth + futureWidth;
  const nowX = pastWidth + nowIndex * HOUR_COL_WIDTH;

  // Max precipitation across all sections
  const maxPrecipitation = useMemo(() => {
    const allPrecip = [
      ...pastDays.map((d) => d.precipitation),
      ...todayHours.map((h) => h.precipitation),
      ...futureDays.map((d) => d.precipitation),
    ];
    return Math.max(0, ...allPrecip);
  }, [pastDays, todayHours, futureDays]);

  // Build sparkline data points
  const sparklinePoints = useMemo(() => {
    const pts = [
      ...pastDays.map((d) => ({
        temperature: d.temperatureAvg,
        colWidth: DAY_COL_WIDTH,
      })),
      ...todayHours.map((h) => ({
        temperature: h.temperature,
        colWidth: HOUR_COL_WIDTH,
      })),
      ...futureDays.map((d) => ({
        temperature: d.temperatureAvg,
        colWidth: DAY_COL_WIDTH,
      })),
    ];
    return pts;
  }, [pastDays, todayHours, futureDays]);

  // Build per-DAY historical avg anchor points (one per unique day, not per column)
  const historicalAvgAnchors = useMemo(() => {
    if (!historicalAvg) return null;

    const toMMDD = (dateStr: string): string => {
      // dateStr is like "9 Mar" → "03-09"
      const months: Record<string, string> = {
        Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
        Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
      };
      const parts = dateStr.split(" ");
      if (parts.length === 2) {
        return `${months[parts[1]] ?? "01"}-${parts[0].padStart(2, "0")}`;
      }
      return "";
    };

    const todayMMDD = todayHours.length > 0
      ? todayHours[0].time.slice(5, 10)
      : "";

    // One anchor per day: { x: center of that day's span, temperature }
    const anchors: { x: number; temperature: number }[] = [];
    let xOffset = 0;

    // Past days
    for (const d of pastDays) {
      const temp = historicalAvg[toMMDD(d.date)];
      if (temp !== undefined) {
        anchors.push({ x: xOffset + DAY_COL_WIDTH / 2, temperature: temp });
      }
      xOffset += DAY_COL_WIDTH;
    }

    // Today (single anchor at center of all hourly columns)
    const todayTemp = historicalAvg[todayMMDD];
    if (todayTemp !== undefined && todayHours.length > 0) {
      const todaySectionWidth = todayHours.length * HOUR_COL_WIDTH;
      anchors.push({ x: xOffset + todaySectionWidth / 2, temperature: todayTemp });
      xOffset += todaySectionWidth;
    } else {
      xOffset += todayHours.length * HOUR_COL_WIDTH;
    }

    // Future days
    for (const d of futureDays) {
      const temp = historicalAvg[toMMDD(d.date)];
      if (temp !== undefined) {
        anchors.push({ x: xOffset + DAY_COL_WIDTH / 2, temperature: temp });
      }
      xOffset += DAY_COL_WIDTH;
    }

    return anchors.length >= 2 ? anchors : null;
  }, [historicalAvg, pastDays, todayHours, futureDays]);

  const sparklineNowIndex = pastDays.length + nowIndex;

  // Auto-scroll to center on NOW
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        const viewportW = scrollRef.current.clientWidth;
        scrollRef.current.scrollLeft =
          nowX - viewportW / 2 + HOUR_COL_WIDTH / 2;
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [nowX]);

  return (
    <div className="pb-2" aria-label={t("weather.timelineAriaLabel")}>
      <div
        ref={scrollRef}
        className="overflow-x-auto overflow-y-hidden"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="inline-block" style={{ width: totalWidth }}>
          {/* Section labels */}
          <div className="flex">
            <div
              className="flex items-center justify-center border-r border-stone-200 text-[9px] font-semibold uppercase tracking-wider text-stone-400"
              style={{ width: pastWidth, height: 20 }}
            >
              {t("weather.pastDays", { count: pastDays.length })}
            </div>
            <div
              className="flex items-center justify-center border-r border-stone-200 text-[9px] font-semibold uppercase tracking-wider text-geo-600"
              style={{ width: todayWidth, height: 20 }}
            >
              {t("weather.today", { date: todayDate })}
            </div>
            <div
              className="flex items-center justify-center text-[9px] font-semibold uppercase tracking-wider text-stone-400"
              style={{ width: futureWidth, height: 20 }}
            >
              {t("weather.forecast")}
            </div>
          </div>

          {/* Sparkline */}
          <WeatherSparkline
            points={sparklinePoints}
            nowIndex={sparklineNowIndex}
            pastCount={pastDays.length}
            todayCount={todayHours.length}
            totalWidth={totalWidth}
            historicalAvgAnchors={historicalAvgAnchors}
          />

          {/* Column row */}
          <div className="flex">
            {pastDays.map((day, i) => (
              <WeatherDayColumn
                key={`p${i}`}
                day={day}
                isPast
                maxPrecipitation={maxPrecipitation}
              />
            ))}
            {todayHours.map((hour, i) => (
              <WeatherHourColumn
                key={`h${i}`}
                hour={hour}
                isNow={i === nowIndex}
                isPast={i < nowIndex}
                maxPrecipitation={maxPrecipitation}
              />
            ))}
            {futureDays.map((day, i) => (
              <WeatherDayColumn
                key={`f${i}`}
                day={day}
                isPast={false}
                maxPrecipitation={maxPrecipitation}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-end gap-4 px-4 pt-1.5">
        {[
          ["💧", t("weather.legend.precipitation")],
          ["💨", t("weather.legend.wind")],
          ...(historicalAvg !== null
            ? [["━ ━", t("weather.legend.historicalAvg")]]
            : []),
        ].map(([icon, label]) => (
          <span
            key={label}
            className="flex items-center gap-1 text-[9px] text-stone-400"
          >
            <span>{icon}</span>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Helper to extract a YYYY-MM-DD string from a WeatherDaySummary */
function dayToDateStr(
  day: { date: string; label: string },
  weather: WeatherData
): string {
  // day.date is like "10 Mar" — we need to match against the hourly data
  // Find the first hourly entry whose formatted date matches
  const months: Record<string, string> = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
  };
  const parts = day.date.split(" ");
  if (parts.length === 2) {
    const dd = parts[0].padStart(2, "0");
    const mm = months[parts[1]] ?? "01";
    // Infer year from the hourly data range
    const firstYear = weather.hourly[0]?.time.slice(0, 4) ?? "2026";
    const lastYear =
      weather.hourly[weather.hourly.length - 1]?.time.slice(0, 4) ?? "2026";
    // Check if date exists in the hourly range
    for (const year of [firstYear, lastYear]) {
      const candidate = `${year}-${mm}-${dd}`;
      if (
        weather.hourly.some((h) => h.time.startsWith(candidate))
      ) {
        return candidate;
      }
    }
    return `${firstYear}-${mm}-${dd}`;
  }
  return "0000-00-00";
}
