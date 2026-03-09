"use client";

import { useState, useCallback, useEffect } from "react";
import type { UnitSystem, WeatherUnits } from "@/types";

const STORAGE_KEY = "geochat_weather_prefs";

const IMPERIAL_LOCALES = new Set(["en-US", "en-LR", "my"]);

function detectUnitSystem(): UnitSystem {
  if (typeof navigator === "undefined") return "metric";
  const lang = navigator.language;
  if (IMPERIAL_LOCALES.has(lang)) return "imperial";
  if (lang.startsWith("en-US")) return "imperial";
  return "metric";
}

function getStoredOverride(): UnitSystem | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const prefs = JSON.parse(raw);
    return prefs.unitOverride ?? null;
  } catch {
    return null;
  }
}

function storeOverride(unit: UnitSystem | null): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ unitOverride: unit }));
  } catch {
    // localStorage unavailable
  }
}

function unitsForSystem(system: UnitSystem): WeatherUnits {
  if (system === "imperial") {
    return { temperature: "°F", windSpeed: "mph", precipitation: "in" };
  }
  return { temperature: "°C", windSpeed: "km/h", precipitation: "mm" };
}

export function useWeatherUnits() {
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>(() => {
    const override = getStoredOverride();
    return override ?? detectUnitSystem();
  });

  useEffect(() => {
    const override = getStoredOverride();
    if (override && override !== unitSystem) {
      setUnitSystemState(override);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setUnitSystem = useCallback((system: UnitSystem) => {
    storeOverride(system);
    setUnitSystemState(system);
  }, []);

  return {
    units: unitsForSystem(unitSystem),
    unitSystem,
    setUnitSystem,
  };
}
