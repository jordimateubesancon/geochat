"use client";

import { useRef, useState } from "react";
import { useNominatimSearch } from "@/hooks/use-nominatim-search";
import { useConversationSearch } from "@/hooks/use-conversation-search";
import type { Conversation } from "@/types";

type SearchMode = "places" | "chats";

interface LocationSearchProps {
  onSelectLocation: (
    lat: number,
    lng: number,
    boundingbox: [number, number, number, number]
  ) => void;
  onSelectConversation: (conversation: Conversation) => void;
}

export default function LocationSearch({
  onSelectLocation,
  onSelectConversation,
}: LocationSearchProps) {
  const [mode, setMode] = useState<SearchMode>("places");
  const nominatim = useNominatimSearch();
  const chatSearch = useConversationSearch();
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeHook = mode === "places" ? nominatim : chatSearch;
  const { query, setQuery, loading, error } = activeHook;
  const minChars = mode === "places" ? 3 : 2;

  const activeResults: { key: string; label: string; secondary?: string }[] =
    mode === "places"
      ? nominatim.results.map((r) => ({
          key: String(r.place_id),
          label: r.display_name,
        }))
      : chatSearch.results.map((c) => ({
          key: c.id,
          label: c.title,
          secondary: c.creator_name,
        }));

  const showResults = query.length >= minChars && !loading && activeResults.length > 0;
  const showNoResults =
    query.length >= minChars && !loading && activeResults.length === 0 && !error;
  const showError = error !== null;

  const handleSelectPlace = (index: number) => {
    const result = nominatim.results[index];
    if (!result) return;

    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const [south, north, west, east] = result.boundingbox.map(Number) as [
      number,
      number,
      number,
      number,
    ];

    onSelectLocation(lat, lng, [south, north, west, east]);
    nominatim.setQuery("");
    setHighlightedIndex(-1);
  };

  const handleSelectChat = (index: number) => {
    const conversation = chatSearch.results[index];
    if (!conversation) return;

    onSelectConversation(conversation);
    chatSearch.setQuery("");
    setHighlightedIndex(-1);
  };

  const handleSelect = (index: number) => {
    if (mode === "places") {
      handleSelectPlace(index);
    } else {
      handleSelectChat(index);
    }
  };

  const handleModeSwitch = (newMode: SearchMode) => {
    if (newMode === mode) return;
    // Clear the old mode's hook
    if (mode === "places") {
      nominatim.setQuery("");
    } else {
      chatSearch.setQuery("");
    }
    setMode(newMode);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < activeResults.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : activeResults.length - 1
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

  const activeDescendant =
    showResults && highlightedIndex >= 0
      ? `search-result-${highlightedIndex}`
      : undefined;

  const placeholder =
    mode === "places"
      ? "City, address, or place..."
      : "Search conversations...";

  const noResultsMessage =
    mode === "places" ? "No results found" : "No conversations found";

  return (
    <div className="flex flex-col gap-2">
      {/* Segmented toggle */}
      <div className="flex rounded-full bg-neutral-100 p-0.5">
        <button
          type="button"
          onClick={() => handleModeSwitch("places")}
          className={`flex-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            mode === "places"
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          Places
        </button>
        <button
          type="button"
          onClick={() => handleModeSwitch("chats")}
          className={`flex-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            mode === "chats"
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          Chats
        </button>
      </div>

      {/* Search input */}
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
          placeholder={placeholder}
          aria-label={mode === "places" ? "Search for a location" : "Search for a conversation"}
          aria-autocomplete="list"
          aria-controls={showResults ? "search-results" : undefined}
          aria-activedescendant={activeDescendant}
          className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-blue-500" />
          </div>
        )}
      </div>

      {/* Results list */}
      {showResults && (
        <ul
          id="search-results"
          role="listbox"
          aria-label="Search results"
          className="flex flex-col overflow-hidden rounded-md border border-neutral-200 bg-white"
        >
          {activeResults.map((result, index) => (
            <li
              key={result.key}
              id={`search-result-${index}`}
              role="option"
              aria-selected={index === highlightedIndex}
              className={`cursor-pointer border-b border-neutral-100 px-3 py-2 text-sm last:border-b-0 ${
                index === highlightedIndex
                  ? "bg-blue-50 text-blue-900"
                  : "text-neutral-700 hover:bg-neutral-50"
              }`}
              onClick={() => handleSelect(index)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <span className={result.secondary ? "font-medium" : ""}>
                {result.label}
              </span>
              {result.secondary && (
                <span className="ml-2 text-xs text-neutral-400">
                  by {result.secondary}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {showNoResults && (
        <p className="px-1 text-sm text-neutral-500">{noResultsMessage}</p>
      )}

      {showError && (
        <p className="px-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
