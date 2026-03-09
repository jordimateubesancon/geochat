"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

interface SparklinePoint {
  temperature: number;
  colWidth: number;
}

interface HistoricalAnchor {
  x: number;
  temperature: number;
}

interface WeatherSparklineProps {
  points: SparklinePoint[];
  nowIndex: number;
  pastCount: number;
  todayCount: number;
  totalWidth: number;
  historicalAvgAnchors: HistoricalAnchor[] | null;
}

const SPARKLINE_HEIGHT = 54;
const PADDING_Y = 10;

export default function WeatherSparkline({
  points,
  nowIndex,
  pastCount,
  todayCount,
  totalWidth,
  historicalAvgAnchors,
}: WeatherSparklineProps) {
  const t = useTranslations();

  const { pathD, pts, minTemp, maxTemp, pastWidth, todayWidth, histPathD } =
    useMemo(() => {
      const temps = points.map((p) => p.temperature);
      // Include historical anchors in the min/max range so the curve fits
      const histTemps = historicalAvgAnchors
        ? historicalAvgAnchors.map((a) => a.temperature)
        : [];
      const allTemps = [...temps, ...histTemps];
      const mn = Math.min(...allTemps) - 1.5;
      const mx = Math.max(...allTemps) + 1.5;
      const toY = (temp: number) =>
        SPARKLINE_HEIGHT -
        PADDING_Y -
        ((temp - mn) / (mx - mn)) * (SPARKLINE_HEIGHT - PADDING_Y * 2);

      let x = 0;
      const computed = points.map((p) => {
        const cx = x + p.colWidth / 2;
        const cy = toY(p.temperature);
        x += p.colWidth;
        return { cx, cy };
      });

      // Bezier path
      let d = `M${computed[0].cx},${computed[0].cy}`;
      for (let i = 1; i < computed.length; i++) {
        const prev = computed[i - 1];
        const curr = computed[i];
        const mx2 = (prev.cx + curr.cx) / 2;
        d += ` C${mx2},${prev.cy} ${mx2},${curr.cy} ${curr.cx},${curr.cy}`;
      }

      // Compute section widths
      let pw = 0;
      for (let i = 0; i < pastCount; i++) pw += points[i].colWidth;
      let tw = 0;
      for (let i = pastCount; i < pastCount + todayCount; i++)
        tw += points[i].colWidth;

      // Historical average smooth bezier curve (one anchor per day)
      let hd: string | null = null;
      if (historicalAvgAnchors && historicalAvgAnchors.length >= 2) {
        const histPts = historicalAvgAnchors.map((a) => ({
          cx: a.x,
          cy: toY(a.temperature),
        }));
        hd = `M${histPts[0].cx},${histPts[0].cy}`;
        for (let i = 1; i < histPts.length; i++) {
          const prev = histPts[i - 1];
          const curr = histPts[i];
          const midX = (prev.cx + curr.cx) / 2;
          hd += ` C${midX},${prev.cy} ${midX},${curr.cy} ${curr.cx},${curr.cy}`;
        }
      }

      return {
        pathD: d,
        pts: computed,
        minTemp: Math.min(...temps),
        maxTemp: Math.max(...temps),
        pastWidth: pw,
        todayWidth: tw,
        histPathD: hd,
      };
    }, [points, pastCount, todayCount, historicalAvgAnchors]);

  const nowPt = pts[nowIndex];
  const lastPt = pts[pts.length - 1];
  const firstPt = pts[0];

  // Gradient stop percentages
  const pastPct = (pastWidth / totalWidth) * 100;
  const nowPct = nowPt ? (nowPt.cx / totalWidth) * 100 : 50;
  const todayEndPct = ((pastWidth + todayWidth) / totalWidth) * 100;

  // Area fill path
  const areaD = `${pathD} L${lastPt.cx},${SPARKLINE_HEIGHT} L${firstPt.cx},${SPARKLINE_HEIGHT} Z`;

  return (
    <svg
      width={totalWidth}
      height={SPARKLINE_HEIGHT}
      className="block"
      aria-label={t("weather.sparklineAriaLabel", {
        min: `${Math.round(minTemp)}`,
        max: `${Math.round(maxTemp)}`,
      })}
      role="img"
    >
      <defs>
        <linearGradient id="wsp-lg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
          <stop
            offset={`${pastPct}%`}
            stopColor="#6b7280"
            stopOpacity={0.7}
          />
          <stop
            offset={`${nowPct}%`}
            stopColor="#f97316"
            stopOpacity={1}
          />
          <stop
            offset={`${todayEndPct}%`}
            stopColor="#6b7280"
            stopOpacity={0.65}
          />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.25} />
        </linearGradient>
        <linearGradient id="wsp-ag" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7c8ddb" stopOpacity={0.08} />
          <stop offset="100%" stopColor="#7c8ddb" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Section dividers */}
      <line
        x1={pastWidth}
        y1={0}
        x2={pastWidth}
        y2={SPARKLINE_HEIGHT}
        stroke="#e7e5e4"
        strokeWidth={1}
      />
      <line
        x1={pastWidth + todayWidth}
        y1={0}
        x2={pastWidth + todayWidth}
        y2={SPARKLINE_HEIGHT}
        stroke="#e7e5e4"
        strokeWidth={1}
      />

      {/* NOW column highlight */}
      {nowPt && (
        <rect
          x={nowPt.cx - points[nowIndex].colWidth / 2}
          y={0}
          width={points[nowIndex].colWidth}
          height={SPARKLINE_HEIGHT}
          fill="rgba(234,88,12,0.04)"
          rx={2}
        />
      )}

      {/* Historical average curve */}
      {histPathD && (
        <path
          d={histPathD}
          fill="none"
          stroke="#4b5563"
          strokeWidth={1}
          strokeDasharray="3,5"
          opacity={0.5}
        />
      )}

      {/* Area fill */}
      <path d={areaD} fill="url(#wsp-ag)" />

      {/* Sparkline */}
      <path
        d={pathD}
        fill="none"
        stroke="url(#wsp-lg)"
        strokeWidth={1.5}
        strokeLinecap="round"
      />

      {/* NOW dot with pulse ring */}
      {nowPt && (
        <>
          <circle
            cx={nowPt.cx}
            cy={nowPt.cy}
            r={7}
            fill="#f97316"
            opacity={0.15}
          />
          <circle
            cx={nowPt.cx}
            cy={nowPt.cy}
            r={4.5}
            fill="none"
            stroke="#f97316"
            strokeWidth={1.5}
          />
          <circle cx={nowPt.cx} cy={nowPt.cy} r={2.5} fill="#f97316" />
        </>
      )}

      {/* Temperature labels for daily columns */}
      {pts.map((pt, i) => {
        const isDaily = i < pastCount || i >= pastCount + todayCount;
        if (!isDaily) return null;
        const isPast = i < pastCount;
        return (
          <text
            key={i}
            x={pt.cx}
            y={pt.cy - 6}
            textAnchor="middle"
            fontSize={9}
            fontWeight={600}
            fill={isPast ? "#a8a29e" : "#78716c"}
          >
            {Math.round(points[i].temperature)}°
          </text>
        );
      })}
    </svg>
  );
}
