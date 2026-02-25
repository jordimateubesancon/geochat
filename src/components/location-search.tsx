"use client";

import { useRef, useState } from "react";
import { useNominatimSearch } from "@/hooks/use-nominatim-search";

interface LocationSearchProps {
  onSelect: (
    lat: number,
    lng: number,
    boundingbox: [number, number, number, number]
  ) => void;
}

export default function LocationSearch({ onSelect }: LocationSearchProps) {
  const { query, setQuery, results, loading, error } = useNominatimSearch();
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (index: number) => {
    const result = results[index];
    if (!result) return;

    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const [south, north, west, east] = result.boundingbox.map(Number) as [
      number,
      number,
      number,
      number,
    ];

    onSelect(lat, lng, [south, north, west, east]);
    setQuery("");
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelect(highlightedIndex);
        }
        break;
      case "Escape":
        e.preventDefault();
        setQuery("");
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Reset highlighted index when results change
  const showResults = query.length >= 3 && !loading && results.length > 0;
  const showNoResults =
    query.length >= 3 && !loading && results.length === 0 && !error;
  const showError = error !== null;

  const activeDescendant =
    showResults && highlightedIndex >= 0
      ? `location-result-${highlightedIndex}`
      : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-neutral-500" htmlFor="location-search-input">
        Search location
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id="location-search-input"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlightedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder="City, address, or place..."
          aria-label="Search for a location"
          aria-autocomplete="list"
          aria-controls={showResults ? "location-search-results" : undefined}
          aria-activedescendant={activeDescendant}
          className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-blue-500" />
          </div>
        )}
      </div>

      {showResults && (
        <ul
          id="location-search-results"
          role="listbox"
          aria-label="Search results"
          className="flex flex-col overflow-hidden rounded-md border border-neutral-200 bg-white"
        >
          {results.map((result, index) => (
            <li
              key={result.place_id}
              id={`location-result-${index}`}
              role="option"
              aria-selected={index === highlightedIndex}
              className={`cursor-pointer border-b border-neutral-100 px-3 py-2 text-sm text-neutral-700 last:border-b-0 ${
                index === highlightedIndex
                  ? "bg-blue-50 text-blue-900"
                  : "hover:bg-neutral-50"
              }`}
              onClick={() => handleSelect(index)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {result.display_name}
            </li>
          ))}
        </ul>
      )}

      {showNoResults && (
        <p className="px-1 text-sm text-neutral-500">No results found</p>
      )}

      {showError && (
        <p className="px-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
